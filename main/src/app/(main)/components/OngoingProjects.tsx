'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, MapPin, Calendar } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  location: string;
  image: string;
  completionDate: string;
  progress: number;
}

const ongoingProjects: Project[] = [
  {
    id: 'ongoing1',
    title: 'Skyline Towers',
    location: 'Mumbai, Maharashtra',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1470&auto=format&fit=crop',
    completionDate: 'December 2024',
    progress: 65
  },
  {
    id: 'ongoing2',
    title: 'Green Valley Residences',
    location: 'Pune, Maharashtra',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1470&auto=format&fit=crop',
    completionDate: 'March 2025',
    progress: 40
  },
  {
    id: 'ongoing3',
    title: 'Urban Heights Phase II',
    location: 'Bangalore, Karnataka',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1470&auto=format&fit=crop',
    completionDate: 'June 2025',
    progress: 25
  },
  {
    id: 'ongoing4',
    title: 'Serene Meadows Extension',
    location: 'Delhi, NCR',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1470&auto=format&fit=crop',
    completionDate: 'September 2024',
    progress: 80
  }
];

export function OngoingProjects() {
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ongoing Projects</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Track the progress of our latest developments and secure your investment early
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ongoingProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-3xl font-bold">{project.progress}%</div>
                    <div className="text-sm">Completed</div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                  {project.location}
                </div>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                  Expected completion: {project.completionDate}
                </div>
                <Link 
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
