import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiPackage,
  FiArrowRight,
  FiCheckCircle,
  FiPlayCircle,
  FiPlusCircle,
  FiMail,
} from "react-icons/fi";
import { getSellerOrdersApi, updateOrderStatusApi } from "../../api/orderApi.js";
import Badge from "../../components/common/Badge.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";
import "./Orders.css";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const SellerOrders = () => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders", status, page],
    queryFn: () => getSellerOrdersApi({ status, page, limit: 10 }),
    keepPreviousData: true,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatusApi(id, status),
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries(["seller-orders"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const handleStatusUpdate = (e, orderId, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    updateStatus({ id: orderId, status: newStatus });
  };

  return (
    <div className="orders-page">
      <div className="container">

        {/* Header */}
        <div className="orders-header">
          <div>
            <h1 className="orders-title">Manage Orders</h1>
            <p className="orders-subtitle">View and update your incoming orders</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`orders-filter-btn ${status === f.value ? "active" : ""}`}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <Loader fullPage />
        ) : data?.orders?.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <FiMail size={48} />
            </div>
            <h3>No orders yet</h3>
            <p>Your incoming orders will appear here</p>
            <Link to="/seller/gigs/create" className="btn btn-primary">
              <FiPlusCircle />
              Create a Gig
            </Link>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {data?.orders?.map((order) => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="order-card"
                >
                  {/* Gig Image */}
                  <div className="order-card__image">
                    {order.gigId?.images?.[0] ? (
                      <img
                        src={order.gigId.images[0]}
                        alt={order.gigId.title}
                      />
                    ) : (
                      <div className="order-card__placeholder">
                        <FiPackage size={24} />
                      </div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="order-card__info">
                    <h3 className="order-card__title">
                      {order.gigId?.title || "Gig"}
                    </h3>
                    <div className="order-card__meta">
                      <span>Buyer: <strong>{order.buyerId?.name}</strong></span>
                      <span>Package: <strong>{order.package}</strong></span>
                      <span>Delivery: <strong>{order.deliveryTime} days</strong></span>
                    </div>
                    <p className="order-card__date">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>

                    {/* Quick Action Buttons */}
                    <div className="order-card__actions">
                      {order.status === "pending" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) =>
                            handleStatusUpdate(e, order._id, "in_progress")
                          }
                        >
                          <FiPlayCircle />
                          Accept Order
                        </button>
                      )}
                      {order.status === "in_progress" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) =>
                            handleStatusUpdate(e, order._id, "completed")
                          }
                        >
                          <FiCheckCircle />
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="order-card__right">
                    <Badge status={order.status} />
                    <span className="order-card__price">${order.amount}</span>
                    <span className="order-card__arrow">
                      <FiArrowRight size={18} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={data?.pagination?.pages || 1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;