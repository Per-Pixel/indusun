'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingBag, 
  MessageSquare, 
  Lock, 
  FileCode, 
  Layers, 
  HelpCircle,
  ChevronDown,
  DollarSign
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [pagesOpen, setPagesOpen] = useState(true);
  const [salesOpen, setSalesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  
  const togglePages = () => setPagesOpen(!pagesOpen);
  const toggleSales = () => setSalesOpen(!salesOpen);
  const toggleAuth = () => setAuthOpen(!authOpen);

  return (
    <div 
      className="h-screen w-[200px] fixed left-0 top-0 flex flex-col text-gray-700 border-r border-gray-200 rounded-tr-xl rounded-br-xl overflow-hidden"
      style={{ 
        background: 'linear-gradient(to left, rgba(217, 217, 217, 1) 15%, rgba(115, 181, 236, 1) 150%)' 
      }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center">
        <div className="bg-green-600 rounded-full h-8 w-8 flex items-center justify-center mr-2">
          <span className="text-white font-bold">I</span>
        </div>
        <span className="text-xl font-semibold">Indusun</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="mb-4">
          <Link 
            href="/dashboard" 
            className={`flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/dashboard' 
                ? 'bg-white text-black' 
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Pages Section with Dropdown */}
        <div className="mb-2">
          <div 
            className="flex items-center justify-between p-3 text-black hover:bg-gray-600 hover:text-white rounded-md cursor-pointer font-bold transition-colors"
            onClick={togglePages}
          >
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-3 stroke-[2.5px]" />
              <span>Pages</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform stroke-[2.5px] ${pagesOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {/* Submenu */}
          {pagesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <Link 
                href="/homepage" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/homepage' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Homepage</span>
              </Link>
              <Link 
                href="/property-page" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/property-page' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Property Page</span>
              </Link>
              <Link 
                href="/about-us" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/about-us' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>About Us</span>
              </Link>
              <Link 
                href="/contact-us" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/contact-us' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Contact Us</span>
              </Link>
            </div>
          )}
        </div>
        
        {/* Sales Section with Dropdown */}
        <div className="mb-2">
          <div 
            className="flex items-center justify-between p-3 text-black hover:bg-gray-600 hover:text-white rounded-md cursor-pointer font-bold transition-colors"
            onClick={toggleSales}
          >
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-3 stroke-[2.5px]" />
              <span>Sales</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform stroke-[2.5px] ${salesOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {/* Submenu */}
          {salesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <Link 
                href="/properties" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/properties' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Properties</span>
              </Link>
              <Link 
                href="/billing" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/billing' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Billing</span>
              </Link>
              <Link 
                href="/invoice" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/invoice' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Invoice</span>
              </Link>
            </div>
          )}
        </div>
        
        <div className="mb-2">
          <Link 
            href="/messages" 
            className={`flex items-center justify-between p-3 rounded-md font-bold transition-colors ${
              pathname === '/messages' 
                ? 'bg-white text-black' 
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-3 stroke-[2.5px]" />
              <span>Messages</span>
            </div>
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">1</span>
          </Link>
        </div>
        
        <div className="mb-2">
          <div 
            className="flex items-center justify-between p-3 text-black hover:bg-gray-600 hover:text-white rounded-md cursor-pointer font-bold transition-colors"
            onClick={toggleAuth}
          >
            <div className="flex items-center">
              <Lock className="w-5 h-5 mr-3 stroke-[2.5px]" />
              <span>Authentication</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform stroke-[2.5px] ${authOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {authOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <Link 
                href="/login" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/login' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Login</span>
              </Link>
              <Link 
                href="/register" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold transition-colors ${
                  pathname === '/register' 
                    ? 'bg-white text-black' 
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
        
        <div className="mb-2">
          <Link 
            href="/docs" 
            className={`flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/docs' 
                ? 'bg-white text-black' 
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <FileCode className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Docs</span>
          </Link>
        </div>
        
        <div className="mb-2">
          <Link 
            href="/components" 
            className={`flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/components' 
                ? 'bg-white text-black' 
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Components</span>
          </Link>
        </div>
        
        <div className="mb-2">
          <Link 
            href="/help" 
            className={`flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/help' 
                ? 'bg-white text-black' 
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <HelpCircle className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Help</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;












