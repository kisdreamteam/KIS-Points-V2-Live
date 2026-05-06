import Image from 'next/image'

export default function LandingMascot() {
  return (
    <div className="flex items-center justify-center">
      <div className="bg-brand-cream relative h-150 w-150 rounded-2xl p-8 drop-shadow-lg">
        <Image
          src="/images/landing/landing-mascot.png"
          alt="Friendly character with yellow crown and cheerful pose"
          width={600}
          height={600}
          priority
          className="absolute -top-8 left-5 h-auto w-full object-cover drop-shadow-lg"
        />
      </div>
    </div>
  )
}
