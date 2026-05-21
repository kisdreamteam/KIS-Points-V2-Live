export default function AuthSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        h-screen w-screen flex flex-row items-center justify-center
        bg-brand-purple font-spartan relative
      "
    >
      {children}
    </div>
  );
}
