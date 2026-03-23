import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  Plus,
  ArrowRight,
  Package,
  Loader2,
} from "lucide-react";
import { getBuyerDashboardApi } from "../../api/dashboardApi.js";
import { submitReviewApi } from "../../api/reviewApi.js";
import { getBuyerWalletApi, buyerTopUpApi } from "../../api/walletApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Badge from "../../components/common/Badge.jsx";
import StarRating from "../../components/common/StarRating.jsx";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";
import "./Dashboard.css";
import WarningBanner from "../../components/common/WarningBanner.jsx";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reviewModal, setReviewModal]   = useState(null);
  const [reviewData, setReviewData]     = useState({ rating: 0, comment: "" });
  const [topUpAmount, setTopUpAmount]   = useState("");
  const [showTopUp, setShowTopUp]       = useState(false);

  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ["buyer-wallet"],
    queryFn: getBuyerWalletApi,
  });

  const { mutate: topUp, isPending: toppingUp } = useMutation({
    mutationFn: buyerTopUpApi,
    onSuccess: (data) => {
      toast.success(data.message);
      setShowTopUp(false);
      setTopUpAmount("");
      refetchWallet();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-dashboard"],
    queryFn: getBuyerDashboardApi,
  });

  const { mutate: submitReview, isPending: reviewing } = useMutation({
    mutationFn: submitReviewApi,
    onSuccess: () => {
      toast.success("Review submitted!");
      setReviewModal(null);
      setReviewData({ rating: 0, comment: "" });
      queryClient.invalidateQueries(["buyer-dashboard"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit review");
    },
  });

  const handleReviewSubmit = () => {
    if (reviewData.rating === 0)        { toast.error("Please select a rating"); return; }
    if (!reviewData.comment.trim())     { toast.error("Please write a comment");  return; }
    submitReview({ orderId: reviewModal, ...reviewData });
  };

  if (isLoading) return <Loader fullPage />;

  const { stats, recentOrders, pendingReviews } = data || {};

  return (
    <div className="dashboard-page">
      <div className="container">
        <WarningBanner warning={user?.warning} />
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Hello, {user?.name?.split(" ")[0]}</h1>
            <p className="dashboard-subtitle">Manage your orders and purchases</p>
          </div>
          <Link to="/gigs" className="btn btn-primary">Browse Services</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid stats-grid--4">
          <div className="stat-card">
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{stats?.totalOrders || 0}</p>
            <p className="stat-hint">All time</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Spent</p>
            <p className="stat-value">${stats?.totalSpent || 0}</p>
            <p className="stat-hint">Completed orders</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">In Progress</p>
            <p className="stat-value stat-value--blue">{stats?.inProgressOrders || 0}</p>
            <p className="stat-hint">Active orders</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Completed</p>
            <p className="stat-value stat-value--green">{stats?.completedOrders || 0}</p>
            <p className="stat-hint">Finished orders</p>
          </div>
        </div>

        {/* Pending Reviews */}
        {pendingReviews?.length > 0 && (
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Pending Reviews</h2>
              <span className="dashboard-badge">{pendingReviews.length}</span>
            </div>
            <div className="pending-reviews-list">
              {pendingReviews.map((order) => (
                <div key={order._id} className="pending-review-item">
                  <div className="pending-review-img">
                    {order.gigId?.images?.[0] ? (
                      <img src={order.gigId.images[0]} alt={order.gigId.title} />
                    ) : (
                      <div className="db-placeholder"><Package size={20} /></div>
                    )}
                  </div>
                  <div className="pending-review-info">
                    <p className="pending-review-title">{order.gigId?.title}</p>
                    <p className="pending-review-seller">Seller: {order.sellerId?.name}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setReviewModal(order._id)}
                  >
                    Leave Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-two-col">

          {/* Recent Orders */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Recent Orders</h2>
              <Link to="/buyer/orders" className="dashboard-card-link">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            {recentOrders?.length === 0 ? (
              <div className="dashboard-empty">
                <p>No orders yet</p>
                <Link to="/gigs" className="btn btn-primary btn-sm">Browse Services</Link>
              </div>
            ) : (
              <div className="recent-orders-list-simple">
                {recentOrders?.map((order) => (
                  <Link key={order._id} to={`/orders/${order._id}`} className="recent-order-item">
                    <div className="recent-order-img">
                      {order.gigId?.images?.[0] ? (
                        <img src={order.gigId.images[0]} alt={order.gigId.title} />
                      ) : (
                        <div className="db-placeholder"><Package size={18} /></div>
                      )}
                    </div>
                    <div className="recent-order-info">
                      <p className="recent-order-title">{order.gigId?.title}</p>
                      <p className="recent-order-seller">{order.sellerId?.name}</p>
                    </div>
                    <div className="recent-order-right">
                      <Badge status={order.status} />
                      <span className="recent-order-price">${order.amount}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">
                <Wallet size={18} /> My Wallet
              </h2>
              <button className="btn btn-primary btn-sm" onClick={() => setShowTopUp(true)}>
                <Plus size={14} /> Add Funds
              </button>
            </div>
            <div className="db-wallet-body">
              <div className="db-wallet-balance-block">
                <p className="db-wallet-label">Available Balance</p>
                <p className="db-wallet-amount">${walletData?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="db-wallet-txns">
                <p className="db-wallet-label">Recent Transactions</p>
                {walletData?.transactions?.length === 0 ? (
                  <p className="db-wallet-empty">No transactions yet</p>
                ) : (
                  walletData?.transactions?.slice(0, 5).map((tx, i) => (
                    <div key={i} className="db-txn-row">
                      <span className="db-txn-desc">{tx.description}</span>
                      <span className={`db-txn-amount ${tx.type === "debit" ? "debit" : "credit"}`}>
                        {tx.type === "debit" ? "-" : "+"}${tx.amount}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Order Breakdown */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Order Breakdown</h2>
            </div>
            <div className="order-breakdown">
              {[
                { label: "Pending",     value: stats?.pendingOrders     || 0, color: "#ffbe00" },
                { label: "In Progress", value: stats?.inProgressOrders  || 0, color: "#4a90e2" },
                { label: "Completed",   value: stats?.completedOrders   || 0, color: "#1dbf73" },
                { label: "Cancelled",   value: stats?.cancelledOrders   || 0, color: "#e63737" },
              ].map((item) => (
                <div key={item.label} className="breakdown-item">
                  <div className="breakdown-left">
                    <div className="breakdown-dot" style={{ background: item.color }} />
                    <span className="breakdown-label">{item.label}</span>
                  </div>
                  <div className="breakdown-right">
                    <span className="breakdown-value">{item.value}</span>
                    <div className="breakdown-bar-track">
                      <div
                        className="breakdown-bar-fill"
                        style={{
                          width: `${stats?.totalOrders ? Math.round((item.value / stats.totalOrders) * 100) : 0}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="modal-overlay" onClick={() => setShowTopUp(false)}>
          <div className="modal-box db-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><Wallet size={17} /> Add Funds to Wallet</h3>
              <button className="modal-close" onClick={() => setShowTopUp(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="db-info-banner">
                Demo mode — no real payment will be made
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number" min="1" max="10000"
                  className="form-input"
                  placeholder="Enter amount (e.g. 100)"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
              <div className="db-quick-amounts">
                {[10, 50, 100, 500].map((amt) => (
                  <button
                    key={amt}
                    className="btn btn-outline btn-sm"
                    onClick={() => setTopUpAmount(String(amt))}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowTopUp(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => topUp(Number(topUpAmount))}
                disabled={toppingUp || !topUpAmount}
              >
                {toppingUp ? (
                  <span className="db-btn-inner"><Loader2 size={15} className="db-spinner" /> Adding...</span>
                ) : (
                  `Add $${topUpAmount || 0}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Leave a Review</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Your Rating</label>
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
                  placeholder="Share your experience with this seller..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setReviewModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReviewSubmit} disabled={reviewing}>
                {reviewing ? (
                  <span className="db-btn-inner"><Loader2 size={15} className="db-spinner" /> Submitting...</span>
                ) : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;