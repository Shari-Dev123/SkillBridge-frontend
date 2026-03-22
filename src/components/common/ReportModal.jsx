import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  Flag,
  AlertTriangle,
  Mail,
  Angry,
  Star,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";
import { submitReportApi } from "../../api/Reportapi.js";
import toast from "react-hot-toast";
import "./ReportModal.css";

const REASONS = [
  { value: "fraud",                  label: "Fraud / Scam",            icon: <AlertTriangle size={14} /> },
  { value: "spam",                   label: "Spam",                    icon: <Mail          size={14} /> },
  { value: "inappropriate_behavior", label: "Inappropriate Behavior",  icon: <Angry         size={14} /> },
  { value: "fake_reviews",           label: "Fake Reviews",            icon: <Star          size={14} /> },
  { value: "payment_issue",          label: "Payment Issue",           icon: <CreditCard    size={14} /> },
  { value: "other",                  label: "Other",                   icon: <FileText      size={14} /> },
];

const ReportModal = ({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  orderId,
  onSuccess,
}) => {
  const [reason, setReason]           = useState("");
  const [description, setDescription] = useState("");

  const { mutate: submitReport, isPending } = useMutation({
    mutationFn: submitReportApi,
    onSuccess: () => {
      toast.success("Report submitted! Admin will review it shortly.");
      setReason("");
      setDescription("");
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit report");
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    submitReport({ reportedUserId, reason, description, orderId });
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="report-modal-header">
          <h3 className="report-modal-title">
            <Flag size={18} />
            Report {reportedUserName}
          </h3>
          <button className="report-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="report-modal-body">
          <p className="report-modal-subtitle">
            Let the admin know what the issue is. All reports are kept private.
          </p>

          {/* Reason Select */}
          <div className="report-form-group">
            <label className="report-form-label">Reason *</label>
            <div className="report-reason-grid">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  className={`report-reason-btn ${reason === r.value ? "selected" : ""}`}
                  onClick={() => setReason(r.value)}
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="report-form-group">
            <label className="report-form-label">
              Description <span className="report-label-optional">(optional)</span>
            </label>
            <textarea
              className="report-textarea"
              placeholder="Describe what happened in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="report-char-count">{description.length}/500</p>
          </div>
        </div>

        {/* Footer */}
        <div className="report-modal-footer">
          <button className="btn btn-outline" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={handleSubmit}
            disabled={isPending || !reason}
          >
            {isPending ? (
              <span className="report-submit-inner">
                <Loader2 size={15} className="report-spinner" />
                Submitting...
              </span>
            ) : (
              <span className="report-submit-inner">
                <Flag size={15} />
                Submit Report
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReportModal;