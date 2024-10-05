"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoiceTabs() {
    const tabs = ['all', 'pending', 'paid', 'cancelled'];
    const [activeStatus, setActiveStatus] = useState('all');

    useEffect(() => {
      const savedStatus = localStorage.getItem('activeStatus');
      if (savedStatus) {
        setActiveStatus(savedStatus);
      }
    }, []); 
  
    useEffect(() => {
      localStorage.setItem('activeStatus', activeStatus);
    }, [activeStatus]);

    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();

    const handleTabClick = (tab: string) => {
        setActiveStatus(tab);
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');

        if (tab !== 'all') {
          params.set('param', tab);
        } else if  (tab == 'all') {
          params.delete('param');
        }
        replace(`${pathname}?${params.toString()}`)   
    }
  
 
  
return (
    <div className="mt-5">
    <div className="flex flex-row space-x-4 ml-1">
        {
            tabs.map((tab,index) => (
                <button key={index} className={`capitalize text-sm font-medium ${activeStatus == tab ? 'text-blue-500 border-b-blue-500 border-b-2' : `text-gray-500`}`} onClick={()=>handleTabClick(tab)}>{tab}</button>
            ))
        }
        </div>
  </div>
)
}