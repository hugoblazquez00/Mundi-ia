export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/drizzle'
import {
  users,
  teams,
  teamMembers,
  invitations,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  ActivityType,
} from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { hashPassword, setSession } from '@/lib/auth/session'

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
) {
  if (teamId == null) return
  await db.insert(activityLogs).values({
    teamId,
    userId,
    action: type,
    ipAddress: '',
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const accessToken = searchParams.get('access_token')
  const redirectTo = searchParams.get('redirect')
  const priceId = searchParams.get('priceId')
  const inviteId = searchParams.get('inviteId')

  if (!code && !accessToken) {
    return NextResponse.redirect(
      new URL('/sign-in?error=oauth_missing_code', req.url)
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  let email: string | null = null

  if (code) {
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      return NextResponse.redirect(
        new URL('/sign-in?error=oauth_exchange_failed', req.url)
      )
    }

    if (sessionData?.user?.email) {
      email = sessionData.user.email
    }
  } else if (accessToken) {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user?.email) {
      return NextResponse.redirect(
        new URL('/sign-in?error=oauth_exchange_failed', req.url)
      )
    }

    email = user.email
  }

  if (!email) {
    return NextResponse.redirect(
      new URL('/sign-in?error=oauth_exchange_failed', req.url)
    )
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  let dbUser = existing[0]
  let teamId: number | null = null

  if (!dbUser) {
    const randomPass = globalThis.crypto?.randomUUID?.()
      ? `${crypto.randomUUID()}${crypto.randomUUID()}`
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    const passwordHash = await hashPassword(randomPass)
    const newUser: NewUser = { email, passwordHash, role: 'owner' }
    const created = await db.insert(users).values(newUser).returning()
    dbUser = created[0]
  }

  let userRole = 'owner'
  if (inviteId) {
    const inv = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending'),
        ),
      )
      .limit(1)

    if (inv[0]) {
      teamId = inv[0].teamId
      userRole = inv[0].role
      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, inv[0].id))
      await logActivity(teamId, dbUser.id, ActivityType.ACCEPT_INVITATION)
    }
  }

  if (teamId == null) {
    const member = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, dbUser.id))
      .limit(1)
    if (member[0]) {
      teamId = member[0].teamId
    } else {
      const newTeam: NewTeam = { name: `${email}'s Team` }
      const createdTeam = await db.insert(teams).values(newTeam).returning()
      teamId = createdTeam[0].id
      userRole = 'owner'
      await db.insert(teamMembers).values({
        userId: dbUser.id,
        teamId,
        role: userRole,
      } as NewTeamMember)
      await logActivity(teamId, dbUser.id, ActivityType.CREATE_TEAM)
    }
  } else {
    const member = await db
      .select()
      .from(teamMembers)
      .where(
        and(eq(teamMembers.userId, dbUser.id), eq(teamMembers.teamId, teamId)),
      )
      .limit(1)
    if (!member[0]) {
      await db.insert(teamMembers).values({
        userId: dbUser.id,
        teamId,
        role: userRole,
      } as NewTeamMember)
    }
  }

  await logActivity(teamId, dbUser.id, ActivityType.SIGN_IN)
  await setSession(dbUser)
  await supabase.auth.signOut()

  if (redirectTo === 'checkout' && priceId) {
    const url = new URL('/api/stripe/checkout', req.url)
    url.searchParams.set('priceId', priceId)
    return NextResponse.redirect(url)
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}


