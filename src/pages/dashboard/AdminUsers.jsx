import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Search, Trash2, AlertTriangle, X, ShieldAlert,
  Star, ShoppingBag, Package, ChevronDown, ChevronUp, Eye,
} from "lucide-react";
import {
  adminGetUsersApi,
  adminDeleteUserApi,
  adminWarnUserApi,
} from "../../api/userApi.js";
import Loader from "../../components/common/Loader.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import toast from "react-hot-toast";
import "./Dashboard.css";
import "./AdminUsers.css";

// ── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    seller: { label: "Seller", cls: "au-role au-role--seller" },
    buyer:  { label: "Buyer",  cls: "au-role au-role--buyer"  },
    admin:  { label: "Admin",  cls: "au-role au-role--admin"  },
  };
  const r = map[role] || map.buyer;
  return <span className={r.cls}>{r.label}</span>;
};

// ── Level Badge ───────────────────────────────────────────────────────────────
const LevelBadge = ({ level }) => {
  const map = {
    new_seller: { label: "New",     cls: "au-level au-level--new"  },
    level_1:    { label: "Level 1", cls: "au-level au-level--l1"   },
    level_2:    { label: "Level 2", cls: "au-level au-level--l2"   },
  };
  if (!level) return null;
  const l = map[level] || map.new_seller;
  return <span className={l.cls}>{l.label}</span>;
};

// ── Stat Pill ─────────────────────────────────────────────────────────────────
const Pill = ({ icon: Icon, value, label, color }) => (
  <span className={`au-pill au-pill--${color}`}>
    <Icon size={12} />
    <strong>{value}</strong>
    <span>{label}</span>
  </span>
);

// ── User Row ─────────────────────────────────────────────────────────────────
const UserRow = ({ user, onDelete, onWarn, idx }) => {
  const [expanded, setExpanded] = useState(false);

  const hasWarning = !!user.warning;
  const isSeller   = user.role === "seller";

  return (
    <>
      <tr className={`au-tr ${idx % 2 !== 0 ? "striped" : ""} ${hasWarning ? "au-tr--warned" : ""}`}>
        {/* Avatar + Name */}
        <td className="au-td">
          <div className="au-user-cell">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="au-avatar" />
              : <div className="au-avatar au-avatar--initials">{user.name?.[0]?.toUpperCase()}</div>
            }
            <div>
              <div className="au-user-name">
                {user.name}
                {hasWarning && <ShieldAlert size={13} className="au-warn-icon" title={user.warning} />}
              </div>
              <div className="au-user-email">{user.email}</div>
            </div>
          </div>
        </td>

        {/* Role */}
        <td className="au-td"><RoleBadge role={user.role} /></td>

        {/* Stats */}
        <td className="au-td">
          <div className="au-pills">
            <Pill icon={Package} value={user.totalOrders ?? 0}  label="orders" color="blue"   />
            {isSeller && (
              <>
                <Pill icon={Star}       value={user.rating?.toFixed(1) ?? "0.0"} label="rating" color="yellow" />
                <Pill icon={ShoppingBag} value={`$${user.totalEarnings ?? 0}`}   label="earned" color="green"  />
                <LevelBadge level={user.sellerLevel} />
              </>
            )}
            {!isSeller && (
              <Pill icon={ShoppingBag} value={`$${user.totalSpent ?? 0}`} label="spent" color="purple" />
            )}
          </div>
        </td>

        {/* Joined */}
        <td className="au-td au-date">
          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </td>

        {/* Status */}
        <td className="au-td">
          <span className={`au-status ${user.isActive ? "au-status--active" : "au-status--banned"}`}>
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </td>

        {/* Actions */}
        <td className="au-td">
          <div className="au-actions">
            <button
              className="au-btn au-btn--expand"
              onClick={() => setExpanded(p => !p)}
              title="View details"
            >
              {expanded ? <ChevronUp size={14} /> : <Eye size={14} />}
            </button>
            <button
              className="au-btn au-btn--warn"
              onClick={() => onWarn(user)}
              title="Send warning"
            >
              <AlertTriangle size={14} />
            </button>
            <button
              className="au-btn au-btn--delete"
              onClick={() => onDelete(user)}
              title="Delete user"
              disabled={user.role === "admin"}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Detail Row */}
      {expanded && (
        <tr className="au-detail-row">
          <td colSpan={6}>
            <div className="au-detail-body">
              {/* Active Warning */}
              {hasWarning && (
                <div className="au-detail-warning">
                  <ShieldAlert size={15} />
                  <span><strong>Active Warning:</strong> {user.warning}</span>
                </div>
              )}

              <div className="au-detail-grid">
                <div className="au-detail-box">
                  <p className="au-detail-label">Country</p>
                  <p className="au-detail-val">{user.country || "—"}</p>
                </div>
                <div className="au-detail-box">
                  <p className="au-detail-label">Phone</p>
                  <p className="au-detail-val">{user.phone || "—"}</p>
                </div>
                <div className="au-detail-box">
                  <p className="au-detail-label">Bio</p>
                  <p className="au-detail-val">{user.bio || "—"}</p>
                </div>
                {isSeller && (
                  <>
                    <div className="au-detail-box">
                      <p className="au-detail-label">Services Listed</p>
                      <p className="au-detail-val">{user.totalGigs ?? 0}</p>
                    </div>
                    <div className="au-detail-box">
                      <p className="au-detail-label">Total Reviews</p>
                      <p className="au-detail-val">{user.totalReviews ?? 0}</p>
                    </div>
                    <div className="au-detail-box">
                      <p className="au-detail-label">Wallet Balance</p>
                      <p className="au-detail-val">${user.walletBalance ?? 0}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Warn Modal ────────────────────────────────────────────────────────────────
const WarnModal = ({ user, onClose, onConfirm, loading }) => {
  const [message, setMessage] = useState(user.warning || "");

  return (
    <div className="au-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="au-modal">
        <div className="au-modal-header">
          <h2 className="au-modal-title"><AlertTriangle size={18} /> Send Warning</h2>
          <button className="au-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="au-modal-body">
          <div className="au-warn-target">
            {user.avatar
              ? <img src={user.avatar} className="au-avatar au-avatar--sm" alt="" />
              : <div className="au-avatar au-avatar--initials au-avatar--sm">{user.name?.[0]?.toUpperCase()}</div>
            }
            <div>
              <p className="au-warn-name">{user.name}</p>
              <p className="au-warn-email">{user.email}</p>
            </div>
          </div>
          <label className="au-field-label">Warning Message</label>
          <textarea
            className="au-textarea"
            rows={4}
            placeholder="Explain the reason for this warning..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <p className="au-field-hint">This message will be visible on the user's dashboard.</p>
        </div>
        <div className="au-modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-warning"
            disabled={!message.trim() || loading}
            onClick={() => onConfirm(user._id, message)}
          >
            <AlertTriangle size={14} /> Send Warning
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ user, onClose, onConfirm, loading }) => (
  <div className="au-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="au-modal au-modal--sm">
      <div className="au-confirm-icon"><Trash2 size={36} className="au-delete-icon" /></div>
      <h2 className="au-confirm-title">Delete User?</h2>
      <p className="au-confirm-desc">
        Are you sure you want to permanently delete <strong>{user.name}</strong>?
        This cannot be undone.
      </p>
      <div className="au-confirm-actions">
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" disabled={loading} onClick={() => onConfirm(user._id)}>
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AdminUsers = () => {
  const queryClient = useQueryClient();

  const [search,    setSearch]    = useState("");
  const [role,      setRole]      = useState("");
  const [page,      setPage]      = useState(1);
  const [warnUser,  setWarnUser]  = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [inputVal,  setInputVal]  = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role, page],
    queryFn:  () => adminGetUsersApi({ search, role, page, limit: 12 }),
    keepPreviousData: true,
  });

  const { mutate: deleteUserMutation, isPending: deleting } = useMutation({
    mutationFn: adminDeleteUserApi,
    onSuccess: () => {
      toast.success("User deleted successfully");
      setDeleteUser(null);
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: err => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const { mutate: warnUserMutation, isPending: warning } = useMutation({
    mutationFn: ({ id, message }) => adminWarnUserApi(id, message),
    onSuccess: () => {
      toast.success("Warning sent successfully");
      setWarnUser(null);
      queryClient.invalidateQueries(["admin-users"]);
    },
    onError: err => toast.error(err.response?.data?.message || "Failed to send warning"),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputVal);
    setPage(1);
  };

  const TABS = [
    { label: "All",     value: "" },
    { label: "Sellers", value: "seller" },
    { label: "Buyers",  value: "buyer" },
  ];

  return (
    <div className="admin-page">
      <div className="container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title"><Users size={24} /> User Management</h1>
            <p className="admin-subtitle">View, warn, and manage all platform users</p>
          </div>

          {/* Stats pills */}
          {data && (
            <div className="au-header-stats">
              <span className="au-hstat"><strong>{data.pagination?.total ?? 0}</strong> total users</span>
              <span className="au-hstat au-hstat--seller"><strong>{data.sellerCount ?? 0}</strong> sellers</span>
              <span className="au-hstat au-hstat--buyer"><strong>{data.buyerCount ?? 0}</strong> buyers</span>
            </div>
          )}
        </div>

        {/* Search + Filter */}
        <div className="au-toolbar">
          <form className="au-search-form" onSubmit={handleSearch}>
            <div className="au-search-wrap">
              <Search size={16} className="au-search-icon" />
              <input
                className="au-search-input"
                placeholder="Search by name or email…"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit">Search</button>
            {search && (
              <button className="btn btn-outline" type="button" onClick={() => { setSearch(""); setInputVal(""); setPage(1); }}>
                <X size={14} /> Clear
              </button>
            )}
          </form>

          <div className="au-role-tabs">
            {TABS.map(t => (
              <button
                key={t.value}
                className={`au-role-tab ${role === t.value ? "active" : ""}`}
                onClick={() => { setRole(t.value); setPage(1); }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="au-table-card">
          {isLoading ? (
            <Loader fullPage />
          ) : !data?.users?.length ? (
            <div className="admin-empty">
              <Users size={36} />
              <p>No users found</p>
            </div>
          ) : (
            <div className="au-table-scroll">
              <table className="au-table">
                <thead>
                  <tr className="au-thead-row">
                    <th className="au-th">User</th>
                    <th className="au-th">Role</th>
                    <th className="au-th">Stats</th>
                    <th className="au-th">Joined</th>
                    <th className="au-th">Status</th>
                    <th className="au-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user, idx) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      idx={idx}
                      onDelete={setDeleteUser}
                      onWarn={setWarnUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Pagination
          currentPage={page}
          totalPages={data?.pagination?.pages || 1}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      {warnUser && (
        <WarnModal
          user={warnUser}
          onClose={() => setWarnUser(null)}
          onConfirm={(id, message) => warnUserMutation({ id, message })}
          loading={warning}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={(id) => deleteUserMutation(id)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default AdminUsers;