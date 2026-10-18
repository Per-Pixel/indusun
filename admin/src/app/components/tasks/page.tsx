'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  Plus,
  User,
  Building,
  Search,
  ChevronDown,
  CheckCircle,
  Circle,
  X,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
import toast from 'react-hot-toast';

// Types for tasks
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'completed';
  category: 'client' | 'property' | 'admin' | 'other';
  assignedTo?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
  };
  property?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

const TASK_CATEGORIES = [
  { value: 'client',   label: 'Client' },
  { value: 'property', label: 'Property' },
  { value: 'admin',    label: 'Admin' },
  { value: 'other',    label: 'Other' },
];

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const isOverdue = (task: Task) => {
  if (task.status === 'completed' || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
};

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  high:   'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low:    'bg-blue-100 text-blue-800',
};

const STATUS_STYLES: Record<Task['status'], { label: string; color: string }> = {
  'todo':        { label: 'To Do',       color: 'bg-gray-100 text-gray-800' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  'completed':   { label: 'Completed',   color: 'bg-green-100 text-green-800' },
};

export default function TasksPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    category: 'other' as Task['category'],
    clientName: '',
    propertyTitle: '',
  });
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workspace?type=tasks');
      if (!res.ok) throw new Error('Failed to load tasks');
      const json = await res.json();
      setTasks(json.tasks || []);
    } catch (err) {
      console.error('Tasks fetch error:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const persist = async (items: Task[]) => {
    setSaving(true);
    try {
      await fetch('/api/workspace', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'tasks', items }),
      });
    } catch {
      toast.error('Failed to persist tasks to Supabase');
    } finally {
      setSaving(false);
    }
  };
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(q) ||
      (task.description?.toLowerCase().includes(q) ?? false) ||
      task.client?.name.toLowerCase().includes(q) ||
      task.property?.title.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  const todoTasks       = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress');
  const completedTasks  = filteredTasks.filter(t => t.status === 'completed');
  
  const handleStatusChange = async (id: string, status: Task['status']) => {
    const updated = tasks.map(task => (task.id === id ? { ...task, status } : task));
    setTasks(updated);
    await persist(updated);
  };
  
  const handleDeleteTask = async (id: string) => {
    const updated = tasks.filter(task => task.id !== id);
    setTasks(updated);
    await persist(updated);
    toast.success('Task deleted');
  };
  
  const handleEditClick = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority,
      status: task.status,
      category: task.category,
      clientName: task.client?.name || '',
      propertyTitle: task.property?.title || '',
    });
    setIsEditModalOpen(true);
  };
  
  const handleAddTask = async () => {
    if (!formData.title) {
      toast.error('Please enter a task title');
      return;
    }
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
      status: formData.status,
      category: formData.category,
      createdAt: new Date().toISOString().split('T')[0],
    };
    if (formData.clientName) newTask.client = { id: `c-${Date.now()}`, name: formData.clientName };
    if (formData.propertyTitle) newTask.property = { id: `p-${Date.now()}`, title: formData.propertyTitle };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    setIsAddModalOpen(false);
    setFormData({ title: '', description: '', dueDate: '', priority: 'medium', status: 'todo', category: 'other', clientName: '', propertyTitle: '' });
    await persist(updated);
    toast.success('Task saved to database');
  };
  
  const handleUpdateTask = async () => {
    if (!currentTask || !formData.title) {
      toast.error('Please enter a task title');
      return;
    }
    const updated = tasks.map(task =>
      task.id === currentTask.id
        ? {
            ...task,
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
            priority: formData.priority,
            status: formData.status,
            category: formData.category,
            client: formData.clientName ? { id: task.client?.id || `c-${Date.now()}`, name: formData.clientName } : undefined,
            property: formData.propertyTitle ? { id: task.property?.id || `p-${Date.now()}`, title: formData.propertyTitle } : undefined,
          }
        : task
    );
    setTasks(updated);
    setIsEditModalOpen(false);
    setCurrentTask(null);
    await persist(updated);
    toast.success('Task updated');
  };
  
  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-medium text-gray-900 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
          {task.title}
        </h3>
        <div className="flex space-x-1">
          <button onClick={() => handleEditClick(task)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
            <Edit size={15} />
          </button>
          <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {task.category}
        </span>
        {isOverdue(task) && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
            <AlertTriangle size={10} /> Overdue
          </span>
        )}
      </div>
      
      {task.client && (
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <User size={12} className="mr-1" />
          <span>{task.client.name}</span>
        </div>
      )}
      
      {task.property && (
        <div className="flex items-center text-xs text-gray-600 mb-1">
          <Building size={12} className="mr-1" />
          <span className="truncate">{task.property.title}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex items-center text-xs text-gray-500">
          <Clock size={12} className="mr-1" />
          <span>{task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}</span>
        </div>
        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
            className="text-xs px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
  
  const TaskColumn = ({ title, status, list, icon }: { title: string; status: Task['status']; list: Task[]; icon: React.ReactNode }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
            {list.length.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {list.map(task => <TaskCard key={task.id} task={task} />)}
        {list.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            No tasks here
          </div>
        )}
      </div>
    </div>
  );
  
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
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-sm text-gray-500 mt-1">
                Persistent task board — seeded from live master-data records, stored in Supabase
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchTasks} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                <span>New Task</span>
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
                  placeholder="Search tasks..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {TASK_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Task columns */}
          {loading && tasks.length === 0 ? (
            <div className="bg-white p-16 rounded-lg shadow-sm text-center text-sm text-gray-500">Loading tasks…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TaskColumn title="To Do" status="todo" list={todoTasks} icon={<Circle size={16} className="text-gray-500" />} />
              <TaskColumn title="In Progress" status="in-progress" list={inProgressTasks} icon={<Clock size={16} className="text-blue-500" />} />
              <TaskColumn title="Completed" status="completed" list={completedTasks} icon={<CheckCircle size={16} className="text-green-500" />} />
            </div>
          )}
        </div>
      </div>
      
      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
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
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Task description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Task['category'] })}
                  >
                    {TASK_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
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
                onClick={handleAddTask}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-60"
              >
                <CheckSquare size={16} className="mr-2" />
                {saving ? 'Saving…' : 'Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Task Modal */}
      {isEditModalOpen && currentTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Task['category'] })}
                  >
                    {TASK_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
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
                onClick={handleUpdateTask}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-60"
              >
                <CheckSquare size={16} className="mr-2" />
                {saving ? 'Saving…' : 'Update Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
