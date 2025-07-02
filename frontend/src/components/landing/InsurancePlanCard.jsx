// import React from "react";
// import { Check } from "lucide-react";
// // import { Button } from "@/components/ui/button";

// const InsurancePlanCard = ({
//   title,
//   price,
//   period,
//   description,
//   features,
//   buttonText,
//   popular = false,
// }) => {
//   const containerClasses = `relative rounded-xl overflow-hidden transition-all duration-300 ${
//     popular
//       ? "shadow-lg ring-2 ring-insurance-teal scale-105 md:scale-110 z-10 bg-white"
//       : "shadow-md hover:shadow-lg bg-white"
//   }`;

//   const contentPadding = `p-6 ${popular ? "pt-12" : ""}`;

//   const buttonClasses = `w-full ${
//     popular ? "" : "bg-insurance-blue hover:bg-insurance-blue/90"
//   }`;

//   return (
//     <div className={containerClasses}>
//       {popular && (
//         <div className="absolute top-0 left-0 right-0 bg-insurance-teal py-1.5 text-center text-white text-sm font-medium">
//           Most Popular
//         </div>
//       )}

//       <div className={contentPadding}>
//         <h3 className="text-xl font-semibold text-insurance-blue mb-2">
//           {title}
//         </h3>
//         <div className="flex items-baseline mb-4">
//           <span className="text-3xl font-bold text-insurance-blue">
//             {price}
//           </span>
//           <span className="text-gray-500 ml-1">/{period}</span>
//         </div>
//         <p className="text-gray-500 mb-6">{description}</p>

//         <ul className="space-y-3 mb-6">
//           {features.map((feature, index) => (
//             <li key={index} className="flex items-start gap-2">
//               <Check className="h-5 w-5 text-insurance-teal shrink-0 mt-0.5" />
//               <span className="text-sm">{feature}</span>
//             </li>
//           ))}
//         </ul>

//         <button className={buttonClasses}>{buttonText}</button>
//       </div>
//     </div>
//   );
// };

// export default InsurancePlanCard;
import React from "react";
import { Check } from "lucide-react";

const InsurancePlanCard = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  popular = false,
}) => {
  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        popular
          ? "shadow-lg ring-2 ring-[#0BC5EA] scale-105 md:scale-110 z-10 bg-white"
          : "shadow-md hover:shadow-lg bg-white"
      }`}
    >
      {popular && (
        <div className="absolute top-0 left-0 right-0 bg-[#0BC5EA] py-1.5 text-center text-white text-sm font-medium">
          Most Popular
        </div>
      )}

      <div className={`p-6 ${popular ? "pt-12" : ""}`}>
        <h3 className="text-xl font-semibold text-[#1A365D] mb-2">{title}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold text-[#1A365D]">{price}</span>
          <span className="text-gray-500 ml-1">/{period}</span>
        </div>
        <p className="text-gray-500 mb-6">{description}</p>

        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-[#0BC5EA] shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          className={`w-full py-2 px-4 text-white font-medium rounded-md ${
            popular
              ? "bg-[#0BC5EA] hover:bg-[#0ac0dd]"
              : "bg-[#1A365D] hover:bg-[#163256]"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default InsurancePlanCard;
