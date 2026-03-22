import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Code2,
  Palette,
  PenLine,
  Zap,
  SearchX,
} from "lucide-react";
import { getGigsApi } from "../../api/gigApi.js";
import StarRating from "../../components/common/StarRating.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Loader from "../../components/common/Loader.jsx";
import "./BrowseGigs.css";

const CATEGORIES = [
  { label: "All",                value: ""                  },
  { label: "Web Development",    value: "web-development"   },
  { label: "Graphic Design",     value: "graphic-design"    },
  { label: "Digital Marketing",  value: "digital-marketing" },
  { label: "Writing",            value: "writing"           },
  { label: "Video Editing",      value: "video-editing"     },
  { label: "Mobile Development", value: "mobile-development"},
  { label: "SEO",                value: "seo"               },
  { label: "Other",              value: "other"             },
];

const SORT_OPTIONS = [
  { label: "Newest",             value: ""           },
  { label: "Top Rated",          value: "rating"     },
  { label: "Price: Low to High", value: "price_low"  },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Most Orders",        value: "orders"     },
];

const CATEGORY_ICONS = {
  "web-development": <Code2   size={22} />,
  "graphic-design":  <Palette size={22} />,
  "writing":         <PenLine size={22} />,
};

const GigPlaceholder = ({ category }) => (
  <div className="gig-card__placeholder">
    {CATEGORY_ICONS[category] || <Zap size={22} />}
  </div>
);

const BrowseGigs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const search   = searchParams.get("search")   || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort     = searchParams.get("sort")     || "";

  const [filters, setFilters] = useState({ minPrice, maxPrice, sort });

  const { data, isLoading } = useQuery({
    queryKey: ["gigs", search, category, filters, page],
    queryFn: () =>
      getGigsApi({
        search,
        category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort:     filters.sort,
        page,
        limit: 12,
      }),
    keepPreviousData: true,
  });

  useEffect(() => { setPage(1); }, [search, category]);

  const handleCategoryChange = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set("category", val);
    else params.delete("category");
    params.delete("page");
    setSearchParams(params);
    setPage(1);
  };

  const handleFilterApply = () => {
    const params = new URLSearchParams(searchParams);
    if (filters.minPrice) params.set("minPrice", filters.minPrice); else params.delete("minPrice");
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice); else params.delete("maxPrice");
    if (filters.sort)     params.set("sort",     filters.sort);     else params.delete("sort");
    setSearchParams(params);
    setPage(1);
  };

  const handleFilterReset = () => {
    setFilters({ minPrice: "", maxPrice: "", sort: "" });
    const params = new URLSearchParams();
    if (search)   params.set("search",   search);
    if (category) params.set("category", category);
    setSearchParams(params);
    setPage(1);
  };

  const pageTitle = search
    ? `Results for "${search}"`
    : category
    ? CATEGORIES.find((c) => c.value === category)?.label || "All Services"
    : "All Services";

  return (
    <div className="browse-page">
      <div className="container browse-layout">

        {/* ── Sidebar ── */}
        <aside className="browse-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Category</h3>
            <div className="sidebar-categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  className={`sidebar-cat-btn ${category === cat.value ? "active" : ""}`}
                  onClick={() => handleCategoryChange(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <h3 className="sidebar-title">Budget</h3>
            <div className="sidebar-price">
              <div className="form-group">
                <label className="form-label">Min ($)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max ($)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Any"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <h3 className="sidebar-title">Sort by</h3>
            <div className="sidebar-sorts">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  className={`sidebar-cat-btn ${filters.sort === s.value ? "active" : ""}`}
                  onClick={() => setFilters({ ...filters, sort: s.value })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn btn-primary btn-block"  onClick={handleFilterApply}>Apply Filters</button>
            <button className="btn btn-outline btn-block" onClick={handleFilterReset}>Reset</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="browse-main">
          <div className="browse-header">
            <div>
              <h1 className="browse-title">{pageTitle}</h1>
              {data && (
                <p className="browse-count">
                  {data.pagination?.total || 0} services available
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <Loader fullPage />
          ) : data?.gigs?.length === 0 ? (
            <div className="browse-empty">
              <SearchX size={48} className="browse-empty-icon" />
              <h3>No services found</h3>
              <p>Try different keywords or filters</p>
              <button className="btn btn-primary" onClick={handleFilterReset}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="browse-grid">
                {data?.gigs?.map((gig) => (
                  <Link key={gig._id} to={`/gigs/${gig.slug}`} className="gig-card">
                    <div className="gig-card__image">
                      {gig.images?.[0] ? (
                        <img src={gig.images[0]} alt={gig.title} />
                      ) : (
                        <GigPlaceholder category={gig.category} />
                      )}
                    </div>
                    <div className="gig-card__body">
                      <div className="gig-card__seller">
                        {gig.sellerId?.avatar ? (
                          <img
                            src={gig.sellerId.avatar}
                            alt={gig.sellerId.name}
                            className="avatar avatar-sm"
                          />
                        ) : (
                          <div className="avatar-initials avatar-sm">
                            {gig.sellerId?.name?.[0]?.toUpperCase()}
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

              <Pagination
                currentPage={page}
                totalPages={data?.pagination?.pages || 1}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseGigs;