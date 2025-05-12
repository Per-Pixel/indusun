'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import { 
  CheckCircle, 
  ArrowLeft, 
  MessageSquare, 
  Users,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MessageSentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Get parameters from URL
  const count = searchParams.get('count') || '0';
  const type = searchParams.get('type') || 'message';

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/messages')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Back to Messages</span>
            </button>

            {/* Success Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-8 text-center relative">
              {/* Confetti Animation */}
              {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-6"
                      style={{
                        backgroundColor: [
                          '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B5DE5'
                        ][Math.floor(Math.random() * 5)],
                        top: `${Math.random() * -10}%`,
                        left: `${Math.random() * 100}%`,
                        transformOrigin: 'center',
                        rotate: `${Math.random() * 360}deg`,
                      }}
                      animate={{
                        y: ['0vh', `${100 + Math.random() * 20}vh`],
                        rotate: [`${Math.random() * 360}deg`, `${Math.random() * 360 + 180}deg`],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        ease: "easeOut",
                        delay: Math.random() * 0.5,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: 0.2
                }}
                className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={48} className="text-green-600" />
              </motion.div>

              {/* Success Message */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Message Sent Successfully!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600 mb-8"
              >
                Your {type} has been sent to {count} recipient{parseInt(count) !== 1 ? 's' : ''}.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <MessageSquare size={24} className="text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">Message Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{type}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Users size={24} className="text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">Recipients</p>
                  <p className="text-lg font-semibold text-gray-900">{count}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Clock size={24} className="text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Sent At</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={() => router.push('/messages')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Another Message
                </button>
                <button
                  onClick={() => router.push('/messages/history')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  View Message History
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
