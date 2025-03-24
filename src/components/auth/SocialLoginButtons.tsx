import React from 'react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface SocialLoginButtonsProps {
  className?: string;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ className = '' }) => {
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    try {
      // Log the attempt
      console.log(`Attempting to login with ${provider}`);
      
      // Redirect to the auth endpoint
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      console.error(`Error redirecting to ${provider} login:`, error);
      toast.error(`Failed to connect to ${provider}. Please try again.`);
    }
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      <button
        onClick={() => handleSocialLogin('google')}
        type="button"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaGoogle className="text-red-500" />
        <span>Continue with Google</span>
      </button>
      
      <button
        onClick={() => handleSocialLogin('facebook')}
        type="button"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaFacebook className="text-blue-600" />
        <span>Continue with Facebook</span>
      </button>
    </div>
  );
};

export default SocialLoginButtons;
