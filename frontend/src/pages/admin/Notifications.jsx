import { useState, useEffect } from "react";
import api from "../../api/api";
import {
  Bell,
  Send,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Tag,
  GraduationCap
} from "lucide-react";

const EVENT_CATEGORIES = [
  { id: "NSS", label: "NSS (National Service Scheme)", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400" },
  { id: "Tech Fest", label: "Tech Fest & Hackathons", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:text-indigo-400" },
  { id: "Cultural Fest", label: "Cultural & Arts Fest", color: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400" },
  { id: "Workshop / Seminar", label: "Workshop & Seminar", color: "bg-sky-500/10 text-sky-600 border-sky-500/30 dark:text-sky-400" },
  { id: "Sports Meet", label: "Sports & Athletics", color: "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400" },
  { id: "Placement & Career", label: "Placement & Career Drive", color: "bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400" },
  { id: "General Announcement", label: "General Announcement", color: "bg-slate-500/10 text-slate-700 border-slate-500/30 dark:text-slate-300" }
];

const TARGET_BATCHES = [
  { id: "All", label: "All Batches (Everyone)" },
  { id: "B.Tech", label: "B.Tech (Bachelor of Technology)" },
  { id: "M.Tech", label: "M.Tech (Master of Technology)" },
  { id: "MBA", label: "MBA (Master of Business Administration)" },
  { id: "MCA", label: "MCA (Master of Computer Applications)" }
];

export default function AdminNotifications() {
  const [formData, setFormData] = useState({
    title: "",
    category: "NSS",
    targetBatch: "All",
    eventDate: "",
    venue: "",
    message: ""
  });

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setFetchingHistory(true);
    try {
      const res = await api.get("/notifications/history");
      if (res.data?.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error("Failed to load broadcast history:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setStatusMessage({ type: "error", text: "Please enter both an Event Title and Message description." });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.post("/notifications/broadcast", formData);
      if (res.data?.success) {
        setStatusMessage({
          type: "success",
          text: `Success! Broadcast sent to ${res.data.recipientCount} student(s) in batch: ${formData.targetBatch}.`
        });
        // Reset form
        setFormData({
          title: "",
          category: "NSS",
          targetBatch: "All",
          eventDate: "",
          venue: "",
          message: ""
        });
        loadHistory();
      }
    } catch (err) {
      console.error("Broadcast failed:", err);
      setStatusMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to broadcast notification. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this broadcast log?")) return;
    try {
      await api.delete(`/notifications/history/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete broadcast history item:", err);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (item.message && item.message.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (item.venue && item.venue.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category) => {
    const cat = EVENT_CATEGORIES.find((c) => c.id === category) || EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cat.color}`}>
        <Tag size={12} />
        {category || "General"}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider">
            <Bell size={16} />
            <span>Campus Broadcast Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
            Events & Broadcast Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Send real-time alerts, NSS events, workshops, and official notifications targeted by student batches.
          </p>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all duration-300 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="mt-0.5 text-emerald-500 shrink-0" size={20} />
          ) : (
            <AlertCircle className="mt-0.5 text-red-500 shrink-0" size={20} />
          )}
          <div className="flex-1 text-sm font-medium">{statusMessage.text}</div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 font-semibold uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Top: Broadcast Composer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-glass p-6 md:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Compose Broadcast
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target by Batch and College Event Category
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-5">
              {/* Event Category & Batch Filter Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Events Column */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    Event Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer"
                    >
                      {EVENT_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">E.g., NSS, Hackathons, Workshops</p>
                </div>

                {/* Batches Column */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                    Target Batch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="targetBatch"
                      value={formData.targetBatch}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none cursor-pointer"
                    >
                      {TARGET_BATCHES.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Filters recipients based on course</p>
                </div>
              </div>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Event / Notification Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., NSS Mega Blood Donation & Tree Plantation Camp 2026"
                  required
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>

              {/* Event Date & Venue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Calendar size={13} className="text-brand-500" />
                    Event Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <MapPin size={13} className="text-brand-500" />
                    Venue / Location (Optional)
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="e.g., Campus Auditorium / Seminar Hall"
                    className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Message Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Notification Message & Instructions <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Provide all details about the event, timings, chief guests, registration links, and eligibility criteria..."
                  required
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-y"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-6 shadow-lg shadow-brand-500/25 transition duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Broadcasting to Students...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Broadcast Notification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-glass p-6 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Student Feed Live Preview
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Live Rendering
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {getCategoryBadge(formData.category)}
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <GraduationCap size={13} />
                  Batch: {formData.targetBatch}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {formData.title || "Your Event Title Will Appear Here"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed">
                  {formData.message ||
                    "This is a preview of the announcement body that will be delivered directly to the notification inbox of all students matching your selected batch filter."}
                </p>
              </div>

              {(formData.eventDate || formData.venue) && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                  {formData.eventDate && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} className="text-brand-500" />
                      {new Date(formData.eventDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  )}
                  {formData.venue && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} className="text-brand-500" />
                      {formData.venue}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Users size={15} className="text-brand-500 shrink-0" />
              <span>Target: Delivering to all enrolled students in <strong>{formData.targetBatch}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Logs & History Section */}
      <div className="card-glass p-6 md:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock size={20} className="text-brand-500" />
              Broadcast History & Logs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record of all past college events and announcements sent to batches.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* History Table */}
        {fetchingHistory ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading broadcast records...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Bell size={36} className="mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="text-sm font-medium">No broadcast notifications found.</p>
            <p className="text-xs text-slate-500 mt-1">Compose your first event broadcast above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Event Category</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Target Batch</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Event Date / Venue</th>
                  <th className="py-3 px-4">Sent At</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                    <td className="py-4 px-4 font-medium whitespace-nowrap">
                      {getCategoryBadge(item.category)}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {item.message}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <GraduationCap size={13} />
                        {item.targetBatch || "All"}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <Users size={12} />
                        {item.recipientCount || 1} students
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {item.eventDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-brand-500" />
                          {new Date(item.eventDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                      {item.venue && (
                        <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                          <MapPin size={11} />
                          {item.venue}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteHistory(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
