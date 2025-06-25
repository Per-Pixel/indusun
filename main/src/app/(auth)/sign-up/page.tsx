"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

const SignUp = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState(1); // Step 1: Signup, Step 2: Verification
  const [isLoading, setIsLoading] = useState(false);
  const [signupMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [resendCooldown] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the request body based on signup method
      const requestBody = signupMethod === 'email'
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password
          }
        : {
            name: formData.name,
            phone: formData.phone,
            password: formData.password
          };

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification code sent to your email');
        setStep(2); // Move to verification step
      } else {
        if (data.code === 'VERIFICATION_COOLDOWN') {
          toast.error('Please wait before requesting another code');
        } else if (data.code === 'EMAIL_SEND_FAILED') {
          toast.error('Failed to send verification email. Please try again.');
        } else {
          toast.error(data.error || 'Signup failed');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const successfulVerify = async (data: { user: unknown }) => {
    try {
      // Update auth context with user data
      login(data.user);
      // Show success message and redirect
      toast.success('Your account has been created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        successfulVerify(data);
      } else {
        if (data.code === 'VERIFICATION_FAILED') {
          toast.error('Invalid verification code');
        } else if (data.code === 'VERIFICATION_EXPIRED') {
          toast.error('Verification code has expired. Please request a new one.');
          // Optionally reset to step 1
        } else if (data.code === 'TOO_MANY_ATTEMPTS') {
          toast.error('Too many failed attempts. Please request a new code.');
        } else {
          toast.error(data.error || 'Verification failed');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New verification code sent to your email');
      } else {
        if (data.code === 'VERIFICATION_COOLDOWN') {
          toast.error('Please wait before requesting another code');
        } else {
          toast.error(data.error || 'Failed to send new code');
        }
      }
    } catch (error) {
      console.error('Resend code error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center bg-white md:overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row-reverse items-center justify-between scale-[0.85] md:scale-[0.75]">
          {/* Right side - Image (visible on desktop) */}
          <div className="hidden md:block md:w-1/2 p-4">
            <div className="rounded-2xl overflow-hidden" style={{ height: '800px', width: '700px' }}>
              <Image
                src="/auth/Sign up Art.png"
                alt="Signup Background"
                width={700}
                height={800}
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
                src="/auth/Sign up Art Mobile.png"
                alt="Signup Background Mobile"
                width={400}
                height={300}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Left side - Signup Form */}
          <div className="w-full md:w-1/2 md:pr-6 max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <h1 className="text-4xl font-semibold text-gray-800 mb-4">
              Welcome <span className="text-yellow-500">👋</span>
            </h1>
            <p className="text-gray-500 text-xl mb-8">
              Create your account to get started with Indusun
            </p>

            {step === 1 ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="name" className="block text-xl font-medium text-gray-700 mb-3">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full p-4 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all text-xl h-14"
                      required
                    />
                  </div>

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
                      required
                    />
                  </div>

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
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xl font-medium text-gray-700 mb-3">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full p-4 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all text-xl h-14"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-800 p-4 rounded-md font-medium text-white text-xl hover:bg-blue-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed h-14"
                  >
                    {isLoading ? 'Creating Account...' : 'Sign up'}
                  </motion.button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xl">
                    <span className="px-3 bg-white text-gray-500 text-xl">or sign up with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <SocialLoginButtons />
              </>
              ) : (
                <form onSubmit={handleVerification} className="space-y-5">
                  <div>
                    <p className="text-gray-700 mb-6 text-center text-xl">
                      We&apos;ve sent a verification code to <span className="text-blue-600 font-medium">{formData.email}</span>.
                      Please enter the code below to verify your email address.
                    </p>
                    <label htmlFor="verificationCode" className="block text-xl font-medium text-gray-700 mb-3">Verification Code</label>
                    <input
                      id="verificationCode"
                      type="text"
                      name="verificationCode"
                      value={formData.verificationCode}
                      onChange={handleChange}
                      placeholder="Enter code"
                      className="w-full p-2.5 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-800 p-2.5 rounded-md font-medium text-white hover:bg-blue-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </motion.button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading || resendCooldown > 0}
                      className="text-gray-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </form>
              )}

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-xl">
                {step === 1 ? (
                  <>
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-800 hover:text-blue-700 font-medium transition-colors text-xl">
                      Log in
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-blue-800 hover:text-blue-700 font-medium transition-colors text-xl"
                    >
                      Back to signup
                    </button>
                  </>
                )}
              </p>
            </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SignUp;
