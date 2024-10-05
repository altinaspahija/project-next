"use client";
import { updateInvoiceStatusBySelection } from "@/app/lib/actions";
import { ClockIcon } from "@heroicons/react/16/solid";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
export default function InvoiceDropdown({status,invoiceId}: {status: string,invoiceId: string}) {
    const statuses = ['pending', 'paid', 'cancelled'];
    const handleOptionClick = async (status: string)  => {
      await updateInvoiceStatusBySelection(invoiceId, status);
    }
    return (
  <div className="dropdown">
    <button  className="dropbtn"><p>
        {status }
        </p></button>
    <div className="dropdown-content"  >
      {
         statuses.map((status,index) => (
            <p key={index} className='cursor-pointer' 
            >
        <span 
        onClick={()=>handleOptionClick(status)}     
        className={clsx(
          'inline-flex items-center rounded-full px-2 py-1 text-xs',
          {
            'bg-gray-100 text-gray-500': status === 'pending',
            'bg-green-500 text-white': status === 'paid',
            'bg-red-500 text-white': status === 'cancelled',
          },
        )}
      >
        {status === 'pending' ? (
          <>
            Pending
            <ClockIcon className="ml-1 w-4 text-gray-500" />
          </>
        ) : null}
        {status === 'paid' ? (
          <>
            Paid
            <CheckIcon className="ml-1 w-4 text-white" />
          </>
        ) : null}
            {status === 'cancelled' ? (
          <>
            Cancelled
            <XMarkIcon className="ml-1 w-4 text-white" />
          </>
        ) : null}
      </span>
              </p>
         ))
      }
    </div>
  </div>
    );
}