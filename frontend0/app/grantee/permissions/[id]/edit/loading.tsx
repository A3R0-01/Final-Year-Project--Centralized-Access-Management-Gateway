import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditPermissionLoading() {
  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/grantee/permissions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Permission</h1>
        </div>

        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
              <div className="h-72 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
