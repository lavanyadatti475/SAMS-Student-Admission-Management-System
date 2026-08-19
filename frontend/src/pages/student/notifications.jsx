import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Bell,
  CheckCheck,
  Check,
  Calendar,
  MapPin,
  Tag,
  GraduationCap,
  Clock,
  Sparkles,
  Filter,
  Inbox
} from "lucide-react";

const CATEGORIES = [
  { id: "All", label: "All Updates" },
  { id: "NSS", label: "NSS" },
  { id: "Tech Fest", label: "Tech Fest" },
  { id: "Cultural Fest", label: "Cultural" },
  { id: "Workshop / Seminar", label: "Workshops" },
  { id: "Sports Meet", label: "Sports" },
  { id: "Placement & Career", label: "Placements" },
  { id: "General Announcement", label: "General" }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesCategory =
      activeCategory === "All" || n.category === activeCategory;
    const matchesUnread = !showUnreadOnly || !n.read;
    return matchesCategory && matchesUnread;
  });

  const getCategoryStyles = (category) => {
    switch (category) {
      case "NSS":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "Tech Fest":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
      case "Cultural Fest":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
      case "Workshop / Seminar":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30";
      case "Sports Meet":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30";
      case "Placement & Career":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="card-glass p-6 md:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-xs uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Campus Live Feeds</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                College Events & Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500 text-white shadow-sm animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Stay updated with NSS activities, tech fests, workshops, and official college circulars.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-4 py-2 text-xs font-semibold rounded-2xl border transition cursor-pointer ${
                showUnreadOnly
                  ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                  : "bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {showUnreadOnly ? "Showing Unread" : "Filter Unread"}
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition cursor-pointer disabled:opacity-50"
              >
                <CheckCheck size={15} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 pt-5 border-t border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <Filter size={13} />
              Filter:
            </div>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="card-glass p-12 rounded-3xl text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Fetching event updates...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card-glass p-12 rounded-3xl border border-slate-200/70 dark:border-slate-800 text-center text-slate-400 shadow-sm">
          <Inbox size={44} className="mx-auto mb-3 opacity-40 text-slate-500" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No Notifications Found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeCategory !== "All"
              ? `There are no ${activeCategory} notifications currently available.`
              : "You're all caught up! New college event announcements will appear right here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((n) => {
            const isUnread = !n.read;
            return (
              <div
                key={n.id}
                className={`card-glass p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                  isUnread
                    ? "border-brand-500/40 bg-white/90 dark:bg-slate-900/90 shadow-md ring-1 ring-brand-500/20"
                    : "border-slate-200/70 dark:border-slate-800 opacity-90"
                }`}
              >
                {/* Unread Accent Bar */}
                {isUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-500 to-indigo-600" />
                )}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border ${getCategoryStyles(
                          n.category
                        )}`}
                      >
                        <Tag size={11} />
                        {n.category || "General"}
                      </span>

                      {n.targetBatch && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <GraduationCap size={12} />
                          Batch: {n.targetBatch}
                        </span>
                      )}

                      {isUnread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {n.title}
                    </h2>

                    {/* Message Body */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {n.message}
                    </p>

                    {/* Event Meta Details (Date, Venue, Sent Timestamp) */}
                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      {n.eventDate && (
                        <span className="inline-flex items-center gap-1.5 font-medium text-brand-600 dark:text-brand-400">
                          <Calendar size={14} />
                          Event Date:{" "}
                          {new Date(n.eventDate).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      )}

                      {n.venue && (
                        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <MapPin size={14} className="text-red-500" />
                          Venue: {n.venue}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock size={13} />
                        Sent:{" "}
                        {new Date(n.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:self-center shrink-0">
                    {isUnread ? (
                      <button
                        onClick={() => markRead(n.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm shadow-brand-500/20 transition cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Mark as Read</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 px-3 py-1">
                        <CheckCheck size={14} className="text-emerald-500" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}