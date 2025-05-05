'use client';

import React from 'react';
import Image from 'next/image';

const SalesMap = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium mb-4">Sales By Region</h2>
      <div className="h-64 relative">
        <Image 
          src="/auth/map.png" 
          alt="Sales Map" 
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default SalesMap;
