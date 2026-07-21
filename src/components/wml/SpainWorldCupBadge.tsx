import Image from 'next/image'

const ENABLE_SPAIN_WORLD_CUP_BADGE = true

export function isSpainProfile(country?: string | null) {
  const normalized = country?.trim().toLowerCase()
  return normalized === 'es' || normalized === 'spain' || normalized === 'espana' || normalized === 'españa'
}

export default function SpainWorldCupBadge({ country }: { country?: string | null }) {
  if (!ENABLE_SPAIN_WORLD_CUP_BADGE || !isSpainProfile(country)) return null

  return (
    <Image
      src="/world-cup-spain.png"
      width={348}
      height={869}
      alt=""
      aria-hidden="true"
      title="España"
      style={{
        display: 'inline-block',
        width: 'auto',
        height: '1em',
        marginLeft: '0.35em',
        objectFit: 'contain',
        verticalAlign: '-0.12em',
        filter: 'invert(1)',
        flexShrink: 0,
      }}
    />
  )
}
