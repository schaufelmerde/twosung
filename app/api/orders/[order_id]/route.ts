import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderDb } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(
  _req: NextRequest,
  { params }: { params: { order_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [rows] = await orderDb.execute<RowDataPacket[]>(
    `SELECT o.order_id, o.ship_type, o.status, o.priority, o.due_date,
            o.total_qty, o.notes, o.created_at,
            COALESCE(SUM(p1.unit_cost + p2.unit_cost), 0) AS estimated_cost
     FROM orders o
     LEFT JOIN order_items oi ON o.order_id = oi.order_id
     LEFT JOIN sf_inventory.parts p1 ON oi.part1_id = p1.part_id
     LEFT JOIN sf_inventory.parts p2 ON oi.part2_id = p2.part_id
     WHERE o.order_id = ? AND o.customer_id = ?
     GROUP BY o.order_id`,
    [params.order_id, session.user.customerId]
  );

  if (!rows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const r = rows[0];
  return NextResponse.json({
    id:            r.order_id,
    orderId:       r.order_id,
    shipType:      r.ship_type,
    status:        r.status,
    priority:      r.priority,
    dueDate:       r.due_date,
    totalItems:    r.total_qty,
    notes:         r.notes,
    estimatedCost: Number(r.estimated_cost),
    createdAt:     r.created_at,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { order_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status } = await req.json();
  if (status !== 'CANCELLED') {
    return NextResponse.json(
      { error: 'Only CANCELLED status is supported via this endpoint' },
      { status: 400 }
    );
  }

  const [result] = await orderDb.execute<ResultSetHeader>(
    `UPDATE orders SET status = 'CANCELLED'
     WHERE order_id = ? AND customer_id = ? AND status IN ('PENDING', 'QUEUED')`,
    [params.order_id, session.user.customerId]
  );

  if (result.affectedRows === 0) {
    return NextResponse.json(
      { error: 'Order cannot be cancelled (not found or already past QUEUED)' },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
