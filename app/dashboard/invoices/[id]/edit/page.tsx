import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers, fetchInvoiceAuditLogsById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import InvoiceAuditLogsClient from '@/app/ui/invoices/invoice-audit-logs-client';

export const metadata: Metadata = {
  title: 'Edit Invoice',
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [invoice, customers, logs] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
    fetchInvoiceAuditLogsById(id),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
      <InvoiceAuditLogsClient logs={logs} invoiceId={id} />
    </main>
  );

      }
