import InvoiceStatusClient from "./invoice-status-client";

export default function InvoiceStatus({ status, invoiceId }: { status: string, invoiceId: string }) {
  return (
    <InvoiceStatusClient status={status} invoiceId=  {invoiceId} />
  )
}
