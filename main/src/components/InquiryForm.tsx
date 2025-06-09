'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface InquiryFormProps {
  propertyTitle: string;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ propertyTitle }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more information.'
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Contact form submitted:', contactFormData);
    setShowContactForm(true);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-8 mb-8 sticky top-8 border border-blue-100">
      <div className="flex items-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
          Inquire About<br />
          <span className="text-blue-600">{propertyTitle}</span>
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Interested in this property? Fill out the form below and our expert team will get back to you with detailed information and schedule a viewing.
        </p>
      </div>

      {!showContactForm ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={contactFormData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={contactFormData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={contactFormData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                value={contactFormData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your requirements..."
                rows={4}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-white text-gray-900 placeholder-gray-500"
                required
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Send Inquiry →
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By submitting this form, you agree to our privacy policy and terms of service.
          </p>
        </form>
      ) : (
        <div className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            Your inquiry has been sent. We'll get back to you shortly.
          </p>
          <button
            onClick={() => setShowContactForm(false)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Send Another Message
          </button>
        </div>
      )}
    </div>
  );
};

export default InquiryForm;
