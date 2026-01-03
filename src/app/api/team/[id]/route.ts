import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/team/[id] - Update teamlid role/permissions
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, permissions } = body;

    // Controleer of teamlid bestaat en eigendom is van gebruiker
    const [existing] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.id, id),
          eq(teamMembers.ownerId, session.user.id)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: 'Teamlid niet gevonden' }, { status: 404 });
    }

    // Update teamlid
    const [updated] = await db
      .update(teamMembers)
      .set({
        ...(role && { role }),
        ...(permissions && { permissions }),
      })
      .where(eq(teamMembers.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      member: updated,
    });
  } catch (error) {
    console.error('Teamlid bijwerken mislukt:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// DELETE /api/team/[id] - Verwijder teamlid
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const { id } = await params;

    // Controleer of teamlid bestaat en eigendom is van gebruiker
    const [existing] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.id, id),
          eq(teamMembers.ownerId, session.user.id)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: 'Teamlid niet gevonden' }, { status: 404 });
    }

    // Verwijder teamlid
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Teamlid verwijderen mislukt:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
