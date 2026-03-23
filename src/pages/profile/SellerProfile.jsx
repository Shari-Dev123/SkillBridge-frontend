import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiPlay,
  FiBriefcase,
  FiImage,
  FiBookOpen,
  FiAward,
  FiPackage,
  FiExternalLink,
} from "react-icons/fi";
import { getSellerProfileApi } from "../../api/userApi.js";
import { getGigsApi } from "../../api/gigApi.js";
import { getSellerReviewsApi } from "../../api/reviewApi.js";
import StarRating from "../../components/common/StarRating.jsx";
import Loader from "../../components/common/Loader.jsx";
import "./Profile.css";

const LEVEL_CONFIG = {
  new_seller: { label: "New Seller", color: "#6b7280", bg: "#f3f4f6" },
  level_1:    { label: "Level 1",    color: "#0369a1", bg: "#e0f2fe" },
  level_2:    { label: "Level 2",    color: "#b45309", bg: "#fef3c7" },
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const SellerProfile = () => {
  const { id } = useParams();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["seller-profile", id],
    queryFn:  () => getSellerProfileApi(id),
  });

  const { data: gigsData } = useQuery({
    queryKey: ["seller-gigs", id],
    queryFn:  () => getGigsApi({ sellerId: id, limit: 6 }),
    enabled:  !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["seller-reviews", id],
    queryFn:  () => getSellerReviewsApi(id, { limit: 5 }),
    enabled:  !!id,
  });

  if (isLoading) return <Loader fullPage />;

  const { user, sellerProfile: sp } = profileData || {};

  if (!user) {
    return (
      <div className="container sp-not-found">
        <p>Seller not found</p>
      </div>
    );
  }

  return (
    <div className="seller-profile-page">
      <div className="container seller-profile-layoutt">

        {/* ── Left Sidebar ── */}
        <aside className="seller-profile-sidebar">

          {/* Avatar & Identity */}
          <div className="seller-profile-card">
            <div className="seller-avatar-wrap">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="seller-avatar-img" />
              ) : (
                <div className="seller-avatar-initials">{getInitials(user.name)}</div>
              )}
              <span className="seller-online-dot" />
            </div>

            <h1 className="seller-name">{user.name}</h1>

            {sp?.username && (
              <p className="seller-username">@{sp.username}</p>
            )}

            {sp?.tagline && (
              <p className="seller-tagline">"{sp.tagline}"</p>
            )}

            {/* Level Badge */}
            {sp?.level && (() => {
              const cfg = LEVEL_CONFIG[sp.level] || LEVEL_CONFIG.new_seller;
              return (
                <span
                  className="seller-level-badge"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              );
            })()}

            {sp?.rating > 0 && (
              <div className="seller-rating">
                <StarRating rating={sp.rating} totalReviews={sp.totalReviews} />
              </div>
            )}

            <div className="seller-stats-row">
              <div className="seller-stat">
                <span className="seller-stat-value">{sp?.completedOrders || 0}</span>
                <span className="seller-stat-label">Orders Done</span>
              </div>
              <div className="seller-stat-divider" />
              <div className="seller-stat">
                <span className="seller-stat-value">{sp?.totalReviews || 0}</span>
                <span className="seller-stat-label">Reviews</span>
              </div>
            </div>

            <div className="seller-info-list">
              {user.country && (
                <div className="seller-info-item">
                  <FiMapPin size={14} className="seller-info-icon" />
                  <span>{user.country}</span>
                </div>
              )}
              {sp?.hourlyRate > 0 && (
                <div className="seller-info-item">
                  <FiDollarSign size={14} className="seller-info-icon" />
                  <span>${sp.hourlyRate}/hr</span>
                </div>
              )}
              <div className="seller-info-item">
                <FiCalendar size={14} className="seller-info-icon" />
                <span>
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {sp?.introVideo && (
              <a
                href={sp.introVideo}
                target="_blank"
                rel="noreferrer"
                className="seller-intro-link"
              >
                <FiPlay size={13} />
                Watch Intro Video
              </a>
            )}
          </div>

          {/* About */}
          {sp?.bio && (
            <div className="seller-profile-card">
              <h3 className="seller-section-title">About</h3>
              <p className="seller-bio">{sp.bio}</p>
            </div>
          )}

          {/* Skills */}
          {sp?.skills?.length > 0 && (
            <div className="seller-profile-card">
              <h3 className="seller-section-title">Skills & Expertise</h3>
              <div className="seller-skills">
                {sp.skills.map((skill) => (
                  <span key={skill} className="seller-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {sp?.languages?.length > 0 && (
            <div className="seller-profile-card">
              <h3 className="seller-section-title">Languages</h3>
              <div className="seller-languages">
                {sp.languages.map((lang, i) => (
                  <div key={i} className="seller-language-item">
                    <span>{lang.name || lang}</span>
                    <span className="seller-language-level">{lang.level || "Fluent"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Right Main ── */}
        <div className="seller-profile-main">

          {/* Work Experience */}
          {sp?.workExperience?.length > 0 && (
            <div className="sp-section">
              <h2 className="sp-section__title">
                <FiBriefcase size={18} /> Work Experience
              </h2>
              <div className="sp-timeline">
                {sp.workExperience.map((w, i) => (
                  <div
                    key={i}
                    className={`sp-timeline-item ${i < sp.workExperience.length - 1 ? "sp-timeline-item--bordered" : ""}`}
                  >
                    <div className="sp-timeline-icon">
                      <FiBriefcase size={16} />
                    </div>
                    <div className="sp-timeline-body">
                      <p className="sp-timeline-body__title">{w.title}</p>
                      <p className="sp-timeline-body__sub">{w.company}</p>
                      <p className="sp-timeline-body__date">{w.from} — {w.to}</p>
                      {w.description && (
                        <p className="sp-timeline-body__desc">{w.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {sp?.portfolio?.length > 0 && (
            <div className="sp-section">
              <h2 className="sp-section__title">
                <FiImage size={18} /> Portfolio
              </h2>
              <div className="sp-portfolio-grid">
                {sp.portfolio.map((p, i) => (
                  <div key={i} className="sp-portfolio-card">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="sp-portfolio-card__img" />
                    ) : (
                      <div className="sp-portfolio-card__placeholder">
                        <FiImage size={28} />
                      </div>
                    )}
                    <div className="sp-portfolio-card__body">
                      <p className="sp-portfolio-card__title">{p.title}</p>
                      {p.description && (
                        <p className="sp-portfolio-card__desc">{p.description}</p>
                      )}
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="sp-portfolio-card__link"
                        >
                          <FiExternalLink size={12} /> View Project
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {sp?.education?.length > 0 && (
            <div className="sp-section">
              <h2 className="sp-section__title">
                <FiBookOpen size={18} /> Education
              </h2>
              <div className="sp-timeline">
                {sp.education.map((e, i) => (
                  <div key={i} className="sp-timeline-item">
                    <div className="sp-timeline-icon sp-timeline-icon--blue">
                      <FiBookOpen size={16} />
                    </div>
                    <div className="sp-timeline-body">
                      <p className="sp-timeline-body__title">
                        {e.degree}{e.major ? ` — ${e.major}` : ""}
                      </p>
                      <p className="sp-timeline-body__sub">{e.institution}</p>
                      <p className="sp-timeline-body__date">{e.from} — {e.to}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {sp?.certifications?.length > 0 && (
            <div className="sp-section">
              <h2 className="sp-section__title">
                <FiAward size={18} /> Certifications
              </h2>
              <div className="sp-cert-list">
                {sp.certifications.map((c, i) => (
                  <div key={i} className="sp-cert-item">
                    <FiAward size={20} className="sp-cert-item__icon" />
                    <div>
                      <p className="sp-cert-item__name">{c.name}</p>
                      <p className="sp-cert-item__meta">{c.issuedBy} · {c.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gigs / Services */}
          <div className="seller-section">
            <h2 className="seller-main-title">Services</h2>
            {gigsData?.gigs?.length === 0 ? (
              <p className="text-muted">No services listed yet</p>
            ) : (
              <div className="seller-gigs-grid">
                {gigsData?.gigs?.map((gig) => (
                  <Link key={gig._id} to={`/gigs/${gig.slug}`} className="gig-card">
                    <div className="gig-card__image">
                      {gig.images?.[0] ? (
                        <img src={gig.images[0]} alt={gig.title} />
                      ) : (
                        <div className="gig-card__placeholder">
                          <FiPackage size={24} />
                        </div>
                      )}
                    </div>
                    <div className="gig-card__body">
                      <h3 className="gig-card__title">{gig.title}</h3>
                      {gig.rating > 0 && (
                        <StarRating rating={gig.rating} totalReviews={gig.totalReviews} />
                      )}
                      <div className="gig-card__footer">
                        <span className="gig-card__label">Starting at</span>
                        <span className="gig-card__price">${gig.pricing?.basic?.price}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="seller-section">
            <h2 className="seller-main-title">
              Reviews ({reviewsData?.pagination?.total || 0})
            </h2>
            {reviewsData?.reviews?.length === 0 ? (
              <p className="text-muted">No reviews yet</p>
            ) : (
              <div className="seller-reviews-list">
                {reviewsData?.reviews?.map((review) => (
                  <div key={review._id} className="seller-review-item">
                    <div className="seller-review-header">
                      <div className="seller-review-buyer">
                        {review.buyerId?.avatar ? (
                          <img
                            src={review.buyerId.avatar}
                            alt={review.buyerId.name}
                            className="avatar avatar-md"
                          />
                        ) : (
                          <div className="avatar-initials avatar-md">
                            {review.buyerId?.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="seller-review-buyer-name">{review.buyerId?.name}</p>
                          <StarRating rating={review.rating} />
                        </div>
                      </div>
                      <span className="seller-review-date">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="seller-review-comment">{review.comment}</p>
                    {review.gigId?.title && (
                      <Link
                        to={`/gigs/${review.gigId?.slug}`}
                        className="seller-review-gig"
                      >
                        {review.gigId.title}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SellerProfile;