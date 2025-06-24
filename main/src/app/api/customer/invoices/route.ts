import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getCustomerData } from '@/lib/mock-customer-data';

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify JWT secret exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined');
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    try {
      // Decode and verify the token
      const decoded = jwt.verify(accessToken, jwtSecret) as { 
        id: string; 
        email: string; 
        name: string; 
        role: string 
      };

      // Verify the user is a customer/user
      if (decoded.role !== 'user') {
        return NextResponse.json(
          { error: "Unauthorized - customer access only" },
          { status: 403 }
        );
      }

      // Get customer data based on email
      const customerData = getCustomerData(decoded.email);
      
      if (!customerData) {
        return NextResponse.json(
          { error: "Customer data not found" },
          { status: 404 }
        );
      }

      // Get query parameters for filtering
      const url = new URL(request.url);
      const status = url.searchParams.get('status');
      const propertyId = url.searchParams.get('propertyId');

      // Filter invoices based on query parameters
      let filteredInvoices = customerData.invoices;
      
      if (status) {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
      }
      
      if (propertyId) {
        filteredInvoices = filteredInvoices.filter(inv => inv.propertyId === propertyId);
      }

      // Enhance invoices with property information and payment status
      const enhancedInvoices = filteredInvoices.map(invoice => {
        const property = customerData.properties.find(p => p.id === invoice.propertyId);
        const payment = customerData.payments.find(p => p.invoiceId === invoice.id);
        
        return {
          ...invoice,
          propertyName: property?.name || 'Unknown Property',
          propertyLocation: property?.location || 'Unknown Location',
          payment: payment ? {
            id: payment.id,
            amount: payment.amount,
            date: payment.date,
            method: payment.method,
            transactionId: payment.transactionId,
            status: payment.status
          } : null,
          isOverdue: invoice.status === 'overdue',
          daysPastDue: invoice.status === 'overdue' 
            ? Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0
        };
      });

      // Sort by date (newest first)
      enhancedInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate summary statistics
      const summary = {
        total: enhancedInvoices.length,
        paid: enhancedInvoices.filter(inv => inv.status === 'paid').length,
        overdue: enhancedInvoices.filter(inv => inv.status === 'overdue').length,
        pending: enhancedInvoices.filter(inv => inv.status === 'pending').length,
        totalAmount: enhancedInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        paidAmount: enhancedInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
        overdueAmount: enhancedInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)
      };

      return NextResponse.json({
        invoices: enhancedInvoices,
        summary,
        properties: customerData.properties.map(p => ({
          id: p.id,
          name: p.name,
          location: p.location
        }))
      });

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Invoices API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
