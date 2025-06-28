import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ManagerSettingsLoading() {
  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-32 mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
