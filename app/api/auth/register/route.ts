import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { orderDb } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyName, contactName, phone, email, password } = body;

  if (!companyName || !contactName || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check email uniqueness
  const [existing] = await orderDb.execute<RowDataPacket[]>(
    'SELECT auth_id FROM user_auth WHERE email = ? LIMIT 1',
    [email]
  );
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  // Generate a unique customer_id
  const [countRows] = await orderDb.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS cnt FROM customers'
  );
  const next = Number(countRows[0].cnt) + 1;
  const customerId = `CUST-${String(next).padStart(4, '0')}`;

  const passwordHash = await bcrypt.hash(password, 12);

  const conn = await orderDb.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute<ResultSetHeader>(
      `INSERT INTO customers (customer_id, company_name, contact_name, phone, email)
       VALUES (?, ?, ?, ?, ?)`,
      [customerId, companyName, contactName, phone || null, email]
    );

    await conn.execute<ResultSetHeader>(
      `INSERT INTO user_auth (customer_id, email, password_hash)
       VALUES (?, ?, ?)`,
      [customerId, email, passwordHash]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }

  conn.release();
  return NextResponse.json({ customerId }, { status: 201 });
}
