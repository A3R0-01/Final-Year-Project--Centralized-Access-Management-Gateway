import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function AdminPermissionsLoading() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </DashboardLayout>
  )
}
