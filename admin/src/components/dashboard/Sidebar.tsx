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
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const [pagesOpen, setPagesOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  
  const togglePages = () => setPagesOpen(!pagesOpen);
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
            className={`flex items-center p-3 rounded-md font-bold ${
              pathname === '/dashboard' 
                ? 'bg-blue-500 text-white' 
                : 'text-black hover:bg-blue-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Pages Section with Dropdown */}
        <div className="mb-2">
          <div 
            className="flex items-center justify-between p-3 text-black hover:bg-blue-200 rounded-md cursor-pointer font-bold"
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
                href="/sales" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold ${
                  pathname === '/sales' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-black hover:bg-blue-200'
                }`}
              >
                <span>Sales</span>
              </Link>
              <Link 
                href="/properties" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold ${
                  pathname === '/properties' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-black hover:bg-blue-200'
                }`}
              >
                <span>Properties</span>
              </Link>
              <Link 
                href="/billing" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold ${
                  pathname === '/billing' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-black hover:bg-blue-200'
                }`}
              >
                <span>Billing</span>
              </Link>
              <Link 
                href="/invoice" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold ${
                  pathname === '/invoice' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-black hover:bg-blue-200'
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
            className={`flex items-center justify-between p-3 rounded-md font-bold ${
              pathname === '/messages' 
                ? 'bg-blue-500 text-white' 
                : 'text-black hover:bg-blue-200'
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
            className="flex items-center justify-between p-3 text-black hover:bg-blue-200 rounded-md cursor-pointer font-bold"
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
                className={`flex items-center p-2 pl-8 rounded-md font-bold ${
                  pathname === '/login' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-black hover:bg-blue-200'
                }`}
              >
                <span>Login</span>
              </Link>
              <Link 
                href="/register" 
                className={`flex items-center p-2 pl-8 rounded-md font-bold ${
                  pathname === '/register' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-black hover:bg-blue-200'
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
            className={`flex items-center p-3 rounded-md font-bold ${
              pathname === '/docs' 
                ? 'bg-blue-500 text-white' 
                : 'text-black hover:bg-blue-200'
            }`}
          >
            <FileCode className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Docs</span>
          </Link>
        </div>
        
        <div className="mb-2">
          <Link 
            href="/components" 
            className={`flex items-center p-3 rounded-md font-bold ${
              pathname === '/components' 
                ? 'bg-blue-500 text-white' 
                : 'text-black hover:bg-blue-200'
            }`}
          >
            <Layers className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Components</span>
          </Link>
        </div>
        
        <div className="mb-2">
          <Link 
            href="/help" 
            className={`flex items-center p-3 rounded-md font-bold ${
              pathname === '/help' 
                ? 'bg-blue-500 text-white' 
                : 'text-black hover:bg-blue-200'
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








