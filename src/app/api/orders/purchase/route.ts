import { db } from "@/db";
import { pendingOrdersTable, usersTable } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    // Get request data
    const { imageUrl, prompt } = await request.json();

    // Log incoming data
    console.log('Received order request:', { imageUrl, prompt });

    // Validate required fields
    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields', fields: { imageUrl, prompt } },
        { status: 400 }
      );
    }

    // Create a test user if none exists
    let user = await db.select().from(usersTable).limit(1);
    
    if (!user.length) {
      // Create a test user without specifying the ID
      user = await db.insert(usersTable).values({
        name: 'Test User',
        age: 25,
        email: 'test@example.com',
      }).returning();
    }

    // Create new order
    const order = await db.insert(pendingOrdersTable).values({
      imageUrl,
      prompt,
      userId: user[0].id,
      status: 'pending',
      createdAt: new Date(),
    }).returning();

    console.log('Order created:', order);

    return NextResponse.json({
      success: true,
      order: order[0],
      message: 'Thank you! Your order was created successfully. A florist will get back to you in a few business days.'
    });

  } catch (error) {
    // More detailed error logging
    console.error('Detailed error creating order:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optionally add a GET method to fetch orders
export async function GET() {
  try {
    const orders = await db
      .select()
      .from(pendingOrdersTable)
      .orderBy(desc(pendingOrdersTable.createdAt));

    return NextResponse.json({ success: true, orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}