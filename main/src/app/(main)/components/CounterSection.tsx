'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-blue-600">{count}+</div>
      <div className="text-sm md:text-base text-gray-600 mt-1">{label}</div>
    </div>
  );
};

export function CounterSection() {
  return (
    <section className="relative pt-12 pb-12 md:pt-16 md:pb-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Not Sure What You Need?</h2>
          <p className="text-gray-600 mt-2">Explore our extensive property listings</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Counter end={31} label="Cities" delay={0.2} />
          <Counter end={29} label="Properties" delay={0.4} />
          <Counter end={17} label="Agents" delay={0.6} />
        </div>
      </div>
    </section>
  );
}

