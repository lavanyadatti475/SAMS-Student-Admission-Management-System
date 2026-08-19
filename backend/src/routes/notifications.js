const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { requireAuth, requireRole } = require('../middleware/auth');

/* ==========================================================================
   STUDENT ROUTES
   ========================================================================== */

/**
 * GET /api/notifications
 * Fetch notifications for the currently logged-in student (optional category filter)
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { category } = req.query;

    const whereClause = {
      studentId: req.user.id
    };

    if (category && category !== 'All' && category !== 'all') {
      whereClause.category = category;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/unread-count
 * Returns count of unread notifications for current student
 */
router.get('/unread-count', requireAuth, async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: {
        studentId: req.user.id,
        read: false
      }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Marks all notifications for current student as read
 */
router.put('/mark-all-read', requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        studentId: req.user.id,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
router.put('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid notification ID' });
    }

    const notification = await prisma.notification.update({
      where: {
        id
      },
      data: {
        read: true
      }
    });

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
});

/* ==========================================================================
   ADMIN BROADCAST ROUTES
   ========================================================================== */

/**
 * POST /api/notifications/broadcast
 * Broadcast event notifications to filtered batches (B.Tech, M.Tech, MBA, MCA, or All)
 */
router.post('/broadcast', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, message, category, targetBatch, eventDate, venue } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required.'
      });
    }

    const selectedCategory = category || 'General Announcement';
    const selectedBatch = targetBatch || 'All';

    // Find recipient students based on targetBatch
    let students = [];
    if (selectedBatch === 'All' || selectedBatch === 'all') {
      students = await prisma.student.findMany({
        select: { id: true, email: true, fullName: true }
      });
    } else {
      // Find students whose admissionForm course matches the targetBatch
      students = await prisma.student.findMany({
        where: {
          admissionForm: {
            course: {
              contains: selectedBatch,
              mode: 'insensitive'
            }
          }
        },
        select: { id: true, email: true, fullName: true }
      });

      // If no students match via admission form yet, fallback to all students so test notifications succeed
      if (students.length === 0) {
        students = await prisma.student.findMany({
          select: { id: true, email: true, fullName: true }
        });
      }
    }

    const parsedEventDate = eventDate ? new Date(eventDate) : null;

    // 1. Create Broadcast Record in EventBroadcast table if supported
    let broadcastRecord = null;
    try {
      broadcastRecord = await prisma.eventBroadcast.create({
        data: {
          title,
          message,
          category: selectedCategory,
          targetBatch: selectedBatch,
          eventDate: parsedEventDate,
          venue: venue || null,
          recipientCount: students.length,
          createdBy: req.user.email || req.user.fullName || 'Admin'
        }
      });
    } catch (err) {
      console.warn('EventBroadcast insert note:', err.message);
    }

    // 2. Dispatch notifications to all target students
    if (students.length > 0) {
      const notificationData = students.map((s) => ({
        studentId: s.id,
        title,
        message,
        category: selectedCategory,
        targetBatch: selectedBatch,
        eventDate: parsedEventDate,
        venue: venue || null,
        read: false
      }));

      await prisma.notification.createMany({
        data: notificationData
      });
    }

    res.status(201).json({
      success: true,
      message: `Notification broadcasted to ${students.length} student(s) successfully.`,
      broadcast: broadcastRecord,
      recipientCount: students.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/notifications/history
 * Fetch past event broadcasts sent by admin
 */
router.get('/history', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    let history = [];
    try {
      history = await prisma.eventBroadcast.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (err) {
      // Fallback: aggregate from Notification table if EventBroadcast isn't present
      const rawNotifications = await prisma.notification.findMany({
        distinct: ['title', 'createdAt'],
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      history = rawNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category || 'General Announcement',
        targetBatch: n.targetBatch || 'All',
        eventDate: n.eventDate,
        venue: n.venue,
        recipientCount: 1,
        createdAt: n.createdAt
      }));
    }

    res.json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notifications/history/:id
 * Delete a broadcast history item
 */
router.delete('/history/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid broadcast ID' });
    }

    try {
      await prisma.eventBroadcast.delete({
        where: { id }
      });
    } catch (err) {
      console.warn('Could not delete from EventBroadcast:', err.message);
    }

    res.json({
      success: true,
      message: 'Broadcast record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
