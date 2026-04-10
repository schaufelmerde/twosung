import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderDb, productionDb } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function GET(
  _req: NextRequest,
  { params }: { params: { order_id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.customerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify order belongs to this customer
  const [orderRows] = await orderDb.execute<RowDataPacket[]>(
    'SELECT order_id FROM orders WHERE order_id = ? AND customer_id = ? LIMIT 1',
    [params.order_id, session.user.customerId]
  );
  if (!orderRows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const [items] = await orderDb.execute<RowDataPacket[]>(
    `SELECT oi.item_id, oi.part1_id, oi.part2_id, oi.item_status, oi.completed_at,
            p1.part_name AS part1_name,
            p2.part_name AS part2_name
     FROM order_items oi
     JOIN sf_inventory.parts p1 ON oi.part1_id = p1.part_id
     JOIN sf_inventory.parts p2 ON oi.part2_id = p2.part_id
     WHERE oi.order_id = ?
     ORDER BY oi.item_id`,
    [params.order_id]
  );

  // Enrich with sort_results (sort_position, ng_reason)
  let sortMap = new Map<number, { sort_position: number; ng_reason: string | null }>();
  if (items.length > 0) {
    const itemIds = items.map((i) => i.item_id);
    const placeholders = itemIds.map(() => '?').join(',');
    const [sortRows] = await productionDb.execute<RowDataPacket[]>(
      `SELECT item_id, sort_position, ng_reason
       FROM sort_results
       WHERE item_id IN (${placeholders})`,
      itemIds
    );
    sortMap = new Map(sortRows.map((r) => [r.item_id, r]));
  }

  const result = items.map((i) => {
    const sr = sortMap.get(i.item_id);
    return {
      id:          String(i.item_id),
      itemId:      String(i.item_id),
      part1Name:   i.part1_name,
      part2Name:   i.part2_name,
      status:      i.item_status,
      completedAt: i.completed_at,
      ngReason:    sr?.ng_reason ?? null,
      sortBin:     sr?.sort_position ?? null,
    };
  });

  return NextResponse.json(result);
}
