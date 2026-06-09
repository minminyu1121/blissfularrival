import ArrivalIcon from "@/components/icons/ArrivalIcon";

// 登入頁左側品牌面板 — 暖陶土漸層
export default function LoginBranding() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-accent-gradient">
      {/* 背景裝飾圓形 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
        <div className="absolute bottom-20 -right-16 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/5" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 px-10 pt-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm">
          <ArrivalIcon className="h-5 w-5" filled />
        </div>
        <span className="font-serif text-xl tracking-wide text-white">
          Blissful Arrival
        </span>
      </div>

      {/* 中央插畫 */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-10">
        <svg viewBox="0 0 200 260" fill="none" className="h-56 w-44 opacity-90">
          <circle cx="100" cy="52" r="28" fill="white" fillOpacity="0.25" />
          <circle cx="100" cy="52" r="22" fill="white" fillOpacity="0.35" />
          <rect x="78" y="82" width="44" height="70" rx="22" fill="white" fillOpacity="0.2" />
          <rect x="38" y="88" width="44" height="16" rx="8" fill="white" fillOpacity="0.3" transform="rotate(-50 60 96)" />
          <rect x="118" y="88" width="44" height="16" rx="8" fill="white" fillOpacity="0.3" transform="rotate(50 140 96)" />
          <rect x="72" y="148" width="20" height="72" rx="10" fill="white" fillOpacity="0.2" />
          <rect x="108" y="148" width="20" height="72" rx="10" fill="white" fillOpacity="0.2" />
          <circle cx="28" cy="60" r="3" fill="white" fillOpacity="0.7" />
          <circle cx="172" cy="55" r="2.5" fill="white" fillOpacity="0.6" />
          <path d="M155 38l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="white" fillOpacity="0.6" />
        </svg>
      </div>

      {/* 底部引言 */}
      <div className="relative z-10 px-10 pb-12">
        <p className="text-center font-serif text-lg leading-relaxed text-white/90">
          「進步不是直線，但每一步都算數。」
        </p>
        <p className="mt-6 text-xs text-white/50">
          Blissful Arrival v1.0 · 生活進度追蹤系統
        </p>
      </div>
    </div>
  );
}
