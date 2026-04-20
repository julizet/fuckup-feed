// altcha-lib 1.4.x — root import IS the v1 API, no subpath needed
import { createChallenge } from 'altcha-lib'
import { NextResponse } from 'next/server'

const HMAC_KEY = process.env.ALTCHA_HMAC_KEY ?? 'fuckup-feed-hmac-secret-key-change-in-production'

export async function GET() {
  try {
    const challenge = await createChallenge({
      hmacKey: HMAC_KEY,
      algorithm: 'SHA-256',
      maxNumber: 50000, // ~1–2s solve time in the browser
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
    })
    return NextResponse.json(challenge)
  } catch (err) {
    console.error('[altcha] challenge generation failed:', err)
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 })
  }
}
