import React from "react";
import { Star } from "lucide-react";

const TestimonialCard = ({ name, title, testimonial, rating }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover-scale">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
      <p className="text-gray-600 mb-6">"{testimonial}"</p>
      <div>
        <h4 className="text-sm font-semibold text-insurance-blue">{name}</h4>
        <p className="text-xs text-gray-500">{title}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
