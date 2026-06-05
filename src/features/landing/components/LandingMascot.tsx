import Image from 'next/image'

export default function LandingMascot() {
  return (
    <div className="flex
                        w-[clamp(3.5rem,70dvw,40rem)]
                        sm:w-[clamp(3.5rem,35dvw,40rem)]
                        md:w-[clamp(3.5rem,30dvw,40rem)] h-auto
                        bg-brand-cream rounded-4xl drop-shadow-lg">
      <Image
        src="/images/landing/landing-mascot.png"
        alt="Friendly character with yellow crown and cheerful pose"
        width={1}
        height={1}
        priority
        className="w-full h-auto object-cover scale-105 drop-shadow-lg"
      />
    </div>
  )
}
