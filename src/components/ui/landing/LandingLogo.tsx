import Image from "next/image";

export default function LandingLogo() {
  return (
    <div
      className="     
      absolute right-5 md:right-12 -bottom-14 md:-bottom-27  
      w-35 md:w-70 h-35 md:h-70   
      flex items-center justify-center
      overflow-hidden"
    // Position & Layout: (absolute, top, z-index, display)
    // Box Model (Sizing): (w, h, aspect)
    // Spacing: (m, p) — Note: Not usually needed on absolute elements.
    // Internal Alignment: (flex,items-center, justify-center, gap
    // Visuals & Borders: (bg, rounded, shadow, overflow)
    // Typography: (text, font, leading)    
    >
      <Image
        src="/images/landing/landing-kis-logo.png"
        alt="kis-points-avatar"
        width={200}
        height={200}
        className="w-full h-full object-cover drop-shadow-lg"
      />
    </div>
  );
}
