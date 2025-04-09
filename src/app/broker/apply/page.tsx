'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function BrokerApplicationPage() {
  const [experience, setExperience] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast.error('You must be logged in to apply');
        router.push('/login');
      } else {
        checkExistingApplication();
      }
    }
  }, [user, isLoading, router]);

  const checkExistingApplication = async () => {
    try {
      const response = await fetch('/api/broker/application/status');
      const data = await response.json();
      
      if (data.hasApplication) {
        setHasExistingApplication(true);
        setApplicationStatus(data.application.status);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!experience.trim() || !qualifications.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/broker/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experience,
          qualifications,
          message,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Application submitted successfully');
        setHasExistingApplication(true);
        setApplicationStatus('pending');
      } else {
        toast.error(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Become a Broker</h1>
      
      {hasExistingApplication ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Application Status</h2>
          
          {applicationStatus === 'pending' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Your application is currently under review. We'll notify you once a decision has been made.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {applicationStatus === 'approved' && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Congratulations! Your application has been approved. You now have broker access.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {applicationStatus === 'rejected' && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    We're sorry, but your application has been rejected. You may apply again in the future.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-6 text-gray-700">
            Join our platform as a broker and gain access to exclusive tools and features to help you manage properties and clients.
            Please fill out the application form below to get started.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="experience" className="block text-gray-700 font-medium mb-2">
                  Real Estate Experience
                </label>
                <textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your experience in real estate..."
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="qualifications" className="block text-gray-700 font-medium mb-2">
                  Qualifications & Certifications
                </label>
                <textarea
                  id="qualifications"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="List your qualifications, certifications, and licenses..."
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                  Why do you want to join our platform?
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Tell us why you want to join our platform as a broker..."
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
