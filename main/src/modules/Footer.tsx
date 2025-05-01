import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <div className="w-full overflow-hidden">
      {/* Curved top border using SVG */}
      <div className="bg-white w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-4 sm:h-6 md:h-16">
          <path 
            fill="#000000" 
            d="M0,100 L0,85 Q30,60 60,60 L1380,60 Q1410,60 1440,85 L1440,100 Z"
            fillRule="evenodd"
          />
        </svg>
      </div>
      
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/navbar/logo.svg"
                  alt="Indusun Logo"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">Indusun</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Your trusted partner in finding the perfect property for your needs.
              </p>
              <div className="space-y-2 text-gray-400">
                <p>123 Real Estate Avenue</p>
                <p>Mumbai, Maharashtra</p>
                <p>Phone: +91 123 456 7890</p>
                <p>Email: info@indusun.com</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/properties" className="text-gray-400 hover:text-white transition-colors">
                    Properties
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/services/buying" className="text-gray-400 hover:text-white transition-colors">
                    Buying Property
                  </Link>
                </li>
                <li>
                  <Link href="/services/selling" className="text-gray-400 hover:text-white transition-colors">
                    Selling Property
                  </Link>
                </li>
                <li>
                  <Link href="/services/renting" className="text-gray-400 hover:text-white transition-colors">
                    Renting Property
                  </Link>
                </li>
                <li>
                  <Link href="/services/investment" className="text-gray-400 hover:text-white transition-colors">
                    Property Investment
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for the latest updates on properties and projects.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="px-4 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none flex-1"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-r-md hover:bg-orange-600 transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} Indusun. All rights reserved.
              </p>
              
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer
