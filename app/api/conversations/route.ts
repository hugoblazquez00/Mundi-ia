import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateConversationSchema = z.object({
  conversationId: z.number(),
  status: z.enum(['active', 'completed', 'cancelled']),
});

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { conversationId, status } = updateConversationSchema.parse(body);

    const [updated] = await db
      .update(conversations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
