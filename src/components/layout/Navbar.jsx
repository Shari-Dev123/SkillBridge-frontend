import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellOff,
  ShoppingBag,
  CheckCircle2,
  PartyPopper,
  XCircle,
  BadgeDollarSign,
  Ban,
  CreditCard,
  Star,
  AlertTriangle,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import UserAvatar from "../common/UserAvatar.jsx";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
} from "../../api/notificationApi.js";
import "./Navbar.css";

const TYPE_ICONS = {
  order_placed:     <ShoppingBag    size={18} />,
  order_accepted:   <CheckCircle2   size={18} />,
  order_completed:  <PartyPopper    size={18} />,
  order_cancelled:  <XCircle        size={18} />,
  order_approved:   <BadgeDollarSign size={18} />,
  order_rejected:   <Ban            size={18} />,
  payment_received: <CreditCard     size={18} />,
  review_received:  <Star           size={18} />,
  report_submitted: <AlertTriangle  size={18} />,
  report_resolved:  <Search         size={18} />,
  general:          <Bell           size={18} />,
};

const Navbar = () => {
  const { user, isAuthenticated, isSeller, isBuyer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const notifRef = useRef(null);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch notifications — poll every 30 seconds
  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotificationsApi({ limit: 15 }),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const notifications = notifData?.notifications || [];
  const unreadCount   = notifData?.unreadCount    || 0;

  const { mutate: markRead } = useMutation({
    mutationFn: markAsReadApi,
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const { mutate: markAll } = useMutation({
    mutationFn: markAllAsReadApi,
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn: deleteNotificationApi,
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markRead(notif._id);
    setNotifOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const timeAgo = (date) => {
    const diff  = Date.now() - new Date(date).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return "Just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <nav className="navbar">
      <div className="container navbar__inner">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          Skill<span>Bridge</span>
        </Link>

        {/* Desktop Nav */}
        <div className={`navbar__links ${menuOpen ? "open" : ""}`}>
          <Link to="/gigs" className="navbar__link">Browse Gigs</Link>

          {!isAuthenticated && (
            <>
              <Link to="/login"    className="navbar__link">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join</Link>
            </>
          )}

          {isAuthenticated && (
            <>
              {isSeller && (
                <Link to="/seller/dashboard" className="navbar__link">Dashboard</Link>
              )}
              {isBuyer && (
                <Link to="/buyer/dashboard" className="navbar__link">Dashboard</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="navbar__link">Admin Panel</Link>
              )}

              {/* ── Notification Bell ── */}
              <div className="navbar__notif" ref={notifRef}>
                <button
                  className="navbar__notif-btn"
                  onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="navbar__notif-badge">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="navbar__notif-panel">
                    {/* Panel Header */}
                    <div className="navbar__notif-header">
                      <span className="navbar__notif-title">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="navbar__notif-count">{unreadCount} new</span>
                        )}
                      </span>
                      {unreadCount > 0 && (
                        <button className="navbar__notif-readall" onClick={() => markAll()}>
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="navbar__notif-list">
                      {notifications.length === 0 ? (
                        <div className="navbar__notif-empty">
                          <BellOff size={32} />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`navbar__notif-item ${!notif.isRead ? "unread" : ""}`}
                          >
                            {/* Icon + Content */}
                            <div
                              className="navbar__notif-body"
                              onClick={() => handleNotifClick(notif)}
                            >
                              <span className="navbar__notif-icon">
                                {TYPE_ICONS[notif.type] || <Bell size={18} />}
                              </span>
                              <div className="navbar__notif-text">
                                <p className="navbar__notif-item-title">{notif.title}</p>
                                <p className="navbar__notif-item-msg">{notif.message}</p>
                                <span className="navbar__notif-time">{timeAgo(notif.createdAt)}</span>
                              </div>
                              {!notif.isRead && <span className="navbar__notif-dot" />}
                            </div>

                            {/* Delete button */}
                            <button
                              className="navbar__notif-delete"
                              onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                              aria-label="Delete notification"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── User Dropdown ── */}
              <div className="navbar__dropdown">
                <button
                  className="navbar__avatar-btn"
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="navbar__username">{user?.name}</span>
                  <ChevronDown size={14} className="navbar__chevron" />
                </button>

                {dropdownOpen && (
                  <div className="navbar__dropdown-menu">
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{user?.name}</p>
                      <p className="navbar__dropdown-role">{user?.role}</p>
                    </div>
                    <div className="navbar__dropdown-divider" />

                    {isSeller && (
                      <>
                        <Link to="/seller/dashboard"   className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                        <Link to="/seller/orders"      className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                        <Link to="/seller/gigs/create" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>Create Gig</Link>
                      </>
                    )}
                    {isBuyer && (
                      <>
                        <Link to="/buyer/dashboard" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                        <Link to="/buyer/orders"    className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <Link to="/admin"         className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>Admin Panel</Link>
                        <Link to="/admin/reports" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>Reports</Link>
                      </>
                    )}

                    <Link to="/profile/edit" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Edit Profile
                    </Link>
                    <div className="navbar__dropdown-divider" />
                    <button
                      className="navbar__dropdown-item navbar__dropdown-logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>

      {/* Dropdown backdrop */}
      {dropdownOpen && (
        <div className="navbar__backdrop" onClick={() => setDropdownOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;