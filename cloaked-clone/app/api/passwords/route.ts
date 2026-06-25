// ============================================================
// Shielded Privacy App — Password Manager API
// GET /api/passwords    → list decrypted passwords
// POST /api/passwords   → create encrypted password entry
//
// Passwords are encrypted at rest with AES-256-GCM using a key
// derived from NEXTAUTH_SECRET + userId so each user has a
// unique encryption key.
// ============================================================
import { NextResponse } from 'next/server'
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto'
import { getAuthenticatedUser, successResponse, errorResponse } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  site: z.string().min(1),
  url: z.string().optional(),
  username: z.string().min(1),
  password: z.string().min(1),
  strength: z.enum(['weak', 'medium', 'strong']).default('medium'),
  hasTotp: z.boolean().default(false),
  totpSecret: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

function getDerivedKey(userId: string): Buffer {
  const secret = process.env.NEXTAUTH_SECRET ?? 'fallback-dev-secret-change-in-prod'
  return Buffer.from(createHmac('sha256', secret).update(userId).digest())
}

function encrypt(plaintext: string, userId: string): string {
  const key = getDerivedKey(userId)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv(12) + tag(16) + ciphertext — all base64-encoded together
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

function decrypt(encoded: string, userId: string): string {
  try {
    const key = getDerivedKey(userId)
    const buf = Buffer.from(encoded, 'base64')
    const iv = buf.subarray(0, 12)
    const tag = buf.subarray(12, 28)
    const ciphertext = buf.subarray(28)
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(ciphertext) + decipher.final('utf8')
  } catch {
    // If decryption fails (e.g. old unencrypted entry), return as-is
    return encoded
  }
}

export async function GET() {
  const session = await getAuthenticatedUser()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const entries = await prisma.passwordEntry.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: 'desc' },
    })

    const decrypted = entries.map((e) => ({
      id: e.id,
      site: e.site,
      url: e.url,
      username: e.username,
      password: decrypt(e.encryptedPassword, session.id),
      strength: e.strength,
      hasTotp: e.hasTotp,
      tags: e.tags,
      notes: e.notes,
      breached: e.breached,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }))

    return successResponse({ items: decrypted, total: decrypted.length })
  } catch (err) {
    console.error('[Passwords GET]', err)
    return errorResponse('Failed to fetch passwords', 500)
  }
}

export async function POST(req: Request) {
  const session = await getAuthenticatedUser()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const body = await req.json()
    // Accept both `password` (new) and `encryptedPassword` (legacy)
    const parsed = createSchema.safeParse({
      ...body,
      password: body.password ?? body.encryptedPassword,
    })
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 })

    const { password, ...rest } = parsed.data
    const entry = await prisma.passwordEntry.create({
      data: {
        userId: session.id,
        encryptedPassword: encrypt(password, session.id),
        ...rest,
      },
    })

    return NextResponse.json({ data: { ...entry, password } }, { status: 201 })
  } catch (err) {
    console.error('[Passwords POST]', err)
    return errorResponse('Failed to save password', 500)
  }
}
