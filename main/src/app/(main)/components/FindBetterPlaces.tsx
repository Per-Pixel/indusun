'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function FindBetterPlaces() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 md:order-1"
          >
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop"
              alt="Modern Living Room"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </motion.div>
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 md:order-2"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Find Better Places to Live, Work, and Wonder
            </h2>
            <p className="text-gray-600 mb-6">
              We help you find the perfect space that matches your lifestyle and preferences. 
              Our extensive property listings include everything from cozy apartments to 
              luxurious villas, ensuring you find exactly what you're looking for.
            </p>
            <Link 
              href="/properties" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base font-medium"
            >
              Explore
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
