import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Check,
  Flag,
  AlertTriangle,
  CreditCard,
  Loader2,
} from "lucide-react";
import { getOrderByIdApi, updateOrderStatusApi } from "../../api/orderApi.js";
import { getMessagesApi, sendMessageApi } from "../../api/messageApi.js";
import { submitReviewApi } from "../../api/reviewApi.js";
import { checkMyReportApi } from "../../api/reportApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Badge from "../../components/common/Badge.jsx";
import StarRating from "../../components/common/StarRating.jsx";
import Loader from "../../components/common/Loader.jsx";
import ReportModal from "../../components/common/ReportModal.jsx";
import toast from "react-hot-toast";
import "./OrderDetail.css";

const STATUS_STEPS = ["pending", "in_progress", "completed"];

const OrderDetail = () => {
  const { id } = useParams();
  const { user, isBuyer, isSeller } = useAuth();
  const queryClient = useQueryClient();

  const [message, setMessage]             = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData]       = useState({ rating: 0, comment: "" });
  const [showReportModal, setShowReportModal] = useState(false);

  const { data: orderData, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderByIdApi(id),
  });

  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => getMessagesApi(id),
    refetchInterval: 5000,
  });

  const order = orderData?.order;

  const reportedUserId   = isSeller ? order?.buyerId?._id  : order?.sellerId?._id;
  const reportedUserName = isSeller ? order?.buyerId?.name : order?.sellerId?.name;

  const { data: reportCheck, refetch: refetchReportCheck } = useQuery({
    queryKey: ["report-check", id, reportedUserId],
    queryFn: () => checkMyReportApi(id, reportedUserId),
    enabled: !!order && !!reportedUserId,
  });

  const hasReported = reportCheck?.hasReported;

  const { mutate: updateStatus } = useMutation({
    mutationFn: (status) => updateOrderStatusApi(id, status),
    onSuccess: () => {
      toast.success("Status updated!");
      queryClient.invalidateQueries(["order", id]);
      queryClient.invalidateQueries(["seller-orders"]);
      queryClient.invalidateQueries(["buyer-orders"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: (text) => sendMessageApi(id, text),
    onSuccess: () => { setMessage(""); refetchMessages(); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send"),
  });

  const { mutate: submitReview, isPending: reviewing } = useMutation({
    mutationFn: submitReviewApi,
    onSuccess: () => {
      toast.success("Review submitted!");
      setShowReviewForm(false);
      queryClient.invalidateQueries(["order", id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to submit review"),
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message.trim());
  };

  const handleReviewSubmit = () => {
    if (reviewData.rating === 0)    { toast.error("Please select a rating"); return; }
    if (!reviewData.comment.trim()) { toast.error("Please write a comment");  return; }
    submitReview({ orderId: id, ...reviewData });
  };

  if (isLoading) return <Loader fullPage />;
  if (!order)    return <div className="container">Order not found</div>;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="order-detail-page">
      <div className="container order-detail-layoutt">

        {/* ── Left Column ── */}
        <div className="order-detail-left">

          {/* Breadcrumb */}
          <div className="order-breadcrumb">
            <Link to={isSeller ? "/seller/orders" : "/buyer/orders"}>Orders</Link>
            <span>›</span>
            <span>Order #{order._id.slice(-6).toUpperCase()}</span>
          </div>

          {/* Order Card */}
          <div className="order-detail-card">
            <div className="order-detail-top">
              <div className="order-detail-gig">
                {order.gigId?.images?.[0] ? (
                  <img src={order.gigId.images[0]} alt={order.gigId.title} className="order-detail-gig-img" />
                ) : (
                  <div className="order-detail-gig-placeholder">
                    <Package size={22} />
                  </div>
                )}
                <div>
                  <h2 className="order-detail-gig-title">{order.gigId?.title}</h2>
                  <p className="order-detail-gig-meta">
                    Package: <strong>{order.package}</strong> · ${order.amount} · {order.deliveryTime} days delivery
                  </p>
                </div>
              </div>
              <Badge status={order.status} />
            </div>

            {/* Stepper */}
            {order.status !== "cancelled" && (
              <div className="order-stepper">
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="order-stepper-item">
                    <div className={`order-stepper-dot ${i <= currentStepIndex ? "done" : ""}`}>
                      {i < currentStepIndex ? <Check size={13} /> : i + 1}
                    </div>
                    <span className={`order-stepper-label ${i === currentStepIndex ? "active" : ""}`}>
                      {s.replace("_", " ")}
                    </span>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`order-stepper-line ${i < currentStepIndex ? "done" : ""}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Requirements */}
            {order.requirements && (
              <div className="order-requirements">
                <p className="order-requirements-label">Requirements</p>
                <p className="order-requirements-text">{order.requirements}</p>
              </div>
            )}

            {/* Seller Actions */}
            {isSeller && (
              <div className="order-actions">
                {order.status === "pending" && (
                  <button className="btn btn-primary" onClick={() => updateStatus("in_progress")}>
                    Accept Order
                  </button>
                )}
                {order.status === "in_progress" && (
                  <button className="btn btn-primary" onClick={() => updateStatus("completed")}>
                    Mark as Completed
                  </button>
                )}
              </div>
            )}

            {/* Buyer Actions */}
            {isBuyer && (
              <div className="order-actions">
                {order.status === "pending_payment" && !order.isPaid && (
                  <div className="od-payment-banner">
                    <p className="od-payment-title">
                      <AlertTriangle size={15} /> Payment pending!
                    </p>
                    <p className="od-payment-desc">Complete your payment to start this order.</p>
                    <Link to={`/orders/${order._id}/pay`} className="btn btn-primary od-pay-btn">
                      <CreditCard size={15} /> Pay Now — ${order.amount}
                    </Link>
                  </div>
                )}
                {(order.status === "pending" || order.status === "in_progress") && (
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus("cancelled")}>
                    Cancel Order
                  </button>
                )}
                {order.status === "completed" && !order.isReviewed && (
                  <button className="btn btn-primary" onClick={() => setShowReviewForm(true)}>
                    Leave a Review
                  </button>
                )}
                {order.status === "completed" && order.isReviewed && (
                  <span className="order-reviewed-badge">
                    <Check size={13} /> Review submitted
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="review-form-card">
              <h3 className="review-form-title">Leave a Review</h3>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <StarRating
                  rating={reviewData.rating}
                  interactive
                  onRate={(r) => setReviewData({ ...reviewData, rating: r })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Share your experience..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="review-form-actions">
                <button className="btn btn-outline" onClick={() => setShowReviewForm(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleReviewSubmit} disabled={reviewing}>
                  {reviewing ? (
                    <span className="od-btn-inner"><Loader2 size={15} className="od-spinner" /> Submitting...</span>
                  ) : "Submit Review"}
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="message-section">
            <h3 className="message-section-title">Messages</h3>
            <div className="message-thread">
              {messagesData?.messages?.length === 0 ? (
                <p className="message-empty">No messages yet. Start the conversation!</p>
              ) : (
                messagesData?.messages?.map((msg) => {
                  const isMe = msg.senderId?._id === user?._id;
                  return (
                    <div key={msg._id} className={`message-bubble ${isMe ? "mine" : "theirs"}`}>
                      {!isMe && (
                        <div className="message-sender">
                          {msg.senderId?.avatar ? (
                            <img src={msg.senderId.avatar} alt={msg.senderId.name} className="avatar avatar-sm" />
                          ) : (
                            <div className="avatar-initials avatar-sm">
                              {msg.senderId?.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="message-content">
                        <p className="message-text">{msg.text}</p>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {order.status !== "cancelled" && (
              <form onSubmit={handleSendMessage} className="message-input-row">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="form-input message-input"
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !message.trim()}>
                  {sending ? <Loader2 size={15} className="od-spinner" /> : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="order-detail-right">

          {/* Buyer / Seller Info */}
          <div className="order-info-card">
            <h3 className="order-info-title">{isSeller ? "Buyer" : "Seller"}</h3>
            <div className="order-info-user">
              {(isSeller ? order.buyerId : order.sellerId)?.avatar ? (
                <img
                  src={(isSeller ? order.buyerId : order.sellerId).avatar}
                  alt="user"
                  className="avatar avatar-lg"
                />
              ) : (
                <div className="avatar-initials avatar-lg">
                  {(isSeller ? order.buyerId : order.sellerId)?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="order-info-name">{(isSeller ? order.buyerId : order.sellerId)?.name}</p>
                <p className="order-info-email">{(isSeller ? order.buyerId : order.sellerId)?.email}</p>
              </div>
            </div>

            {/* Report section */}
            <div className="od-report-section">
              {hasReported ? (
                <div className="od-reported-notice">
                  <Flag size={13} />
                  <span>You have already reported this user. Admin will review it.</span>
                </div>
              ) : (
                <button
                  className="btn btn-outline btn-sm od-report-btn"
                  onClick={() => setShowReportModal(true)}
                >
                  <Flag size={13} /> Report {isSeller ? "Buyer" : "Seller"}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-info-card">
            <h3 className="order-info-title">Order Summary</h3>
            <div className="order-summary-rows">
              <div className="order-summary-row">
                <span>Order ID</span>
                <span>#{order._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="order-summary-row">
                <span>Package</span>
                <span className="od-capitalize">{order.package}</span>
              </div>
              <div className="order-summary-row">
                <span>Amount</span>
                <span className="order-summary-amount">${order.amount}</span>
              </div>
              <div className="order-summary-row">
                <span>Delivery</span>
                <span>{order.deliveryTime} days</span>
              </div>
              <div className="order-summary-row">
                <span>Placed</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
              <div className="order-summary-row">
                <span>Status</span>
                <Badge status={order.status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={reportedUserId}
        reportedUserName={reportedUserName}
        orderId={id}
        onSuccess={() => refetchReportCheck()}
      />
    </div>
  );
};

export default OrderDetail;