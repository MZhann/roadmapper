import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";
export const iconPaths = {
  calendar: "M4 5h16v16H4zM4 10h16M8 3v4M16 3v4",
  clock: "M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  back: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  down: "M6 9l6 6 6-6",
  close: "M6 6l12 12M18 6L6 18",
  arrow: "M5 12h14M13 6l6 6-6 6",
  up: "M12 19V5M6 11l6-6 6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  star: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z",
  path: "M6 20c0-5 12-4 12-9S8 8 8 4",
  journal: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM9 9h6M9 13h4",
  profile: "M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6",
  flame:
    "M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 2 2 2.5 2.5C12 8 12 5 12 3z",
  xp: "M13 2L4 14h7l-1 8 9-12h-7z",
  lock: "M8 11V8a4 4 0 0 1 8 0v3",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0",
  plus: "M12 5v14M5 12h14",
  sound: "M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7",
  tip: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  help: "M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5M12 16h0",
  camera: "M4 8h3l2-3h6l2 3h3v11H4z",
  mountain: "M4 20l6-12 4 7 2-3 4 8z",
  book: "M4 5h7v14H4zM13 5h7v14h-7zM6.5 9h2M15.5 9h2M15.5 12h2",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  image: "M21 16l-5-5-9 9",
  settings:
    "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1",
} as const;
export type IconName = keyof typeof iconPaths;
export function Icon({
  name,
  size = 24,
  color,
  stroke = 2.2,
  filled = false,
}: {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
  filled?: boolean;
}) {
  const { colors } = useTheme();
  const ink = color ?? colors.ink;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ink}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <Path d={iconPaths[name]} fill={filled ? ink : "none"} />
      {name === "path" && (
        <>
          <Circle cx={8} cy={4} r={1.5} />
          <Circle cx={6} cy={20} r={1.5} />
        </>
      )}
      {name === "profile" && <Circle cx={12} cy={8} r={4} />}
      {name === "lock" && <Rect x={5} y={11} width={14} height={9} rx={2} />}
      {name === "camera" && <Circle cx={12} cy={13} r={3.5} />}
      {name === "settings" && <Circle cx={12} cy={12} r={5} />}
      {name === "image" && (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={3} />
          <Circle cx={9} cy={10} r={2} />
        </>
      )}
    </Svg>
  );
}
