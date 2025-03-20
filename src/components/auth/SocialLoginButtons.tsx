import React from 'react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

interface SocialLoginButtonsProps {
  className?: string;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      <button
        onClick={() => window.location.href = '/api/auth/google'}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaGoogle className="text-red-500" />
        <span>Continue with Google</span>
      </button>
      
      <button
        onClick={() => window.location.href = '/api/auth/facebook'}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaFacebook className="text-blue-600" />
        <span>Continue with Facebook</span>
      </button>
    </div>
  );
};

export default SocialLoginButtons;
