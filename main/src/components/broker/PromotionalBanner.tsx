'use client';

import React from 'react';
import Image from 'next/image';

interface PromotionalBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  onButtonClick: () => void;
}

const PromotionalBanner = ({ 
  title, 
  subtitle, 
  buttonText, 
  onButtonClick 
}: PromotionalBannerProps) => {
  return (
    <div className="bg-indigo-700 rounded-lg p-6 mb-6 flex items-center justify-between relative overflow-hidden">
      <div className="text-white z-10">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-lg font-medium mb-4">{subtitle}</p>
        <button 
          onClick={onButtonClick}
          className="bg-white text-indigo-700 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
        >
          {buttonText}
        </button>
      </div>
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
        <Image 
          src="/auth/properties/house-banner.png" 
          alt="House" 
          width={200} 
          height={120} 
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default PromotionalBanner;
