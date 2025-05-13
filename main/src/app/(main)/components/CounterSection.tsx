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
      <div className="text-xs md:text-sm text-gray-600 mb-1">Our {label}</div>
      <div className="text-3xl md:text-4xl font-bold text-gray-800">{count}+</div>
      <div className="text-sm md:text-base text-gray-600 mt-1">{label}</div>
    </div>
  );
};

export function CounterSection() {
  return (
    <section className="relative py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Left side - Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-1/2 lg:w-5/12"
          >
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop" 
              alt="Modern Real Estate" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </motion.div>
          
          {/* Right side - Content */}
          <div className="w-full md:w-1/2 lg:w-7/12">
            <div className="flex flex-col">
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Not sure what you need?</h2>
              </motion.div>
              
              {/* Description - Aligned with heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
              <div className="text-gray-700 py-3 pr-4 pl-0 rounded-lg bg-gray-50 w-11/12 md:w-10/12 mr-auto">
  <p className="text-base md:text-lg">
    Our dedicated team of professionals is committed to finding the perfect property for you. With years of experience in the real estate market, we understand your needs and preferences. We provide personalized solutions tailored to your requirements, ensuring a smooth and satisfying real estate experience.
  </p>
</div>

              </motion.div>
              
              {/* Counters and Get in touch - in same row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center mb-6"
              >
                {/* Counters */}
                <div className="flex flex-1">
                  <div className="flex-1">
                    <Counter end={31} label="Cities" delay={0.2} />
                  </div>
                  <div className="flex-1 -ml-[280px]">
                    <Counter end={29} label="Properties" delay={0.4} />
                  </div>
                  <div className="flex-1 -ml-[280px]">
                    <Counter end={17} label="Brokers" delay={0.6} />
                  </div>
                </div>
                
                {/* Get in touch */}
                <div className="flex items-center justify-end gap-4 ml-auto">
                  <p className="text-lg font-medium text-gray-800">Get in touch with us</p>
                  <Link 
                    href="/contact" 
                    className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-700 hover:bg-gray-100 transition-all duration-300 hover:scale-105 group"
                    aria-label="Contact Us"
                  >
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
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
























