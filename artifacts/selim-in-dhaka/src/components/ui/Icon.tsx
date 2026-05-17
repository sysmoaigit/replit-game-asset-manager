import { CSSProperties, ReactElement } from "react";

// Unified inline-SVG icon set. 24x24 viewBox, strokeWidth 1.75, currentColor.
// Used for stat bars and chrome where emoji rendered inconsistently across
// platforms. Emoji is still fine for narrative flair.

export type IconName =
  | "heart" | "smile" | "brain" | "bolt" | "star"
  | "smoke" | "flame" | "shield" | "pinky" | "ribbon"
  | "briefcase" | "handshake" | "fog" | "link" | "moon"
  | "fever" | "money" | "back" | "menu" | "trophy"
  | "play" | "pause" | "save" | "speaker" | "speaker-mute"
  | "spark" | "warning" | "info";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

const PATHS: Record<IconName, ReactElement> = {
  heart: (
    <path d="M12 20s-7-4.35-9.5-9C0.8 7.5 3.2 4 6.5 4c2 0 3.5 1.2 5.5 3.5C13.5 5.2 15.5 4 17.5 4 20.8 4 23.2 7.5 21.5 11 19 15.65 12 20 12 20Z" />
  ),
  smile: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14c1.2 1.6 2.8 2.4 4 2.4s2.8-.8 4-2.4" />
      <circle cx="9" cy="10" r="0.9" fill="currentColor" />
      <circle cx="15" cy="10" r="0.9" fill="currentColor" />
    </g>
  ),
  brain: (
    <path d="M9 4a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10v2a3 3 0 0 0 1.5 2.6V17a3 3 0 0 0 4 2.8A3 3 0 0 0 12 21a3 3 0 0 0 2.5-1.2A3 3 0 0 0 18.5 17v-2.4A3 3 0 0 0 20 12v-2a3 3 0 0 0-2-2.5V7a3 3 0 0 0-3-3 3 3 0 0 0-3 1.5A3 3 0 0 0 9 4Zm3 3v13" />
  ),
  bolt: (
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  ),
  star: (
    <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6.1L12 16.7 6.6 19.6l1.2-6.1L3.3 9.3l6.1-.7L12 3Z" />
  ),
  smoke: (
    <g>
      <rect x="3" y="14" width="18" height="3" rx="1" />
      <path d="M16 11c0-1.5-1-2.5-1-4s1-2.5 1-4M19 11c0-1.5-1-2.5-1-4s1-2.5 1-4" />
    </g>
  ),
  flame: (
    <path d="M12 22c4 0 7-3 7-7 0-3.5-3-5-3-9 0 0-2 1-2 4-1-1-2-3-2-6 0 0-7 3-7 11 0 4 3 7 7 7Z" />
  ),
  shield: (
    <path d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6l-8-3Z" />
  ),
  pinky: (
    <g>
      <path d="M12 21s-7-4.35-9.5-9C0.8 8.5 3.2 5 6.5 5c2 0 3.5 1.2 5.5 3.5C13.5 6.2 15.5 5 17.5 5 20.8 5 23.2 8.5 21.5 12 19 16.65 12 21 12 21Z" />
      <circle cx="12" cy="11" r="1.4" fill="currentColor" />
    </g>
  ),
  ribbon: (
    <g>
      <path d="M12 8c-2-3-5-3-6.5-1.5S5 11 7 12l5 3 5-3c2-1 3-4 1.5-5.5S14 5 12 8Z" />
      <path d="m9 14-3 6 4-1 2 3 2-3 4 1-3-6" />
    </g>
  ),
  briefcase: (
    <g>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </g>
  ),
  handshake: (
    <path d="M3 12 7 8l3 3 4-4 7 6-3 3-4-4-2 2 2 2-2 2-2-2-2 2-2-2 1-1-3-3Z" />
  ),
  fog: (
    <g>
      <path d="M3 9h12M5 13h14M3 17h11" />
    </g>
  ),
  link: (
    <path d="M9 15a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-2 2M15 9a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6-6l2-2" />
  ),
  moon: (
    <path d="M21 14a9 9 0 0 1-11-11 9 9 0 1 0 11 11Z" />
  ),
  fever: (
    <g>
      <path d="M10 4v10a3 3 0 1 0 4 0V4a2 2 0 1 0-4 0Z" />
      <path d="M12 17v.01" />
    </g>
  ),
  money: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9c-.7-1-1.8-1.5-3-1.5S9.7 8 9 9c-.7 1-.5 2.3.7 3l3.6 1.5c1.2.7 1.4 2 .7 3-.7 1-1.8 1.5-3 1.5S8.7 17.5 8 16.5M12 6v12" />
    </g>
  ),
  back: (
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  ),
  menu: (
    <g>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </g>
  ),
  trophy: (
    <g>
      <path d="M8 4h8v5a4 4 0 1 1-8 0V4Z" />
      <path d="M5 4h3v3a3 3 0 0 1-3-3ZM19 4h-3v3a3 3 0 0 0 3-3ZM10 17h4v3h-4zM8 20h8" />
    </g>
  ),
  play: (
    <path d="M7 4v16l13-8L7 4Z" fill="currentColor" stroke="none" />
  ),
  pause: (
    <g>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </g>
  ),
  save: (
    <g>
      <path d="M5 5h11l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 5v4h6V5M7 19v-6h10v6" />
    </g>
  ),
  speaker: (
    <g>
      <path d="M4 9v6h3l5 4V5L7 9H4Z" />
      <path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" />
    </g>
  ),
  "speaker-mute": (
    <g>
      <path d="M4 9v6h3l5 4V5L7 9H4Z" />
      <path d="m16 9 5 6m0-6-5 6" />
    </g>
  ),
  spark: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l3 3M15.5 15.5l3 3M5.5 18.5l3-3M15.5 8.5l3-3" />
  ),
  warning: (
    <g>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v5M12 17v.01" />
    </g>
  ),
  info: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v.01M11 12h1v5h1" />
    </g>
  ),
};

export default function Icon({
  name,
  size = 18,
  className = "",
  style,
  title,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block flex-shrink-0 ${className}`}
      style={style}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-icon={name}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}
