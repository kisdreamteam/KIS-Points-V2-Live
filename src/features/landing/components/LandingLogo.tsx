import Image from "next/image";

export default function LandingLogo() {
  return (
    <div className="relative overflow-visible">
      <Image
        src="/images/landing/landing-kis-logo.png"
        alt="kis-points-avatar"
        width={1}
        height={1}
        className="h-[clamp(4.5rem,10vw,9rem)] w-auto min-w-[80px] translate-y-[25%] w-auto scale-150"
      />
    </div>
  );
}
