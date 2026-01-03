import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/team/accept - Accepteer uitnodiging
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is verplicht' }, { status: 400 });
    }

    // Zoek uitnodiging met token
    const [invitation] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.inviteToken, token),
          eq(teamMembers.status, 'pending')
        )
      );

    if (!invitation) {
      return NextResponse.json({ error: 'Uitnodiging niet gevonden of al geaccepteerd' }, { status: 404 });
    }

    // Controleer of e-mail overeenkomt
    if (invitation.email !== session.user.email?.toLowerCase()) {
      return NextResponse.json({ 
        error: 'Deze uitnodiging is voor een ander e-mailadres' 
      }, { status: 403 });
    }

    // Accepteer uitnodiging
    const [updated] = await db
      .update(teamMembers)
      .set({
        userId: session.user.id,
        status: 'active',
        acceptedAt: new Date(),
        inviteToken: null,
      })
      .where(eq(teamMembers.id, invitation.id))
      .returning();

    return NextResponse.json({
      success: true,
      member: updated,
    });
  } catch (error) {
    console.error('Uitnodiging accepteren mislukt:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
