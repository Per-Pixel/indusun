'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const Invoices = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Invoices</h1>
        {/* Add your invoices content here */}
      </div>
    </DashboardLayout>
  );
};

export default Invoices;