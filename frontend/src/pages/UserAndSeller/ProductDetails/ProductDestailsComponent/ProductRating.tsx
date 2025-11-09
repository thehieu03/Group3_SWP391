import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";

interface ProductRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

const ProductRating = ({ rating, size = "sm" }: ProductRatingProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
      {[...Array(fullStars)].map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className="text-amber-400"
        />
      ))}
      {hasHalfStar && (
        <FontAwesomeIcon icon={faStarHalfAlt} className="text-amber-400" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FontAwesomeIcon key={i} icon={faStar} className="text-gray-300" />
      ))}
    </div>
  );
};

export default ProductRating;

