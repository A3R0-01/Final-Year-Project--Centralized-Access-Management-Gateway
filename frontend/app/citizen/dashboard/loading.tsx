import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function CitizenDashboardLoading() {
  return (
    <DashboardLayout role="citizen">
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
        </div>

        <div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-2">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
