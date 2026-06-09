// 到達終點圖示 — 路程曲線通往終點旗幟
interface ArrivalIconProps {
  className?: string;
  /** 實心填滿（用於深色/漸層背景） */
  filled?: boolean;
}

export default function ArrivalIcon({
  className = "h-4 w-4",
  filled = false,
}: ArrivalIconProps) {
  const stroke = filled ? "white" : "currentColor";

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* 路程曲線 */}
      <path
        d="M3.5 18.5 C8 13.5 11.5 15.5 14 11.5"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* 旗桿 */}
      <path
        d="M15.5 19 V7.5"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* 終點旗幟 */}
      <path
        d="M15.5 7.5 L20.5 10 L15.5 12.5 Z"
        fill={filled ? stroke : "none"}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
