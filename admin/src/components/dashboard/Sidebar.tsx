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
  DollarSign,
  Calendar,
  CheckSquare,
  StickyNote,
  FolderOpen,
  Map,
  BarChart2,
  FileInput,
  Users,
  UserPlus,
  UserCog,
  Settings
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
  const [componentsOpen, setComponentsOpen] = useState(pathname.startsWith('/components'));
  const [messagesOpen, setMessagesOpen] = useState(pathname.startsWith('/messages'));

  const togglePages = () => setPagesOpen(!pagesOpen);
  const toggleSales = () => setSalesOpen(!salesOpen);
  const toggleAuth = () => setAuthOpen(!authOpen);
  const toggleComponents = () => setComponentsOpen(!componentsOpen);
  const toggleMessages = () => setMessagesOpen(!messagesOpen);

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
          <div
            className={`flex items-center justify-between p-3 rounded-md cursor-pointer font-bold transition-colors ${
              pathname.startsWith('/messages')
                ? 'bg-white text-black'
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <div
              className="flex items-center w-full"
              onClick={toggleMessages}
            >
              <MessageSquare className="w-5 h-5 mr-3 stroke-[2.5px]" />
              <span>Messages</span>
            </div>
            <div className="flex items-center">
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 mr-2">1</span>
              <div onClick={toggleMessages}>
                <ChevronDown className={`w-4 h-4 transition-transform stroke-[2.5px] ${messagesOpen ? 'transform rotate-180' : ''}`} />
              </div>
            </div>
          </div>

          {/* Messages Submenu */}
          {messagesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => handleNavigation('/messages')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/messages'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Compose</span>
              </button>
              <button
                onClick={() => handleNavigation('/messages/received')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/messages/received' || pathname.startsWith('/messages/received/')
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Received Messages</span>
              </button>
              <button
                onClick={() => handleNavigation('/messages/history')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/messages/history' || pathname.startsWith('/messages/history/')
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <span>Message History</span>
              </button>
            </div>
          )}
        </div>

        {/* Authentication Section with Dropdown */}
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
                onClick={() => handleNavigation('/clients')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/clients' || pathname.startsWith('/clients/')
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 mr-2 stroke-[2.5px]" />
                <span>Clients</span>
              </button>
              <button
                onClick={() => handleNavigation('/brokers')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/brokers' || pathname.startsWith('/brokers/')
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2 stroke-[2.5px]" />
                <span>Brokers</span>
              </button>
              <button
                onClick={() => handleNavigation('/admin-users')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/admin-users' || pathname.startsWith('/admin-users/')
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <UserCog className="w-4 h-4 mr-2 stroke-[2.5px]" />
                <span>Admin Users</span>
              </button>
            </div>
          )}
        </div>

        {/* Components Section with Dropdown */}
        <div className="mb-2">
          <div
            className={`flex items-center justify-between p-3 rounded-md cursor-pointer font-bold transition-colors ${
              pathname.startsWith('/components')
                ? 'bg-white text-black'
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <div
              className="flex items-center w-full"
              onClick={toggleComponents}
            >
              <Layers className="w-5 h-5 mr-3 stroke-[2.5px]" />
              <span>Components</span>
            </div>
            <div onClick={toggleComponents}>
              <ChevronDown className={`w-4 h-4 transition-transform stroke-[2.5px] ${componentsOpen ? 'transform rotate-180' : ''}`} />
            </div>
          </div>

          {/* Components Submenu */}
          {componentsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              <button
                onClick={() => handleNavigation('/components/calendar')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/components/calendar'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2 stroke-[2.5px]" />
                <span>Calendar</span>
              </button>
              <button
                onClick={() => handleNavigation('/components/tasks')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/components/tasks'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <CheckSquare className="w-4 h-4 mr-2 stroke-[2.5px]" />
                <span>Task Manager</span>
              </button>
              <button
                onClick={() => handleNavigation('/components/notes')}
                className={`w-full flex items-center p-2 pl-8 rounded-md font-bold transition-colors text-left ${
                  pathname === '/components/notes'
                    ? 'bg-white text-black'
                    : 'text-black hover:bg-gray-600 hover:text-white'
                }`}
              >
                <StickyNote className="w-4 h-4 mr-2 stroke-[2.5px]" />
                <span>Notes</span>
              </button>
            </div>
          )}
        </div>

        <div className="mb-2">
          <button
            onClick={() => handleNavigation('/settings')}
            className={`w-full flex items-center p-3 rounded-md font-bold transition-colors ${
              pathname === '/settings'
                ? 'bg-white text-black'
                : 'text-black hover:bg-gray-600 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5 mr-3 stroke-[2.5px]" />
            <span>Settings</span>
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















