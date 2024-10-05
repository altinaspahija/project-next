import InvoiceAuditLogs from "./auditlogs";

export default function InvoiceAuditLogsClient({logs,invoiceId}:{logs:any[], invoiceId:string}) {
  return (
    <InvoiceAuditLogs logs={logs} invoiceId={invoiceId} />
  );
}