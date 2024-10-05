"use client"
import { restoreInvoice } from "@/app/lib/actions";

export default function InvoiceAuditLogs({logs,invoiceId}:{logs:any[], invoiceId:string}) {
    const handleRestore = async (logId: string) => {
        try {
          const response = await restoreInvoice(invoiceId, logId);
          console.log(response.message);
        } catch (error) {
          console.error('Error restoring invoice:', error);
        }
      };
    return (
    <div className="bg-gray-50 p-4 mt-5 rounded-md">

    <div className="flex flex-col  text-base font-medium">
        Audit Logs

    </div>
    <div className="flex flex-col">
    {logs && logs.length > 0 ? (
    logs.map((log: any, index: any) => (
        <div key={index} className="flex flex-col my-3 capitalize">
            <div className="flex flex-row">
                User: {log.user_name}
            </div>
            <div key={log.id} className="flex flex-row space-x-2">
              <p>Status changed from <strong>{log.old_status}</strong> to <strong>{log.new_status}</strong> by {log.user_name} on {new Date(log.created_at).toLocaleDateString()}</p>
              
            </div>
            
            <div className="flex flex-row mb-3">
            Change date: {new Date(log.created_at).toLocaleDateString()}
            </div>
            <button className="bg-blue-500 text-white hover:bg-blue-400 rounded-md p-2 w-20 self-center " onClick={() => handleRestore(log.id)}>Restore</button>
        </div>
    ))
) : (
    <div>No logs available</div>
)}


        </div>
        </div>
)
}