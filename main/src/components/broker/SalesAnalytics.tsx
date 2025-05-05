'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SalesData {
  name: string;
  value: number;
  color: string;
}

interface SalesAnalyticsProps {
  data: SalesData[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

const SalesAnalytics = ({ data, selectedYear, onYearChange }: SalesAnalyticsProps) => {
  const totalSalesAmount = data.reduce((sum, item) => sum + item.value, 0).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Sales Analytics</h2>
        <select 
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
        >
          <option>December 2021</option>
          <option>January 2022</option>
          <option>February 2022</option>
        </select>
      </div>
      
      <div className="flex">
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-1/2">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">${totalSalesAmount}</p>
          </div>
          
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-900">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;

