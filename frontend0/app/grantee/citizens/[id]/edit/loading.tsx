import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EditCitizenPasswordLoading() {
  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-2">
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-80 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40 animate-pulse"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
