import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Flag,
  Eye,
  Trash2,
  X,
  Check,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Mail,
  Angry,
  Star,
  CreditCard,
  FileText,
} from "lucide-react";
import {
  getAllReportsApi,
  updateReportStatusApi,
  deleteReportedUserApi,
} from "../../api/reportApi.js";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";
import "./Dashboard.css";

const STATUS_COLORS = {
  pending:   { bg: "#fef3c7", color: "#92400e", label: "Pending"   },
  reviewed:  { bg: "#dbeafe", color: "#1e40af", label: "Reviewed"  },
  resolved:  { bg: "#dcfce7", color: "#166534", label: "Resolved"  },
  dismissed: { bg: "#f3f4f6", color: "#6b7280", label: "Dismissed" },
};

const REASON_LABELS = {
  fraud:                  { label: "Fraud / Scam",           icon: <AlertTriangle size={13} /> },
  spam:                   { label: "Spam",                   icon: <Mail          size={13} /> },
  inappropriate_behavior: { label: "Inappropriate Behavior", icon: <Angry         size={13} /> },
  fake_reviews:           { label: "Fake Reviews",           icon: <Star          size={13} /> },
  payment_issue:          { label: "Payment Issue",          icon: <CreditCard    size={13} /> },
  other:                  { label: "Other",                  icon: <FileText      size={13} /> },
};

const ReasonCell = ({ reason }) => {
  const r = REASON_LABELS[reason];
  if (!r) return <span>{reason}</span>;
  return (
    <span className="ar-reason">
      {r.icon}
      {r.label}
    </span>
  );
};

const AdminReports = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus]         = useState("");
  const [selectedReport, setSelectedReport]     = useState(null);
  const [adminNote, setAdminNote]               = useState("");
  const [newStatus, setNewStatus]               = useState("");
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName]     = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", filterStatus],
    queryFn: () => getAllReportsApi({ status: filterStatus || undefined }),
  });

  const { mutate: updateStatus, isPending: updating } = useMutation({
    mutationFn: updateReportStatusApi,
    onSuccess: () => {
      toast.success("Report status updated successfully.");
      setSelectedReport(null);
      queryClient.invalidateQueries(["admin-reports"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: deleteReportedUserApi,
    onSuccess: (data) => {
      toast.success(data.message);
      setConfirmDeleteUserId(null);
      queryClient.invalidateQueries(["admin-reports"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleOpenDetail = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminNote(report.adminNote || "");
  };

  const handleUpdateStatus = () => {
    if (!newStatus) return;
    updateStatus({ id: selectedReport._id, status: newStatus, adminNote });
  };

  const reports = data?.reports || [];

  return (
    <div className="ar-page">
      <div className="container">

        {/* Header */}
        <div className="ar-header">
          <h1 className="ar-title">
            <Flag size={24} />
            User Reports
          </h1>
          <p className="ar-subtitle">
            Review and manage buyer and seller complaints
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid stats-grid--4">
          {Object.entries(STATUS_COLORS).map(([key, val]) => (
            <div
              key={key}
              className={`stat-card ar-stat-card ${filterStatus === key ? "active" : ""}`}
              style={{ "--active-color": val.color }}
              onClick={() => setFilterStatus(filterStatus === key ? "" : key)}
            >
              <p className="stat-label">{val.label}</p>
              <p className="stat-value" style={{ color: val.color }}>
                {reports.filter((r) => r.status === key).length}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="ar-filter-tabs">
          {[
            { val: "", label: "All" },
            ...Object.entries(STATUS_COLORS).map(([k, v]) => ({ val: k, label: v.label })),
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setFilterStatus(tab.val)}
              className={`ar-filter-btn ${filterStatus === tab.val ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="ar-table-card">
          {isLoading ? (
            <Loader fullPage />
          ) : reports.length === 0 ? (
            <div className="ar-empty">
              <CheckCircle2 size={36} />
              <p>No reports found</p>
            </div>
          ) : (
            <table className="ar-table">
              <thead>
                <tr className="ar-thead-row">
                  {["Reported By", "Reported User", "Reason", "Order", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="ar-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report, i) => {
                  const st = STATUS_COLORS[report.status];
                  return (
                    <tr key={report._id} className={`ar-tr ${i % 2 !== 0 ? "striped" : ""}`}>

                      <td className="ar-td">
                        <div className="ar-user-name">{report.reportedBy?.name}</div>
                        <div className="ar-user-role">{report.reportedBy?.role}</div>
                      </td>

                      <td className="ar-td">
                        <div className="ar-user-name">{report.reportedUser?.name}</div>
                        <div className="ar-user-email">{report.reportedUser?.email}</div>
                      </td>

                      <td className="ar-td">
                        <ReasonCell reason={report.reason} />
                      </td>

                      <td className="ar-td ar-order-id">
                        #{report.orderId?._id?.slice(-6).toUpperCase() || "—"}
                      </td>

                      <td className="ar-td">
                        <span
                          className="ar-status-badge"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </td>

                      <td className="ar-td ar-date">
                        {new Date(report.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>

                      <td className="ar-td">
                        <div className="ar-actions">
                          <button
                            className="btn btn-outline btn-sm ar-action-btn"
                            onClick={() => handleOpenDetail(report)}
                          >
                            <Eye size={13} /> Review
                          </button>
                          <button
                            className="btn btn-danger btn-sm ar-action-btn"
                            onClick={() => {
                              setConfirmDeleteUserId(report.reportedUser?._id);
                              setConfirmDeleteName(report.reportedUser?.name);
                            }}
                          >
                            <Trash2 size={13} /> Delete User
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Review Report Modal ── */}
      {selectedReport && (
        <div className="ar-overlay" onClick={() => setSelectedReport(null)}>
          <div className="ar-modal" onClick={(e) => e.stopPropagation()}>

            <div className="ar-modal-header">
              <h3 className="ar-modal-title">
                <Flag size={17} />
                Report Detail
              </h3>
              <button className="ar-modal-close" onClick={() => setSelectedReport(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="ar-modal-body">
              <div className="ar-modal-grid">
                <div className="ar-info-box">
                  <p className="ar-info-label">REPORTED BY</p>
                  <p className="ar-info-name">{selectedReport.reportedBy?.name}</p>
                  <p className="ar-info-sub">{selectedReport.reportedBy?.role}</p>
                </div>
                <div className="ar-info-box danger">
                  <p className="ar-info-label danger">REPORTED USER</p>
                  <p className="ar-info-name">{selectedReport.reportedUser?.name}</p>
                  <p className="ar-info-sub">{selectedReport.reportedUser?.email}</p>
                </div>
              </div>

              <div className="ar-field">
                <p className="ar-field-label">Reason</p>
                <ReasonCell reason={selectedReport.reason} />
              </div>

              {selectedReport.description && (
                <div className="ar-field">
                  <p className="ar-field-label">Description</p>
                  <p className="ar-field-desc">{selectedReport.description}</p>
                </div>
              )}

              <div className="ar-field">
                <p className="ar-field-label">Update Status</p>
                <select
                  className="ar-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {Object.entries(STATUS_COLORS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div className="ar-field">
                <p className="ar-field-label">Admin Note</p>
                <textarea
                  className="ar-textarea"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add an optional note about this report..."
                  rows={3}
                />
              </div>
            </div>

            <div className="ar-modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedReport(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={updating}>
                {updating ? "Saving..." : <><Check size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDeleteUserId && (
        <div className="ar-overlay ar-overlay--top" onClick={() => setConfirmDeleteUserId(null)}>
          <div className="ar-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ar-confirm-icon">
              <AlertCircle size={40} color="#dc2626" />
            </div>
            <h3 className="ar-confirm-title">Delete User Account?</h3>
            <p className="ar-confirm-desc">
              <strong>{confirmDeleteName}</strong>'s account will be permanently deleted. This action cannot be undone.
            </p>
            <div className="ar-confirm-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDeleteUserId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={deleting}
                onClick={() => deleteUser(confirmDeleteUserId)}
              >
                <Trash2 size={14} />
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
