import Image from 'next/image'

export default function LandingMascot() {
  return (
    <div className="flex justify-center md:justify-end">
      <div className="bg-brand-cream h-75 md:h-150 w-75 md:w-150 rounded-2xl drop-shadow-lg">
        <Image
          src="/images/landing/landing-mascot.png"
          alt="Friendly character with yellow crown and cheerful pose"
          width={600}
          height={600}
          priority
          className="absolute md:-top-8 md:left-5 -top-3 left-1 h-auto w-75 md:w-full object-cover drop-shadow-lg"
        />
      </div>
    </div>
  )
}
