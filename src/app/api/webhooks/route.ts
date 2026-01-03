import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, webhooks } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// GET - List all webhooks for user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWebhooks = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, session.user.id));

    // Return array directly, not wrapped in object
    return NextResponse.json(userWebhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Create new webhook
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, url, events } = await request.json();

    // Validate required fields
    if (!name || !type || !url) {
      return NextResponse.json({ error: 'Naam, type en URL zijn verplicht' }, { status: 400 });
    }

    // Validate type
    const validTypes = ['slack', 'discord', 'teams', 'generic'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Ongeldig webhook type' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Ongeldige URL' }, { status: 400 });
    }

    // Check webhook limit based on plan
    const existingWebhooks = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, session.user.id));

    const userPlan = (session.user as { plan?: string }).plan || 'free';
    const limits: Record<string, number> = {
      free: 1,
      pro: 5,
      business: 20,
      enterprise: 100
    };
    const limit = limits[userPlan] || 1;

    if (existingWebhooks.length >= limit) {
      return NextResponse.json({ 
        error: `Je hebt het maximum aantal webhooks bereikt (${limit}). Upgrade je abonnement voor meer.` 
      }, { status: 400 });
    }

    // Create webhook
    const [webhook] = await db
      .insert(webhooks)
      .values({
        userId: session.user.id,
        name,
        type,
        url,
        events: events || ['downtime', 'recovery'],
        isActive: true,
      })
      .returning();

    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete a webhook
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID is verplicht' }, { status: 400 });
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(webhooks)
      .where(and(
        eq(webhooks.id, webhookId),
        eq(webhooks.userId, session.user.id)
      ));

    if (!existing) {
      return NextResponse.json({ error: 'Webhook niet gevonden' }, { status: 404 });
    }

    await db.delete(webhooks).where(eq(webhooks.id, webhookId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update a webhook
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, url, events, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Webhook ID is verplicht' }, { status: 400 });
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(webhooks)
      .where(and(
        eq(webhooks.id, id),
        eq(webhooks.userId, session.user.id)
      ));

    if (!existing) {
      return NextResponse.json({ error: 'Webhook niet gevonden' }, { status: 404 });
    }

    // Build update object
    const updates: Partial<{ name: string; url: string; events: string[]; isActive: boolean; updatedAt: Date }> = {
      updatedAt: new Date()
    };

    if (name !== undefined) updates.name = name;
    if (url !== undefined) {
      try {
        new URL(url);
        updates.url = url;
      } catch {
        return NextResponse.json({ error: 'Ongeldige URL' }, { status: 400 });
      }
    }
    if (events !== undefined) updates.events = events;
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(webhooks)
      .set(updates)
      .where(eq(webhooks.id, id))
      .returning();

    return NextResponse.json({ webhook: updated });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
