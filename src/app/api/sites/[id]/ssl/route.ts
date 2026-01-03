import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, sites } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { performSSLCheck } from '@/lib/monitoring/ssl';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, id), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site niet gevonden' }, { status: 404 });
    }

    // Perform SSL check
    const sslResult = await performSSLCheck(id);

    return NextResponse.json({ 
      success: true, 
      ssl: sslResult 
    });
  } catch (error) {
    console.error('Error checking SSL:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
