// ============================================================
// Shielded Privacy App — Password Vault Encryption
// AES-256-GCM with a per-user key derived from NEXTAUTH_SECRET.
// Shared by /api/passwords and /api/passwords/[id] so every
// write path encrypts identically.
// ============================================================
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto'

function getDerivedKey(userId: string): Buffer {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is not configured — cannot derive encryption key')
  return Buffer.from(createHmac('sha256', secret).update(userId).digest())
}

export function encrypt(plaintext: string, userId: string): string {
  const key = getDerivedKey(userId)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv(12) + tag(16) + ciphertext — all base64-encoded together
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(encoded: string, userId: string): string {
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
