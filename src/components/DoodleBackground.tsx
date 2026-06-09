"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface DoodleIconProps {
  strokeColor: string;
}

const TerminalIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <line x1="2" y1="7" x2="22" y2="7" />
    <circle cx="14" cy="4" r="1.2" />
    <circle cx="17" cy="4" r="1.2" />
    <circle cx="20" cy="4" r="1.2" />
    <line x1="4" y1="10" x2="10" y2="10" />
    <line x1="4" y1="13" x2="8" y2="13" />
    <line x1="4" y1="16" x2="12" y2="16" />
    <line x1="4" y1="19" x2="9" y2="19" />
  </svg>
);

const BracesIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M5 3c-1.5 1.5-2.5 4-2.5 7v4c0 3 1 5.5 2.5 7" />
    <path d="M19 3c1.5 1.5 2.5 4 2.5 7v4c0 3-1 5.5-2.5 7" />
    <circle cx="6" cy="5" r="1" />
    <circle cx="18" cy="5" r="1" />
    <circle cx="6" cy="19" r="1" />
    <circle cx="18" cy="19" r="1" />
  </svg>
);

const TagsIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M14 2l6 6-6 6" />
    <path d="M20 2l-6 6 6 6" />
    <line x1="3" y1="8" x2="15" y2="8" />
    <line x1="3" y1="12" x2="11" y2="12" />
    <line x1="3" y1="16" x2="9" y2="16" />
    <circle cx="13" cy="8" r="1" />
    <circle cx="17" cy="12" r="1" />
    <circle cx="15" cy="16" r="1" />
  </svg>
);

const CodeIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <rect x="2" y="2" width="20" height="20" rx="1" />
    <line x1="2" y1="6" x2="22" y2="6" />
    <line x1="2" y1="10" x2="18" y2="10" />
    <line x1="2" y1="14" x2="20" y2="14" />
    <line x1="2" y1="18" x2="16" y2="18" />
    <circle cx="8" cy="4" r="0.8" />
    <circle cx="10" cy="4" r="0.8" />
    <circle cx="12" cy="4" r="0.8" />
  </svg>
);

const DatabaseIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <ellipse cx="12" cy="5" rx="10" ry="3" />
    <path d="M2 5v5c0 2.5 2 5 5 5h10c3 0 5-2.5 5-5V5" />
    <path d="M2 10v5c0 2.5 2 5 5 5h10c3 0 5-2.5 5-5v-5" />
    <circle cx="7" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="17" cy="12" r="1.2" />
    <circle cx="9" cy="17" r="1.2" />
    <circle cx="15" cy="17" r="1.2" />
  </svg>
);

const ServerIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="14" x2="21" y2="14" />
    <circle cx="5" cy="6" r="1.2" />
    <circle cx="8" cy="6" r="1.2" />
    <circle cx="11" cy="6" r="1.2" />
    <circle cx="14" cy="6" r="1.2" />
    <circle cx="17" cy="6" r="1.2" />
    <rect x="5" y="11" width="5" height="2" rx="0.5" />
    <rect x="14" y="11" width="5" height="2" rx="0.5" />
    <rect x="7" y="16" width="10" height="2" rx="0.5" />
  </svg>
);

const CloudIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M18 10c-3.5 0-6 2.5-7 5s-3.5 5-3.5 8h13c0-3 1.5-5.5 3-7.5s1.5-4-1-5.5z" />
    <path d="M6 14c-2.5 0-4 2-4.5 4s1 4.5 3 4.5h5c0-2.5-1.5-4.5-3-6.5s-2-4-3-5.5z" />
    <circle cx="7" cy="11" r="1.5" />
    <circle cx="15" cy="8" r="1" />
    <circle cx="19" cy="10" r="1" />
  </svg>
);

const RocketIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="72" height="104" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M12 2v8" />
    <line x1="8" y1="4" x2="16" y2="4" />
    <rect x="5" y="10" width="14" height="11" rx="2" />
    <rect x="7" y="12" width="10" height="3" rx="1" />
    <path d="M12 21v3" />
    <path d="M10 22l2 3 2-3" />
    <path d="M8.5 21.5l-1.5 2.5" />
    <path d="M15.5 21.5l1.5 2.5" />
  </svg>
);

const PlanetIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 4c5 2 8 6 8 11" />
    <path d="M7 6c3 2 5 5 5 10" />
    <circle cx="13" cy="6" r="1.2" />
    <circle cx="7" cy="17" r="1" />
    <circle cx="17" cy="15" r="0.8" />
  </svg>
);

const CpuIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2.5" />
    <circle cx="5" cy="5" r="1.5" />
    <circle cx="19" cy="5" r="1.5" />
    <circle cx="5" cy="19" r="1.5" />
    <circle cx="19" cy="19" r="1.5" />
  </svg>
);

const GitBranchIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <circle cx="12" cy="5" r="3.5" />
    <circle cx="5" cy="19" r="3.5" />
    <circle cx="19" cy="19" r="3.5" />
    <line x1="12" y1="8.5" x2="12" y2="15.5" />
    <path d="M12 15.5c-5 0-7-2.5-7-5" />
    <path d="M12 15.5c5 0 7-2.5 7-5" />
    <circle cx="12" cy="5" r="1.2" />
    <circle cx="5" cy="19" r="1.2" />
    <circle cx="19" cy="19" r="1.2" />
  </svg>
);

const WifiIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M12 20c5 0 8.5-3.5 8.5-8s-3.5-8-8.5-8-8.5 3.5-8.5 8 3.5 8 8.5 8z" />
    <path d="M12 14c3 0 4.5-2 4.5-4.5s-1.5-4.5-4.5-4.5-4.5 2-4.5 4.5 1.5 4.5 4.5 4.5z" />
    <path d="M12 8c1.5 0 2-1 2-2.5s-0.5-2.5-2-2.5-2 1-2 2.5 0.5 2.5 2 2.5z" />
    <line x1="12" y1="20" x2="12" y2="24" />
  </svg>
);

const BotIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <circle cx="12" cy="6" r="5" />
    <rect x="4" y="11" width="16" height="11" rx="2" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="15" cy="5" r="1" />
    <path d="M9 8h6" />
    <rect x="6" y="13" width="4" height="3" rx="1" />
    <rect x="14" y="13" width="4" height="3" rx="1" />
    <rect x="8" y="18" width="8" height="2" rx="1" />
  </svg>
);

const GlobeIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M5.5 5.5l13 13" />
    <path d="M18.5 5.5l-13 13" />
    <path d="M4 12a8 8 0 0116 0" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const ZapIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M12 2L2 14h7l-2 8 10-12h-7l2-8z" />
    <circle cx="12" cy="6" r="1.5" />
  </svg>
);

const StarIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M12 2l3.5 8h8.5l-6.5 5 2 8.5-7.5-5-7.5 5 2-8.5-6.5-5h8.5z" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

const MoonIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    <circle cx="15" cy="8" r="0.8" />
    <circle cx="9" cy="11" r="0.6" />
    <circle cx="13" cy="14" r="0.8" />
    <circle cx="17" cy="13" r="0.5" />
    <circle cx="11" cy="16" r="0.6" />
  </svg>
);

const CoffeeIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M18 8h1a4 4 0 014 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a4 4 0 014-4h1" />
    <path d="M16 18a3 3 0 00-3-3H5a3 3 0 00-3 3v1a6 6 0 006 6h10a6 6 0 006-6v-1" />
    <path d="M11 8V6a3 3 0 016 0v2" />
  </svg>
);

const BookIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    <line x1="12" y1="19" x2="12" y2="5" />
    <line x1="2" y1="10" x2="8" y2="10" />
    <line x1="16" y1="10" x2="22" y2="10" />
    <line x1="2" y1="14" x2="8" y2="14" />
    <line x1="16" y1="14" x2="22" y2="14" />
  </svg>
);

const MusicIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
    <path d="M7 18a1 1 0 100-2 1 1 0 000 2z" />
    <path d="M19 16a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);

const CameraIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
    <circle cx="8.5" cy="12.5" r="0.5" />
    <circle cx="12" cy="13" r="1.5" />
  </svg>
);

const HeartIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    <circle cx="9" cy="9" r="1" />
    <circle cx="15" cy="9" r="1" />
  </svg>
);

const SmileIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="10" r="2" />
    <circle cx="16" cy="10" r="2" />
    <path d="M8 15c4 0 8 2 8 2s-4 2-8 2-8-2-8-2 4-2 8-2z" />
    <circle cx="8" cy="10" r="0.8" />
    <circle cx="16" cy="10" r="0.8" />
  </svg>
);

const GiftIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <rect x="3" y="12" width="18" height="10" rx="2" />
    <path d="M12 12V2l8 4-8 4z" />
    <path d="M12 12V2l-8 4 8 4z" />
    <line x1="12" y1="12" x2="12" y2="22" />
    <line x1="3" y1="17" x2="21" y2="17" />
    <circle cx="12" cy="17" r="1.5" />
  </svg>
);

const ShoppingBagIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
    <circle cx="8" cy="12" r="1" />
    <circle cx="16" cy="12" r="1" />
  </svg>
);

const UmbrellaIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 21l1.39-3.72A9.91 9.91 0 0112 3a9.91 9.91 0 018.61 5.28L21 21l-1.39-3.72A9.75 9.75 0 0112 21a9 9 0 019-9z" />
    <line x1="12" y1="21" x2="12" y2="3" />
    <circle cx="12" cy="3" r="1" />
    <path d="M8 6a1 1 0 100-2 1 1 0 000 2z" />
    <path d="M16 6a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);

const GlassesIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="72" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <circle cx="6" cy="12" r="4" />
    <circle cx="18" cy="12" r="4" />
    <line x1="10" y1="12" x2="14" y2="12" />
    <path d="M6 8c-2 0-3.5 1-3.5 2.5S4 13 6 13" />
    <path d="M18 8c2 0 3.5 1 3.5 2.5S20 13 18 13" />
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
  </svg>
);

const BikeIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="72" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <circle cx="5" cy="21" r="2" />
    <circle cx="19" cy="21" r="2" />
    <path d="M12 17a5 5 0 00-5-5H5a2 2 0 00-2 2v4a2 2 0 002 2h1a5 5 0 0010 0h1a2 2 0 002-2v-4a2 2 0 00-2-2h-1a5 5 0 00-5 5z" />
    <path d="M12 17l0-10" />
    <path d="M8 10l4-3 4 3" />
    <circle cx="5" cy="21" r="0.8" />
    <circle cx="19" cy="21" r="0.8" />
  </svg>
);

const PaletteIcon = ({ strokeColor }: DoodleIconProps) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.0">
    <circle cx="12" cy="12" r="10" />
    <circle cx="8" cy="8" r="2" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="14" cy="16" r="2" />
    <circle cx="18" cy="16" r="1" />
    <circle cx="6" cy="14" r="1.5" />
    <path d="M22 22a2 2 0 01-2 2H2a2 2 0 01-2-2v-2a2 2 0 012-2h20a2 2 0 012 2v2z" />
  </svg>
);

const DoodleIcons: Record<string, React.ComponentType<DoodleIconProps>> = {
  terminal: TerminalIcon,
  braces: BracesIcon,
  tags: TagsIcon,
  code: CodeIcon,
  database: DatabaseIcon,
  server: ServerIcon,
  cloud: CloudIcon,
  rocket: RocketIcon,
  planet: PlanetIcon,
  cpu: CpuIcon,
  gitBranch: GitBranchIcon,
  wifi: WifiIcon,
  bot: BotIcon,
  globe: GlobeIcon,
  zap: ZapIcon,
  star: StarIcon,
  moon: MoonIcon,
  coffee: CoffeeIcon,
  book: BookIcon,
  music: MusicIcon,
  camera: CameraIcon,
  heart: HeartIcon,
  smile: SmileIcon,
  gift: GiftIcon,
  shoppingBag: ShoppingBagIcon,
  umbrella: UmbrellaIcon,
  glasses: GlassesIcon,
  bike: BikeIcon,
  palette: PaletteIcon,
};

const iconList = Object.keys(DoodleIcons);

interface DoodleItem {
  id: number;
  icon: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

function generateDoodleItems(count: number): DoodleItem[] {
  const items: DoodleItem[] = [];
  const gridSize = 60;
  const cols = 35;
  const rows = 35;
  const usedCells = new Set<string>();
  
  const maxAttempts = count * 5;
  let attempts = 0;
  let placed = 0;
  
  while (placed < count && attempts < maxAttempts) {
    attempts++;
    
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    const cellKey = `${col}-${row}`;
    
    if (usedCells.has(cellKey)) continue;
    
    const hasAdjacent = [
      `${col-1}-${row}`, `${col+1}-${row}`,
      `${col}-${row-1}`, `${col}-${row+1}`,
    ].some(k => usedCells.has(k));
    
    const hasDiagonal = [
      `${col-1}-${row-1}`, `${col+1}-${row-1}`,
      `${col-1}-${row+1}`, `${col+1}-${row+1}`,
    ].some(k => usedCells.has(k));
    
    if (hasAdjacent && Math.random() > 0.35) continue;
    if (hasDiagonal && Math.random() > 0.55) continue;
    
    usedCells.add(cellKey);
    
    items.push({
      id: placed,
      icon: iconList[Math.floor(Math.random() * iconList.length)],
      x: col * gridSize + Math.random() * 12 - 6,
      y: row * gridSize + Math.random() * 12 - 6,
      rotation: Math.floor(Math.random() * 360),
      scale: 0.55 + Math.random() * 0.4,
    });
    
    placed++;
  }
  
  return items;
}

const doodleItems = generateDoodleItems(260);

export default function DoodleBackground() {
  const { isClient } = useTheme();
  // 使用CSS变量替代硬编码颜色
  const strokeColor = "var(--doodle-color, rgba(60, 80, 120, 0.12))";
  
  if (!isClient) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundColor: "var(--doodle-bg, #FFFFFF)" }} />
    );
  }

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        backgroundColor: "var(--doodle-bg, #FFFFFF)",
        transition: "background-color 0.3s ease",
      }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 2100 2100"
        preserveAspectRatio="xMidYMid slice"
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      >
        {doodleItems.map((item) => {
          const Icon = DoodleIcons[item.icon];
          if (!Icon) return null;
          
          return (
            <g
              key={item.id}
              transform={`translate(${item.x}, ${item.y}) rotate(${item.rotation}) scale(${item.scale})`}
            >
              <Icon strokeColor={strokeColor} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
