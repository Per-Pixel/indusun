'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Shield, Clock, Award, Users, ThumbsUp } from 'lucide-react';

interface Reason {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const reasons: Reason[] = [
  {
    icon: <CheckCircle className="h-8 w-8 text-blue-600" />,
    title: 'Verified Listings',
    description: 'All our properties are thoroughly verified for authenticity and legal compliance.'
  },
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: 'Secure Transactions',
    description: 'Your transactions are protected with our secure payment systems and legal assistance.'
  },
  {
    icon: <Clock className="h-8 w-8 text-blue-600" />,
    title: 'Fast Processing',
    description: 'We ensure quick processing of all documentation and approvals for a smooth experience.'
  },
  {
    icon: <Award className="h-8 w-8 text-blue-600" />,
    title: 'Award-Winning Service',
    description: 'Our service excellence has been recognized with multiple industry awards.'
  },
  {
    icon: <Users className="h-8 w-8 text-blue-600" />,
    title: 'Expert Team',
    description: 'Our team of experienced professionals provides expert guidance at every step.'
  },
  {
    icon: <ThumbsUp className="h-8 w-8 text-blue-600" />,
    title: 'Customer Satisfaction',
    description: 'We pride ourselves on our high customer satisfaction rates and positive feedback.'
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Why Choose Us?</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Discover the advantages of working with Indusun for all your real estate needs
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-blue-50 p-6 rounded-lg"
            >
              <div className="mb-4">{reason.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{reason.title}</h3>
              <p className="text-gray-600">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
