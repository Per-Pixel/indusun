'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search, Phone, Mail, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// FAQ data structure
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'buying' | 'selling' | 'renting' | 'legal' | 'technical';
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 1,
    question: "What is Indusun and how does it work?",
    answer: "Indusun is a comprehensive real estate platform that connects buyers, sellers, and renters. We provide verified property listings, expert guidance, and secure transaction services to make your property journey smooth and hassle-free.",
    category: "general"
  },
  {
    id: 2,
    question: "How do I search for properties on Indusun?",
    answer: "You can search for properties using our advanced search filters. Simply enter your preferred location, budget, property type, and other criteria. Our smart search algorithm will show you the most relevant properties matching your requirements.",
    category: "general"
  },
  {
    id: 3,
    question: "Are all properties on Indusun verified?",
    answer: "Yes, we have a strict verification process. All properties undergo document verification, legal checks, and physical inspection before being listed on our platform. This ensures you only see genuine, legally compliant properties.",
    category: "general"
  },
  
  // Buying Questions
  {
    id: 4,
    question: "What documents do I need to buy a property?",
    answer: "Essential documents include: PAN card, Aadhaar card, income proof (salary slips/ITR), bank statements, loan approval letter (if applicable), and property-related documents like sale deed, NOC, and clearance certificates.",
    category: "buying"
  },
  {
    id: 5,
    question: "How can I get a home loan through Indusun?",
    answer: "We partner with leading banks and financial institutions to offer competitive home loan rates. Our loan experts will help you compare options, prepare documentation, and guide you through the approval process.",
    category: "buying"
  },
  {
    id: 6,
    question: "What are the additional costs involved in buying a property?",
    answer: "Additional costs include registration charges (1-3% of property value), stamp duty (varies by state), legal fees, home loan processing fees, property insurance, and maintenance deposits. Our experts will provide a detailed cost breakdown.",
    category: "buying"
  },

  // Selling Questions
  {
    id: 7,
    question: "How do I list my property for sale on Indusun?",
    answer: "Simply create an account, click on 'List Property', fill in the property details, upload high-quality photos, and set your price. Our team will verify the listing and make it live within 24-48 hours.",
    category: "selling"
  },
  {
    id: 8,
    question: "What commission does Indusun charge for selling properties?",
    answer: "Our commission structure is transparent and competitive. The exact percentage depends on the property type and value. Contact our sales team for detailed pricing information tailored to your property.",
    category: "selling"
  },

  // Renting Questions
  {
    id: 9,
    question: "How do I find rental properties on Indusun?",
    answer: "Use our rental search filters to find properties based on location, budget, amenities, and lease duration. You can also set up alerts to get notified when new rental properties matching your criteria are listed.",
    category: "renting"
  },
  {
    id: 10,
    question: "What is the rental agreement process?",
    answer: "We provide standardized rental agreement templates and can connect you with legal experts for customization. The process includes agreement drafting, stamp paper procurement, registration (if required), and security deposit handling.",
    category: "renting"
  },

  // Legal Questions
  {
    id: 11,
    question: "How do I verify if a property has clear title?",
    answer: "Our legal team conducts thorough title verification including chain of ownership, encumbrance certificate check, survey settlement records, and clearance from local authorities. We provide a detailed legal report for every property.",
    category: "legal"
  },
  {
    id: 12,
    question: "What should I do if I face issues with my property transaction?",
    answer: "Contact our customer support immediately. We have a dedicated resolution team and legal experts who can help resolve transaction-related issues. We also provide mediation services for dispute resolution.",
    category: "legal"
  },

  // Technical Questions
  {
    id: 13,
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page, enter your registered email address, and follow the instructions sent to your email. If you continue to face issues, contact our technical support team.",
    category: "technical"
  },
  {
    id: 14,
    question: "Can I save my favorite properties?",
    answer: "Yes, you can save properties to your favorites list by clicking the heart icon on any property listing. Access your saved properties anytime from your dashboard or the favorites section.",
    category: "technical"
  }
];

const categories = [
  { key: 'all', label: 'All Questions', icon: <HelpCircle className="h-5 w-5" /> },
  { key: 'general', label: 'General', icon: <HelpCircle className="h-5 w-5" /> },
  { key: 'buying', label: 'Buying', icon: <HelpCircle className="h-5 w-5" /> },
  { key: 'selling', label: 'Selling', icon: <HelpCircle className="h-5 w-5" /> },
  { key: 'renting', label: 'Renting', icon: <HelpCircle className="h-5 w-5" /> },
  { key: 'legal', label: 'Legal', icon: <HelpCircle className="h-5 w-5" /> },
  { key: 'technical', label: 'Technical', icon: <HelpCircle className="h-5 w-5" /> }
];

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // Filter FAQs based on category and search term
  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle FAQ item expansion
  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-200 pt-[75px] md:pt-[90px] pb-20 overflow-hidden">
        {/* Geometric Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-600 rounded-full opacity-15 transform -translate-x-20 translate-y-20"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Frequently Asked
              <br />
              <span className="text-gray-800">Questions</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our exclusive services, property listings, and the real estate process. We&apos;re here to provide clarity and assist you every step of the way.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-6">
                <Search className="h-6 w-6 text-gray-600" />
              </div>
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 text-lg text-gray-900 placeholder-gray-600 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-gray-400 bg-white shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Category Filters */}
          <div className="mb-16">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeCategory === category.key
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <span className="mr-2">
                    {category.icon}
                  </span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full p-8 text-left flex items-start justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {faq.question}
                      </h3>
                      {!expandedItems.includes(faq.id) && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {faq.answer.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {expandedItems.includes(faq.id) ? (
                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                          <ChevronUp className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedItems.includes(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 border-t border-gray-100">
                          <p className="text-gray-700 leading-relaxed pt-6 text-lg">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No FAQs found</h3>
                <p className="text-gray-600 text-lg">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-gray-50 py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Still have questions?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our dedicated support team is here to help you with any questions or concerns.
                Reach out to us through any of the channels below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Call Us</h3>
                <p className="text-gray-600 mb-4">
                  Speak directly with our support team
                </p>
                <a
                  href="tel:+911234567890"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors"
                >
                  +91 123 456 7890
                </a>
                <p className="text-gray-500 text-sm mt-3">
                  Mon-Sat, 9 AM - 7 PM
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Email Us</h3>
                <p className="text-gray-600 mb-4">
                  Send us a detailed message
                </p>
                <a
                  href="mailto:support@indusun.com"
                  className="text-green-600 hover:text-green-700 font-semibold text-lg transition-colors"
                >
                  support@indusun.com
                </a>
                <p className="text-gray-500 text-sm mt-3">
                  We&apos;ll respond within 24 hours
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Chat</h3>
                <p className="text-gray-600 mb-6">
                  Get instant help from our team
                </p>
                <Link
                  href="/contact"
                  className="inline-block px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Start Chat
                </Link>
                <p className="text-gray-500 text-sm mt-3">
                  Available 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
