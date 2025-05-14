'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StickyNote,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Clock,
  User,
  Home,
  Building,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

// Types for notes
interface Note {
  id: string;
  title: string;
  content: string;
  category: 'client' | 'property' | 'meeting' | 'other';
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'gray';
  pinned: boolean;
  client?: {
    id: string;
    name: string;
  };
  property?: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock data for notes
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Client Requirements - Priya Patel',
    content: 'Looking for a 4-bedroom villa in Whitefield area. Budget is around 1.5 Cr. Needs a garden and parking space for 2 cars. Prefers a gated community with 24/7 security.',
    category: 'client',
    color: 'blue',
    pinned: true,
    client: {
      id: 'c1',
      name: 'Priya Patel'
    },
    createdAt: '2023-12-10',
    updatedAt: '2023-12-10'
  },
  {
    id: '2',
    title: 'Property Details - Commercial Space',
    content: 'Commercial space in Tech Park has 5000 sq ft area. Suitable for IT companies or startups. Has 3 conference rooms, cafeteria, and parking space. Rent is 3.5 Lakhs per month with 6 months deposit.',
    category: 'property',
    color: 'green',
    pinned: true,
    property: {
      id: '2',
      title: 'Commercial Space in Tech Park'
    },
    createdAt: '2023-12-08',
    updatedAt: '2023-12-12'
  },
  {
    id: '3',
    title: 'Meeting Notes - TechSoft Solutions',
    content: 'Met with TechSoft Solutions team on Dec 5. They are looking for office space for 50 employees. Need at least 3 conference rooms and a cafeteria. Budget is flexible but prefer Central Business District area.',
    category: 'meeting',
    color: 'purple',
    pinned: false,
    client: {
      id: 'c3',
      name: 'TechSoft Solutions'
    },
    createdAt: '2023-12-05',
    updatedAt: '2023-12-05'
  },
  {
    id: '4',
    title: 'Property Inspection - Residential Plot',
    content: 'Inspected the residential plot in Sarjapur. Size is 30x40 (1200 sq ft). East facing with good road access. Water and electricity connections available. Market value around 85 Lakhs.',
    category: 'property',
    color: 'green',
    pinned: false,
    property: {
      id: '3',
      title: 'Residential Plot in Sarjapur'
    },
    createdAt: '2023-12-02',
    updatedAt: '2023-12-02'
  },
  {
    id: '5',
    title: 'Follow-up Tasks - Ananya Reddy',
    content: 'Need to follow up with Ananya Reddy about the payment for Residential Plot. Also need to arrange for property registration process. Send her the list of required documents.',
    category: 'client',
    color: 'yellow',
    pinned: false,
    client: {
      id: 'c5',
      name: 'Ananya Reddy'
    },
    property: {
      id: '3',
      title: 'Residential Plot in Sarjapur'
    },
    createdAt: '2023-11-28',
    updatedAt: '2023-12-01'
  },
  {
    id: '6',
    title: 'Market Research - Whitefield Area',
    content: 'Property prices in Whitefield have increased by 15% in the last year. High demand for 3-4 bedroom villas and apartments. Good investment opportunity for residential projects.',
    category: 'other',
    color: 'gray',
    pinned: false,
    createdAt: '2023-11-25',
    updatedAt: '2023-11-25'
  },
  {
    id: '7',
    title: 'Client Feedback - Vikram Singh',
    content: 'Vikram Singh was satisfied with the property documentation service. He might refer some of his colleagues who are looking for properties in HSR Layout area.',
    category: 'client',
    color: 'blue',
    pinned: false,
    client: {
      id: 'c2',
      name: 'Vikram Singh'
    },
    createdAt: '2023-11-20',
    updatedAt: '2023-11-20'
  },
  {
    id: '8',
    title: 'Rental Agreement - Retail Space',
    content: 'Prepared rental agreement for Fashion Trends Ltd for the Retail Space in Commercial Complex. Monthly rent is 2.8 Lakhs with 6 months deposit. Agreement duration is 3 years with 5% annual increment.',
    category: 'property',
    color: 'green',
    pinned: false,
    client: {
      id: 'c8',
      name: 'Fashion Trends Ltd'
    },
    property: {
      id: '8',
      title: 'Retail Space in Commercial Complex'
    },
    createdAt: '2023-11-15',
    updatedAt: '2023-11-18'
  }
];

// Helper function to get category color
const getCategoryColor = (category: Note['category']) => {
  switch (category) {
    case 'client':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'property':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'meeting':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'other':
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get note background color
const getNoteColor = (color: Note['color']) => {
  switch (color) {
    case 'blue':
      return 'bg-blue-50 border-blue-200';
    case 'green':
      return 'bg-green-50 border-green-200';
    case 'yellow':
      return 'bg-yellow-50 border-yellow-200';
    case 'purple':
      return 'bg-purple-50 border-purple-200';
    case 'gray':
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function NotesPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter notes based on search term and filters
  const filteredNotes = mockNotes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (note.property?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Group notes by pinned status
  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const otherNotes = filteredNotes.filter(note => !note.pinned);

  // Open note modal
  const openNoteModal = (note: Note) => {
    setSelectedNote(note);
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setShowNoteModal(true);
    setIsEditing(false);
  };

  // Close note modal
  const closeNoteModal = () => {
    setSelectedNote(null);
    setShowNoteModal(false);
    setIsEditing(false);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Save edited note
  const saveNote = () => {
    // In a real app, this would update the note in the database
    setIsEditing(false);
  };

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
            {/* Notes Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
                <p className="text-gray-500">Manage your notes and important information</p>
              </div>

              <div className="flex items-center mt-4 md:mt-0">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Add Note</span>
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <select
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="client">Client</option>
                  <option value="property">Property</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Tag size={18} className="mr-2" />
                  Pinned Notes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg border shadow-sm cursor-pointer ${getNoteColor(note.color)}`}
                      onClick={() => openNoteModal(note)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">{note.title}</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {note.content}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(note.category)}`}>
                          {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                        </span>
                        {note.client && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            <User size={12} className="mr-1" />
                            {note.client.name}
                          </span>
                        )}
                        {note.property && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <Home size={12} className="mr-1" />
                            {note.property.title}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          <span>Updated {formatDate(note.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes */}
            <div>
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <StickyNote size={18} className="mr-2" />
                All Notes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-lg border shadow-sm cursor-pointer ${getNoteColor(note.color)}`}
                    onClick={() => openNoteModal(note)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">{note.title}</h3>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {note.content}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(note.category)}`}>
                        {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                      </span>
                      {note.client && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <User size={12} className="mr-1" />
                          {note.client.name}
                        </span>
                      )}
                      {note.property && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <Home size={12} className="mr-1" />
                          {note.property.title}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        <span>Updated {formatDate(note.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Note Card */}
                <div
                  className="p-4 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 h-full min-h-[200px]"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <Plus size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">Add New Note</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to create a new note
                  </p>
                </div>
              </div>
            </div>

            {/* Note Modal */}
            {showNoteModal && selectedNote && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 ${getNoteColor(selectedNote.color)}`}>
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">Note Details</h3>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <button
                          onClick={saveNote}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Save size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={toggleEditMode}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      <button
                        onClick={closeNoteModal}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                          </label>
                          <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={8}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-medium mb-4">{selectedNote.title}</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(selectedNote.category)}`}>
                            {selectedNote.category.charAt(0).toUpperCase() + selectedNote.category.slice(1)}
                          </span>
                          {selectedNote.client && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              <User size={12} className="mr-1" />
                              {selectedNote.client.name}
                            </span>
                          )}
                          {selectedNote.property && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <Home size={12} className="mr-1" />
                              {selectedNote.property.title}
                            </span>
                          )}
                        </div>

                        <div className="prose max-w-none mb-6">
                          <p className="whitespace-pre-line">{selectedNote.content}</p>
                        </div>

                        <div className="flex justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                          <div>
                            Created: {formatDate(selectedNote.createdAt)}
                          </div>
                          <div>
                            Updated: {formatDate(selectedNote.updatedAt)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveNote}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={closeNoteModal}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Close
                        </button>
                        <button
                          onClick={toggleEditMode}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          Edit Note
                        </button>
                      </>
                    )}
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
