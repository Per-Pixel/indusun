'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Building } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  location: string;
  image: string;
  type: string;
}

const highlightedProjects: Project[] = [
  {
    id: 'project1',
    title: 'Skyline Residences',
    location: 'Mumbai, Maharashtra',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop',
    type: 'Residential'
  },
  {
    id: 'project2',
    title: 'Green Valley Villas',
    location: 'Pune, Maharashtra',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1470&auto=format&fit=crop',
    type: 'Residential'
  },
  {
    id: 'project3',
    title: 'Urban Heights',
    location: 'Bangalore, Karnataka',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop',
    type: 'Commercial'
  },
  {
    id: 'project4',
    title: 'Serene Meadows',
    location: 'Delhi, NCR',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1470&auto=format&fit=crop',
    type: 'Residential'
  }
];

export function HighlightedProjects() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Highlighted Residential Projects
            </h2>
            <p className="text-gray-600 mt-2">
              Explore our premium residential developments
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-4 md:mt-0"
          >
            <Link 
              href="/projects" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Projects
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {highlightedProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full bg-white">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {project.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                    {project.location}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-blue-600 font-medium">View Details</span>
                    <ArrowRight className="h-4 w-4 text-blue-600 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
