import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderDb, inventoryDb } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
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
     WHERE o.customer_id = ?
     GROUP BY o.order_id
     ORDER BY o.created_at DESC`,
    [session.user.customerId]
  );

  const orders = rows.map((r) => ({
    id:             r.order_id,
    orderId:        r.order_id,
    shipType:       r.ship_type,
    status:         r.status,
    priority:       r.priority,
    dueDate:        r.due_date,
    totalItems:     r.total_qty,
    estimatedCost:  Number(r.estimated_cost),
    createdAt:      r.created_at,
  }));

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { shipType, dueDate, priority, notes, items } = body as {
    shipType: string;
    dueDate: string;
    priority: number;
    notes?: string;
    items: { part1Id: string; part2Id: string }[];
  };

  if (!shipType || !dueDate || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Current queue state — determines status assigned to each new order
  const [
    [inProgressRows],
    [queuedRows],
    [orderCountRows],
    [shipCountRows],
  ] = await Promise.all([
    orderDb.execute<RowDataPacket[]>("SELECT COUNT(*) AS cnt FROM orders WHERE status = 'IN_PROGRESS'"),
    orderDb.execute<RowDataPacket[]>("SELECT COUNT(*) AS cnt FROM orders WHERE status = 'QUEUED'"),
    orderDb.execute<RowDataPacket[]>("SELECT COALESCE(MAX(CAST(SUBSTRING(order_id, 2) AS UNSIGNED)), 0) AS cnt FROM orders"),
    inventoryDb.execute<RowDataPacket[]>("SELECT COALESCE(MAX(CAST(SUBSTRING(ship_id, 6) AS UNSIGNED)), 0) AS cnt FROM ships"),
  ]);

  let inProgressSlotFilled = Number(inProgressRows[0].cnt) > 0;
  let queuedSlotFilled     = Number(queuedRows[0].cnt) > 0;
  let orderSeq             = Number(orderCountRows[0].cnt);
  let shipSeq              = Number(shipCountRows[0].cnt);

  const conn = await orderDb.getConnection();
  const createdOrderIds: string[] = [];

  try {
    await conn.beginTransaction();

    for (const item of items) {
      orderSeq++;
      shipSeq++;

      const orderId = `P${String(orderSeq).padStart(9, '0')}`;
      const shipId  = `SHIP-${String(shipSeq).padStart(3, '0')}`;

      let status: string;
      if (!inProgressSlotFilled) {
        status = 'IN_PROGRESS';
        inProgressSlotFilled = true;
      } else if (!queuedSlotFilled) {
        status = 'QUEUED';
        queuedSlotFilled = true;
      } else {
        status = 'PENDING';
      }

      await conn.execute<ResultSetHeader>(
        `INSERT INTO orders
           (order_id, customer_id, ship_type, due_date, priority, notes, status, total_qty, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [orderId, session.user.customerId, shipType, dueDate, priority, notes || null, status, session.user.email ?? null]
      );

      await conn.execute<ResultSetHeader>(
        'INSERT INTO order_items (order_id, part1_id, part2_id) VALUES (?, ?, ?)',
        [orderId, item.part1Id, item.part2Id]
      );

      await inventoryDb.execute(
        `INSERT INTO ships (ship_id, ship_name, ship_type, status) VALUES (?, ?, ?, 'PLANNING')`,
        [shipId, `${shipType} #${shipSeq}`, shipType]
      );

      createdOrderIds.push(orderId);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Create order error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Failed to create order', detail: message }, { status: 500 });
  }

  conn.release();
  return NextResponse.json({ orderIds: createdOrderIds }, { status: 201 });
}
