import Image from "next/image";

export default function LandingMascot() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-brand-cream rounded-2xl p-8 w-[650px] h-[650px] relative drop-shadow-lg">
        <Image
          src="/images/landing/landing-mascot.png"
          alt="Friendly character with yellow crown and cheerful pose"
          width={1000}
          height={1000}
          priority
          className="absolute translate-x-1/8 max-w-[500px] w-full h-auto object-cover scale-145 drop-shadow-lg"
          style={{ top: "calc(0% + -30px)" }}
        />
      </div>
    </div>
  );
}
