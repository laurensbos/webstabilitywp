import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, maintenanceWindows } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// GET /api/maintenance/[id] - Get single maintenance window
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [window] = await db
      .select()
      .from(maintenanceWindows)
      .where(and(eq(maintenanceWindows.id, id), eq(maintenanceWindows.userId, session.user.id)));

    if (!window) {
      return NextResponse.json({ error: 'Maintenance window not found' }, { status: 404 });
    }

    return NextResponse.json(window);
  } catch (error) {
    console.error('Error fetching maintenance window:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/maintenance/[id] - Update maintenance window
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
    const { title, description, startsAt, endsAt, isActive } = await request.json();

    const updates: Partial<typeof maintenanceWindows.$inferInsert> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (startsAt !== undefined) updates.startsAt = new Date(startsAt);
    if (endsAt !== undefined) updates.endsAt = new Date(endsAt);
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(maintenanceWindows)
      .set(updates)
      .where(and(eq(maintenanceWindows.id, id), eq(maintenanceWindows.userId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Maintenance window not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating maintenance window:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/maintenance/[id] - Delete maintenance window
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

    await db
      .delete(maintenanceWindows)
      .where(and(eq(maintenanceWindows.id, id), eq(maintenanceWindows.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting maintenance window:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
