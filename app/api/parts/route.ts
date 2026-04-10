import { NextResponse } from 'next/server';
import { inventoryDb } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET() {
  const [rows] = await inventoryDb.execute<RowDataPacket[]>(
    `SELECT part_id, part_name, part_category, unit_cost, sort_bin
     FROM parts
     ORDER BY sort_bin, part_name`
  );
  return NextResponse.json(rows);
}
