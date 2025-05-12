'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit, Mail, Phone, Calendar, ChevronDown } from 'lucide-react';

interface AgentDetailsFormProps {
  agent: {
    id: string;
    name: string;
    title?: string;
    email: string;
    phone: string;
    image?: string;
    practice?: string;
    branch?: string;
    contract?: string;
    grade?: string;
    division?: string;
    division_manager?: string;
    login?: string;
    status?: string;
    status_history?: {
      status: string;
      date: string;
    }[];
  };
  onEdit?: () => void;
  readOnly?: boolean;
}

const AgentDetailsForm: React.FC<AgentDetailsFormProps> = ({
  agent,
  onEdit,
  readOnly = false
}) => {
  const [formData, setFormData] = useState(agent);
  const [showProjects, setShowProjects] = useState(true);

  // Mock projects data
  const projects = [
    {
      id: '1',
      status: 'active',
      name: 'Project 1',
      role: 'Specialist',
      task: 'Management',
      startDate: '11.06.2019',
      capacity: '35%'
    },
    {
      id: '2',
      status: 'active',
      name: 'Project 2',
      role: 'Specialist',
      task: 'Support',
      startDate: '12.02.2019',
      capacity: '65%'
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Agent Details</h2>
        {!readOnly && (
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:text-blue-800 border border-blue-600 rounded"
          >
            <Edit size={16} />
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row">
          {/* Form fields on the left */}
          <div className="md:w-2/3 md:pr-8">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-500 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-500 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="practice" className="block text-sm font-medium text-gray-500 mb-1">
                  Practice
                </label>
                <input
                  id="practice"
                  name="practice"
                  type="text"
                  value={formData.practice || ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-500 mb-1">
                  Branch
                </label>
                <div className="relative">
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md appearance-none pr-8"
                    disabled={readOnly}
                  >
                    <option value="Paris">Paris</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="contract" className="block text-sm font-medium text-gray-500 mb-1">
                  Contract
                </label>
                <input
                  id="contract"
                  name="contract"
                  type="text"
                  value={formData.contract || ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-500 mb-1">
                  Grade
                </label>
                <input
                  id="grade"
                  name="grade"
                  type="text"
                  value={formData.grade || ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="division" className="block text-sm font-medium text-gray-500 mb-1">
                Division
              </label>
              <input
                id="division"
                name="division"
                type="text"
                value={formData.division || ''}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="division_manager" className="block text-sm font-medium text-gray-500 mb-1">
                Division manager
              </label>
              <input
                id="division_manager"
                name="division_manager"
                type="text"
                value={formData.division_manager || ''}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="login" className="block text-sm font-medium text-gray-500 mb-1">
                Login
              </label>
              <input
                id="login"
                name="login"
                type="text"
                value={formData.login || ''}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                readOnly={readOnly}
                disabled={readOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-500 mb-1">
                  Status history
                </label>
                <input
                  id="status"
                  name="status"
                  type="text"
                  value={formData.status || ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>

              <div>
                <label htmlFor="status_date" className="block text-sm font-medium text-gray-500 mb-1">
                  &nbsp;
                </label>
                <input
                  id="status_date"
                  name="status_date"
                  type="text"
                  value={formData.status_history?.[0]?.date || ''}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                  readOnly={readOnly}
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>

          {/* Profile image and actions on the right */}
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="h-32 w-32 rounded-full overflow-hidden mb-3">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt={formData.name}
                  width={128}
                  height={128}
                  className="h-32 w-32 object-cover"
                />
              ) : (
                <div className="h-32 w-32 flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-semibold">
                  {formData.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-black">{formData.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{formData.title}</p>

            <div className="flex gap-3 mb-6">
              <button className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md">
                <Mail size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md">
                <Phone size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="8" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                </svg>
              </button>
            </div>

            <div className="w-full space-y-2">
              <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                <Calendar size={16} className="text-blue-600" />
                <span>Calendar</span>
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                  <path d="M8 1L10 5H14L11 8L12 12L8 10L4 12L5 8L2 5H6L8 1Z" fill="currentColor" />
                </svg>
                <span>Vacations</span>
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                  <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8H11" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 5H11" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 11H11" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>Timesheet</span>
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                  <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 6H12" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 10H8" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>Corporate CV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="border-t border-gray-200">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-md text-sm">
                <span>Filter</span>
                <ChevronDown size={16} />
              </button>
            </div>
            <button
              className="p-1 text-gray-500 hover:text-gray-700"
              onClick={() => setShowProjects(!showProjects)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8L14 8" stroke="currentColor" strokeWidth="1.5" />
                {!showProjects && <path d="M8 2L8 14" stroke="currentColor" strokeWidth="1.5" />}
              </svg>
            </button>
          </div>
        </div>

        {showProjects && (
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Task
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {project.role}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {project.task}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {project.startDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {project.capacity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetailsForm;
