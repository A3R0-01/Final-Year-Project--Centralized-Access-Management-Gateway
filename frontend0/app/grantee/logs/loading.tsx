import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function GranteeLogsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
