import { NextResponse } from 'next/server'

import { generateWorkoutPlan } from '@/lib/gravity-fitness'

/**
 * POST /api/plan
 * Port of backend/app/routers/plan.py — builds the 7-day workout plan
 * from an intensity index and optional gravity fraction.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: 'Request body must be valid JSON' }, { status: 400 })
  }

  const { intensity_index, g_fraction } = (body ?? {}) as {
    intensity_index?: number
    g_fraction?: number | null
  }

  if (
    typeof intensity_index !== 'number' ||
    !Number.isInteger(intensity_index) ||
    intensity_index < 1 ||
    intensity_index > 10
  ) {
    return NextResponse.json({ detail: 'intensity_index must be an integer in [1, 10]' }, { status: 400 })
  }
  if (
    g_fraction !== undefined &&
    g_fraction !== null &&
    (typeof g_fraction !== 'number' || !Number.isFinite(g_fraction) || g_fraction < 0 || g_fraction > 1)
  ) {
    return NextResponse.json({ detail: 'g_fraction must be a number in [0, 1]' }, { status: 400 })
  }

  return NextResponse.json(generateWorkoutPlan(intensity_index, g_fraction))
}
