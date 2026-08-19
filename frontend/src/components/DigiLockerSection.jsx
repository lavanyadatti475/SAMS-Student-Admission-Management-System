import {
  FileText,
  Download,
  CheckCircle,
  Clock
} from "lucide-react";

export default function DigiLockerSection({
  uploadedDocuments = []
}) {
  return (
    <div className="card-glass p-6 rounded-3xl border border-slate-200/70 dark:border-slate-700/70">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          DigiLocker
        </h2>

        <span className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm">
          {uploadedDocuments.length} Documents
        </span>
      </div>

      {/* Empty State */}
      {uploadedDocuments.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          No documents uploaded yet.
        </div>
      ) : (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

          {uploadedDocuments.map((doc) => (

            <div
              key={doc.id}
              className="border rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-sm"
            >

              {/* Top Row */}
              <div className="flex justify-between items-start">

                <FileText
                  size={24}
                  className="text-blue-600"
                />

                {doc.verificationStatus?.toLowerCase() === "approved" ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <Clock className="text-yellow-500" />
                )}

              </div>

              {/* Document Name */}
              <h3 className="mt-4 font-semibold text-lg">
                {doc.documentName || "Unknown Document"}
              </h3>

              {/* Original File */}
              <p className="text-sm text-slate-500 mt-2 break-all">
                {doc.originalFileName}
              </p>

              {/* Category */}
              <p className="text-sm text-slate-500 mt-1">
                Category :
                <span className="font-medium ml-1">
                  {doc.category}
                </span>
              </p>

              {/* Status */}
              <p className="mt-2 text-sm">

                Status :

                <span
                  className={`ml-2 font-medium ${
                    doc.verificationStatus?.toLowerCase() === "approved"
                      ? "text-green-600"
                      : doc.verificationStatus?.toLowerCase() === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {doc.verificationStatus}
                </span>

              </p>

              {/* Uploaded Date */}
              <p className="text-xs text-slate-400 mt-2">

                Uploaded :

                {doc.uploadedAt
                  ? new Date(doc.uploadedAt).toLocaleDateString()
                  : "-"}

              </p>

              {/* Button */}
              {doc.publicUrl && (

                <a
                  href={doc.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white transition"
                >
                  <Download size={16} />
                  View Document
                </a>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}