import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the main feed page.
 */
export default function MainLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex gap-8">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab skeleton */}
          <Skeleton className="h-10 w-56 rounded-lg" />

          {/* Post card skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block w-72 shrink-0 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
