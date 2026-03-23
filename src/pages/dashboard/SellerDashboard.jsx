import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Wallet,
  Banknote,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  Medal,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getSellerDashboardApi } from "../../api/dashboardApi.js";
import { deleteGigApi } from "../../api/gigApi.js";
import { getSellerWalletApi, sellerWithdrawApi } from "../../api/walletApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Badge from "../../components/common/Badge.jsx";
import StarRating from "../../components/common/StarRating.jsx";
import Loader from "../../components/common/Loader.jsx";
import AvailabilityModal from "../../components/common/AvailabilityModal.jsx";
import toast from "react-hot-toast";
import "./Dashboard.css";
import WarningBanner from "../../components/common/WarningBanner.jsx";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Level Config ── */
const LEVEL_CONFIG = {
  new_seller: { label: "New Seller", color: "#6b7280", bg: "#f3f4f6" },
  level_1:    { label: "Level 1",    color: "#0369a1", bg: "#e0f2fe" },
  level_2:    { label: "Level 2",    color: "#b45309", bg: "#fef3c7" },
};

const LevelBadge = ({ level }) => {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.new_seller;
  return (
    <span className="db-level-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <Medal size={13} />
      {cfg.label}
    </span>
  );
};

/* ── Progress Bar ── */
const ProgressBar = ({ current, target, color = "var(--primary)" }) => {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="db-progress-track">
      <div
        className="db-progress-fill"
        style={{ width: `${pct}%`, background: pct >= 100 ? "#16a34a" : color }}
      />
    </div>
  );
};

/* ── Level Progress Card ── */
const LevelProgressCard = ({ levelProgress }) => {
  const [showDetails, setShowDetails] = useState(false);
  if (!levelProgress) return null;

  const current     = levelProgress.current;
  const isLevel2    = current === "level_2";
  const targetReqs  = (!isLevel2 && (current === "level_1" ? levelProgress.level2 : levelProgress.level1))?.requirements
                      || levelProgress.level1.requirements;
  const donePct     = Math.round((targetReqs.filter((r) => r.done).length / targetReqs.length) * 100);
  const targetLabel = current === "level_1" ? "Level 2" : "Level 1";

  return (
    <div className="dashboard-card db-level-card">
      <div className="dashboard-card-header">
        <div className="db-level-header-left">
          <h2 className="dashboard-card-title"><Trophy size={18} /> Seller Level</h2>
          <LevelBadge level={current} />
        </div>
        <button className="db-toggle-btn" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> View Requirements</>}
        </button>
      </div>

      {isLevel2 ? (
        <div className="db-top-level-banner">
          <Trophy size={28} color="#b45309" />
          <div>
            <p className="db-top-level-title">You are at the Top Level!</p>
            <p className="db-top-level-desc">Level 2 Seller — SkillBridge's highest rank. Congratulations!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="db-overall-progress">
            <div className="db-progress-meta">
              <span className="db-progress-label">{targetLabel} progress</span>
              <span className={`db-progress-count ${donePct === 100 ? "done" : ""}`}>
                {targetReqs.filter((r) => r.done).length}/{targetReqs.length} requirements
              </span>
            </div>
            <div className="db-progress-row">
              <div className="db-progress-track db-progress-track--lg">
                <div
                  className="db-progress-fill"
                  style={{
                    width: `${donePct}%`,
                    background: donePct === 100 ? "#16a34a" : "var(--primary)",
                  }}
                />
              </div>
              <span className={`db-progress-pct ${donePct === 100 ? "done" : ""}`}>{donePct}%</span>
            </div>
          </div>

          {showDetails && (
            <div className="db-req-details">
              {/* Level 1 */}
              <div className="db-req-section db-req-section--blue">
                <p className="db-req-section-title blue">
                  <Medal size={14} /> Level 1 Requirements
                  {levelProgress.level1.completed && (
                    <span className="db-req-done"><CheckCircle2 size={12} /> Completed</span>
                  )}
                </p>
                {levelProgress.level1.requirements.map((req, i) => (
                  <div key={i} className="db-req-row">
                    {req.done
                      ? <CheckCircle2 size={16} color="#16a34a" className="db-req-icon" />
                      : <XCircle     size={16} color="#d1d5db" className="db-req-icon" />
                    }
                    <span className="db-req-label">{req.label}</span>
                    <ProgressBar current={req.current} target={req.target} color="#0369a1" />
                    <span className={`db-req-value ${req.done ? "done" : ""}`}>
                      {req.prefix || ""}{req.current} / {req.prefix || ""}{req.target}
                    </span>
                  </div>
                ))}
              </div>

              {/* Level 2 */}
              <div className="db-req-section db-req-section--gold">
                <p className="db-req-section-title gold">
                  <Medal size={14} /> Level 2 Requirements
                  {levelProgress.level2.completed && (
                    <span className="db-req-done"><CheckCircle2 size={12} /> Completed</span>
                  )}
                </p>
                {levelProgress.level2.requirements.map((req, i) => (
                  <div key={i} className="db-req-row">
                    {req.done
                      ? <CheckCircle2 size={16} color="#16a34a" className="db-req-icon" />
                      : <XCircle     size={16} color="#d1d5db" className="db-req-icon" />
                    }
                    <span className="db-req-label">{req.label}</span>
                    <ProgressBar current={req.current} target={req.target} color="#b45309" />
                    <span className={`db-req-value ${req.done ? "done" : ""}`}>
                      {req.prefix || ""}{req.current} / {req.prefix || ""}{req.target}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Main Seller Dashboard ── */
const SellerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [deleteConfirm, setDeleteConfirm]   = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdraw, setShowWithdraw]     = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ["seller-wallet"],
    queryFn: getSellerWalletApi,
  });

  const { mutate: withdraw, isPending: withdrawing } = useMutation({
    mutationFn: sellerWithdrawApi,
    onSuccess: (data) => {
      toast.success(data.message);
      setShowWithdraw(false);
      setWithdrawAmount("");
      refetchWallet();
      queryClient.invalidateQueries(["seller-dashboard"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: getSellerDashboardApi,
  });

  const { mutate: deleteGig } = useMutation({
    mutationFn: deleteGigApi,
    onSuccess: () => {
      toast.success("Gig deleted");
      setDeleteConfirm(null);
      queryClient.invalidateQueries(["seller-dashboard"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  if (isLoading) return <Loader fullPage />;

  const { stats, monthlyEarnings, recentOrders, myGigs, recentReviews, levelProgress, availability } = data || {};

  const chartData = monthlyEarnings?.map((item) => ({
    name:     MONTHS[item._id.month - 1],
    earnings: item.earnings,
    orders:   item.orders,
  })) || [];

  const isAvailable = availability?.isAvailable !== false;

  return (
    <div className="dashboard-page">
      <div className="container">
      <WarningBanner warning={user?.warning} />
        {/* Header */}
        <div className="dashboard-header">
          <div className="db-header-left">
            <div>
              <h1 className="dashboard-title">Welcome back, {user?.name?.split(" ")[0]}</h1>
              <p className="dashboard-subtitle">Here's what's happening with your gigs</p>
            </div>
            {levelProgress?.current && <LevelBadge level={levelProgress.current} />}
          </div>
          <div className="db-header-actions">
            <button
              onClick={() => setShowAvailability(true)}
              className={`db-avail-btn ${isAvailable ? "available" : "unavailable"}`}
            >
              {isAvailable
                ? <><CheckCircle2 size={15} /> Available</>
                : <><XCircle      size={15} /> Unavailable</>
              }
            </button>
            <Link to="/seller/gigs/create" className="btn btn-primary">+ Create New Gig</Link>
          </div>
        </div>

        {/* Away Banner */}
        {!isAvailable && (
          <div className="db-away-banner">
            <XCircle size={22} color="#dc2626" className="db-away-icon" />
            <div className="db-away-content">
              <p className="db-away-title">You are unavailable — Gigs are hidden</p>
              {(availability.unavailableFrom || availability.unavailableTo) && (
                <p className="db-away-dates">
                  {availability.unavailableFrom && `From: ${new Date(availability.unavailableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  {availability.unavailableTo   && ` — To: ${new Date(availability.unavailableTo).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                </p>
              )}
              {availability.awayMessage && (
                <p className="db-away-message">"{availability.awayMessage}"</p>
              )}
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => setShowAvailability(true)}>
              Edit
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: "Total Earnings", value: `$${stats?.totalEarnings || 0}`, hint: "Completed orders",       cls: "" },
            { label: "Total Orders",   value: stats?.totalOrders || 0,         hint: "All time",               cls: "" },
            { label: "In Progress",    value: stats?.inProgressOrders || 0,    hint: "Active orders",          cls: "stat-value--blue"   },
            { label: "Avg Rating",     value: stats?.averageRating ? Number(stats.averageRating).toFixed(1) : "—", hint: `${stats?.totalReviews || 0} reviews`, cls: "stat-value--yellow" },
            { label: "Completed",      value: stats?.completedOrders || 0,     hint: "Finished orders",        cls: "stat-value--green"  },
            { label: "Pending",        value: stats?.pendingOrders || 0,       hint: "Awaiting acceptance",    cls: "stat-value--orange" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <p className="stat-label">{s.label}</p>
              <p className={`stat-value ${s.cls}`}>{s.value}</p>
              <p className="stat-hint">{s.hint}</p>
            </div>
          ))}
        </div>

        {/* Level Progress */}
        <LevelProgressCard levelProgress={levelProgress} />

        {/* Earnings Chart */}
        {chartData.length > 0 && (
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Earnings (Last 6 Months)</h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#74767e" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#74767e" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Earnings"]}
                    contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e4e5e7" }}
                  />
                  <Line
                    type="monotone" dataKey="earnings"
                    stroke="#1dbf73" strokeWidth={2.5}
                    dot={{ fill: "#1dbf73", r: 4 }} activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Wallet Card */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title"><Wallet size={18} /> My Wallet</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowWithdraw(true)}
              disabled={!walletData?.balance || walletData.balance <= 0}
            >
              <Banknote size={14} /> Withdraw
            </button>
          </div>
          <div className="db-wallet-stats">
            {[
              { label: "Available Balance", value: `$${walletData?.balance?.toFixed(2) || "0.00"}`,       color: "var(--primary)" },
              { label: "Total Earned",      value: `$${walletData?.totalEarnings?.toFixed(2) || "0.00"}`, color: "#1dbf73"        },
              { label: "Total Withdrawn",   value: `$${walletData?.withdrawn?.toFixed(2) || "0.00"}`,     color: "#7c3aed"        },
            ].map((item) => (
              <div key={item.label} className="db-wallet-stat-box">
                <p className="db-wallet-label">{item.label}</p>
                <p className="db-wallet-amount" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
          <p className="db-txns-title">Recent Transactions</p>
          {walletData?.transactions?.length === 0 ? (
            <p className="db-wallet-empty">No transactions yet</p>
          ) : (
            walletData?.transactions?.slice(0, 5).map((tx, i) => (
              <div key={i} className="db-txn-row">
                <span className="db-txn-desc">{tx.description}</span>
                <span className={`db-txn-amount ${tx.type === "withdrawal" ? "debit" : "credit"}`}>
                  {tx.type === "withdrawal" ? "-" : "+"}${tx.amount}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="dashboard-two-col">

          {/* My Gigs */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">My Gigs</h2>
              <Link to="/seller/gigs/create" className="dashboard-card-link">+ Add New</Link>
            </div>
            {myGigs?.length === 0 ? (
              <div className="dashboard-empty">
                <p>No gigs yet</p>
                <Link to="/seller/gigs/create" className="btn btn-primary btn-sm">Create your first gig</Link>
              </div>
            ) : (
              <div className="gig-manage-list">
                {myGigs?.map((gig) => (
                  <div key={gig._id} className="gig-manage-item">
                    <div className="gig-manage-img">
                      {gig.images?.[0] ? (
                        <img src={gig.images[0]} alt={gig.title} />
                      ) : (
                        <div className="db-placeholder"><Package size={20} /></div>
                      )}
                    </div>
                    <div className="gig-manage-info">
                      <p className="gig-manage-title">{gig.title}</p>
                      <div className="gig-manage-meta">
                        <span className="gig-manage-price">From ${gig.pricing?.basic?.price}</span>
                        <span className="gig-manage-orders">{gig.totalOrders} orders</span>
                        <span className={`gig-manage-status ${gig.isActive ? "active" : "paused"}`}>
                          {gig.isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                    </div>
                    <div className="gig-manage-actions">
                      <Link to={`/seller/gigs/edit/${gig._id}`} className="btn btn-outline btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(gig._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Recent Reviews</h2>
            </div>
            {recentReviews?.length === 0 ? (
              <div className="dashboard-empty"><p>No reviews yet</p></div>
            ) : (
              <div className="recent-reviews-list">
                {recentReviews?.map((review) => (
                  <div key={review._id} className="recent-review-item">
                    <div className="recent-review-header">
                      <div className="db-review-buyer">
                        {review.buyerId?.avatar ? (
                          <img src={review.buyerId.avatar} alt={review.buyerId.name} className="avatar avatar-sm" />
                        ) : (
                          <div className="avatar-initials avatar-sm">
                            {review.buyerId?.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="recent-review-name">{review.buyerId?.name}</p>
                          <StarRating rating={review.rating} />
                        </div>
                      </div>
                      <span className="recent-review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="recent-review-comment">{review.comment}</p>
                    <p className="recent-review-gig">{review.gigId?.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Recent Orders</h2>
            <Link to="/seller/orders" className="dashboard-card-link">View all →</Link>
          </div>
          {recentOrders?.length === 0 ? (
            <div className="dashboard-empty"><p>No orders yet</p></div>
          ) : (
            <div className="recent-orders-table">
              <div className="recent-orders-head">
                <span>Gig</span><span>Buyer</span><span>Package</span>
                <span>Amount</span><span>Status</span><span></span>
              </div>
              {recentOrders?.map((order) => (
                <div key={order._id} className="recent-orders-row">
                  <span className="recent-orders-gig">{order.gigId?.title || "—"}</span>
                  <span>{order.buyerId?.name}</span>
                  <span className="db-capitalize">{order.package}</span>
                  <span className="recent-orders-amount">${order.amount}</span>
                  <span><Badge status={order.status} /></span>
                  <span>
                    <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm">View →</Link>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="modal-overlay" onClick={() => setShowWithdraw(false)}>
          <div className="modal-box db-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title"><Banknote size={17} /> Withdraw Funds</h3>
              <button className="modal-close" onClick={() => setShowWithdraw(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="db-info-banner success">
                Demo mode — withdrawal will be processed automatically
              </div>
              <p className="db-modal-balance">
                Available: <strong>${walletData?.balance?.toFixed(2)}</strong>
              </p>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number" min="1" max={walletData?.balance || 0}
                  className="form-input" placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <button
                className="btn btn-outline btn-sm db-withdraw-all-btn"
                onClick={() => setWithdrawAmount(String(walletData?.balance || 0))}
              >
                Withdraw All
              </button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => withdraw(Number(withdrawAmount))}
                disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) > (walletData?.balance || 0)}
              >
                {withdrawing ? (
                  <span className="db-btn-inner"><Loader2 size={15} className="db-spinner" /> Processing...</span>
                ) : `Withdraw $${withdrawAmount || 0}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box db-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Gig</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="db-confirm-text">
                Are you sure you want to delete this gig? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteGig(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      <AvailabilityModal
        isOpen={showAvailability}
        onClose={() => setShowAvailability(false)}
        currentAvailability={availability}
      />
    </div>
  );
};

export default SellerDashboard;