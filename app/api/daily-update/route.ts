import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export  async function GET() {
    try {
        await sql`
        UPDATE invoices
        SET status = 'overdue'
        WHERE status = 'pending' AND date <= NOW() - INTERVAL '14 days';
        `;
        return NextResponse.json({message: 'Daily Update Complete'});
    } catch (error) {
        return NextResponse.json({message:"Failed to update overdue invoices"}, {status: 500});
    }
}
