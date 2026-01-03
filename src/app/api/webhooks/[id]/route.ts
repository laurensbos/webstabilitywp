import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, webhooks } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// DELETE - Remove a webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if webhook exists and belongs to user
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(and(
        eq(webhooks.id, id),
        eq(webhooks.userId, session.user.id)
      ));

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook niet gevonden' }, { status: 404 });
    }

    // Delete webhook
    await db.delete(webhooks).where(eq(webhooks.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update a webhook
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if webhook exists and belongs to user
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(and(
        eq(webhooks.id, id),
        eq(webhooks.userId, session.user.id)
      ));

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook niet gevonden' }, { status: 404 });
    }

    // Build update object
    const updates: Partial<{
      name: string;
      url: string;
      events: string[];
      isActive: boolean;
    }> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.url !== undefined) updates.url = body.url;
    if (body.events !== undefined) updates.events = body.events;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    // Update webhook
    const [updated] = await db
      .update(webhooks)
      .set(updates)
      .where(eq(webhooks.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
