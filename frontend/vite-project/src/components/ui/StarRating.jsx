import { Star } from "lucide-react";

export default function StarRating({ rating = 0, size = "md", interactive = false, onRate }) {
  const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-6 w-6" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${star <= Math.round(rating) ? "fill-orange-400 text-orange-400" : "text-gray-300"} ${interactive ? "cursor-pointer hover:text-orange-400" : ""}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

