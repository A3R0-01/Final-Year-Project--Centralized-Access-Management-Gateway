"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import {
  Users,
  Building,
  FileText,
  FileCheck,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DashboardStats {
  totalCitizens: number
  totalGrantees: number
  totalDepartments: number
  totalAssociations: number
  totalServices: number
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  totalGrants: number
}

interface LogEntry {
  id: string
  Citizen: {
    UserName: string
  }
  Method: string
  Object: string
  Message: string
  Created: string
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCitizens: 0,
    totalGrantees: 0,
    totalDepartments: 0,
    totalAssociations: 0,
    totalServices: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalGrants: 0,
  })
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [
          citizensResponse,
          granteesResponse,
          departmentsResponse,
          associationsResponse,
          servicesResponse,
          requestsResponse,
          grantsResponse,
          logsResponse,
        ] = await Promise.all([
          directApi.admin.getCitizens(),
          directApi.admin.getGrantees(),
          directApi.admin.getDepartments(),
          directApi.admin.getAssociations(),
          directApi.admin.getServices(),
          directApi.admin.getRequests(),
          directApi.admin.getGrants(),
          directApi.admin.getLogs.citizen(),
        ])

        // Check if all requests were successful
        if (!citizensResponse.ok) {
          throw new Error("Failed to fetch citizens data")
        }
        if (!granteesResponse.ok) {
          throw new Error("Failed to fetch grantees data")
        }
        if (!departmentsResponse.ok) {
          throw new Error("Failed to fetch departments data")
        }
        if (!associationsResponse.ok) {
          throw new Error("Failed to fetch associations data")
        }
        if (!servicesResponse.ok) {
          throw new Error("Failed to fetch services data")
        }
        if (!requestsResponse.ok) {
          throw new Error("Failed to fetch requests data")
        }
        if (!grantsResponse.ok) {
          throw new Error("Failed to fetch grants data")
        }

        // Parse the data
        const citizensData = await citizensResponse.json()
        const granteesData = await granteesResponse.json()
        const departmentsData = await departmentsResponse.json()
        const associationsData = await associationsResponse.json()
        const servicesData = await servicesResponse.json()
        const requestsData = await requestsResponse.json()
        const grantsData = await grantsResponse.json()

        // Calculate request statistics
        const pendingRequests = requestsData.filter((req: any) => {
          // A request is pending if it has no grant or the grant is not processed
          return !req.grant || (!req.grant.Granted && !req.grant.Decline)
        }).length

        const approvedRequests = requestsData.filter((req: any) => {
          return req.grant && req.grant.Granted && !req.grant.Decline
        }).length

        const rejectedRequests = requestsData.filter((req: any) => {
          return req.grant && req.grant.Decline
        }).length

        setStats({
          totalCitizens: citizensData.length,
          totalGrantees: granteesData.length,
          totalDepartments: departmentsData.length,
          totalAssociations: associationsData.length,
          totalServices: servicesData.length,
          totalRequests: requestsData.length,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalGrants: grantsData.length,
        })

        // Handle logs (optional, might fail)
        if (logsResponse.ok) {
          const logsData = await logsResponse.json()
          setRecentLogs(logsData.slice(0, 10))
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Failed to load dashboard data")
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const handleRefresh = () => {
    window.location.reload()
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
            <p className="text-muted-foreground">Manage your department and oversee system operations</p>
          </div>
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
            <p className="text-muted-foreground">Manage your department and oversee system operations</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Citizens"
            value={stats.totalCitizens}
            description="Registered users"
            icon={<Users className="h-5 w-5 text-blue-500" />}
            href="/admin/citizens"
          />
          <StatsCard
            title="Total Grantees"
            value={stats.totalGrantees}
            description="Grant processors"
            icon={<Shield className="h-5 w-5 text-emerald-500" />}
            href="/admin/grantees"
          />
          <StatsCard
            title="Departments"
            value={stats.totalDepartments}
            description="System departments"
            icon={<Building className="h-5 w-5 text-purple-500" />}
            href="/admin/departments"
          />
          <StatsCard
            title="Associations"
            value={stats.totalAssociations}
            description="Department associations"
            icon={<Building className="h-5 w-5 text-indigo-500" />}
            href="/admin/associations"
          />
        </div>

        {/* Services and Requests Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Services"
            value={stats.totalServices}
            description="Available services"
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            href="/admin/services"
          />
          <StatsCard
            title="Total Requests"
            value={stats.totalRequests}
            description="Service requests"
            icon={<FileText className="h-5 w-5 text-gray-500" />}
            href="/admin/requests"
          />
          <StatsCard
            title="Total Grants"
            value={stats.totalGrants}
            description="Processed grants"
            icon={<FileCheck className="h-5 w-5 text-green-500" />}
            href="/admin/grants"
          />
        </div>

        {/* Request Status Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests}
            description="Awaiting processing"
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            href="/admin/requests?status=pending"
          />
          <StatsCard
            title="Approved Requests"
            value={stats.approvedRequests}
            description="Successfully approved"
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            href="/admin/requests?status=approved"
          />
          <StatsCard
            title="Rejected Requests"
            value={stats.rejectedRequests}
            description="Declined requests"
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            href="/admin/requests?status=rejected"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
              <CardDescription>Latest activities in the system</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/logs">View All Logs</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 border-b border-slate-200 dark:border-slate-800 py-3 last:border-0"
                  >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{log.Message}</p>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 space-x-2">
                        <span>{log.Citizen?.UserName || "System"}</span>
                        <span>•</span>
                        <span>
                          {log.Method} {log.Object}
                        </span>
                        <span>•</span>
                        <span>{new Date(log.Created).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400">No recent activity found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function StatsCard({
  title,
  value,
  description,
  icon,
  href,
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  href?: string
}) {
  const CardWrapper = href ? Link : "div"

  return (
    <CardWrapper href={href || ""} className={href ? "block" : ""}>
      <Card className={href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </CardWrapper>
  )
}
