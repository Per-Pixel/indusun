'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Check, X } from 'lucide-react';

interface AgentEditFormProps {
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
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AgentEditForm: React.FC<AgentEditFormProps> = ({
  agent,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: agent.name || '',
    title: agent.title || '',
    email: agent.email || '',
    phone: agent.phone || '',
    practice: agent.practice || '',
    branch: agent.branch || '',
    contract: agent.contract || '',
    grade: agent.grade || '',
    division: agent.division || '',
    division_manager: agent.division_manager || '',
    login: agent.login || agent.id || '',
    status: agent.status || 'Activated',
    status_date: agent.status_history?.[0]?.date || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Agent Details</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
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
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
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
                  value={formData.practice}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
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
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md appearance-none pr-8"
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
                  value={formData.contract}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
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
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
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
                value={formData.division}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
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
                value={formData.division_manager}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
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
                value={formData.login}
                onChange={handleChange}
                className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
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
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
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
                  value={formData.status_date}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-100 border border-gray-200 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Profile image on the right */}
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="h-32 w-32 rounded-full overflow-hidden mb-3">
              {agent.image ? (
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={128}
                  height={128}
                  className="h-32 w-32 object-cover"
                />
              ) : (
                <div className="h-32 w-32 flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-semibold">
                  {agent.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold text-black">{agent.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{agent.title}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentEditForm;
