'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react'; // Import X icon

export default function BrokerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleClose = () => {
    router.back(); // This will take user back to previous page
  };

  // Animation variants matching hamburger menu
  const closeButtonVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };



  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setEmailError('');

    // Validate empty email
    if (!email.trim()) {
      setEmailError('Email is required');
      toast.error('Please enter your email');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/broker/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification code sent to your email');
        setEmailError('');
      } else {
        setEmailError(data.error || 'Failed to send verification code');
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch {
      setEmailError('Something went wrong');
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/broker/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          code: verificationCode.trim() 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login successful');
        router.push('/broker/dashboard');
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-6 md:py-0 md:px-0">
      {/* Close Button */}
      <motion.button
        variants={closeButtonVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        whileTap="tap"
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white shadow-md hover:bg-gray-50"
      >
        <X className="w-6 h-6 text-gray-600" />
      </motion.button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-6 md:p-12 w-full max-w-md z-10"
      >
        {/* Profile Photo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 relative">
            <Image
              src="/broker/login/broker-avatar.webp"
              alt="Broker Avatar"
              fill
              priority
              className="rounded-full object-cover border-4 border-gray-100 shadow-md"
            />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">Welcome Back!</h2>
          <p className="text-sm md:text-base text-gray-600">Nice to see you again</p>
        </div>

        {/* Email Input with Verify Button */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              placeholder="Enter your email"
              className={`flex-1 px-4 py-2.5 md:py-3 rounded-xl border ${
                emailError ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 text-black placeholder:text-gray-500 text-sm md:text-base`}
            />
            <button
              onClick={handleEmailSubmit}
              disabled={isLoading}
              className={`px-6 py-2.5 md:py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              } text-sm md:text-base`}
            >
              {isLoading ? 'Sending...' : 'Verify'}
            </button>
          </div>
          {emailError && (
            <p className="mt-2 text-xs md:text-sm text-red-500">{emailError}</p>
          )}
        </div>

        {/* Verification Code Input */}
        <div className="mb-4 md:mb-6">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 text-black placeholder:text-gray-500 text-sm md:text-base"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleVerifyCode}
          disabled={isLoading || !email || !verificationCode}
          className={`w-full py-2.5 md:py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-4 md:mb-6 text-sm md:text-base ${
            (isLoading || !email || !verificationCode) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* Support Link */}
        <div className="text-center">
          <p className="text-xs md:text-sm text-gray-500">
            Having trouble? <a href="#" className="text-blue-500 hover:underline">Contact Support</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}










