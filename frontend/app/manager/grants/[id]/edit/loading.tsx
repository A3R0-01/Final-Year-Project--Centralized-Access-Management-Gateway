import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EditGrantLoading() {
  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
