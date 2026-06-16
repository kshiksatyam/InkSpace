import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for single post view.
 */
export default function PostLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Skeleton className="h-10 w-3/4 mb-4" />
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-64 w-full rounded-lg mt-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
