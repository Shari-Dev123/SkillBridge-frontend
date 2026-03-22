import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Code2,
  Palette,
  Megaphone,
  PenLine,
  Video,
  Smartphone,
  Search,
  Zap,
  User,
} from "lucide-react";
import { getGigsApi } from "../../api/gigApi.js";
import StarRating from "../../components/common/StarRating.jsx";
import Loader from "../../components/common/Loader.jsx";
import "./Home.css";

const CATEGORIES = [
  { label: "Web Development",    value: "web-development",   icon: <Code2       size={26} /> },
  { label: "Graphic Design",     value: "graphic-design",    icon: <Palette     size={26} /> },
  { label: "Digital Marketing",  value: "digital-marketing", icon: <Megaphone   size={26} /> },
  { label: "Writing",            value: "writing",           icon: <PenLine     size={26} /> },
  { label: "Video Editing",      value: "video-editing",     icon: <Video       size={26} /> },
  { label: "Mobile Development", value: "mobile-development",icon: <Smartphone  size={26} /> },
  { label: "SEO",                value: "seo",               icon: <Search      size={26} /> },
  { label: "Other",              value: "other",             icon: <Zap         size={26} /> },
];

const HERO_CARDS = [
  { icon: <Code2   size={26} />, label: "Web Development",  sub: "Starting at $25" },
  { icon: <Palette size={26} />, label: "Graphic Design",   sub: "Starting at $15" },
  { icon: <PenLine size={26} />, label: "Content Writing",  sub: "Starting at $10" },
];

const GIG_CATEGORY_ICONS = {
  "web-development": <Code2   size={40} />,
  "graphic-design":  <Palette size={40} />,
  "writing":         <PenLine size={40} />,
};

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["featured-gigs"],
    queryFn: () => getGigsApi({ limit: 8, sort: "rating" }),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/gigs?search=${search.trim()}`);
  };

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <h1 className="hero__title">
              Find the perfect{" "}
              <span className="hero__title-highlight">freelance</span>{" "}
              services for your business
            </h1>
            <p className="hero__subtitle">
              Work with talented freelancers to get your projects done — fast,
              affordable, and professional.
            </p>

            <form onSubmit={handleSearch} className="hero__search">
              <input
                type="text"
                placeholder="Search for any service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="hero__search-input"
              />
              <button type="submit" className="hero__search-btn">Search</button>
            </form>

            <div className="hero__popular">
              <span>Popular:</span>
              {["Logo Design", "WordPress", "React", "SEO"].map((tag) => (
                <button
                  key={tag}
                  className="hero__tag"
                  onClick={() => navigate(`/gigs?search=${tag}`)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero__visual">
            {HERO_CARDS.map((card, i) => (
              <div key={i} className={`hero__card hero__card--${i + 1}`}>
                <div className="hero__card-avatar">{card.icon}</div>
                <div>
                  <p className="hero__card-name">{card.label}</p>
                  <p className="hero__card-sub">{card.sub}</p>
                </div>
              </div>
            ))}
            <div className="hero__stats">
              {[
                { num: "500+", label: "Services"     },
                { num: "200+", label: "Sellers"      },
                { num: "98%",  label: "Satisfaction" },
              ].map((s) => (
                <div key={s.label} className="hero__stat">
                  <span className="hero__stat-num">{s.num}</span>
                  <span className="hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Browse by category</h2>
          <div className="categories__grid">
            {CATEGORIES.map((cat) => (
              <Link key={cat.value} to={`/gigs?category=${cat.value}`} className="category-card">
                <span className="category-card__icon">{cat.icon}</span>
                <span className="category-card__label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Gigs ── */}
      <section className="featured">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular services</h2>
            <Link to="/gigs" className="section-link">View all →</Link>
          </div>

          {isLoading ? (
            <Loader fullPage />
          ) : (
            <div className="gigs-grid">
              {data?.gigs?.map((gig) => (
                <Link key={gig._id} to={`/gigs/${gig.slug}`} className="gig-card">
                  <div className="gig-card__image">
                    {gig.images?.[0] ? (
                      <img src={gig.images[0]} alt={gig.title} />
                    ) : (
                      <div className="gig-card__placeholder">
                        {GIG_CATEGORY_ICONS[gig.category] || <Zap size={40} />}
                      </div>
                    )}
                  </div>
                  <div className="gig-card__body">
                    <div className="gig-card__seller">
                      {gig.sellerId?.avatar ? (
                        <img src={gig.sellerId.avatar} alt={gig.sellerId.name} className="avatar avatar-sm" />
                      ) : (
                        <div className="avatar-initials avatar-sm">
                          {gig.sellerId?.name?.[0]?.toUpperCase() || <User size={12} />}
                        </div>
                      )}
                      <span className="gig-card__seller-name">{gig.sellerId?.name}</span>
                    </div>
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
      </section>

      {/* ── How it Works ── */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title text-center">How SkillBridge works</h2>
          <div className="steps">
            <div className="step">
              <div className="step__num">1</div>
              <h3 className="step__title">Find a service</h3>
              <p className="step__desc">Browse hundreds of services or search for exactly what you need.</p>
            </div>
            <div className="step__arrow">→</div>
            <div className="step">
              <div className="step__num">2</div>
              <h3 className="step__title">Place an order</h3>
              <p className="step__desc">Choose a package, share your requirements, and place your order.</p>
            </div>
            <div className="step__arrow">→</div>
            <div className="step">
              <div className="step__num">3</div>
              <h3 className="step__title">Get it done</h3>
              <p className="step__desc">Work with your freelancer and receive high-quality results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <div className="container cta__inner">
          <div>
            <h2 className="cta__title">Ready to get started?</h2>
            <p className="cta__sub">Join thousands of businesses using SkillBridge.</p>
          </div>
          <div className="cta__btns">
            <Link to="/gigs"     className="btn btn-primary btn-lg">Find a Service</Link>
            <Link to="/register" className="btn btn-outline btn-lg cta__btn-outline">Become a Seller</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;