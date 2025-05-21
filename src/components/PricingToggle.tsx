// components/PricingToggle.tsx
"use client";

import { useState } from "react";

type Props = {
  onToggle: (isYearly: boolean) => void;
};

export default function PricingToggle({ onToggle }: Props) {
  const [isYearly, setIsYearly] = useState(false);

  const toggle = () => {
    setIsYearly(!isYearly);
    onToggle(!isYearly);
  };

  return (
    <div className="flex justify-center items-center mb-12">
      <span className={`mr-2 ${!isYearly ? "text-white" : "text-gray-400"}`}>Monthly</span>
      <button
        onClick={toggle}
        className={`relative inline-flex items-center h-6 rounded-full w-11 bg-gray-600`}
      >
        <span
          className={`transform transition ease-in-out duration-200 inline-block w-4 h-4 bg-white rounded-full ${
            isYearly ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className={`ml-2 ${isYearly ? "text-white" : "text-gray-400"}`}>Yearly</span>
    </div>
  );
}
