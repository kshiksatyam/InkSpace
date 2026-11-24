import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0c0c] px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#444] font-semibold mb-4">
        404
      </p>
      <h1 className="text-4xl font-bold text-[#efefef] tracking-tight mb-3">
        Page not found
      </h1>
      <p className="text-sm text-[#555] mb-8 max-w-xs leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold bg-[#E8C97A] hover:bg-[#dabb65] text-[#0c0c0c] px-6 py-2.5 rounded transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
