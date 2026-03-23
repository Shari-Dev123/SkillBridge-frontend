import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Code2,
  Palette,
  Zap,
  XCircle,
  MessageSquare,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { getGigBySlugApi } from "../../api/gigApi.js";
import { getGigReviewsApi } from "../../api/reviewApi.js";
import { placeOrderApi } from "../../api/orderApi.js";
import { getSellerAvailabilityApi } from "../../api/userApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import StarRating from "../../components/common/StarRating.jsx";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";
import "./GigDetail.css";

const CATEGORY_ICONS = {
  "web-development": <Code2   size={52} />,
  "graphic-design":  <Palette size={52} />,
};

const GigDetail = () => {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isBuyer } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [activeImage, setActiveImage]         = useState(0);
  const [requirements, setRequirements]       = useState("");
  const [showOrderModal, setShowOrderModal]   = useState(false);

  const { data: gigData, isLoading } = useQuery({
    queryKey: ["gig", slug],
    queryFn: () => getGigBySlugApi(slug),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", gigData?.gig?._id],
    queryFn: () => getGigReviewsApi(gigData.gig._id),
    enabled: !!gigData?.gig?._id,
  });

  const { data: availData } = useQuery({
    queryKey: ["seller-availability", gigData?.gig?.sellerId?._id],
    queryFn: () => getSellerAvailabilityApi(gigData.gig.sellerId._id),
    enabled: !!gigData?.gig?.sellerId?._id,
  });

  const { mutate: placeOrder, isPending: ordering } = useMutation({
    mutationFn: placeOrderApi,
    onSuccess: (data) => {
      toast.success("Order placed successfully!");
      setShowOrderModal(false);
      queryClient.invalidateQueries(["buyer-orders"]);
      navigate(`/orders/${data.order._id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to place order"),
  });

  const handleOrderSubmit = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!isBuyer) { toast.error("Only buyers can place orders"); return; }
    placeOrder({ gigId: gig._id, package: selectedPackage, requirements });
  };

  if (isLoading) return <Loader fullPage />;

  const gig = gigData?.gig;
  if (!gig) return <div className="container">Gig not found</div>;

  const availability  = availData?.availability;
  const isUnavailable = availability?.isAvailable === false;
  const awayMessage   = availability?.awayMessage;
  const allowMessages = availability?.allowMessages;

  const currentPkg = gig.pricing?.[selectedPackage];
  const packages   = ["basic", "standard", "premium"].filter((p) => gig.pricing?.[p]?.price);

  return (
    <div className="gig-detail-page">
      <div className="container gig-detail-layoutt">

        {/* ── Left Column ── */}
        <div className="gig-detail-left">

          {/* Breadcrumb */}
          <div className="gig-breadcrumb">
            <Link to="/gigs">Services</Link>
            <span>›</span>
            <Link to={`/gigs?category=${gig.category}`}>
              {gig.category.replace(/-/g, " ")}
            </Link>
            <span>›</span>
            <span>{gig.title}</span>
          </div>

          {/* Title */}
          <h1 className="gig-detail-title">{gig.title}</h1>

          {/* Seller row */}
          <div className="gig-seller-row">
            <Link to={`/seller/${gig.sellerId?._id}`} className="gig-seller-info">
              {gig.sellerId?.avatar ? (
                <img src={gig.sellerId.avatar} alt={gig.sellerId.name} className="avatar avatar-md" />
              ) : (
                <div className="avatar-initials avatar-md">
                  {gig.sellerId?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="gig-seller-name">{gig.sellerId?.name}</span>
            </Link>
            {gig.rating > 0 && <StarRating rating={gig.rating} totalReviews={gig.totalReviews} />}
            <span className="gig-orders-count">{gig.totalOrders} orders</span>
          </div>

          {/* Seller Unavailable Banner */}
          {isUnavailable && (
            <div className="gig-unavail-banner">
              <XCircle size={20} color="#dc2626" className="gig-unavail-icon" />
              <div>
                <p className="gig-unavail-title">Seller is currently unavailable</p>
                {awayMessage && (
                  <p className="gig-unavail-msg">"{awayMessage}"</p>
                )}
                {(availability?.unavailableFrom || availability?.unavailableTo) && (
                  <p className="gig-unavail-dates">
                    {availability.unavailableFrom && `From: ${new Date(availability.unavailableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                    {availability.unavailableTo   && ` — To: ${new Date(availability.unavailableTo).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                  </p>
                )}
                {allowMessages && (
                  <p className="gig-unavail-contact">
                    <MessageSquare size={12} /> You can still message the seller for active orders
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Image Gallery */}
          <div className="gig-gallery">
            <div className="gig-gallery__main">
              {gig.images?.[activeImage] ? (
                <img src={gig.images[activeImage]} alt={gig.title} />
              ) : (
                <div className="gig-gallery__placeholder">
                  {CATEGORY_ICONS[gig.category] || <Zap size={52} />}
                </div>
              )}
            </div>
            {gig.images?.length > 1 && (
              <div className="gig-gallery__thumbs">
                {gig.images.map((img, i) => (
                  <button
                    key={i}
                    className={`gig-gallery__thumb ${activeImage === i ? "active" : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`thumb-${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="gig-section">
            <h2 className="gig-section-title">About this gig</h2>
            <p className="gig-description">{gig.description}</p>
          </div>

          {/* Tags */}
          {gig.tags?.length > 0 && (
            <div className="gig-section">
              <h2 className="gig-section-title">Tags</h2>
              <div className="gig-tags">
                {gig.tags.map((tag) => (
                  <Link key={tag} to={`/gigs?search=${tag}`} className="gig-tag">{tag}</Link>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="gig-section">
            <h2 className="gig-section-title">
              Reviews ({reviewsData?.pagination?.total || 0})
            </h2>
            {reviewsData?.reviews?.length === 0 ? (
              <p className="text-muted">No reviews yet</p>
            ) : (
              <div className="gig-reviews">
                {reviewsData?.reviews?.map((review) => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      {review.buyerId?.avatar ? (
                        <img src={review.buyerId.avatar} alt={review.buyerId.name} className="avatar avatar-sm" />
                      ) : (
                        <div className="avatar-initials avatar-sm">
                          {review.buyerId?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="review-name">{review.buyerId?.name}</p>
                        <StarRating rating={review.rating} />
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column — Order Box ── */}
        <div className="gig-detail-right">
          <div className="order-box">

            {/* Unavailable notice */}
            {isUnavailable && (
              <div className="order-box-unavail">
                <XCircle size={14} />
                Seller is not accepting new orders
              </div>
            )}

            {/* Package Tabs */}
            {packages.length > 1 && (
              <div className="order-tabs">
                {packages.map((pkg) => (
                  <button
                    key={pkg}
                    className={`order-tab ${selectedPackage === pkg ? "active" : ""}`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {gig.pricing[pkg]?.label || pkg}
                  </button>
                ))}
              </div>
            )}

            {/* Package Details */}
            <div className="order-pkg">
              <div className="order-pkg__header">
                <span className="order-pkg__name">{currentPkg?.label || selectedPackage}</span>
                <span className="order-pkg__price">${currentPkg?.price}</span>
              </div>
              {currentPkg?.description && (
                <p className="order-pkg__desc">{currentPkg.description}</p>
              )}
              <div className="order-pkg__meta">
                <span className="order-pkg__delivery">
                  <Clock size={13} /> {currentPkg?.deliveryTime} days delivery
                </span>
              </div>
            </div>

            {/* Order Button */}
            {isBuyer && (
              <button
                className={`btn btn-primary btn-block btn-lg ${isUnavailable ? "btn-disabled" : ""}`}
                onClick={() => setShowOrderModal(true)}
                disabled={isUnavailable}
              >
                {isUnavailable ? "Seller Unavailable" : `Continue ($${currentPkg?.price})`}
              </button>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="btn btn-primary btn-block btn-lg">
                Sign in to Order
              </Link>
            )}

            {isAuthenticated && !isBuyer && (
              <p className="text-muted text-center text-sm">Sellers cannot place orders</p>
            )}

            <div className="order-divider"><span>or</span></div>
            <Link to={`/seller/${gig.sellerId?._id}`} className="btn btn-outline btn-block">
              View Seller Profile
            </Link>

          </div>
        </div>
      </div>

      {/* ── Order Modal ── */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Place Order</h3>
              <button className="modal-close" onClick={() => setShowOrderModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-gig-info">
                <p className="modal-gig-title">{gig.title}</p>
                <p className="modal-gig-pkg">
                  {currentPkg?.label} — ${currentPkg?.price} · {currentPkg?.deliveryTime} days delivery
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Requirements (optional)</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Describe what you need in detail..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowOrderModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleOrderSubmit} disabled={ordering}>
                {ordering ? (
                  <span className="gig-btn-inner">
                    <Loader2 size={15} className="gig-spinner" /> Placing order...
                  </span>
                ) : (
                  `Confirm Order — $${currentPkg?.price}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigDetail;