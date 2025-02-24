import { db } from "@/db";
import { pendingOrdersTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/');
    const id = segments[segments.length - 1];
    
    const { status } = await request.json();
    const orderId = parseInt(id);

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

    if (!updatedOrder.length) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

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

export const runtime = 'nodejs'
