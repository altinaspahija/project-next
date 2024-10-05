"use client";
import InvoiceDropdown from "./dropdown";

export default function InvoiceStatusClient({ status,invoiceId }: { status: string,invoiceId: string }) {
    return <InvoiceDropdown status={status} invoiceId={invoiceId}/>;
}