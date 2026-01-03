import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { teamMembers, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

// GET /api/team - Haal alle teamleden op
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    // Haal teamleden op waar gebruiker owner is
    const ownedTeam = await db
      .select({
        id: teamMembers.id,
        email: teamMembers.email,
        role: teamMembers.role,
        status: teamMembers.status,
        invitedAt: teamMembers.invitedAt,
        acceptedAt: teamMembers.acceptedAt,
        permissions: teamMembers.permissions,
        memberName: users.name,
        memberEmail: users.email,
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.ownerId, session.user.id));

    // Haal ook teams op waar gebruiker lid van is
    const memberOf = await db
      .select({
        id: teamMembers.id,
        ownerId: teamMembers.ownerId,
        role: teamMembers.role,
        permissions: teamMembers.permissions,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.ownerId, users.id))
      .where(
        and(
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.status, 'active')
        )
      );

    return NextResponse.json({
      ownedTeam,
      memberOf,
    });
  } catch (error) {
    console.error('Team ophalen mislukt:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}

// POST /api/team - Nodig een nieuw teamlid uit
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role = 'viewer', permissions = [] } = body;

    if (!email) {
      return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 });
    }

    // Controleer of e-mail al is uitgenodigd
    const [existing] = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.ownerId, session.user.id),
          eq(teamMembers.email, email.toLowerCase())
        )
      );

    if (existing) {
      return NextResponse.json({ error: 'Dit e-mailadres is al uitgenodigd' }, { status: 400 });
    }

    // Controleer of gebruiker al bestaat
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    // Genereer invite token
    const inviteToken = randomBytes(32).toString('hex');

    // Maak teamlid aan
    const [newMember] = await db.insert(teamMembers).values({
      ownerId: session.user.id,
      userId: existingUser?.id || null,
      email: email.toLowerCase(),
      role,
      status: 'pending',
      inviteToken,
      permissions,
      invitedAt: new Date(),
    }).returning();

    // TODO: Stuur uitnodigingsmail via email service
    // const inviteUrl = `${process.env.NEXTAUTH_URL}/team/accept?token=${inviteToken}`;

    return NextResponse.json({
      success: true,
      member: newMember,
    });
  } catch (error) {
    console.error('Teamlid uitnodigen mislukt:', error);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
