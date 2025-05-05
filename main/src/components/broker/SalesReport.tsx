'use client';

import React from 'react';
import Image from 'next/image';

interface Agent {
  name: string;
  avatar: string;
}

interface SaleItem {
  id: number;
  agent: Agent;
  location: string;
  type: string;
  price: string;
  status: 'Paid' | 'Pending';
}

interface SalesReportProps {
  data: SaleItem[];
}

const SalesReport = ({ data }: SalesReportProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Sales Report</h2>
        <button className="text-gray-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="6" cy="12" r="1" fill="currentColor"/>
            <circle cx="18" cy="12" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-3 font-medium">Sales by</th>
              <th className="pb-3 font-medium">Property name</th>
              <th className="pb-3 font-medium">Sales Type</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((sale) => (
              <tr key={sale.id} className="text-sm">
                <td className="py-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                      <Image 
                        src={sale.agent.avatar} 
                        alt={sale.agent.name} 
                        width={32} 
                        height={32} 
                        className="object-cover"
                      />
                    </div>
                    <span>{sale.agent.name}</span>
                  </div>
                </td>
                <td className="py-3">{sale.location}</td>
                <td className="py-3">{sale.type}</td>
                <td className="py-3">{sale.price}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    sale.status === 'Paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sale.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;
