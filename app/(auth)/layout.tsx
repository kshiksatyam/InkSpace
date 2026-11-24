import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0c0c] px-4 py-12">
      <div className="w-full max-w-[440px]">{children}</div>
    </div>
  );
}
