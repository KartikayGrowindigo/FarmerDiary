import React, { useId } from 'react'
import { ModuleKey } from '../config/modules'

// Hand-drawn flat illustrations used in place of generic icon glyphs.
// All drawn on a 64x64 grid so they can be dropped into any size container.

type ArtProps = { className?: string }

const svgProps = { viewBox: '0 0 64 64', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true } as const

function WheatHead({ x, y, s = 1, light = '#F6C544', dark = '#DC9A1E' }: { x: number; y: number; s?: number; light?: string; dark?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1={0} y1={-5} x2={0} y2={-11} stroke={dark} strokeWidth={0.9} strokeLinecap="round" />
      <ellipse cx={0} cy={-2.5} rx={1.9} ry={3} fill={light} />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <ellipse cx={-2.4} cy={i * 4 + 1} rx={2} ry={3.2} transform={`rotate(-28 -2.4 ${i * 4 + 1})`} fill={light} />
          <ellipse cx={2.4} cy={i * 4 + 1} rx={2} ry={3.2} transform={`rotate(28 2.4 ${i * 4 + 1})`} fill={dark} />
        </g>
      ))}
    </g>
  )
}

function Sprout({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C0 -6 0 -10 0 -14" stroke="#3F9A3A" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d="M0 -8 C-6 -8 -11 -12 -11 -17 C-5 -17 0 -14 0 -8Z" fill="#4CAF50" />
      <path d="M0 -11 C5 -11 11 -15 11 -21 C5 -21 0 -17 0 -11Z" fill="#8BD04E" />
    </g>
  )
}

function Soil({ top = 46 }: { top?: number }) {
  return (
    <g>
      <path d={`M2 ${top + 4} Q32 ${top - 6} 62 ${top + 4} V62 H2Z`} fill="#9A6331" />
      <path d={`M2 ${top + 4} Q32 ${top - 6} 62 ${top + 4} Q32 ${top} 2 ${top + 4}Z`} fill="#B97A3E" />
      <path d={`M10 ${top + 10} q4 -2 8 0 M28 ${top + 12} q4 -2 8 0 M46 ${top + 10} q4 -2 8 0`} stroke="#7A4A20" strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </g>
  )
}

/* ---------- Module illustrations ---------- */

function LandPrepArt({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M4 50 C16 38 48 38 60 50 L60 58 Q32 62 4 58Z" fill="#8B5A2B" />
      <rect x={30} y={8} width={4} height={30} rx={2} fill="#C0823F" />
      <rect x={23} y={5} width={18} height={5.5} rx={2.75} fill="#7A4A1F" />
      <path d="M23 32 H41 V43 Q41 51 32 55 Q23 51 23 43Z" fill="#A7B1BE" />
      <path d="M26 34 H30 V48 Q27 46 26 43Z" fill="#fff" opacity={0.55} />
      <path d="M4 50 C16 43 48 43 60 50 Q48 47 32 48 Q16 47 4 50Z" fill="#B7773A" />
      <path d="M4 52 Q32 44 60 52 L60 58 Q32 62 4 58Z" fill="#A36A33" />
      <path d="M12 55 q5 -3 10 0 M42 55 q5 -3 10 0" stroke="#6E4520" strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <circle cx={14} cy={46} r={2.2} fill="#A36A33" />
      <circle cx={52} cy={45} r={1.8} fill="#A36A33" />
    </svg>
  )
}

function SeedArt({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M6 54 Q32 40 58 54 V60 H6Z" fill="#9A6331" />
      <path d="M6 54 Q32 40 58 54 Q32 48 6 54Z" fill="#B97A3E" />
      <Sprout x={32} y={48} s={1.5} />
      <ellipse cx={13} cy={14} rx={2.4} ry={3.6} transform="rotate(-25 13 14)" fill="#E0A94A" />
      <ellipse cx={20} cy={26} rx={2.4} ry={3.6} transform="rotate(20 20 26)" fill="#C98B2E" />
      <ellipse cx={52} cy={36} rx={2.4} ry={3.6} transform="rotate(-15 52 36)" fill="#E0A94A" />
      <path d="M11 6 v3 M18 17 v3 M50 27 v3" stroke="#E0A94A" strokeWidth={1.4} strokeLinecap="round" opacity={0.6} />
    </svg>
  )
}

function FertilizerArt({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M16 24 Q13 40 16 55 Q32 61 48 55 Q51 40 48 24Z" fill="#F4E4C4" />
      <path d="M41 24 Q45 40 42 57 Q46 56 48 55 Q51 40 48 24Z" fill="#E2CB9C" />
      <path d="M20 25 Q32 19 44 25 L40 13 Q32 9 24 13Z" fill="#EAD6AA" />
      <rect x={21} y={20} width={22} height={4.5} rx={2.2} fill="#7C3AED" />
      <circle cx={32} cy={40} r={9.5} fill="#7C3AED" />
      <path d="M28 44 C28 38 32 34 37 34 C37 40 33 44 28 44Z" fill="#fff" />
      <path d="M28 44 L33 39" stroke="#7C3AED" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={8} cy={52} r={2.4} fill="#A78BFA" />
      <circle cx={12} cy={57} r={1.8} fill="#C4B5FD" />
      <circle cx={55} cy={50} r={2} fill="#C4B5FD" />
      <circle cx={57} cy={57} r={2.4} fill="#A78BFA" />
    </svg>
  )
}

function PestArt({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M32 5 L53 12 V30 C53 44 44 53 32 59 C20 53 11 44 11 30 V12Z" fill="#FDA4AF" />
      <path d="M32 9 L49 15 V30 C49 41 42 49 32 54 C22 49 15 41 15 30 V15Z" fill="#FFF1F2" />
      <path d="M25 24 l-5 -3 M25 32 h-6 M25 40 l-5 3 M39 24 l5 -3 M39 32 h6 M39 40 l5 3" stroke="#4C1D1D" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M29 20 q-3 -5 -6 -6 M35 20 q3 -5 6 -6" stroke="#4C1D1D" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <circle cx={32} cy={22} r={4.5} fill="#3F1D1D" />
      <ellipse cx={32} cy={34} rx={9} ry={11} fill="#E11D48" />
      <line x1={32} y1={24} x2={32} y2={45} stroke="#7F1D1D" strokeWidth={1.4} />
      <circle cx={27.5} cy={31} r={2} fill="#3F1D1D" />
      <circle cx={36.5} cy={31} r={2} fill="#3F1D1D" />
      <circle cx={28} cy={39} r={1.7} fill="#3F1D1D" />
      <circle cx={36} cy={39} r={1.7} fill="#3F1D1D" />
      <circle cx={49} cy={49} r={8} fill="#16A34A" stroke="#fff" strokeWidth={2} />
      <path d="M45 49 l3 3 l5 -6" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function WaterArt({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <ellipse cx={32} cy={58} rx={16} ry={3} fill="#0EA5E9" opacity={0.25} />
      <path d="M32 5 C32 5 14 27 14 39 A18 18 0 0 0 50 39 C50 27 32 5 32 5Z" fill="#38BDF8" />
      <path d="M32 57 A18 18 0 0 0 50 39 C50 33 46 25 42 19 C46 30 46 49 32 57Z" fill="#0284C7" opacity={0.55} />
      <path d="M22 38 C22 32 25 27 28 23" stroke="#fff" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
      <circle cx={23} cy={44} r={1.8} fill="#fff" opacity={0.8} />
      <path d="M9 18 C9 18 5 23 5 26 A4 4 0 0 0 13 26 C13 23 9 18 9 18Z" fill="#7DD3FC" />
      <path d="M55 12 C55 12 52 16 52 18 A3 3 0 0 0 58 18 C58 16 55 12 55 12Z" fill="#7DD3FC" />
    </svg>
  )
}

function HarvestArt({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      {[-30, -15, 0, 15, 30].map((a, i) => (
        <g key={a} transform={`rotate(${a} 32 46)`}>
          <line x1={32} y1={60} x2={32} y2={24} stroke="#C98A1B" strokeWidth={1.8} strokeLinecap="round" />
          <WheatHead x={32} y={i % 2 ? 10 : 8} s={1.05} />
        </g>
      ))}
      <rect x={24} y={42} width={16} height={5} rx={2.5} fill="#B45309" />
      <rect x={24} y={42} width={16} height={2} rx={1} fill="#D97706" />
    </svg>
  )
}

function ResidueArt({ className }: ArtProps) {
  return (
    <svg {...svgProps} className={className}>
      <ellipse cx={34} cy={57} rx={24} ry={3} fill="#92400E" opacity={0.2} />
      <rect x={26} y={18} width={22} height={38} fill="#CA8A04" />
      <path d="M30 20 v34 M36 19 v36 M42 20 v34" stroke="#A16207" strokeWidth={1.2} opacity={0.6} />
      <ellipse cx={48} cy={37} rx={6} ry={19} fill="#A16207" />
      <circle cx={26} cy={37} r={19} fill="#FACC15" />
      <circle cx={26} cy={37} r={14} fill="none" stroke="#CA8A04" strokeWidth={1.8} />
      <circle cx={26} cy={37} r={9} fill="none" stroke="#CA8A04" strokeWidth={1.8} />
      <circle cx={26} cy={37} r={4} fill="none" stroke="#CA8A04" strokeWidth={1.8} />
      <circle cx={51} cy={13} r={9} fill="#14B8A6" stroke="#fff" strokeWidth={2} />
      <path d="M46.5 13 A4.5 4.5 0 1 1 51 17.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d="M44 11.5 L46.5 14.5 L49 11.5Z" fill="#fff" />
      <path d="M8 58 l4 -3 M56 58 l3 -4 M14 59 l-3 -3" stroke="#CA8A04" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  )
}

const MODULE_ART: Record<ModuleKey, (p: ArtProps) => JSX.Element> = {
  'Land Preparation & Sowing': LandPrepArt,
  'Seed & Sowing': SeedArt,
  'Fertilizer & Nutrient Management': FertilizerArt,
  'Pest & Disease Management': PestArt,
  'Water Management': WaterArt,
  Harvesting: HarvestArt,
  'Residue Management': ResidueArt
}

export function ModuleArt({ moduleKey, className }: { moduleKey: string } & ArtProps) {
  const Art = MODULE_ART[moduleKey as ModuleKey]
  return Art ? <Art className={className} /> : <HarvestArt className={className} />
}

/* ---------- Option illustrations (grid choices inside forms) ---------- */

const OPTION_ART: Record<string, (p: ArtProps) => JSX.Element> = {
  'Conventional Tillage': ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={44} />
      <path d="M4 54 q7 -4 14 0 t14 0 t14 0 t14 0" stroke="#6E4520" strokeWidth={2} fill="none" />
      <line x1={32} y1={24} x2={54} y2={8} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
      <circle cx={32} cy={28} r={13} fill="#94A3B8" stroke="#64748B" strokeWidth={2} />
      <circle cx={32} cy={28} r={4} fill="#475569" />
      {[0, 60, 120].map(a => <line key={a} x1={32} y1={17} x2={32} y2={39} transform={`rotate(${a} 32 28)`} stroke="#64748B" strokeWidth={1.4} />)}
    </svg>
  ),
  'Happy Seeder': ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={44} />
      {[8, 13, 18, 44, 49, 54].map((x, i) => <line key={x} x1={x} y1={48} x2={x + (i % 2 ? 2 : -2)} y2={36} stroke="#E0A526" strokeWidth={2} strokeLinecap="round" />)}
      <Sprout x={31} y={46} s={1.3} />
      <path d="M22 14 a10 10 0 0 1 20 0" stroke="#F59E0B" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <circle cx={32} cy={8} r={3} fill="#FBBF24" />
    </svg>
  ),
  'Super Seeder': ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={46} />
      <rect x={8} y={14} width={48} height={10} rx={4} fill="#EA580C" />
      <rect x={8} y={14} width={48} height={4} rx={2} fill="#FB923C" />
      <line x1={10} y1={34} x2={54} y2={34} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
      {[14, 24, 34, 44, 52].map((x, i) => <path key={x} d={`M${x} 34 v${i % 2 ? -7 : 7} h4`} stroke="#64748B" strokeWidth={2.4} fill="none" strokeLinecap="round" />)}
      <line x1={14} y1={24} x2={14} y2={32} stroke="#9A3412" strokeWidth={2.4} />
      <line x1={50} y1={24} x2={50} y2={32} stroke="#9A3412" strokeWidth={2.4} />
    </svg>
  ),
  'Smart Seeder': ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={46} />
      <Sprout x={24} y={48} s={1.3} />
      <rect x={38} y={16} width={16} height={16} rx={4} fill="#6366F1" />
      <rect x={42} y={20} width={8} height={8} rx={1.5} fill="#C7D2FE" />
      {[20, 24, 28].map(y => <g key={y}><line x1={35} y1={y} x2={38} y2={y} stroke="#6366F1" strokeWidth={1.6} /><line x1={54} y1={y} x2={57} y2={y} stroke="#6366F1" strokeWidth={1.6} /></g>)}
      <path d="M40 8 a10 10 0 0 1 12 0 M43 11 a5 5 0 0 1 6 0" stroke="#818CF8" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </svg>
  ),
  'Zero Till Drill': ({ className }) => (
    <svg {...svgProps} className={className}>
      <rect x={2} y={44} width={60} height={18} fill="#9A6331" />
      <rect x={2} y={42} width={60} height={4} fill="#B97A3E" />
      {[6, 12, 18, 46, 52, 58].map(x => <line key={x} x1={x} y1={43} x2={x} y2={34} stroke="#E0A526" strokeWidth={2} strokeLinecap="round" />)}
      <path d="M28 10 H36 V40 L32 52 L28 40Z" fill="#64748B" />
      <path d="M29 12 H31 V40 L30 44Z" fill="#fff" opacity={0.5} />
      <ellipse cx={32} cy={56} rx={2.2} ry={3} fill="#F6C544" />
      <path d="M44 14 v12 m-4 -4 l4 4 l4 -4" stroke="#16A34A" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Broadcasting: ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={48} />
      <path d="M6 22 Q12 30 22 28 L20 18 Q12 16 6 22Z" fill="#8B5CF6" />
      {[[26, 18], [32, 22], [38, 20], [44, 26], [36, 30], [48, 34], [42, 38], [54, 40], [30, 34]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 ? 1.8 : 2.4} fill={i % 2 ? '#A78BFA' : '#7C3AED'} />
      ))}
    </svg>
  ),
  Seeder: ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={46} />
      <path d="M14 8 H50 L44 26 H20Z" fill="#8B5CF6" />
      <path d="M14 8 H50 L49 12 H15Z" fill="#A78BFA" />
      {[24, 32, 40].map(x => <line key={x} x1={x} y1={26} x2={x} y2={40} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />)}
      {[24, 32, 40].map(x => <circle key={x} cx={x} cy={46} r={2} fill="#C4B5FD" />)}
    </svg>
  ),
  Fertigation: ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={48} />
      <rect x={4} y={12} width={56} height={7} rx={3.5} fill="#0EA5E9" />
      <rect x={4} y={12} width={56} height={2.5} rx={1.2} fill="#7DD3FC" />
      <path d="M32 22 C32 22 24 32 24 37 A8 8 0 0 0 40 37 C40 32 32 22 32 22Z" fill="#38BDF8" />
      <circle cx={30} cy={37} r={2} fill="#8B5CF6" />
      <circle cx={34.5} cy={34} r={1.6} fill="#8B5CF6" />
      <Sprout x={14} y={52} s={0.8} />
      <Sprout x={50} y={52} s={0.8} />
    </svg>
  ),
  Spray: ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={48} />
      <path d="M4 18 L22 18 L26 14 L30 14 L30 22 L26 22 L22 20 L4 20Z" fill="#475569" />
      <rect x={4} y={16} width={10} height={6} rx={2} fill="#64748B" />
      {[[36, 12], [40, 18], [36, 24], [44, 10], [46, 16], [44, 24], [50, 20], [52, 12], [54, 28], [40, 28]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.4 : 2} fill="#38BDF8" opacity={1 - i * 0.06} />
      ))}
      <Sprout x={42} y={50} s={1.1} />
    </svg>
  ),
  Drenching: ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={48} />
      <path d="M6 16 H26 V34 Q26 38 22 38 H10 Q6 38 6 34Z" fill="#0EA5E9" />
      <path d="M26 20 L40 12 L42 15 L28 26Z" fill="#0284C7" />
      <path d="M6 18 Q0 22 6 30" stroke="#0284C7" strokeWidth={2.5} fill="none" />
      <path d="M42 15 Q46 30 44 44" stroke="#7DD3FC" strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="3 3" />
      <Sprout x={48} y={50} s={1} />
    </svg>
  ),
  Flood: ({ className }) => (
    <svg {...svgProps} className={className}>
      <rect x={2} y={40} width={60} height={22} fill="#9A6331" />
      {[16, 32, 48].map(x => <Sprout key={x} x={x} y={42} s={1} />)}
      <path d="M2 38 q7 -4 15 0 t15 0 t15 0 t15 0 V52 H2Z" fill="#38BDF8" opacity={0.85} />
      <path d="M2 44 q7 -4 15 0 t15 0 t15 0 t15 0" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.7} />
      <path d="M2 50 q7 -3 15 0 t15 0 t15 0 t15 0 V52 H2Z" fill="#0284C7" opacity={0.5} />
    </svg>
  ),
  Sprinkler: ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={50} />
      <rect x={30} y={24} width={4} height={28} fill="#64748B" />
      <rect x={25} y={20} width={14} height={6} rx={3} fill="#475569" />
      <path d="M26 22 Q14 14 6 26 M38 22 Q50 14 58 26" stroke="#7DD3FC" strokeWidth={1.5} fill="none" strokeDasharray="2 3" />
      {[[8, 30], [12, 22], [18, 16], [46, 16], [52, 22], [56, 30], [14, 36], [50, 36]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 3} C${x} ${y - 3} ${x - 2} ${y} ${x - 2} ${y + 1} A2 2 0 0 0 ${x + 2} ${y + 1} C${x + 2} ${y} ${x} ${y - 3} ${x} ${y - 3}Z`} fill="#38BDF8" />
      ))}
    </svg>
  ),
  Drip: ({ className }) => (
    <svg {...svgProps} className={className}>
      <Soil top={48} />
      <rect x={2} y={16} width={60} height={6} rx={3} fill="#1E293B" />
      {[14, 32, 50].map(x => (
        <g key={x}>
          <rect x={x - 2} y={21} width={4} height={4} fill="#334155" />
          <path d={`M${x} 28 C${x} 28 ${x - 3} 32 ${x - 3} 34 A3 3 0 0 0 ${x + 3} 34 C${x + 3} 32 ${x} 28 ${x} 28Z`} fill="#38BDF8" />
          <Sprout x={x} y={50} s={0.75} />
        </g>
      ))}
    </svg>
  ),
  Burning: ({ className }) => (
    <svg {...svgProps} className={className}>
      <circle cx={18} cy={12} r={6} fill="#9CA3AF" opacity={0.6} />
      <circle cx={26} cy={8} r={5} fill="#9CA3AF" opacity={0.5} />
      <circle cx={46} cy={10} r={5} fill="#9CA3AF" opacity={0.5} />
      <path d="M32 14 C40 24 50 30 48 44 C46 54 38 58 32 58 C24 58 16 53 16 44 C16 36 22 32 24 24 C28 30 30 32 32 14Z" fill="#EF4444" />
      <path d="M32 28 C37 34 42 38 41 46 C40 52 36 56 32 56 C27 56 23 52 23 47 C23 42 27 40 28 35 C30 38 31 38 32 28Z" fill="#F97316" />
      <path d="M32 40 C35 44 37 46 36.5 50 C36 53 34 55 32 55 C29.5 55 27.5 53 27.5 50.5 C27.5 47.5 30 46 32 40Z" fill="#FDE047" />
      <path d="M6 60 H58" stroke="#78350F" strokeWidth={3} strokeLinecap="round" />
    </svg>
  ),
  Incorporation: ({ className }) => (
    <svg {...svgProps} className={className}>
      <rect x={2} y={26} width={60} height={36} rx={4} fill="#9A6331" />
      <rect x={2} y={26} width={60} height={5} rx={2} fill="#B97A3E" />
      {[[10, 38, 20], [22, 48, -30], [38, 36, 40], [48, 50, -10], [30, 56, 10], [52, 40, 60], [14, 54, -50]].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width={9} height={2.4} rx={1.2} transform={`rotate(${r} ${x + 4} ${y + 1})`} fill="#F6C544" />
      ))}
      <path d="M22 16 A10 10 0 0 1 42 16" stroke="#16A34A" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M39 11 L43 17 L46 11Z" fill="#16A34A" />
      <path d="M22 16 L22 22" stroke="#16A34A" strokeWidth={3} strokeLinecap="round" />
    </svg>
  ),
  'Baling & Selling': ({ className }) => (
    <svg {...svgProps} className={className}>
      <path d="M8 26 L30 20 L52 26 L30 32Z" fill="#FDE68A" />
      <path d="M8 26 L30 32 V54 L8 48Z" fill="#FACC15" />
      <path d="M30 32 L52 26 V48 L30 54Z" fill="#CA8A04" />
      <path d="M15 28 V50 M22 30 V52 M38 30 V52 M45 28 V50" stroke="#92400E" strokeWidth={1.4} opacity={0.6} />
      <circle cx={48} cy={16} r={11} fill="#16A34A" stroke="#fff" strokeWidth={2} />
      <text x={48} y={21} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff" fontFamily="Plus Jakarta Sans, sans-serif">₹</text>
    </svg>
  )
}

// Small standalone illustrations for the impact screen
export const ExtraArt = {
  diesel: ({ className }: ArtProps) => (
    <svg {...svgProps} className={className}>
      <path d="M18 14 H40 L50 24 V54 Q50 58 46 58 H18 Q14 58 14 54 V18 Q14 14 18 14Z" fill="#DC2626" />
      <path d="M18 14 H26 V58 H18 Q14 58 14 54 V18 Q14 14 18 14Z" fill="#EF4444" />
      <rect x={22} y={6} width={12} height={8} rx={2} fill="#7F1D1D" />
      <path d="M22 30 L42 46 M42 30 L22 46" stroke="#FCA5A5" strokeWidth={3} strokeLinecap="round" />
    </svg>
  ),
  coins: ({ className }: ArtProps) => (
    <svg {...svgProps} className={className}>
      {[48, 40, 32].map((y, i) => (
        <g key={y}>
          <ellipse cx={24} cy={y + 4} rx={16} ry={5} fill="#B45309" />
          <ellipse cx={24} cy={y} rx={16} ry={5} fill={i === 2 ? '#FDE047' : '#FACC15'} />
        </g>
      ))}
      <circle cx={44} cy={22} r={14} fill="#FACC15" stroke="#B45309" strokeWidth={2.5} />
      <text x={44} y={28} textAnchor="middle" fontSize={17} fontWeight={800} fill="#92400E" fontFamily="Plus Jakarta Sans, sans-serif">₹</text>
      <path d="M8 12 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2Z" fill="#fff" />
    </svg>
  ),
  leaf: ({ className }: ArtProps) => (
    <svg {...svgProps} className={className}>
      <path d="M10 54 C10 26 30 10 56 8 C56 36 40 54 10 54Z" fill="#22C55E" />
      <path d="M10 54 C22 40 34 28 50 14" stroke="#15803D" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <path d="M26 40 l-2 -10 M36 30 l-1 -9 M26 40 l10 1 M36 30 l9 1" stroke="#15803D" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  ),
  bulb: ({ className }: ArtProps) => (
    <svg {...svgProps} className={className}>
      <circle cx={32} cy={26} r={20} fill="#FDE68A" opacity={0.6} />
      <path d="M32 8 A16 16 0 0 0 22 37 Q25 40 25 44 H39 Q39 40 42 37 A16 16 0 0 0 32 8Z" fill="#FBBF24" />
      <path d="M26 20 A8 8 0 0 1 32 15" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <rect x={25} y={45} width={14} height={4} rx={2} fill="#78716C" />
      <rect x={26} y={50} width={12} height={4} rx={2} fill="#57534E" />
    </svg>
  )
}

export function OptionArt({ value, className }: { value: string } & ArtProps) {
  const Art = OPTION_ART[value]
  return Art ? <Art className={className} /> : null
}

export function hasOptionArt(value: string) {
  return value in OPTION_ART
}

/* ---------- Plot tile: a small field landscape ---------- */

const PLOT_PALETTES = [
  { sky: '#BFE9F7', hill: '#7CC47F', rowA: '#4CAF50', rowB: '#6CC24A' },
  { sky: '#FFE2B8', hill: '#E9B949', rowA: '#F2C14E', rowB: '#DDA42C' },
  { sky: '#D9E8FF', hill: '#8DCB9A', rowA: '#3E9B5B', rowB: '#86C95A' },
  { sky: '#FFD9CC', hill: '#C9D66B', rowA: '#9CC940', rowB: '#E3C04A' }
]

export function PlotArt({ variant = 0, className }: { variant?: number } & ArtProps) {
  const p = PLOT_PALETTES[variant % PLOT_PALETTES.length]
  return (
    <svg viewBox="0 0 64 64" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width={64} height={64} fill={p.sky} />
      <circle cx={48} cy={16} r={7} fill="#FFD166" />
      <circle cx={48} cy={16} r={11} fill="#FFD166" opacity={0.3} />
      <path d="M-4 34 Q18 20 40 30 T68 26 V64 H-4Z" fill={p.hill} />
      <path d="M-4 40 Q32 30 68 40 V64 H-4Z" fill={p.rowA} />
      <path d="M-4 47 Q32 38 68 47 V52 Q32 43 -4 52Z" fill={p.rowB} />
      <path d="M-4 57 Q32 48 68 57 V62 Q32 53 -4 62Z" fill={p.rowB} />
      <rect x={12} y={20} width={2.5} height={10} fill="#7A4A1F" />
      <circle cx={13.2} cy={19} r={5.5} fill="#2F7A4F" />
    </svg>
  )
}

/* ---------- Brand mark ---------- */

export function Logo({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width={48} height={48} rx={14} fill="#FFF7E6" />
      <circle cx={24} cy={22} r={9} fill="#F59E0B" />
      <circle cx={24} cy={22} r={13} fill="#F59E0B" opacity={0.25} />
      <path d="M4 32 Q24 22 44 32 V44 Q44 48 40 48 H8 Q4 48 4 44Z" fill="#16A34A" />
      <path d="M4 38 Q24 29 44 38" stroke="#86EFAC" strokeWidth={2} fill="none" />
      <path d="M4 43 Q24 35 44 43" stroke="#86EFAC" strokeWidth={2} fill="none" />
    </svg>
  )
}

/* ---------- Animated field landscape used behind screen headers ---------- */

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
      <ellipse cx={0} cy={8} rx={22} ry={8} />
      <circle cx={-8} cy={3} r={9} />
      <circle cx={6} cy={0} r={11} />
    </g>
  )
}

function Stalks({ x, flip = false }: { x: number; flip?: boolean }) {
  const offsets = [0, 9, 17, 26]
  return (
    <g transform={`translate(${x} 0) ${flip ? 'scale(-1 1)' : ''}`}>
      {offsets.map((o, i) => (
        <g key={o} className="anim-sway" style={{ animationDelay: `${i * -0.7}s` }}>
          <path d={`M${o} 200 Q${o + 3} ${176 - i * 4} ${o + 5} ${150 + i * 6}`} stroke="#B7791F" strokeWidth={2} fill="none" />
          <WheatHead x={o + 5} y={140 + i * 6} s={1.5} light="#F8D35E" dark="#D69A1C" />
        </g>
      ))}
    </g>
  )
}

export function FieldScene({ className, compact = false }: ArtProps & { compact?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B4F4B" />
          <stop offset="45%" stopColor="#1F7F72" />
          <stop offset="80%" stopColor="#F0B562" />
          <stop offset="100%" stopColor="#FFD89A" />
        </linearGradient>
        <radialGradient id={`${id}sun`}>
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="60%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#FFB547" />
        </radialGradient>
      </defs>
      <rect width={400} height={200} fill={`url(#${id}sky)`} />

      <g className="anim-sun">
        <circle cx={318} cy={128} r={52} fill="#FFD166" opacity={0.18} />
        <circle cx={318} cy={128} r={38} fill="#FFD166" opacity={0.3} />
      </g>
      <circle cx={318} cy={128} r={26} fill={`url(#${id}sun)`} />

      <g opacity={0.85}>
        <g className="anim-drift" style={{ animationDuration: '46s' }}><Cloud x={80} y={42} s={0.9} /></g>
        <g className="anim-drift" style={{ animationDuration: '62s', animationDelay: '-20s' }}><Cloud x={250} y={60} s={0.65} /></g>
        {!compact && <g className="anim-drift" style={{ animationDuration: '80s', animationDelay: '-40s' }}><Cloud x={170} y={92} s={0.5} /></g>}
      </g>

      <g className="anim-float" stroke="#0B3B38" strokeWidth={1.6} fill="none" strokeLinecap="round">
        <path d="M238 100 q4 -4 8 0 q4 -4 8 0" />
        <path d="M258 110 q3 -3 6 0 q3 -3 6 0" />
      </g>

      <path d="M0 148 Q60 118 130 136 T260 130 T400 122 V200 H0Z" fill="#6FB38F" opacity={0.9} />
      <path d="M0 162 Q90 134 180 154 T400 146 V200 H0Z" fill="#3F8F5F" />
      <g>
        <rect x={62} y={132} width={3} height={14} fill="#5B3A1A" />
        <circle cx={63.5} cy={130} r={9} fill="#2C6E46" />
        <rect x={352} y={128} width={3} height={14} fill="#5B3A1A" />
        <circle cx={353.5} cy={126} r={8} fill="#2C6E46" />
      </g>
      <path d="M0 178 Q200 150 400 172 V200 H0Z" fill="#E7B84A" />
      <g stroke="#CF9B2C" strokeWidth={1.5} fill="none" opacity={0.8}>
        <path d="M0 186 Q200 160 400 182" />
        <path d="M0 194 Q200 170 400 191" />
      </g>

      <Stalks x={-4} />
      <Stalks x={404} flip />
    </svg>
  )
}
