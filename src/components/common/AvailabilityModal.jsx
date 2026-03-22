import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  CheckCircle2,
  XCircle,
  CalendarDays,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { updateAvailabilityApi } from "../../api/userApi.js";
import toast from "react-hot-toast";
import "./AvailabilityModal.css";

const AvailabilityModal = ({ isOpen, onClose, currentAvailability }) => {
  const queryClient = useQueryClient();

  const avail = currentAvailability || {};

  const [isAvailable, setIsAvailable] = useState(avail.isAvailable !== false);
  const [unavailableFrom, setUnavailableFrom] = useState(
    avail.unavailableFrom ? avail.unavailableFrom.slice(0, 10) : ""
  );
  const [unavailableTo, setUnavailableTo] = useState(
    avail.unavailableTo ? avail.unavailableTo.slice(0, 10) : ""
  );
  const [allowMessages, setAllowMessages] = useState(
    avail.allowMessages !== false
  );
  const [awayMessage, setAwayMessage] = useState(avail.awayMessage || "");

  const { mutate: updateAvailability, isPending } = useMutation({
    mutationFn: updateAvailabilityApi,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["seller-dashboard"]);
      queryClient.invalidateQueries(["my-profile"]);
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Update failed"),
  });

  const handleSave = () => {
    updateAvailability({
      isAvailable,
      unavailableFrom:
        !isAvailable && unavailableFrom ? unavailableFrom : null,
      unavailableTo: !isAvailable && unavailableTo ? unavailableTo : null,
      allowMessages,
      awayMessage: !isAvailable ? awayMessage : "",
    });
  };

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="avail-overlay" onClick={onClose}>
      <div className="avail-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="avail-header">
          <div>
            <h3 className="avail-header-title">Edit Availability</h3>
            <p className="avail-header-subtitle">
              Manage when buyers can order from you
            </p>
          </div>
          <button className="avail-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="avail-body">

          {/* Status Banner + Toggle */}
          <div className={`avail-status-banner ${isAvailable ? "available" : "unavailable"}`}>
            <div className="avail-status-info">
              <p className="avail-status-title">
                {isAvailable
                  ? <><CheckCircle2 size={16} /> Currently Available</>
                  : <><XCircle size={16} /> Currently Unavailable</>
                }
              </p>
              <p className="avail-status-desc">
                {isAvailable
                  ? "Your gigs are visible and you can receive orders"
                  : "Your gigs are hidden — no new orders will come in"}
              </p>
            </div>
            <button
              className={`avail-toggle ${isAvailable ? "on" : "off"}`}
              onClick={() => setIsAvailable(!isAvailable)}
              aria-label="Toggle availability"
            >
              <div className="avail-toggle-knob" />
            </button>
          </div>

          {/* Unavailable Options */}
          {!isAvailable && (
            <>
              {/* Date Range */}
              <div>
                <p className="avail-section-label">
                  <CalendarDays size={15} />
                  Choose dates
                </p>
                <div className="avail-date-grid">
                  <div className="avail-date-field">
                    <label>First day</label>
                    <input
                      type="date"
                      className="avail-input"
                      value={unavailableFrom}
                      min={todayStr}
                      onChange={(e) => setUnavailableFrom(e.target.value)}
                    />
                  </div>
                  <div className="avail-date-field">
                    <label>Last day</label>
                    <input
                      type="date"
                      className="avail-input"
                      value={unavailableTo}
                      min={unavailableFrom || todayStr}
                      onChange={(e) => setUnavailableTo(e.target.value)}
                    />
                  </div>
                </div>
                <p className="avail-hint">
                  Optional — leave empty if exact dates are not known yet
                </p>
              </div>

              {/* Allow Messages Toggle */}
              <div className="avail-msg-row">
                <button
                  className={`avail-toggle-sm ${allowMessages ? "on" : "off"}`}
                  onClick={() => setAllowMessages(!allowMessages)}
                  aria-label="Toggle allow messages"
                >
                  <div className="avail-toggle-knob" />
                </button>
                <div>
                  <p className="avail-msg-title">All buyers can contact me</p>
                  <p className="avail-msg-desc">
                    Only enable if you can reply — your response rate to new
                    messages will affect your overall response score.
                  </p>
                </div>
              </div>

              {/* Away Message */}
              <div>
                <label className="avail-away-label">
                  <MessageSquare size={15} />
                  Add a message&nbsp;
                  <span>(Optional)</span>
                </label>
                <textarea
                  className="avail-input avail-textarea"
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. I'm on vacation till Jan 15. Will respond to messages when I'm back!"
                  value={awayMessage}
                  onChange={(e) => setAwayMessage(e.target.value)}
                />
                <div className="avail-char-row">
                  <span className="avail-char-hint">
                    Visible to buyers on your profile and gig pages
                  </span>
                  <span className="avail-char-count">
                    {awayMessage.length}/300
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="avail-footer">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? (
              <span className="avail-save-inner">
                <Loader2 size={16} className="avail-spinner" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AvailabilityModal;