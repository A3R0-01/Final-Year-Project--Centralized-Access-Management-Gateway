import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditDepartmentLoading() {
  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-48" />
        </div>

        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>

            <div className="space-y-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
