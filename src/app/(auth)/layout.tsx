export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh grid place-items-center px-4 py-12">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
