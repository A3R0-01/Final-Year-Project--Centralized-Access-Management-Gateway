import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function GranteeGrantEditLoading() {
  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </DashboardLayout>
  )
}
