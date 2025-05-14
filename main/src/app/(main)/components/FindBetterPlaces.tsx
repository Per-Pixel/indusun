'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function FindBetterPlaces() {
  return (
    <section className="pt-0 pb-6 md:pt-0 md:pb-8 bg-white -mt-12 relative z-20">
      <div className="container mx-auto px-4">
        {/* Header text centered */}
        <div className="text-center mb-6">
          <p className="text-gray-500 uppercase tracking-wider mb-2 font-bold">ALL PROPERTY NEEDS - ONE PORTAL</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Find Better Places to Live, Work<br />and Wonder...
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-8">
          {/* Image with left spacing */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="pl-0 md:pl-8 lg:pl-12"
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
            className="flex flex-col"
          >
            <p className="text-gray-500 uppercase tracking-wider mb-2">BUY A HOME</p>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find, Buy & Own Your<br />Dream Home
            </h3>
            <p className="text-lg md:text-xl text-gray-500 mb-6">
              Explore from Apartments, land, builder<br />floors, villas and more
            </p>
            <div>
              <Link 
                href="/properties" 
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base font-medium"
              >
                Explore Buying
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}










