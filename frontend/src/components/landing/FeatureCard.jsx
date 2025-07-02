import React from "react";
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover-scale">
      <div className="h-12 w-12 rounded-lg bg-insurance-teal/10 flex items-center justify-center text-insurance-teal mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-insurance-blue mb-2">
        {title}
      </h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default FeatureCard;
