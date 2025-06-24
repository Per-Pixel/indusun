import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getCustomerData } from '@/lib/mock-customer-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

      // Find the specific invoice
      const invoice = customerData.invoices.find(inv => inv.id === params.id);
      
      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      // Find related property and payment
      const property = customerData.properties.find(p => p.id === invoice.propertyId);
      const payment = customerData.payments.find(p => p.invoiceId === invoice.id);

      // Generate HTML for PDF (in a real app, you'd use a PDF library like puppeteer or jsPDF)
      const htmlContent = generateInvoiceHTML(invoice, property, payment, customerData);

      // For now, return the HTML content
      // In production, you would convert this to PDF using a library
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"`
        }
      });

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Invoice PDF API error:', error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: any, property: any, payment: any, customerData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #1e40af; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .customer-details, .invoice-info { width: 45%; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .table th { background-color: #f8f9fa; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .payment-info { margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 5px; }
        .status { padding: 5px 10px; border-radius: 3px; color: white; }
        .status.paid { background-color: #10b981; }
        .status.overdue { background-color: #ef4444; }
        .status.pending { background-color: #f59e0b; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">INDUSUN</div>
        <div>Mortgage Service</div>
      </div>

      <div class="invoice-details">
        <div class="customer-details">
          <h3>Bill To:</h3>
          <p><strong>${customerData.name}</strong></p>
          <p>${customerData.email}</p>
          <p>${customerData.phone}</p>
        </div>
        <div class="invoice-info">
          <h3>Invoice Details:</h3>
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></p>
        </div>
      </div>

      <div class="property-info">
        <h3>Property Information:</h3>
        <p><strong>Property:</strong> ${property?.name || 'N/A'}</p>
        <p><strong>Location:</strong> ${property?.location || 'N/A'}</p>
        <p><strong>Type:</strong> ${property?.type || 'N/A'}</p>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.lineItems.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td>₹${item.amount.toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td><strong>Total Amount</strong></td>
            <td><strong>₹${invoice.amount.toLocaleString()}</strong></td>
          </tr>
        </tbody>
      </table>

      ${payment ? `
        <div class="payment-info">
          <h3>Payment Information:</h3>
          <p><strong>Payment Date:</strong> ${new Date(payment.date).toLocaleDateString()}</p>
          <p><strong>Amount Paid:</strong> ₹${payment.amount.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${payment.method.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
          <p><strong>Status:</strong> ${payment.status.toUpperCase()}</p>
        </div>
      ` : ''}

      <div style="margin-top: 40px; text-align: center; color: #666;">
        <p>Thank you for your business!</p>
        <p>For any queries, contact us at support@indusun.com</p>
      </div>
    </body>
    </html>
  `;
}
