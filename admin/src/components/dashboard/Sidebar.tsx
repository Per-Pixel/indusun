'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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

interface SidebarProps {
  isOpen: boolean;
  closeSidebar?: () => void;
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [pagesOpen, setPagesOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(pathname.startsWith('/sales'));
  const [authOpen, setAuthOpen] = useState(false);

  const togglePages = () => setPagesOpen(!pagesOpen);
  const toggleSales = () => setSalesOpen(!salesOpen);
  const toggleAuth = () => setAuthOpen(!authOpen);

  // Handle navigation with sidebar closing for mobile
  const handleNavigation = (path: string) => {
    if (closeSidebar) {
      closeSidebar();
    }
    router.push(path);
  };

  return (
    <div
      className={`h-screen fixed left-0 top-0 flex flex-col text-gray-700 border-r border-gray-200 rounded-tr-xl rounded-br-xl overflow-hidden transition-all duration-300 w-[200px] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
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
          <button
            onClick={() => handleNavigation('/dashboard')}
            className={`w-full flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/dashboard'
                ? 'bg-white text-black'
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Dashboard</span>
          </button>
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
              <button
                onClick={() => handleNavigation('/homepage')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/homepage'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Homepage</span>
              </button>
              <button
                onClick={() => handleNavigation('/property-page')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/property-page'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Property Page</span>
              </button>
              <button
                onClick={() => handleNavigation('/about-us')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/about-us'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>About Us</span>
              </button>
              <button
                onClick={() => handleNavigation('/contact-us')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/contact-us'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Contact Us</span>
              </button>
            </div>
          )}
        </div>

        {/* Sales Section with Dropdown */}
        <div className="mb-2">
          <div
            className={`flex items-center justify-between p-3 rounded-md cursor-pointer font-bold transition-colors ${
              pathname.startsWith('/sales')
                ? 'bg-white text-black'
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <div
              className="flex items-center w-full"
              onClick={toggleSales}
            >
              <DollarSign className="w-5 h-5 mr-3 stroke-[2.5px]" />
              <span>Sales</span>
            </div>
            <div onClick={toggleSales}>
              <ChevronDown className={`w-4 h-4 transition-transform stroke-[2.5px] ${salesOpen ? 'transform rotate-180' : ''}`} />
            </div>
          </div>

          {/* Submenu */}
          {salesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => handleNavigation('/sales')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/sales'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Sales Overview</span>
              </button>
              <button
                onClick={() => handleNavigation('/properties')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/properties' || pathname.startsWith('/properties/')
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Properties</span>
              </button>
              <button
                onClick={() => handleNavigation('/billing')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/billing' || pathname.startsWith('/billing/')
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Billing</span>
              </button>
              <button
                onClick={() => handleNavigation('/invoices')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/invoices' || pathname.startsWith('/invoices/')
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Invoices</span>
              </button>
            </div>
          )}
        </div>

        <div className="mb-2">
          <button
            onClick={() => handleNavigation('/messages')}
            className={`w-full flex items-center justify-between p-3 rounded-md font-bold transition-colors ${
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
          </button>
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
              <button
                onClick={() => handleNavigation('/login')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/login'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Login</span>
              </button>
              <button
                onClick={() => handleNavigation('/register')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/register'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>

        <div className="mb-2">
          <button
            onClick={() => handleNavigation('/docs')}
            className={`w-full flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/docs'
                ? 'bg-white text-black'
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <FileCode className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Docs</span>
          </button>
        </div>

        <div className="mb-2">
          <button
            onClick={() => handleNavigation('/components')}
            className={`w-full flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/components'
                ? 'bg-white text-black'
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Components</span>
          </button>
        </div>

        <div className="mb-2">
          <button
            onClick={() => handleNavigation('/help')}
            className={`w-full flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/help'
                ? 'bg-white text-black'
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <HelpCircle className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Help</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;














