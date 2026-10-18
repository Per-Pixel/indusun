'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday, isWeekend, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Users, X, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'viewing' | 'meeting' | 'deadline' | 'closing' | 'inspection' | 'open-house';
  location?: string;
  client?: {
    id: string;
    name: string;
    image?: string;
  };
  property?: {
    id: string;
    title: string;
    address: string;
  };
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  image?: string;
}

interface Property {
  id: string;
  title: string;
  address: string;
}

const clients: Client[] = [];
const properties: Property[] = [];

export default function CalendarPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  
  // New event form state
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'viewing',
    location: '',
    notes: '',
    time: '12:00 PM',
  });
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workspace?type=calendar');
      if (!res.ok) throw new Error('Failed to load calendar events');
      const json = await res.json();
      const all: CalendarEvent[] = json.events || [];
      setEvents(all);
      setCustomEvents(all.filter((e) => !e.id.startsWith('crm-evt-')));
    } catch (err) {
      console.error('Calendar fetch error:', err);
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  
  // Calendar navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  // Event handlers
  const handleDateClick = (day: Date) => setSelectedDate(day);
  
  const openEventDetails = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };
  
  const handleAddEvent = async () => {
    if (!newEvent.title) {
      toast.error('Please enter an event title');
      return;
    }
    const event: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: newEvent.title,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: newEvent.time || '12:00 PM',
      type: (newEvent.type as CalendarEvent['type']) || 'viewing',
      location: newEvent.location,
      client: clients.find(c => c.id === newEvent.client?.id),
      property: properties.find(p => p.id === newEvent.property?.id),
      notes: newEvent.notes,
    };

    const updatedCustom = [...customEvents, event];
    setCustomEvents(updatedCustom);
    setEvents((prev) => [...prev, event]);
    setIsAddEventModalOpen(false);
    setNewEvent({ title: '', type: 'viewing', location: '', notes: '', time: '12:00 PM' });

    setSaving(true);
    try {
      await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'calendar_events', items: updatedCustom }),
      });
      toast.success('Event saved to database');
    } catch {
      toast.error('Event added locally but failed to persist');
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (eventId.startsWith('crm-evt-')) {
      toast.error('CRM-derived events are read-only — manage them from the customer record');
      return;
    }
    const updatedCustom = customEvents.filter((e) => e.id !== eventId);
    setCustomEvents(updatedCustom);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setIsEventDetailsOpen(false);
    try {
      await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'calendar_events', items: updatedCustom }),
      });
      toast.success('Event removed');
    } catch {
      toast.error('Failed to delete event');
    }
  };
  
  // Filter events for the selected date
  const selectedDateEvents = events.filter(event => {
    const eventDate = parseISO(event.date);
    return isSameDay(eventDate, selectedDate);
  });
  
  // Filter events for search
  const filteredEvents = searchQuery
    ? events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.property?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;
  
  // Get events for the current month
  const monthEvents = filteredEvents.filter(event => {
    const eventDate = parseISO(event.date);
    return isSameMonth(eventDate, currentMonth);
  });
  
  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'viewing':    return 'bg-blue-100 text-blue-800';
      case 'meeting':    return 'bg-purple-100 text-purple-800';
      case 'deadline':   return 'bg-red-100 text-red-800';
      case 'closing':    return 'bg-green-100 text-green-800';
      case 'inspection': return 'bg-yellow-100 text-yellow-800';
      case 'open-house': return 'bg-indigo-100 text-indigo-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render calendar days
  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dayEvents = monthEvents.filter(event => {
          const eventDate = parseISO(event.date);
          return isSameDay(eventDate, currentDay);
        });
        
        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] p-2 border ${
              !isSameMonth(day, monthStart)
                ? 'bg-gray-50 text-gray-400'
                : isToday(day)
                ? 'bg-blue-50'
                : isSameDay(day, selectedDate)
                ? 'bg-blue-100'
                : isWeekend(day)
                ? 'bg-gray-50'
                : 'bg-white'
            }`}
            onClick={() => handleDateClick(currentDay)}
          >
            <div className="flex justify-between">
              <span className={`text-sm font-medium ${
                isToday(currentDay) ? 'text-blue-600 font-bold' : ''
              }`}>
                {format(day, 'd')}
              </span>
              {dayEvents.length > 0 && (
                <span className="h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {dayEvents.length}
                </span>
              )}
            </div>
            <div className="mt-1 space-y-1">
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEventDetails(event);
                  }}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500 pl-1">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return rows;
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>
        
        <div className="p-6 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-sm text-gray-500 mt-1">
                Live CRM events from <code>Master Data Of Gurukrupa</code> plus your custom events (persisted in Supabase)
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchEvents} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => setIsAddEventModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                <span>Add Event</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center space-x-2">
                  <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h2>
                  <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Today
                </button>
              </div>
              
              <div className="grid grid-cols-7 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="divide-y">
                {renderDays()}
              </div>
            </div>
            
            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Selected date events */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-gray-500">No events scheduled for this day</p>
                    <button
                      onClick={() => setIsAddEventModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Add Event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map(event => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => openEventDetails(event)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.type)}`}>
                              {event.type.replace('-', ' ')}
                            </span>
                            <h4 className="font-medium text-gray-900 mt-1">{event.title}</h4>
                          </div>
                          <div className="text-sm text-gray-500">{event.time}</div>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <MapPin size={14} className="mr-1" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        
                        {event.client && (
                          <div className="flex items-center mt-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {(event.client.name || 'A').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="ml-2 text-sm text-gray-700">{event.client.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Upcoming events */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {filteredEvents
                    .filter(event => parseISO(event.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                    .slice(0, 5)
                    .map(event => (
                      <div
                        key={event.id}
                        className="flex items-start p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => openEventDetails(event)}
                      >
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex flex-col items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-blue-800">{format(parseISO(event.date), 'd')}</span>
                          <span className="text-xs text-blue-800">{format(parseISO(event.date), 'MMM')}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock size={12} className="mr-1" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  {filteredEvents.filter(e => parseISO(e.date) >= new Date(new Date().setHours(0,0,0,0))).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddEventModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddEventModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Event</h2>
                <button
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter event title"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <CalendarIcon size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm">{format(selectedDate, 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10:00 AM"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                  >
                    <option value="viewing">Property Viewing</option>
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="closing">Closing</option>
                    <option value="inspection">Inspection</option>
                    <option value="open-house">Open House</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Client name (optional)"
                    onChange={(e) => setNewEvent({ ...newEvent, client: e.target.value ? { id: `client-${Date.now()}`, name: e.target.value } : undefined })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. SAI SHRUSHTI RESIDENCY – Plot 45"
                    onChange={(e) => setNewEvent({ ...newEvent, property: e.target.value ? { id: `prop-${Date.now()}`, title: e.target.value, address: '' } : undefined })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add notes about this event"
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save Event'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Event Details Modal */}
      <AnimatePresence>
        {isEventDetailsOpen && selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEventDetailsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type.replace('-', ' ')}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedEvent.title}</h2>
                </div>
                <button
                  onClick={() => setIsEventDetailsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <CalendarIcon size={16} className="mr-2 text-gray-500" />
                  <span>{format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock size={16} className="mr-2 text-gray-500" />
                  <span>{selectedEvent.time}</span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center text-gray-700">
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.client && (
                  <div className="flex items-center text-gray-700">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
                      {(selectedEvent.client.name || 'A').slice(0, 2).toUpperCase()}
                    </div>
                    <span>{selectedEvent.client.name}</span>
                  </div>
                )}
                
                {selectedEvent.property && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{selectedEvent.property.title}</div>
                    {selectedEvent.property.address && (
                      <div className="text-sm text-gray-500 mt-1">{selectedEvent.property.address}</div>
                    )}
                  </div>
                )}
                
                {selectedEvent.notes && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-700">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                {!selectedEvent.id.startsWith('crm-evt-') && (
                  <button
                    onClick={() => deleteEvent(selectedEvent.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                  >
                    Delete Event
                  </button>
                )}
                <button
                  onClick={() => setIsEventDetailsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
