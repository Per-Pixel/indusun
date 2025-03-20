"use client";

import React, { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import Link from 'next/link';
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
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      <div className="min-h-screen flex flex-col lg:flex-row lg:items-center lg:justify-end px-4 relative pb-24"> {/* Added pb-24 for footer spacing */}
        {/* Background Image/Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url(/auth-bg.jpg)',
            filter: 'brightness(0.3)'
          }}
        />

        {/* Mobile/Tablet Layout Container */}
        <div className="relative z-10 pt-8 lg:hidden flex flex-col items-center text-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-500 to-pink-500 text-transparent bg-clip-text">
                PixieKat
              </span>
            </h2>
            {/* Remove the mobile text */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-[300px] mb-8"
          >
            <img 
              src="/img/auth/login.png" 
              alt="Login illustration" 
              className="w-full h-auto object-contain"
            />
          </motion.div>
        </div>

        {/* Desktop Left Side Content */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute left-16 top-16 max-w-xl hidden lg:block z-10"
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-yellow-500 to-pink-500 text-transparent bg-clip-text">
              PixieKat
            </span>
          </h2>
          <p className="text-gray-300 text-xl">
            Login to access your gaming dashboard and continue your journey.
          </p>
        </motion.div>

        {/* Desktop Left Center Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute left-[200px] top-1/2 -translate-y-1/2 hidden lg:block z-10"
        >
          <img 
            src="/img/auth/login.png" 
            alt="Login illustration" 
            className="w-[400px] h-[400px] object-contain"
          />
        </motion.div>

        {/* Right side content (login form) */}
        <div className="w-full lg:max-w-[500px] relative z-10 lg:mr-16">
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1D232A]/90 p-8 rounded-lg backdrop-blur-sm shadow-xl"
          >
            <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-500 to-pink-500 text-transparent bg-clip-text">
              Welcome Back
            </h1>
            
            {/* Social Login Buttons */}
            <SocialLoginButtons className="mb-6" />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1D232A] text-gray-400">or continue with</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full p-3 bg-[#2A323C] rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 bg-[#2A323C] rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                  required
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-pink-500 p-3 rounded-lg font-medium text-white hover:from-yellow-600 hover:to-pink-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link href="/sign-up" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;
