import { db } from "@/db";
import { pendingOrdersTable } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const orderId = parseInt(params.id);

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedOrder = await db
      .update(pendingOrdersTable)
      .set({ status })
      .where(eq(pendingOrdersTable.id, orderId))
      .returning();

    return NextResponse.json({
      success: true,
      order: updatedOrder[0],
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 