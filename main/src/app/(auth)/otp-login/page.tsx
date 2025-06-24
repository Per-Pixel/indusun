"use client";

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/PageWrapper';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const OTPLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [otpSent, setOtpSent] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && otpSent) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, otpSent]);

  // Auto-send OTP if phone is provided
  useEffect(() => {
    if (phone && !otpSent) {
      handleSendOTP();
    }
  }, [phone]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setTimeLeft(300); // Reset timer
        toast.success('OTP sent successfully!');
        
        // In development, show the OTP in console
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Development OTP:', data.otp);
          toast.success(`Development OTP: ${data.otp}`, { duration: 10000 });
        }
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeLeft(300); // Reset timer
        setOtp(['', '', '', '', '', '']); // Clear OTP inputs
        toast.success('OTP resent successfully!');
        
        // In development, show the OTP in console
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Development OTP:', data.otp);
          toast.success(`Development OTP: ${data.otp}`, { duration: 10000 });
        }
      } else {
        toast.error(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp: otpString }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Invalid OTP');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back Button */}
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-800 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Login
            </button>
          </div>

          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-semibold text-gray-800 mb-4">
                Enter OTP <span className="text-blue-500">🔐</span>
              </h1>
              <p className="text-gray-500 text-xl mb-8">
                We've sent a 6-digit code to<br />
                <span className="font-medium text-gray-700">{phone}</span>
              </p>
            </motion.div>
          </div>

          {/* OTP Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-xl font-medium text-gray-700 mb-4 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              {timeLeft > 0 && (
                <div className="text-center">
                  <p className="text-gray-500">
                    OTP expires in <span className="font-medium text-blue-800">{formatTime(timeLeft)}</span>
                  </p>
                </div>
              )}

              {/* Verify Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-blue-800 p-4 rounded-md font-medium text-white text-xl hover:bg-blue-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed h-14"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </motion.button>
            </form>

            {/* Resend OTP */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-2">Didn't receive the code?</p>
              <button
                onClick={handleResendOTP}
                disabled={isResending || timeLeft > 240} // Allow resend after 1 minute
                className="flex items-center justify-center mx-auto text-blue-800 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className={`mr-2 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Resending...' : 'Resend OTP'}
              </button>
              {timeLeft > 240 && (
                <p className="text-sm text-gray-500 mt-1">
                  Resend available in {formatTime(timeLeft - 240)}
                </p>
              )}
            </div>

            {/* Change Phone Number */}
            <div className="mt-4 text-center">
              <Link 
                href="/login" 
                className="text-blue-800 hover:text-blue-700 font-medium transition-colors"
              >
                Change phone number
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default OTPLogin;
