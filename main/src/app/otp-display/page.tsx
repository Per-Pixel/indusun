'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Clock, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const OTPDisplayPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulate getting phone number from URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get('phone') || localStorage.getItem('otp_phone') || '+91 98765 12345';
    setPhoneNumber(phone);
    
    // Generate a random OTP for display
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generatedOtp);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopyOtp = async () => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      toast.success('OTP copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy OTP');
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtp(newOtp);
      setTimeLeft(900); // Reset timer to 15 minutes
      setIsExpired(false);
      
      toast.success('New OTP sent successfully');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</h1>
          <p className="text-gray-600">
            Development/Testing Page
          </p>
        </div>

        {/* Phone Number Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OTP sent to:
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center">
              <Smartphone className="w-4 h-4 text-gray-500 mr-2" />
              <span className="font-medium text-gray-900">{phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* OTP Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your OTP:
          </label>
          <div className="relative">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
                  {otp}
                </span>
                <button
                  onClick={handleCopyOtp}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Copy OTP"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500 mr-2" />
            <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
              {isExpired ? 'OTP Expired' : `Expires in: ${formatTime(timeLeft)}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleResendOtp}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend OTP
              </>
            )}
          </button>

          <button
            onClick={goToLogin}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Login
          </button>
        </div>

        {/* Development Notes */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Development Notes:</h3>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• This page is for testing purposes only</li>
            <li>• Any 6-digit number will work as OTP in development</li>
            <li>• OTP is auto-generated and displayed here</li>
            <li>• Timer resets to 15 minutes on resend</li>
            <li>• Use this OTP in the login form</li>
          </ul>
        </div>

        {/* Quick Copy Instructions */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Quick Test:</h3>
          <p className="text-xs text-blue-700">
            Copy the OTP above and paste it in the login form, or simply enter any 6-digit number.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPDisplayPage;
