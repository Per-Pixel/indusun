import React from 'react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

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
    <div className={`flex gap-3 w-full ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleSocialLogin('google')}
        type="button"
        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-800"
      >
        <FaGoogle className="text-red-500" />
        <span className="hidden sm:inline">Google</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleSocialLogin('facebook')}
        type="button"
        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-800"
      >
        <FaFacebook className="text-blue-600" />
        <span className="hidden sm:inline">Facebook</span>
      </motion.button>
    </div>
  );
};

export default SocialLoginButtons;
