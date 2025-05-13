'use client';

import { motion } from 'framer-motion';
import { Home, Building, MapPin, Key, Users, Briefcase } from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: <Home className="h-8 w-8 text-blue-600" />,
    title: 'Residential Properties',
    description: 'Find your dream home from our extensive listings of apartments, villas, and houses.'
  },
  {
    icon: <Building className="h-8 w-8 text-blue-600" />,
    title: 'Commercial Properties',
    description: 'Discover the perfect space for your business with our commercial property listings.'
  },
  {
    icon: <MapPin className="h-8 w-8 text-blue-600" />,
    title: 'Land & Plots',
    description: 'Invest in premium land and plots in high-growth areas with excellent potential.'
  },
  {
    icon: <Key className="h-8 w-8 text-blue-600" />,
    title: 'Property Management',
    description: 'Let us handle the complexities of property management while you enjoy the benefits.'
  },
  {
    icon: <Users className="h-8 w-8 text-blue-600" />,
    title: 'Expert Consultation',
    description: 'Get expert advice from our team of experienced real estate professionals.'
  },
  {
    icon: <Briefcase className="h-8 w-8 text-blue-600" />,
    title: 'Legal Assistance',
    description: 'Navigate legal complexities with our comprehensive legal assistance services.'
  }
];

export function ServicesSection() {
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our Services</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
