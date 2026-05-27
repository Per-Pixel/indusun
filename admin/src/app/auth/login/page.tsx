'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const router = useRouter();
  const { login } = useAdminAuth();

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);

    try {
      // Use Supabase Auth via context
      const result = await login(email, password);

      if (result.success) {
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="mr-3">
            <Image
              src="/logo.png"
              alt="Indusun"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Indusun</h1>
            <p className="text-gray-600 text-sm">Mortgage Service</p>
          </div>
        </div>

        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-8">Welcome back!</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => {
                    if (email && !validateEmail(email)) {
                      setEmailError('Please enter a valid email address');
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${
                    emailError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                  style={{ color: '#374151' }}
                  required
                  placeholder="example@mail.com"
                />
                {email && !emailError && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {emailError && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            <div className="mb-2">
              <label htmlFor="password" className="block text-gray-700 text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  style={{ color: '#374151' }}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => {
                    const input = document.getElementById('password') as HTMLInputElement;
                    input.type = input.type === 'password' ? 'text' : 'password';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6">
              Use at least 8 characters with 1 number and one special character.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'LOGGING IN...' : 'LOG IN'}
            </button>

            <div className="text-center mt-4">
              <a href="#" className="text-sm text-gray-500 hover:text-green-500">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
