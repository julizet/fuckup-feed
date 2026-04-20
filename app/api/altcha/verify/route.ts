// altcha-lib 1.4.x — root import IS the v1 API, no subpath needed
import { verifySolution } from 'altcha-lib'
import { type NextRequest, NextResponse } from 'next/server'

const HMAC_KEY = process.env.ALTCHA_HMAC_KEY ?? 'fuckup-feed-hmac-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { payload } = await request.json()
    if (!payload) {
      return NextResponse.json({ verified: false, error: 'Missing payload' }, { status: 400 })
    }
    // verifySolution(payload, hmacKey, checkExpires?)
    // payload is the base64-encoded JSON string the widget submits
    const ok = await verifySolution(payload, HMAC_KEY, true)
    return NextResponse.json({ verified: ok })
  } catch (err) {
    console.error('[altcha] verify failed:', err)
    return NextResponse.json({ verified: false, error: 'Verification error' }, { status: 500 })
  }
}
