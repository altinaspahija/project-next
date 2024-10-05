'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';



const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid', 'cancelled'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  { formData, email }: { formData: FormData; email: string }
) {

  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = Number(amount) * 100;

  try {
 
    const oldStatusResult = await sql`SELECT status FROM invoices WHERE id = ${id}`;
    if (!oldStatusResult.rows.length) {
      return { message: 'Invoice not found.' };
    }
    const oldStatus = oldStatusResult.rows[0].status;


    const userResult = await sql`SELECT id, name, email FROM users WHERE email = ${email}`;
    if (!userResult.rows.length) {
      return { message: 'User not found.' };
    }
    const userId = userResult.rows[0].id;
    const userName = userResult.rows[0].name;

    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;

    await sql`
      INSERT INTO invoice_audit_logs (invoice_id, user_id, user_name, old_status, new_status, created_at)
      VALUES (${id}, ${userId}, ${userName}, ${oldStatus}, ${status}, ${new Date().toISOString()})
    `;

  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  // Step 6: Revalidate and redirect
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function restoreInvoice(
  invoiceId: string,
  logId: string,
) {
  try {
    
    const logResult = await sql`
      SELECT old_status, new_status, user_id, user_name
      FROM invoice_audit_logs
      WHERE id = ${logId} AND invoice_id = ${invoiceId}
    `;

    if (!logResult.rows.length) {
      return { message: 'Audit log entry not found.' };
    }

    const { old_status, user_id, user_name } = logResult.rows[0];

    await sql`
      UPDATE invoices
      SET status = ${old_status}
      WHERE id = ${invoiceId}
    `;

    await sql`
      INSERT INTO invoice_audit_logs (invoice_id, user_id, user_name, old_status, new_status, created_at)
      VALUES (${invoiceId}, ${user_id}, ${user_name}, ${old_status}, 'restored', ${new Date().toISOString()})
    `;
    return { message: 'Invoice restored successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Failed to restore invoice.' };
  }
}

export async function updateInvoiceStatus(
  id: string,
) {

  try {
    await sql`
      UPDATE invoices
      SET status = 'cancelled'
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice Status.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoiceStatusBySelection(
  id: string,
  status: string
) {

  try {
    await sql`
      UPDATE invoices
      SET status = ${status}
      WHERE id = ${id}
    `;

  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice Status.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
