import Image from "next/image";

export default function LandingLogo() {
  return (
    <div
      className="absolute bottom-8 translate-y-1/2 right-12 w-70 h-70 flex items-center justify-center overflow-hidden"
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
