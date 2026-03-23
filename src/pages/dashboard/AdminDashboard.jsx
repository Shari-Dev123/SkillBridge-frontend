import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings, Flag, Check, X, CheckCircle2, Users,
} from "lucide-react";
import {
  getAdminPendingOrdersApi,
  getAdminAllOrdersApi,
  approveOrderApi,
  rejectOrderApi,
} from "../../api/orderApi.js";
import { getAllReportsApi } from "../../api/reportApi.js";
import Badge from "../../components/common/Badge.jsx";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";
import "./Dashboard.css";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["admin-pending-orders"],
    queryFn:  () => getAdminPendingOrdersApi(),
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn:  () => getAdminAllOrdersApi(),
    enabled:  activeTab === "all",
  });

  const { data: reportsData } = useQuery({
    queryKey: ["admin-reports", "pending"],
    queryFn:  () => getAllReportsApi({ status: "pending" }),
  });

  const pendingReportsCount = reportsData?.pagination?.total || 0;

  const { mutate: approveOrder, isPending: approving } = useMutation({
    mutationFn: approveOrderApi,
    onSuccess: () => {
      toast.success("Order approved! Seller payment released.");
      queryClient.invalidateQueries(["admin-pending-orders"]);
      queryClient.invalidateQueries(["admin-all-orders"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: rejectOrder, isPending: rejecting } = useMutation({
    mutationFn: rejectOrderApi,
    onSuccess: () => {
      toast.success("Order rejected. Buyer refunded.");
      queryClient.invalidateQueries(["admin-pending-orders"]);
      queryClient.invalidateQueries(["admin-all-orders"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const orders    = activeTab === "pending" ? pendingData?.orders : allData?.orders;
  const isLoading = activeTab === "pending" ? pendingLoading : allLoading;

  const platformFee = (allData?.orders || [])
    .filter((o) => o.isPaid)
    .reduce((sum, o) => sum + (o.platformFee || 0), 0)
    .toFixed(2);

  const STATS = [
    { label: "Pending Approval", value: pendingData?.pagination?.total || 0, colorClass: "stat-value--yellow" },
    { label: "Total Orders",     value: allData?.pagination?.total    || 0,  colorClass: "stat-value--blue"   },
    { label: "Platform (2% cut)",value: `$${platformFee}`,                   colorClass: "stat-value--purple" },
    { label: "Pending Reports",  value: pendingReportsCount,                 colorClass: "stat-value--red"    },
  ];

  return (
    <div className="admin-page">
      <div className="container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">
              <Settings size={26} /> Admin Dashboard
            </h1>
            <p className="admin-subtitle">Manage orders and release payments to sellers</p>
          </div>

          {/* Quick Links */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {/* Users Link */}
            <Link to="/admin/users" className="admin-reports-link">
              <Users size={16} />
              Manage Users
            </Link>

            {/* Reports Link */}
            <Link
              to="/admin/reports"
              className={`admin-reports-link ${pendingReportsCount > 0 ? "has-pending" : ""}`}
            >
              <Flag size={16} />
              User Reports
              {pendingReportsCount > 0 && (
                <span className="admin-reports-badge">{pendingReportsCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid stats-grid--4">
          {STATS.map((item) => (
            <div key={item.label} className="stat-card">
              <p className="stat-label">{item.label}</p>
              <p className={`stat-value ${item.colorClass}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {["pending", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`admin-tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab === "pending"
                ? `Pending Approval (${pendingData?.pagination?.total || 0})`
                : "All Orders"}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="admin-table-card">
          {isLoading ? (
            <Loader fullPage />
          ) : orders?.length === 0 ? (
            <div className="admin-empty">
              <CheckCircle2 size={36} />
              <p>No pending orders</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr className="admin-table-head-row">
                  {["Order ID","Buyer","Seller","Service","Amount","Fee (2%)","Seller Gets","Status","Actions"].map(
                    (h) => <th key={h} className="admin-th">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {orders?.map((order, i) => (
                  <tr key={order._id} className={`admin-table-row ${i % 2 !== 0 ? "striped" : ""}`}>
                    <td className="admin-td admin-order-id">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="admin-td">
                      <div className="admin-user-name">{order.buyerId?.name}</div>
                      <div className="admin-user-email">{order.buyerId?.email}</div>
                    </td>
                    <td className="admin-td">
                      <div className="admin-user-name">{order.sellerId?.name}</div>
                      <div className="admin-user-email">{order.sellerId?.email}</div>
                    </td>
                    <td className="admin-td admin-gig-title">{order.gigId?.title}</td>
                    <td className="admin-td admin-amount">${order.amount}</td>
                    <td className="admin-td admin-fee">${order.platformFee?.toFixed(2)}</td>
                    <td className="admin-td admin-earning">${order.sellerEarning?.toFixed(2)}</td>
                    <td className="admin-td"><Badge status={order.status} /></td>
                    <td className="admin-td">
                      {!order.adminApproved && order.isPaid && (
                        <div className="admin-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => approveOrder(order._id)} disabled={approving}>
                            <Check size={13} /> Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => rejectOrder(order._id)} disabled={rejecting}>
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                      {order.adminApproved && (
                        <span className="admin-approved-label">
                          <CheckCircle2 size={14} /> Approved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;