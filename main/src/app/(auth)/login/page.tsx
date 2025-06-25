"use client";

import React, { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [otpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    otp: ''
  });
  const { login } = useAuth();

  // Show message if redirected with a message parameter
  React.useEffect(() => {
    if (message) {
      toast.success(message);
    }
    if (error) {
      // Handle error messages from social auth
      const errorMessages = {
        'google_auth_failed': 'Google authentication failed',
        'facebook_auth_failed': 'Facebook authentication failed',
        'server_error': 'Server error occurred',
      };
      toast.error(errorMessages[error as keyof typeof errorMessages] || 'Authentication error');
    }
  }, [message, error]);

  // OTP countdown effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCountdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // const handleSendOTP = async () => {
  //   if (!formData.phone) {
  //     toast.error('Please enter your phone number');
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const response = await fetch('/api/auth/send-otp', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ phone: formData.phone }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       setOtpSent(true);
  //       setOtpCountdown(60); // 60 seconds countdown
  //       toast.success('OTP sent successfully!');

  //       // In development, show the OTP
  //       if (data.debug && data.otp) {
  //         toast.success(`Development OTP: ${data.otp}`, { duration: 10000 });
  //       }
  //     } else {
  //       toast.error(data.error || 'Failed to send OTP');
  //     }
  //   } catch (error) {
  //     console.error('Send OTP error:', error);
  //     toast.error('Failed to send OTP. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare the request body based on login method
      const requestBody = loginMethod === 'email'
        ? { email: formData.email, password: formData.password }
        : { phone: formData.phone, password: formData.password };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // Update auth context with user data
        login(data.user);
        router.push('/dashboard'); // Redirect to dashboard or home
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center bg-white md:overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between scale-[0.85] md:scale-[0.75]">
          {/* Left side - Image (visible on desktop) */}
          <div className="hidden md:block md:w-1/2 p-4">
            <div className="rounded-2xl overflow-hidden" style={{ height: '800px', width: '700px' }}>
              <Image
                src="/auth/Login Art.png"
                alt="Login Background"
                width={400}
                height={500}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Mobile Image (visible only on mobile) */}
          <div className="md:hidden w-full mb-0 mt-4 pt-1">
            <div className="rounded-2xl overflow-hidden max-h-[30vh] bg-white">
              <Image
                src="/auth/Login Art Mobile.png"
                alt="Login Background Mobile"
                width={400}
                height={300}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full md:w-1/2 md:pl-6 max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <h1 className="text-4xl font-semibold text-gray-800 mb-4">
              Welcome Back <span className="text-yellow-500">👋</span>
            </h1>
            <p className="text-gray-500 text-xl mb-8">
              Enter your credentials below & access your account
            </p>

            <div className="mb-6">
              <div className="flex space-x-6 mb-6">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-3 border-b-2 ${loginMethod === 'email' ? 'border-blue-800 text-blue-800' : 'border-gray-200 text-gray-500 hover:text-blue-800 hover:border-blue-800'} font-medium transition-colors text-xl`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-3 border-b-2 ${loginMethod === 'phone' ? 'border-blue-800 text-blue-800' : 'border-gray-200 text-gray-500 hover:text-blue-800 hover:border-blue-800'} font-medium transition-colors text-xl`}
                >
                  Phone
                </button>
              </div>

              <form onSubmit={loginMethod === 'phone' && otpSent ? handleVerifyOTP : handleLogin} className="space-y-8">
                {loginMethod === 'email' ? (
                  <div>
                    <label htmlFor="email" className="block text-xl font-medium text-gray-700 mb-3">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className="w-full p-4 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all text-xl h-14"
                      style={{ color: '#374151' }}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="phone" className="block text-xl font-medium text-gray-700 mb-3">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full p-4 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all text-xl h-14"
                      style={{ color: '#374151' }}
                      required
                    />
                    {/* OTP Option */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => router.push(`/otp-login?phone=${encodeURIComponent(formData.phone)}`)}
                        className="text-blue-800 hover:text-blue-700 font-medium transition-colors text-lg underline"
                        disabled={!formData.phone}
                      >
                        Get OTP to login instead
                      </button>
                    </div>
                  </div>
                )}

                {/* Show password field only if not using OTP or if using email login */}
                {(loginMethod === 'email' || !otpSent) && (
                  <div>
                    <label htmlFor="password" className="block text-xl font-medium text-gray-700 mb-3">Password</label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full p-4 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all text-xl h-14"
                      style={{ color: '#374151' }}
                      required={loginMethod === 'email' || !otpSent}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-5 w-5 text-blue-800 focus:ring-blue-800 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xl text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-xl font-medium text-blue-800 hover:text-blue-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || (loginMethod === 'phone' && !otpSent && !formData.password) || (loginMethod === 'phone' && otpSent && !formData.otp)}
                  className="w-full bg-blue-800 p-4 rounded-md font-medium text-white text-xl hover:bg-blue-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed h-14"
                >
                  {isLoading
                    ? (loginMethod === 'phone' && otpSent ? 'Verifying OTP...' : 'Logging in...')
                    : (loginMethod === 'phone' && otpSent ? 'Verify OTP' : 'Log in')
                  }
                </motion.button>
              </form>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="text-blue-800 hover:text-blue-700 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or login with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <SocialLoginButtons />
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;
