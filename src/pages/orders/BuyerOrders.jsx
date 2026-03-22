import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Package, ArrowRight } from "lucide-react";
import { getBuyerOrdersApi } from "../../api/orderApi.js";
import Badge from "../../components/common/Badge.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Loader from "../../components/common/Loader.jsx";
import "./Orders.css";

const FILTERS = [
  { label: "All",         value: ""           },
  { label: "Pending",     value: "pending"    },
  { label: "In Progress", value: "in_progress"},
  { label: "Completed",   value: "completed"  },
  { label: "Cancelled",   value: "cancelled"  },
];

const BuyerOrders = () => {
  const [status, setStatus] = useState("");
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-orders", status, page],
    queryFn: () => getBuyerOrdersApi({ status, page, limit: 10 }),
    keepPreviousData: true,
  });

  return (
    <div className="orders-page">
      <div className="container">

        {/* Header */}
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitle">Track and manage your purchases</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`orders-filter-btn ${status === f.value ? "active" : ""}`}
              onClick={() => { setStatus(f.value); setPage(1); }}
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
            <ClipboardList size={48} className="orders-empty-icon" />
            <h3>No orders found</h3>
            <p>Start by browsing available services</p>
            <Link to="/gigs" className="btn btn-primary">Browse Services</Link>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {data?.orders?.map((order) => (
                <Link key={order._id} to={`/orders/${order._id}`} className="order-card">

                  {/* Gig Image */}
                  <div className="order-card__image">
                    {order.gigId?.images?.[0] ? (
                      <img src={order.gigId.images[0]} alt={order.gigId.title} />
                    ) : (
                      <div className="order-card__placeholder">
                        <Package size={22} />
                      </div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="order-card__info">
                    <h3 className="order-card__title">{order.gigId?.title || "Gig"}</h3>
                    <div className="order-card__meta">
                      <span>Seller: <strong>{order.sellerId?.name}</strong></span>
                      <span>Package: <strong>{order.package}</strong></span>
                      <span>Delivery: <strong>{order.deliveryTime} days</strong></span>
                    </div>
                    <p className="order-card__date">
                      Ordered on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="order-card__right">
                    <Badge status={order.status} />
                    <span className="order-card__price">${order.amount}</span>
                    <ArrowRight size={16} className="order-card__arrow" />
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

export default BuyerOrders;