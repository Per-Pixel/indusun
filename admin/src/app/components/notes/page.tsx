'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  StickyNote,
  Plus,
  Search,
  ChevronDown,
  Edit,
  Trash2,
  X,
  Save,
  Pin,
  PinOff,
  RefreshCw,
  Building,
  User,
  Tag,
  Clock,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import toast from 'react-hot-toast';

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

// Note colors
const NOTE_COLORS = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
  gray:   { bg: 'bg-gray-50',   border: 'border-gray-200',   text: 'text-gray-800' },
};

// Note categories
const NOTE_CATEGORIES = [
  { value: 'client',   label: 'Client' },
  { value: 'property', label: 'Property' },
  { value: 'meeting',  label: 'Meeting' },
  { value: 'other',    label: 'Other' },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function NotesPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'other' as Note['category'],
    color: 'blue' as Note['color'],
    clientName: '',
    propertyTitle: '',
  });
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workspace?type=notes');
      if (!res.ok) throw new Error('Failed to load notes');
      const json = await res.json();
      setNotes(json.notes || []);
    } catch (err) {
      console.error('Notes fetch error:', err);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const persist = async (items: Note[]) => {
    setSaving(true);
    try {
      await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'notes', items }),
      });
    } catch {
      toast.error('Failed to persist notes to Supabase');
    } finally {
      setSaving(false);
    }
  };
  
  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.client?.name.toLowerCase().includes(q) ||
        note.property?.title.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  
  const handlePinNote = async (id: string) => {
    const updated = notes.map(note =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    );
    setNotes(updated);
    await persist(updated);
  };
  
  const handleDeleteNote = async (id: string) => {
    const updated = notes.filter(note => note.id !== id);
    setNotes(updated);
    await persist(updated);
    toast.success('Note deleted');
  };
  
  const handleEditClick = (note: Note) => {
    setCurrentNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      color: note.color,
      clientName: note.client?.name || '',
      propertyTitle: note.property?.title || '',
    });
    setIsEditModalOpen(true);
  };
  
  const handleAddNote = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please fill in both title and content');
      return;
    }
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      color: formData.color,
      pinned: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    if (formData.clientName) newNote.client = { id: `c-${Date.now()}`, name: formData.clientName };
    if (formData.propertyTitle) newNote.property = { id: `p-${Date.now()}`, title: formData.propertyTitle };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setIsAddModalOpen(false);
    setFormData({ title: '', content: '', category: 'other', color: 'blue', clientName: '', propertyTitle: '' });
    await persist(updated);
    toast.success('Note saved to database');
  };
  
  const handleUpdateNote = async () => {
    if (!currentNote || !formData.title || !formData.content) {
      toast.error('Please fill in both title and content');
      return;
    }
    const updated = notes.map(note =>
      note.id === currentNote.id
        ? {
            ...note,
            title: formData.title,
            content: formData.content,
            category: formData.category,
            color: formData.color,
            client: formData.clientName ? { id: note.client?.id || `c-${Date.now()}`, name: formData.clientName } : undefined,
            property: formData.propertyTitle ? { id: note.property?.id || `p-${Date.now()}`, title: formData.propertyTitle } : undefined,
            updatedAt: new Date().toISOString().split('T')[0],
          }
        : note
    );
    setNotes(updated);
    setIsEditModalOpen(false);
    setCurrentNote(null);
    await persist(updated);
    toast.success('Note updated');
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[260px]' : 'ml-0'}`}>
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>
        
        <div className="p-6 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-500 mt-1">
                Persistent CRM notes — stored in Supabase <code>page_content</code> under the <code>_workspace</code> slug
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchNotes} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                <span>New Note</span>
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {NOTE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="updated">Last Updated</option>
                    <option value="created">Date Created</option>
                    <option value="title">Title</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes Grid */}
          {loading && notes.length === 0 ? (
            <div className="bg-white p-16 rounded-lg shadow-sm text-center text-sm text-gray-500">Loading notes…</div>
          ) : filteredNotes.length === 0 ? (
            <div className="bg-white p-16 rounded-lg shadow-sm text-center">
              <StickyNote className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No notes found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search or create a new note.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create a new note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map(note => {
                const colorStyle = NOTE_COLORS[note.color] || NOTE_COLORS.blue;
                return (
                  <div
                    key={note.id}
                    className={`${colorStyle.bg} border ${colorStyle.border} rounded-lg p-4 relative shadow-sm`}
                  >
                    {note.pinned && (
                      <div className="absolute top-2 right-2 text-yellow-600">
                        <Pin size={16} fill="currentColor" />
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${colorStyle.text} mb-1`}>{note.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(note.updatedAt)}</p>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{note.content}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Tag size={10} className="mr-1" />
                        {note.category}
                      </span>
                    </div>
                    
                    {note.client && (
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <User size={12} className="mr-1" />
                        <span>{note.client.name}</span>
                      </div>
                    )}
                    
                    {note.property && (
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <Building size={12} className="mr-1" />
                        <span className="truncate">{note.property.title}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => handlePinNote(note.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full"
                        title={note.pinned ? 'Unpin note' : 'Pin note'}
                      >
                        {note.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                      </button>
                      <button
                        onClick={() => handleEditClick(note)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-full"
                        title="Edit note"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-full"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Note</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Note title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Note content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Note['category'] })}
                  >
                    {NOTE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value as Note['color'] })}
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="purple">Purple</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client (optional)</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Client name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property (optional)</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. SAI SHRUSHTI RESIDENCY – Plot 45"
                  value={formData.propertyTitle}
                  onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-60"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Note Modal */}
      {isEditModalOpen && currentNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Note</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Note['category'] })}
                  >
                    {NOTE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value as Note['color'] })}
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="purple">Purple</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client (optional)</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property (optional)</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.propertyTitle}
                  onChange={(e) => setFormData({ ...formData, propertyTitle: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateNote}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-60"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving…' : 'Update Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
