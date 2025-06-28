import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function GrantDetailLoading() {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
