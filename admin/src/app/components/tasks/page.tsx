'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  User,
  Home,
  Building,
  MoreHorizontal,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  Circle,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

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

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with Priya Patel about property viewing',
    description: 'Call to confirm the viewing appointment for the Luxury Villa in Whitefield',
    dueDate: '2023-12-16',
    priority: 'high',
    status: 'todo',
    category: 'client',
    assignedTo: {
      id: 'a1',
      name: 'Rajesh Admin'
    },
    client: {
      id: 'c1',
      name: 'Priya Patel'
    },
    property: {
      id: '1',
      title: 'Luxury Villa in Whitefield'
    },
    createdAt: '2023-12-14'
  },
  {
    id: '2',
    title: 'Collect property documents from owner',
    description: 'Need to collect all legal documents for the Commercial Space in Tech Park',
    dueDate: '2023-12-18',
    priority: 'medium',
    status: 'todo',
    category: 'property',
    assignedTo: {
      id: 'a2',
      name: 'Neha Gupta'
    },
    property: {
      id: '2',
      title: 'Commercial Space in Tech Park'
    },
    createdAt: '2023-12-13'
  },
  {
    id: '3',
    title: 'Prepare sales report for Q4',
    description: 'Compile all sales data and prepare quarterly report for management',
    dueDate: '2023-12-25',
    priority: 'medium',
    status: 'in-progress',
    category: 'admin',
    assignedTo: {
      id: 'a1',
      name: 'Rajesh Admin'
    },
    createdAt: '2023-12-10'
  },
  {
    id: '4',
    title: 'Update property listing photos',
    description: 'Take new photos of the Residential Plot in Sarjapur and update the listing',
    dueDate: '2023-12-17',
    priority: 'low',
    status: 'todo',
    category: 'property',
    assignedTo: {
      id: 'a3',
      name: 'Suresh Menon'
    },
    property: {
      id: '3',
      title: 'Residential Plot in Sarjapur'
    },
    createdAt: '2023-12-12'
  },
  {
    id: '5',
    title: 'Send contract to TechSoft Solutions',
    description: 'Finalize and send the rental contract for the Office Space',
    dueDate: '2023-12-15',
    priority: 'high',
    status: 'completed',
    category: 'client',
    assignedTo: {
      id: 'a1',
      name: 'Rajesh Admin'
    },
    client: {
      id: 'c3',
      name: 'TechSoft Solutions'
    },
    property: {
      id: '5',
      title: 'Office Space in Central Business District'
    },
    createdAt: '2023-12-08'
  },
  {
    id: '6',
    title: 'Schedule property inspection',
    description: 'Arrange for property inspection of the Retail Space in Commercial Complex',
    dueDate: '2023-12-19',
    priority: 'medium',
    status: 'todo',
    category: 'property',
    assignedTo: {
      id: 'a2',
      name: 'Neha Gupta'
    },
    property: {
      id: '8',
      title: 'Retail Space in Commercial Complex'
    },
    createdAt: '2023-12-14'
  },
  {
    id: '7',
    title: 'Follow up on pending payment',
    description: 'Contact Ananya Reddy regarding the pending payment for Residential Plot',
    dueDate: '2023-12-16',
    priority: 'high',
    status: 'in-progress',
    category: 'client',
    assignedTo: {
      id: 'a1',
      name: 'Rajesh Admin'
    },
    client: {
      id: 'c5',
      name: 'Ananya Reddy'
    },
    property: {
      id: '3',
      title: 'Residential Plot in Sarjapur'
    },
    createdAt: '2023-12-11'
  },
  {
    id: '8',
    title: 'Update CRM with new client details',
    description: 'Add new client Vikram Singh to the CRM system with all contact details',
    dueDate: '2023-12-15',
    priority: 'low',
    status: 'completed',
    category: 'admin',
    assignedTo: {
      id: 'a3',
      name: 'Suresh Menon'
    },
    client: {
      id: 'c2',
      name: 'Vikram Singh'
    },
    createdAt: '2023-12-09'
  }
];

// Helper function to get priority color
const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get category color
const getCategoryColor = (category: Task['category']) => {
  switch (category) {
    case 'client':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'property':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'admin':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'other':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: Task['status']) => {
  switch (status) {
    case 'todo':
      return <Circle size={16} className="text-gray-400" />;
    case 'in-progress':
      return <Circle size={16} className="text-blue-500" />;
    case 'completed':
      return <CheckCircle size={16} className="text-green-500" />;
    default:
      return null;
  }
};

export default function TasksPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task state
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'todo',
    category: 'client'
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter tasks based on search term and filters
  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (task.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (task.property?.title.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  // Open task modal
  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Close task modal
  const closeTaskModal = () => {
    setSelectedTask(null);
    setShowTaskModal(false);
  };

  // Open add task modal
  const openAddTaskModal = (initialStatus: Task['status'] = 'todo') => {
    setNewTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: initialStatus,
      category: 'client'
    });
    setShowAddTaskModal(true);
  };

  // Close add task modal
  const closeAddTaskModal = () => {
    setShowAddTaskModal(false);
  };

  // Handle new task input change
  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save new task
  const saveNewTask = () => {
    // In a real app, this would save to a database
    // For now, we'll just close the modal
    // You would typically generate a unique ID and add to the tasks array

    // Mock adding to the array (this won't persist on refresh)
    const newTaskWithId = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    } as Task;

    // In a real app: mockTasks.push(newTaskWithId);

    closeAddTaskModal();
    // You might want to show a success message here
  };

  // Open edit task modal
  const openEditTaskModal = () => {
    if (selectedTask) {
      setNewTask({
        ...selectedTask
      });
      setShowEditTaskModal(true);
      setShowTaskModal(false);
    }
  };

  // Close edit task modal
  const closeEditTaskModal = () => {
    setShowEditTaskModal(false);
  };

  // Save edited task
  const saveEditedTask = () => {
    // In a real app, this would update the database
    // For now, we'll just close the modal

    // Mock updating the array (this won't persist on refresh)
    // In a real app: update the task in mockTasks

    closeEditTaskModal();
    // You might want to show a success message here
  };

  // Mark task as completed
  const markTaskAsCompleted = () => {
    if (selectedTask) {
      // In a real app, this would update the database
      // For now, we'll just close the modal

      // Mock updating the task status
      // In a real app: update the task status in mockTasks

      closeTaskModal();
      // You might want to show a success message here
    }
  };

  // Reopen task
  const reopenTask = () => {
    if (selectedTask) {
      // In a real app, this would update the database
      // For now, we'll just close the modal

      // Mock updating the task status
      // In a real app: update the task status in mockTasks

      closeTaskModal();
      // You might want to show a success message here
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            {/* Task Manager Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                <p className="text-gray-500">Manage your tasks and to-do lists</p>
              </div>

              <div className="flex items-center mt-4 md:mt-0">
                <button
                  onClick={() => openAddTaskModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Plus size={16} />
                  <span>Add Task</span>
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
                  placeholder="Search tasks..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 pr-8"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
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
                    <option value="admin">Admin</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Task Boards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* To Do Column */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Circle size={16} className="mr-2 text-gray-400" />
                      To Do
                      <span className="ml-2 text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-0.5">
                        {todoTasks.length}
                      </span>
                    </h3>
                    <button
                      onClick={() => openAddTaskModal('todo')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {todoTasks.length > 0 ? (
                    <div className="space-y-2">
                      {todoTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow cursor-pointer"
                          onClick={() => openTaskModal(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>

                          {task.description && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
                              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500">
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                <span>{formatDate(task.dueDate)}</span>
                              </div>
                            )}
                            {task.assignedTo && (
                              <div className="flex items-center">
                                <User size={12} className="mr-1" />
                                <span>{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>No tasks to do</p>
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Circle size={16} className="mr-2 text-blue-500" />
                      In Progress
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                        {inProgressTasks.length}
                      </span>
                    </h3>
                    <button
                      onClick={() => openAddTaskModal('in-progress')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {inProgressTasks.length > 0 ? (
                    <div className="space-y-2">
                      {inProgressTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow cursor-pointer"
                          onClick={() => openTaskModal(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>

                          {task.description && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
                              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500">
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                <span>{formatDate(task.dueDate)}</span>
                              </div>
                            )}
                            {task.assignedTo && (
                              <div className="flex items-center">
                                <User size={12} className="mr-1" />
                                <span>{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>No tasks in progress</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                      Completed
                      <span className="ml-2 text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                        {completedTasks.length}
                      </span>
                    </h3>
                    <button
                      onClick={() => openAddTaskModal('completed')}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {completedTasks.length > 0 ? (
                    <div className="space-y-2">
                      {completedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow cursor-pointer"
                          onClick={() => openTaskModal(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>

                          {task.description && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
                              {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500">
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1" />
                                <span>{formatDate(task.dueDate)}</span>
                              </div>
                            )}
                            {task.assignedTo && (
                              <div className="flex items-center">
                                <User size={12} className="mr-1" />
                                <span>{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>No completed tasks</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Task Modal */}
            {showTaskModal && selectedTask && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">Task Details</h3>
                    <button
                      onClick={closeTaskModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-medium">{selectedTask.title}</h2>
                        <div className="flex space-x-2">
                          <button
                            onClick={openEditTaskModal}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Edit size={16} />
                          </button>
                          <button className="text-gray-500 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(selectedTask.priority)}`}>
                          {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)} Priority
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(selectedTask.category)}`}>
                          {selectedTask.category.charAt(0).toUpperCase() + selectedTask.category.slice(1)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {getStatusIcon(selectedTask.status)}
                          <span className="ml-1">
                            {selectedTask.status === 'todo' ? 'To Do' :
                             selectedTask.status === 'in-progress' ? 'In Progress' : 'Completed'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {selectedTask.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p className="text-sm text-gray-600">{selectedTask.description}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {selectedTask.dueDate && (
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="text-sm">{formatDate(selectedTask.dueDate)}</p>
                          </div>
                        </div>
                      )}

                      {selectedTask.assignedTo && (
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Assigned To</p>
                            <p className="text-sm">{selectedTask.assignedTo.name}</p>
                          </div>
                        </div>
                      )}

                      {selectedTask.client && (
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Client</p>
                            <p className="text-sm">{selectedTask.client.name}</p>
                          </div>
                        </div>
                      )}

                      {selectedTask.property && (
                        <div className="flex items-center">
                          <Home size={16} className="mr-2 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Property</p>
                            <p className="text-sm">{selectedTask.property.title}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-sm">{formatDate(selectedTask.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={closeTaskModal}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    {selectedTask.status !== 'completed' ? (
                      <button
                        onClick={markTaskAsCompleted}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Mark as Completed
                      </button>
                    ) : (
                      <button
                        onClick={reopenTask}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Reopen Task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add Task Modal */}
            {showAddTaskModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">Add New Task</h3>
                    <button
                      onClick={closeAddTaskModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4">
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Task Title*
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={newTask.title}
                          onChange={handleNewTaskChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={newTask.description}
                          onChange={handleNewTaskChange}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date*
                        </label>
                        <input
                          type="date"
                          id="dueDate"
                          name="dueDate"
                          value={newTask.dueDate}
                          onChange={handleNewTaskChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                            Priority*
                          </label>
                          <select
                            id="priority"
                            name="priority"
                            value={newTask.priority}
                            onChange={handleNewTaskChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category*
                          </label>
                          <select
                            id="category"
                            name="category"
                            value={newTask.category}
                            onChange={handleNewTaskChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                          >
                            <option value="client">Client</option>
                            <option value="property">Property</option>
                            <option value="admin">Admin</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status*
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={newTask.status}
                          onChange={handleNewTaskChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </form>
                  </div>

                  <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={closeAddTaskModal}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveNewTask}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Save Task
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Task Modal */}
            {showEditTaskModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">Edit Task</h3>
                    <button
                      onClick={closeEditTaskModal}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4">
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Task Title*
                        </label>
                        <input
                          type="text"
                          id="edit-title"
                          name="title"
                          value={newTask.title}
                          onChange={handleNewTaskChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="edit-description"
                          name="description"
                          value={newTask.description}
                          onChange={handleNewTaskChange}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date*
                        </label>
                        <input
                          type="date"
                          id="edit-dueDate"
                          name="dueDate"
                          value={newTask.dueDate}
                          onChange={handleNewTaskChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1">
                            Priority*
                          </label>
                          <select
                            id="edit-priority"
                            name="priority"
                            value={newTask.priority}
                            onChange={handleNewTaskChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category*
                          </label>
                          <select
                            id="edit-category"
                            name="category"
                            value={newTask.category}
                            onChange={handleNewTaskChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                            required
                          >
                            <option value="client">Client</option>
                            <option value="property">Property</option>
                            <option value="admin">Admin</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status*
                        </label>
                        <select
                          id="edit-status"
                          name="status"
                          value={newTask.status}
                          onChange={handleNewTaskChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                          required
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </form>
                  </div>

                  <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={closeEditTaskModal}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditedTask}
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
