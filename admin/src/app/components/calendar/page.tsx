'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  MapPin,
  Home,
  Building,
  X
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

// Types for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'viewing' | 'meeting' | 'inspection' | 'closing' | 'other';
  location?: string;
  client?: {
    id: string;
    name: string;
  };
  property?: {
    id: string;
    title: string;
    address: string;
  };
  notes?: string;
}

// Mock data for calendar events
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Property Viewing',
    date: '2023-12-15',
    time: '10:00 AM',
    type: 'viewing',
    location: 'Whitefield, Bangalore',
    client: {
      id: 'c1',
      name: 'Priya Patel'
    },
    property: {
      id: '1',
      title: 'Luxury Villa',
      address: '123 Palm Avenue, Whitefield, Bangalore'
    },
    notes: 'Client is interested in 4-bedroom properties with a garden.'
  },
  {
    id: '2',
    title: 'Client Meeting',
    date: '2023-12-15',
    time: '2:00 PM',
    type: 'meeting',
    location: 'Office',
    client: {
      id: 'c2',
      name: 'Vikram Singh'
    },
    notes: 'Discuss investment options in commercial properties.'
  },
  {
    id: '3',
    title: 'Property Inspection',
    date: '2023-12-16',
    time: '11:30 AM',
    type: 'inspection',
    location: 'Electronic City, Bangalore',
    property: {
      id: '2',
      title: 'Commercial Space',
      address: '456 Tech Avenue, Electronic City, Bangalore'
    },
    notes: 'Pre-listing inspection with the property owner.'
  },
  {
    id: '4',
    title: 'Closing Meeting',
    date: '2023-12-18',
    time: '3:00 PM',
    type: 'closing',
    location: 'Legal Office',
    client: {
      id: 'c3',
      name: 'TechSoft Solutions'
    },
    property: {
      id: '2',
      title: 'Commercial Space',
      address: '456 Tech Avenue, Electronic City, Bangalore'
    },
    notes: 'Final paperwork and key handover.'
  },
  {
    id: '5',
    title: 'Property Viewing',
    date: '2023-12-20',
    time: '4:30 PM',
    type: 'viewing',
    location: 'Sarjapur, Bangalore',
    client: {
      id: 'c5',
      name: 'Ananya Reddy'
    },
    property: {
      id: '3',
      title: 'Residential Plot',
      address: '234 Residential Layout, Sarjapur, Bangalore'
    }
  }
];

// Helper function to get the days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get the first day of the month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get event type color
const getEventTypeColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'viewing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'meeting':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'inspection':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'closing':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'other':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get event type icon
const getEventTypeIcon = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'viewing':
      return <Home size={14} className="mr-1" />;
    case 'meeting':
      return <User size={14} className="mr-1" />;
    case 'inspection':
      return <Building size={14} className="mr-1" />;
    case 'closing':
      return <CalendarIcon size={14} className="mr-1" />;
    case 'other':
    default:
      return null;
  }
};

export default function CalendarPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // New event form state
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    date: selectedDate,
    time: '09:00 AM',
    type: 'meeting',
    location: '',
    notes: ''
  });

  // Current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Days in current month
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  // First day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(formatDate(new Date()));
  };

  // Handle date selection
  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(formatDate(selectedDate));
  };

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    const dateString = formatDate(new Date(currentYear, currentMonth, day));
    return mockEvents.filter(event => event.date === dateString);
  };

  // Open event modal
  const openEventModal = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Close event modal
  const closeEventModal = () => {
    setSelectedEvent(null);
    setShowEventModal(false);
  };

  // Open add event modal
  const openAddEventModal = () => {
    setNewEvent({
      title: '',
      date: selectedDate,
      time: '09:00 AM',
      type: 'meeting',
      location: '',
      notes: ''
    });
    setShowAddEventModal(true);
  };

  // Close add event modal
  const closeAddEventModal = () => {
    setShowAddEventModal(false);
  };

  // Handle new event input change
  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save new event
  const saveNewEvent = () => {
    // In a real app, this would save to a database
    // For now, we'll just close the modal
    // You would typically generate a unique ID and add to the events array

    // Mock adding to the array (this won't persist on refresh)
    const newEventWithId = {
      ...newEvent,
      id: `event-${Date.now()}`,
    } as CalendarEvent;

    // In a real app: mockEvents.push(newEventWithId);

    closeAddEventModal();
    // You might want to show a success message here
  };

  // Open edit event modal
  const openEditEventModal = () => {
    if (selectedEvent) {
      setNewEvent({
        ...selectedEvent
      });
      setShowEditEventModal(true);
      setShowEventModal(false);
    }
  };

  // Close edit event modal
  const closeEditEventModal = () => {
    setShowEditEventModal(false);
  };

  // Save edited event
  const saveEditedEvent = () => {
    // In a real app, this would update the database
    // For now, we'll just close the modal

    // Mock updating the array (this won't persist on refresh)
    // In a real app: update the event in mockEvents

    closeEditEventModal();
    // You might want to show a success message here
  };

  // Get events for selected date
  const selectedDateEvents = mockEvents.filter(event => event.date === selectedDate);

  // Generate calendar grid
  const calendarGrid = [];
  let dayCounter = 1;

  // Create calendar rows
  for (let i = 0; i < 6; i++) {
    const week = [];

    // Create days in each week
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayOfMonth) {
        // Empty cells before the first day of the month
        week.push(null);
      } else if (dayCounter <= daysInMonth) {
        // Days of the month
        week.push(dayCounter);
        dayCounter++;
      } else {
        // Empty cells after the last day of the month
        week.push(null);
      }
    }

    calendarGrid.push(week);

    // Stop if we've reached the end of the month
    if (dayCounter > daysInMonth) {
      break;
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Calendar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-500">Manage your property viewings, meetings, and appointments</p>
              </div>

              <div className="flex items-center mt-4 md:mt-0">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
                >
                  Today
                </button>
                <button
                  onClick={prevMonth}
                  className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-1"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-4"
                >
                  <ChevronRight size={16} />
                </button>
                <h2 className="text-lg font-medium">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {dayNames.map((day, index) => (
                  <div key={index} className="py-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="divide-y divide-gray-200">
                {calendarGrid.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-200">
                    {week.map((day, dayIndex) => {
                      if (day === null) {
                        // Empty cell
                        return (
                          <div key={dayIndex} className="h-32 p-2 bg-gray-50"></div>
                        );
                      }

                      const dateString = formatDate(new Date(currentYear, currentMonth, day));
                      const isToday = dateString === formatDate(new Date());
                      const isSelected = dateString === selectedDate;
                      const events = getEventsForDate(day);

                      return (
                        <div
                          key={dayIndex}
                          className={`h-32 p-2 cursor-pointer transition-colors ${
                            isToday ? 'bg-blue-50' : isSelected ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => handleDateSelect(day)}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-sm ${
                              isToday ? 'bg-blue-600 text-white' : ''
                            }`}>
                              {day}
                            </span>
                            {events.length > 0 && (
                              <span className="text-xs font-medium text-gray-500">
                                {events.length} event{events.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          {/* Event Indicators */}
                          <div className="mt-1 space-y-1 max-h-20 overflow-hidden">
                            {events.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`px-2 py-1 rounded-md text-xs truncate border ${getEventTypeColor(event.type)}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEventModal(event);
                                }}
                              >
                                <div className="flex items-center">
                                  {getEventTypeIcon(event.type)}
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            ))}
                            {events.length > 2 && (
                              <div className="text-xs text-gray-500 pl-2">
                                +{events.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Date Events */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-medium">
                  Events for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <button
                  onClick={openAddEventModal}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Add Event</span>
                </button>
              </div>

              {selectedDateEvents.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => openEventModal(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock size={14} className="mr-1" />
                            <span>{event.time}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin size={14} className="mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                      </div>

                      {(event.client || event.property) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {event.client && (
                            <div className="flex items-center text-sm">
                              <User size={14} className="mr-1 text-gray-400" />
                              <span className="text-gray-700">{event.client.name}</span>
                            </div>
                          )}
                          {event.property && (
                            <div className="flex items-center text-sm mt-1">
                              <Home size={14} className="mr-1 text-gray-400" />
                              <span className="text-gray-700">{event.property.title}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No events scheduled for this date.</p>
                  <button
                    onClick={openAddEventModal}
                    className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    <span>Add Event</span>
                  </button>
                </div>
              )}
            </div>

            {/* Event Modal */}
            {showEventModal && selectedEvent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">Event Details</h3>
                    <button
                      onClick={closeEventModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="mb-4">
                      <h2 className="text-xl font-medium">{selectedEvent.title}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getEventTypeColor(selectedEvent.type)}`}>
                        {getEventTypeIcon(selectedEvent.type)}
                        {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CalendarIcon size={16} className="mr-2 text-gray-400" />
                        <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>

                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        <span>{selectedEvent.time}</span>
                      </div>

                      {selectedEvent.location && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 text-gray-400" />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}

                      {selectedEvent.client && (
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <span>{selectedEvent.client.name}</span>
                        </div>
                      )}

                      {selectedEvent.property && (
                        <div>
                          <div className="flex items-center">
                            <Home size={16} className="mr-2 text-gray-400" />
                            <span>{selectedEvent.property.title}</span>
                          </div>
                          <div className="ml-6 mt-1 text-sm text-gray-500">
                            {selectedEvent.property.address}
                          </div>
                        </div>
                      )}

                      {selectedEvent.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium mb-2">Notes</h4>
                          <p className="text-sm text-gray-700">{selectedEvent.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={closeEventModal}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={openEditEventModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Event Modal */}
            {showAddEventModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">Add New Event</h3>
                    <button
                      onClick={closeAddEventModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4">
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Event Title*
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={newEvent.title}
                          onChange={handleNewEventChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date*
                          </label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={newEvent.date}
                            onChange={handleNewEventChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                            Time*
                          </label>
                          <input
                            type="time"
                            id="time"
                            name="time"
                            value={newEvent.time?.replace(' AM', '').replace(' PM', '')}
                            onChange={handleNewEventChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                          Event Type*
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={newEvent.type}
                          onChange={handleNewEventChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        >
                          <option value="viewing">Viewing</option>
                          <option value="meeting">Meeting</option>
                          <option value="inspection">Inspection</option>
                          <option value="closing">Closing</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={newEvent.location}
                          onChange={handleNewEventChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={newEvent.notes}
                          onChange={handleNewEventChange}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                      </div>
                    </form>
                  </div>

                  <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={closeAddEventModal}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveNewEvent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Save Event
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Event Modal */}
            {showEditEventModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">Edit Event</h3>
                    <button
                      onClick={closeEditEventModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4">
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Event Title*
                        </label>
                        <input
                          type="text"
                          id="edit-title"
                          name="title"
                          value={newEvent.title}
                          onChange={handleNewEventChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date*
                          </label>
                          <input
                            type="date"
                            id="edit-date"
                            name="date"
                            value={newEvent.date}
                            onChange={handleNewEventChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="edit-time" className="block text-sm font-medium text-gray-700 mb-1">
                            Time*
                          </label>
                          <input
                            type="time"
                            id="edit-time"
                            name="time"
                            value={newEvent.time?.replace(' AM', '').replace(' PM', '')}
                            onChange={handleNewEventChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-1">
                          Event Type*
                        </label>
                        <select
                          id="edit-type"
                          name="type"
                          value={newEvent.type}
                          onChange={handleNewEventChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        >
                          <option value="viewing">Viewing</option>
                          <option value="meeting">Meeting</option>
                          <option value="inspection">Inspection</option>
                          <option value="closing">Closing</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          id="edit-location"
                          name="location"
                          value={newEvent.location}
                          onChange={handleNewEventChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          id="edit-notes"
                          name="notes"
                          value={newEvent.notes}
                          onChange={handleNewEventChange}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                      </div>
                    </form>
                  </div>

                  <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={closeEditEventModal}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditedEvent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
