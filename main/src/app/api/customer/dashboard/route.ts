import { NextRequest, NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');
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

      // Verify the user is a customer
      if (decoded.role !== 'customer') {
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

      // Calculate dashboard summary
      const totalProperties = customerData.properties.length;
      const overdueInvoices = customerData.invoices.filter(inv => inv.status === 'overdue');
      const pendingEMIs = customerData.emiSchedule.filter(emi => emi.status === 'pending');
      const nextPaymentDue = pendingEMIs.length > 0 ? pendingEMIs[0] : null;

      const dashboardData = {
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          phone: customerData.phone
        },
        summary: {
          totalProperties,
          totalPaid: customerData.totalPaid,
          totalOutstanding: customerData.totalOutstanding,
          overdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          overdueCount: overdueInvoices.length,
          nextPaymentDue: nextPaymentDue ? {
            amount: nextPaymentDue.amount,
            dueDate: nextPaymentDue.dueDate,
            propertyName: customerData.properties.find(p => p.id === nextPaymentDue.propertyId)?.name
          } : null
        },
        recentTransactions: customerData.payments.slice(-5).map(payment => {
          const invoice = customerData.invoices.find(inv => inv.id === payment.invoiceId);
          const property = customerData.properties.find(p => p.id === invoice?.propertyId);
          return {
            id: payment.id,
            amount: payment.amount,
            date: payment.date,
            description: invoice?.description || 'Payment',
            propertyName: property?.name || 'Unknown Property',
            status: payment.status
          };
        }),
        properties: customerData.properties.map(property => ({
          id: property.id,
          name: property.name,
          type: property.type,
          location: property.location,
          totalAmount: property.totalAmount,
          paidAmount: property.paidAmount,
          remainingAmount: property.remainingAmount,
          completionPercentage: Math.round((property.paidAmount / property.totalAmount) * 100),
          status: property.status,
          possessionDate: property.possessionDate
        })),
        broker: {
          id: customerData.brokerId,
          name: customerData.brokerName,
          phone: customerData.brokerPhone,
          email: customerData.brokerEmail
        }
      };

      return NextResponse.json(dashboardData);

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
