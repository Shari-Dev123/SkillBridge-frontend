import { Star } from "lucide-react";
import "./StarRating.css";

const STARS = [1, 2, 3, 4, 5];

const StarRating = ({ rating, totalReviews, interactive = false, onRate }) => {
  return (
    <div className="star-rating">
      <div className="stars">
        {STARS.map((star) => {
          const filled = star <= Math.round(rating);
          return (
            <span
              key={star}
              className={`star ${filled ? "filled" : ""} ${interactive ? "interactive" : ""}`}
              onClick={() => interactive && onRate && onRate(star)}
            >
              <Star
                size={interactive ? 24 : 14}
                fill={filled ? "#ffbe00" : "none"}
                strokeWidth={1.5}
              />
            </span>
          );
        })}
      </div>

      {rating > 0 && (
        <span className="rating-value">{Number(rating).toFixed(1)}</span>
      )}

      {totalReviews !== undefined && (
        <span className="rating-count">({totalReviews})</span>
      )}
    </div>
  );
};

export default StarRating;