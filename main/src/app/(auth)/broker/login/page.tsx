'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function BrokerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

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
    } catch (error) {
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
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-background.jpg"
          alt="Login Background"
          fill
          className="object-cover opacity-50"
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-md mx-4 z-10"
      >
        {/* Profile Photo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <Image
              src="/broker/login/broker-avatar.webp" // Change to WebP format
              alt="Broker Avatar"
              fill
              priority // Add priority for above-the-fold image
              className="rounded-full object-cover border-4 border-gray-100 shadow-md"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Nice to see you again</p>
        </div>

        {/* Email Input with Verify Button */}
        <div className="mb-6">
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(''); // Clear error when user types
              }}
              placeholder="Enter your email"
              className={`flex-1 px-4 py-3 rounded-xl border ${
                emailError ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 text-black placeholder:text-gray-500`}
            />
            <button
              onClick={handleEmailSubmit}
              disabled={isLoading}
              className={`px-6 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Verify'}
            </button>
          </div>
          {emailError && (
            <p className="mt-2 text-sm text-red-500">{emailError}</p>
          )}
        </div>

        {/* Verification Code Input */}
        <div className="mb-6">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors bg-gray-50 text-black placeholder:text-gray-500"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleVerifyCode}
          disabled={isLoading || !email || !verificationCode}
          className={`w-full py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-6 ${
            (isLoading || !email || !verificationCode) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* Support Link */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Having trouble? <a href="#" className="text-blue-500 hover:underline">Contact Support</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}






