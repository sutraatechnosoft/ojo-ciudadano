const num = (v: string | undefined, d: number) => {
  const n = Number(v)
  return v && Number.isFinite(n) ? n : d
}

export const MAP_CENTER: [number, number] = [
  num(process.env.NEXT_PUBLIC_MAP_LAT, 20),
  num(process.env.NEXT_PUBLIC_MAP_LON, -30),
]
export const MAP_ZOOM = num(process.env.NEXT_PUBLIC_MAP_ZOOM, 2)
