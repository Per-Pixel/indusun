'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    role: 'Homeowner',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    content: 'Indusun helped me find my dream home in just two weeks. Their team was professional, responsive, and truly understood my requirements.',
    rating: 5
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Investor',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    content: 'As a property investor, I\'ve worked with many agencies, but Indusun stands out for their market knowledge and commitment to finding the best deals.',
    rating: 5
  },
  {
    id: '3',
    name: 'Amit Verma',
    role: 'First-time Buyer',
    avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    content: 'Buying my first home was intimidating, but the team at Indusun guided me through every step. I couldn\'t be happier with my new apartment!',
    rating: 4
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    role: 'Property Seller',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    content: 'I sold my property through Indusun and was impressed by their marketing strategy. They found a buyer within a month at a price above my expectations.',
    rating: 5
  },
  {
    id: '5',
    name: 'Vikram Singh',
    role: 'Commercial Client',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    content: 'Indusun helped us find the perfect office space for our growing business. Their commercial property expertise is unmatched in the industry.',
    rating: 5
  }
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState(3);
  
  // Update visible testimonials based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleTestimonials(1);
      } else if (window.innerWidth < 1024) {
        setVisibleTestimonials(2);
      } else {
        setVisibleTestimonials(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle navigation
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - visibleTestimonials : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - visibleTestimonials ? 0 : prevIndex + 1
    );
  };
  
  // Get current testimonials to display
  const currentTestimonials = [];
  for (let i = 0; i < visibleTestimonials; i++) {
    const index = (currentIndex + i) % testimonials.length;
    currentTestimonials.push(testimonials[index]);
  }
  
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Testimonial</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            What our clients say about us
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Testimonials Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-${visibleTestimonials} gap-6`}>
            {currentTestimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{testimonial.content}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
}
