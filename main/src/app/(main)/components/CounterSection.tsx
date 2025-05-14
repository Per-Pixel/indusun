'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CounterProps {
  end: number;
  label: string;
  duration?: number;
  delay?: number;
}

const Counter = ({ end, label, duration = 2, delay = 0 }: CounterProps) => {
  const [count, setCount] = useState(0);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Check if device is small mobile (375px or less) or desktop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallMobile(window.innerWidth <= 375);
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    // Delay the start of the animation
    const timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateCount);
    }, delay * 1000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeoutId);
    };
  }, [end, duration, delay]);

  return (
    <div className="text-left">
      <div className={`${isSmallMobile ? 'text-[8px]' : 'text-[10px]'} text-[#b2b2b2] opacity-80 mb-1`}>Our {label}</div>
      <div className={`${isSmallMobile ? 'text-base' : 'text-lg'} font-bold text-[#212121]`}>{count}+</div>
      <div className={`${isSmallMobile ? 'text-[8px]' : 'text-[10px]'} text-[#b2b2b2] opacity-80 mt-1`}>{label}</div>
    </div>
  );
};

const AnimatedCounter = ({ 
  end, 
  className = "", 
  duration = 2, 
  delay = 0,
  suffix = ""
}: { 
  end: number; 
  className?: string; 
  duration?: number; 
  delay?: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    // Delay the start of the animation
    const timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateCount);
    }, delay * 1000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(timeoutId);
    };
  }, [end, duration, delay]);

  return (
    <div className={className}>
      {count}{suffix}
    </div>
  );
};

export function CounterSection() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <section className="relative py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Mobile View */}
        {isMobile ? (
          <div className="relative h-[500px] mb-16">
            {/* Top-left image */}
            <div className="absolute top-0 left-0 w-2/3">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop" 
                alt="Modern Real Estate" 
                className="w-full h-[350px] object-cover rounded-lg shadow-lg"
              />
            </div>
            
            {/* Bottom-right content card */}
            <div className="absolute bottom-0 right-0 w-2/3">
              <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 -4px 10px rgba(0, 0, 0, 0.05)' }}>
                {/* Heading */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Not sure what you need?</h2>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <p className="text-base text-gray-700">
                    Our dedicated team of professionals is committed to finding the perfect property for you. With years of experience in the real estate market, we understand your needs and preferences.
                  </p>
                </div>
                
                {/* Counters */}
                <div className="grid grid-cols-3 gap-2 mb-6 mt-8">
                  <div>
                    <Counter end={31} label="Cities" delay={0.2} />
                  </div>
                  <div>
                    <Counter end={29} label="Properties" delay={0.4} />
                  </div>
                  <div>
                    <Counter end={17} label="Brokers" delay={0.6} />
                  </div>
                </div>
                
                {/* Button */}
                <div className="flex justify-end">
                  <Link 
                    href="/contact" 
                    className="flex items-center gap-4"
                  >
                    <span className="text-base font-medium text-gray-800">Get in touch</span>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-700 hover:bg-gray-100 transition-all duration-300 hover:scale-105 group">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="text-gray-700 group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-12 items-center px-4 md:px-12 lg:px-16">
            {/* Left side - Image with container */}
            <div className="w-full md:w-6/12 lg:w-7/12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="ml-8 md:ml-16"
              >
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop" 
                  alt="Modern Real Estate" 
                  className="w-full h-[400px] md:h-[450px] object-cover rounded-lg shadow-lg"
                />
              </motion.div>
            </div>
            
            {/* Right side - Content */}
            <div className="w-full md:w-1/2 lg:w-2/4 flex flex-col items-start text-left pr-8 md:pr-16">
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <h2 className="text-4xl font-bold text-gray-900">Not sure what you need?</h2>
              </motion.div>
              
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                <p className="text-lg text-gray-700 w-[80%] h-22">
                  We're here to help you find the best options for your financial and brokerage needs. Explore our services or reach out to our team for personalized assistance.
                </p>
              </motion.div>
              
              {/* Counters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex w-full justify-between gap-22 mb-12 pr-32"
              >
                <div className="text-left">
                  <div className="text-sm text-[#b2b2b2] opacity-80 mb-1">PREVIOUS PROJECTS</div>
                  <AnimatedCounter end={34} className="text-4xl font-bold text-[#212121]" suffix="+" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-[#b2b2b2] opacity-80 mb-1">YEARS EXPERIENCE</div>
                  <AnimatedCounter end={20} className="text-4xl font-bold text-[#212121]" suffix="y" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-[#b2b2b2] opacity-80 mb-1">ONGOING PROJECTS</div>
                  <AnimatedCounter end={12} className="text-4xl font-bold text-[#212121]" />
                </div>
              </motion.div>
              
              {/* Get in Touch */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="w-full flex justify-end pr-32"
              >
                <Link 
                  href="/contact" 
                  className="flex items-center gap-4 group"
                >
                  <p className="text-lg font-medium text-gray-800">Get in Touch</p>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-700 hover:bg-gray-100 transition-all duration-300 hover:scale-105">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="22" 
                      height="22" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-gray-700 group-hover:translate-x-1 transition-transform duration-300"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}































