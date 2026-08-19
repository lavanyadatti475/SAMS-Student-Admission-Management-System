const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const mime = require("mime-types");
const { v4: uuid } = require("uuid");
const prisma = require("../prismaClient");
const supabase = require("../supabase");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  MAX_SIZE,
  ALLOWED_TYPES,
} = require("../utils/documentValidation");
const {
  generateFileName,
  isImage,
  isPDF,
} = require("../utils/documentHelpers");
const DOCUMENT_CATEGORIES = require("../utils/documentCategories");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only JPG, PNG and PDF files are allowed."
        )); }
    cb(null, true);
  },
});

async function uploadToSupabase(file, studentId, category) {

  console.log("===== Upload Debug =====");
  console.log("Student ID:", studentId);
  console.log("Category:", category);
  console.log("Bucket:", process.env.SUPABASE_BUCKET);

  const fileName = generateFileName(file);

  const storagePath = `${studentId}/${category}/${fileName}`;

  console.log("Storage Path:", storagePath);

  const { data: uploadData, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  const { data: publicData } = supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .getPublicUrl(storagePath);

  console.log("Public URL:", publicData.publicUrl);
  console.log("========================");

  return {
    storagePath,
    publicUrl: publicData.publicUrl,
    generatedName: fileName,
  };
}

function validateUpload(body) {
  const {
    category,
    subCategory,
    documentName,
  } = body;
  if (!category) {
    throw new Error("Category is required.");
  }
  if (!subCategory) {
    throw new Error("Sub Category is required.");
  }
  if (!documentName) {
    throw new Error("Document Name is required.");
  }
}
router.post(
  "/upload",
  requireAuth,
  upload.single("document"),
  async (req, res, next) => {
    try {
      validateUpload(req.body);
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No document uploaded.",
        });
      }
      const {
        category,
        subCategory,
        documentName,
      } = req.body;
          const uploadResult = await uploadToSupabase(
  req.file,
  req.user.id,
  category
);
  const document = await prisma.uploadedDocument.create({
  data: {
    studentId: req.user.id,
    category,
    subCategory,
    documentName,
    fileName: uploadResult.generatedName,
    originalFileName: req.file.originalname,
    filePath: uploadResult.storagePath,
    publicUrl: uploadResult.publicUrl,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    verificationStatus: "Pending",
  },
});
// Automatically set Passport Photo as Profile Photo

if (
  documentName.toLowerCase().includes("passport") ||
  subCategory.toLowerCase().includes("passport") ||
  category.toLowerCase().includes("passport")
) {
  await prisma.student.update({
    where: {
      id: req.user.id,
    },
    data: {
      profilePhoto: uploadResult.generatedName,
    },
  });
}

await prisma.admissionStatus.upsert({
  where: {
    studentId: req.user.id,
  },
  update: {
    documentStatus: "uploaded",
  },
  create: {
    studentId: req.user.id,
    applicationStatus: "submitted",
    documentStatus: "uploaded",
  },
});

await prisma.notification.create({
  data: {
    studentId: req.user.id,
    title: "Document Uploaded",
    message: `${documentName} uploaded successfully.`,
  },
});

await prisma.activityLog.create({
  data: {
    action: "Document Uploaded",
    performedBy: req.user.id,
    studentId: req.user.id,
    details: `${category} > ${subCategory} > ${documentName}`,
  },
});

return res.status(201).json({
  success: true,
  message: "Document uploaded successfully.",
  document,
});

} catch (error) {
  next(error);
}
}
);

/* =======================================================
   GET MY DOCUMENTS
======================================================= */

router.get(
  "/my-list",
  requireAuth,
  async (req, res, next) => {
    try {

      const documents = await prisma.uploadedDocument.findMany({

        where: {
          studentId: req.user.id,
        },

        orderBy: {
          uploadedAt: "desc",
        },

      });

      return res.json({

        success: true,
        total: documents.length,
        documents,

      });

    } catch (error) {
      next(error);
    }
  }
);

/* =======================================================
   GET DOCUMENT CATEGORIES
======================================================= */

router.get(
  "/categories/all",
  requireAuth,
  (req, res) => {

    return res.json({

      success: true,

      categories: DOCUMENT_CATEGORIES,

    });

  }
);

/* =======================================================
   GET SUB CATEGORIES
======================================================= */

router.get(
  "/categories/:category",
  requireAuth,
  (req, res) => {

    const category =
      req.params.category;

    const result =
      DOCUMENT_CATEGORIES[category];

    if (!result) {

      return res.status(404).json({

        success: false,

        error: "Category not found.",

      });

    }

    return res.json({

      success: true,

      data: result,

    });

  }
);

/* =======================================================
   DOWNLOAD / PREVIEW DOCUMENT
======================================================= */

router.get(
  "/:id/download",
  requireAuth,
  async (req, res, next) => {

    try {

      const id = Number(req.params.id);

      const document =
        await prisma.uploadedDocument.findUnique({

          where: { id }

        });

      if (!document) {

        return res.status(404).json({

          success:false,

          error:"Document not found."

        });

      }

      if (

        document.studentId !== req.user.id &&

        req.user.role !== "admin"

      ){

        return res.status(403).json({

          success:false,

          error:"Unauthorized"

        });

      }

      return res.json({

        success:true,

        url:document.publicUrl,

        fileName:document.originalFileName,

        mimeType:document.mimeType,

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   PREVIEW DOCUMENT
======================================================= */

router.get(
  "/:id/preview",
  requireAuth,
  async (req,res,next)=>{

    try{

      const id=Number(req.params.id);

      const document=
      await prisma.uploadedDocument.findUnique({

        where:{id}

      });

      if(!document){

        return res.status(404).json({

          success:false,

          error:"Document not found."

        });

      }

      return res.json({

        success:true,

        previewUrl:document.publicUrl,

        isImage:document.mimeType.startsWith("image"),

        isPDF:document.mimeType==="application/pdf"

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   DOCUMENT HISTORY
======================================================= */

router.get(
  "/:id/history",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {

    try {

      const id = Number(req.params.id);

      const document =
        await prisma.uploadedDocument.findUnique({

          where:{ id }

        });

      if(!document){

        return res.status(404).json({

          success:false,

          error:"Document not found."

        });

      }

      const history =
        await prisma.activityLog.findMany({

          where:{

            studentId:document.studentId,

            action:{

              contains:"Document"

            }

          },

          orderBy:{

            createdAt:"desc"

          }

        });

      return res.json({

        success:true,

        history

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   GET DOCUMENT BY ID
======================================================= */

router.get(
  "/:id",
  requireAuth,
  async (req, res, next) => {

    try {

      const id = Number(req.params.id);

      const document =
        await prisma.uploadedDocument.findUnique({

          where: {

            id,

          },

        });

      if (!document) {

        return res.status(404).json({

          success: false,

          error: "Document not found.",

        });

      }

      if (document.studentId !== req.user.id &&
          req.user.role !== "admin") {

        return res.status(403).json({

          success: false,

          error: "Unauthorized.",

        });

      }

      return res.json({

        success: true,

        document,

      });

    } catch (error) {

      next(error);

    }

  }
);



/* =======================================================
   DELETE DOCUMENT
======================================================= */

router.delete(
  "/:id",
  requireAuth,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      const document = await prisma.uploadedDocument.findUnique({
        where: { id },
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Document not found.",
        });
      }

      if (
        document.studentId !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized.",
        });
      }

      // Delete from Supabase Storage
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove([document.filePath]);

      if (error) {
        console.log(error.message);
      }

      // Delete from Database
      await prisma.uploadedDocument.delete({
        where: {
          id,
        },
      });

      await prisma.notification.create({
        data: {
          studentId: document.studentId,
          title: "Document Deleted",
          message: `${document.documentName} deleted successfully.`,
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "Document Deleted",
          performedBy: req.user.id,
          studentId: document.studentId,
          details: document.documentName,
        },
      });

      return res.json({
        success: true,
        message: "Document deleted successfully.",
      });

    } catch (error) {
      next(error);
    }
  }
);


/* =======================================================
   REPLACE DOCUMENT
======================================================= */

router.put(
  "/:id/replace",
  requireAuth,
  upload.single("document"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);

      const document = await prisma.uploadedDocument.findUnique({
        where: { id },
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Document not found.",
        });
      }

      if (
        document.studentId !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Please upload a file.",
        });
      }

      // Delete old file from Supabase
      await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove([document.filePath]);

      // Upload new file
      const uploadResult = await uploadToSupabase(
        req.file,
        document.studentId,
        document.category
      );

      // Update database
      const updatedDocument = await prisma.uploadedDocument.update({
        where: { id },
        data: {
          fileName: uploadResult.generatedName,
          originalFileName: req.file.originalname,
          filePath: uploadResult.storagePath,
          publicUrl: uploadResult.publicUrl,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          verificationStatus: "Pending",
          verificationRemarks: null,
        },
      });

      // Notification
      await prisma.notification.create({
        data: {
          studentId: document.studentId,
          title: "Document Replaced",
          message: `${document.documentName} has been replaced successfully.`,
        },
      });

      // Activity Log
      await prisma.activityLog.create({
        data: {
          action: "Document Replaced",
          performedBy: req.user.id,
          studentId: document.studentId,
          details: document.documentName,
        },
      });

      return res.json({
        success: true,
        message: "Document replaced successfully.",
        document: updatedDocument,
      });

    } catch (error) {
      next(error);
    }
  }
);

/* =======================================================
   ADMIN - GET ALL DOCUMENTS
======================================================= */

router.get(
  "/admin/all",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {

      const {
        status,
        category,
        studentId,
      } = req.query;

      const where = {};

      if (status)
        where.verificationStatus = status;

      if (category)
        where.category = category;

      if (studentId)
        where.studentId = Number(studentId);

      const documents =
        await prisma.uploadedDocument.findMany({

          where,

          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },

          orderBy: {
            uploadedAt: "desc",
          },

        });

      return res.json({

        success: true,

        total: documents.length,

        documents,

      });

    } catch (error) {

      next(error);

    }
  }
);

/* =======================================================
   ADMIN VERIFY DOCUMENT
======================================================= */

router.put(
  "/:id/verify",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {

    try {

      const id = Number(req.params.id);

      const {

        status,

        remarks,

      } = req.body;

      const allowed = [

        "Approved",

        "Rejected",

        "Pending",

        "Resubmission Required",

      ];

      if (!allowed.includes(status)) {

        return res.status(400).json({

          success: false,

          error: "Invalid verification status.",

        });

      }

      const document =
        await prisma.uploadedDocument.findUnique({

          where: { id },

        });

      if (!document) {

        return res.status(404).json({

          success: false,

          error: "Document not found.",

        });

      }

      const updated =
        await prisma.uploadedDocument.update({

          where: { id },

          data: {

            verificationStatus: status,

            verificationRemarks: remarks || null,

          },

        });

      await prisma.notification.create({

        data: {

          studentId: document.studentId,

          title: "Document Verification",

          message: `${document.documentName} is ${status}.`,

        },

      });

      await prisma.activityLog.create({

        data: {

          action: "Document Verification",

          performedBy: req.user.id,

          studentId: document.studentId,

          details:
            `${document.documentName} -> ${status}`,

        },

      });

      return res.json({

        success: true,

        message: "Verification updated successfully.",

        document: updated,

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   ADMIN PENDING DOCUMENTS
======================================================= */

router.get(
  "/admin/pending",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {

    try {

      const documents =
        await prisma.uploadedDocument.findMany({

          where: {

            verificationStatus: "Pending",

          },

          include: {

            student: {

              select: {

                id: true,

                fullName: true,

                email: true,

              },

            },

          },

          orderBy: {

            uploadedAt: "desc",

          },

        });

      return res.json({

        success: true,

        total: documents.length,

        documents,

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   ADMIN DOCUMENT STATISTICS
======================================================= */

router.get(
  "/admin/statistics",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {
    try {

      const total = await prisma.uploadedDocument.count();

      const pending = await prisma.uploadedDocument.count({
        where: {
          verificationStatus: "Pending",
        },
      });

      const approved = await prisma.uploadedDocument.count({
        where: {
          verificationStatus: "Approved",
        },
      });

      const rejected = await prisma.uploadedDocument.count({
        where: {
          verificationStatus: "Rejected",
        },
      });

      const resubmission = await prisma.uploadedDocument.count({
        where: {
          verificationStatus: "Resubmission Required",
        },
      });

      return res.json({
        success: true,
        statistics: {
          total,
          pending,
          approved,
          rejected,
          resubmission,
        },
      });

    } catch (error) {
      next(error);
    }
  }
);

/* =======================================================
   SEARCH DOCUMENTS
======================================================= */

router.get(
  "/admin/search",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {

    try {

      const search = req.query.q || "";

      const documents =
        await prisma.uploadedDocument.findMany({

          where: {

            OR: [

              {
                documentName: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                category: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                subCategory: {
                  contains: search,
                  mode: "insensitive",
                },
              },

              {
                student: {

                  fullName: {

                    contains: search,

                    mode: "insensitive",

                  },

                },

              },

            ],

          },

          include: {

            student: {

              select: {

                id: true,

                fullName: true,

                email: true,

              },

            },

          },

          orderBy: {

            uploadedAt: "desc",

          },

        });

      return res.json({

        success: true,

        total: documents.length,

        documents,

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   FILTER DOCUMENTS
======================================================= */

router.get(
  "/admin/category/:category",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {

    try {

      const category =
        req.params.category;

      const documents =
        await prisma.uploadedDocument.findMany({

          where: {

            category,

          },

          include: {

            student: {

              select: {

                id: true,

                fullName: true,

                email: true,

              },

            },

          },

          orderBy: {

            uploadedAt: "desc",

          },

        });

      return res.json({

        success: true,

        total: documents.length,

        documents,

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   RECENT DOCUMENTS
======================================================= */

router.get(
  "/admin/recent",
  requireAuth,
  requireRole("admin"),
  async (req, res, next) => {

    try {

      const documents =
        await prisma.uploadedDocument.findMany({

          take: 10,

          include: {

            student: {

              select: {

                fullName: true,

                email: true,

              },

            },

          },

          orderBy: {

            uploadedAt: "desc",

          },

        });

      return res.json({

        success: true,

        documents,

      });

    }

    catch(error){

      next(error);

    }

  }
);



/* =======================================================
   BULK APPROVE
======================================================= */

router.put(
  "/admin/bulk-approve",
  requireAuth,
  requireRole("admin"),
  async(req,res,next)=>{

    try{

      const ids=req.body.ids;

      if(!Array.isArray(ids)){

        return res.status(400).json({

          success:false,

          error:"Invalid ids."

        });

      }

      await prisma.uploadedDocument.updateMany({

        where:{

          id:{

            in:ids

          }

        },

        data:{

          verificationStatus:"Approved"

        }

      });

      return res.json({

        success:true,

        message:"Documents approved."

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   BULK REJECT
======================================================= */

router.put(
  "/admin/bulk-reject",
  requireAuth,
  requireRole("admin"),
  async(req,res,next)=>{

    try{

      const ids=req.body.ids;

      if(!Array.isArray(ids)){

        return res.status(400).json({

          success:false,

          error:"Invalid ids."

        });

      }

      await prisma.uploadedDocument.updateMany({

        where:{

          id:{

            in:ids

          }

        },

        data:{

          verificationStatus:"Rejected"

        }

      });

      return res.json({

        success:true,

        message:"Documents rejected."

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   STUDENT DOCUMENT TIMELINE
======================================================= */

router.get(
  "/timeline/me",
  requireAuth,
  async(req,res,next)=>{

    try{

      const timeline=
      await prisma.uploadedDocument.findMany({

        where:{

          studentId:req.user.id

        },

        orderBy:{

          uploadedAt:"desc"

        },

        select:{

          documentName:true,

          category:true,

          verificationStatus:true,

          uploadedAt:true

        }

      });

      return res.json({

        success:true,

        timeline

      });

    }

    catch(error){

      next(error);

    }

  }
);

/* =======================================================
   STUDENT DASHBOARD COUNTS
======================================================= */

router.get(
  "/dashboard/me",
  requireAuth,
  async(req,res,next)=>{

    try{

      const uploaded=
      await prisma.uploadedDocument.count({

        where:{

          studentId:req.user.id

        }

      });

      const approved=
      await prisma.uploadedDocument.count({

        where:{

          studentId:req.user.id,

          verificationStatus:"Approved"

        }

      });

      const pending=
      await prisma.uploadedDocument.count({

        where:{

          studentId:req.user.id,

          verificationStatus:"Pending"

        }

      });

      const rejected=
      await prisma.uploadedDocument.count({

        where:{

          studentId:req.user.id,

          verificationStatus:"Rejected"

        }

      });

      return res.json({

        success:true,

        dashboard:{

          uploaded,

          approved,

          pending,

          rejected

        }

      });

    }

    catch(error){

      next(error);

    }

  }
);



module.exports = router;