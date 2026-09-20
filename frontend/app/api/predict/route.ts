import { NextResponse } from 'next/server'

import { calculateIntensityIndex, intensityFormula, type Mapping } from '@/lib/gravity-fitness'

/**
 * POST /api/predict
 * Port of backend/app/routers/predict.py — computes the intensity index
 * from a planet's gravity fraction.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: 'Request body must be valid JSON' }, { status: 400 })
  }

  const { g_fraction, alpha = 1.0, mapping = 'linear' } = (body ?? {}) as {
    g_fraction?: number
    alpha?: number
    mapping?: string
  }

  if (typeof g_fraction !== 'number' || !Number.isFinite(g_fraction) || g_fraction < 0 || g_fraction > 1) {
    return NextResponse.json({ detail: 'g_fraction must be a number in [0, 1]' }, { status: 400 })
  }
  if (typeof alpha !== 'number' || !Number.isFinite(alpha) || alpha < 0.1 || alpha > 2.0) {
    return NextResponse.json({ detail: 'alpha must be a number in [0.1, 2.0]' }, { status: 400 })
  }
  if (mapping !== 'linear' && mapping !== 'nonlinear') {
    return NextResponse.json({ detail: "mapping must be 'linear' or 'nonlinear'" }, { status: 400 })
  }

  const intensityIndex = calculateIntensityIndex(g_fraction, alpha, mapping as Mapping)

  return NextResponse.json({
    intensity_index: intensityIndex,
    details: {
      g_fraction,
      alpha_used: alpha,
      mapping,
      formula: intensityFormula(mapping as Mapping, alpha),
    },
  })
}
