'use client';

import React from 'react';
import { Building, Image as ImageIcon, Home, Users, Building2 } from 'lucide-react';

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  className?: string;
  type?: 'property' | 'interior' | 'building' | 'agent' | 'generic';
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width,
  height,
  className = '',
  type = 'generic'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'property':
        return <Building className="text-gray-400" size={48} />;
      case 'interior':
        return <Home className="text-gray-400" size={48} />;
      case 'building':
        return <Building2 className="text-gray-400" size={48} />;
      case 'agent':
        return <Users className="text-gray-400" size={48} />;
      default:
        return <ImageIcon className="text-gray-400" size={48} />;
    }
  };

  return (
    <div
      className={`flex items-center justify-center bg-gray-200 ${className}`}
      style={width && height ? { width, height } : {}}
    >
      {getIcon()}
    </div>
  );
};

export default PlaceholderImage;
