"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Users, Building, FileText, FileCheck, Shield, Database, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function ManagerDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCitizens: 0,
    totalAdministrators: 0,
    totalGrantees: 0,
    totalDepartments: 0,
    totalServices: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalGrants: 0,
  })
  const [recentLogs, setRecentLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // Fetch users
        const citizensResponse = await directApi.manager.getCitizens()
        const adminsResponse = await directApi.manager.getAdministrators()
        const granteesResponse = await directApi.manager.getGrantees()

        // Fetch resources
        const departmentsResponse = await directApi.manager.getDepartments()
        const servicesResponse = await directApi.manager.getServices()
        const requestsResponse = await directApi.manager.getRequests()
        const grantsResponse = await directApi.manager.getGrants()

        // Fetch logs
        const citizenLogsResponse = await directApi.manager.getLogs.citizen()

        if (
          citizensResponse.ok &&
          adminsResponse.ok &&
          granteesResponse.ok &&
          departmentsResponse.ok &&
          servicesResponse.ok &&
          requestsResponse.ok &&
          grantsResponse.ok &&
          citizenLogsResponse.ok
        ) {
          const citizensData = await citizensResponse.json()
          const adminsData = await adminsResponse.json()
          const granteesData = await granteesResponse.json()
          const departmentsData = await departmentsResponse.json()
          const servicesData = await servicesResponse.json()
          const requestsData = await requestsResponse.json()
          const grantsData = await grantsResponse.json()
          const logsData = await citizenLogsResponse.json()

          // Calculate request stats
          const pendingRequests = requestsData.filter((req: any) => !req.Granted && !req.Decline).length
          const approvedRequests = requestsData.filter((req: any) => req.Granted && !req.Decline).length
          const rejectedRequests = requestsData.filter((req: any) => req.Decline).length

          setStats({
            totalCitizens: citizensData.length,
            totalAdministrators: adminsData.length,
            totalGrantees: granteesData.length,
            totalDepartments: departmentsData.length,
            totalServices: servicesData.length,
            totalRequests: requestsData.length,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            totalGrants: grantsData.length,
          })

          setRecentLogs(logsData.slice(0, 10))
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the site manager portal. Comprehensive system administration and oversight.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Citizens"
            value={stats.totalCitizens}
            description="Registered users"
            icon={<Users className="h-5 w-5 text-blue-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Total Administrators"
            value={stats.totalAdministrators}
            description="System administrators"
            icon={<Shield className="h-5 w-5 text-purple-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Total Grantees"
            value={stats.totalGrantees}
            description="Grant processors"
            icon={<Users className="h-5 w-5 text-amber-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Total Departments"
            value={stats.totalDepartments}
            description="System departments"
            icon={<Building className="h-5 w-5 text-emerald-500" />}
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatsCard
            title="Total Requests"
            value={stats.totalRequests}
            description="Service requests"
            icon={<FileText className="h-5 w-5 text-indigo-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests}
            description="Awaiting processing"
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Approved Requests"
            value={stats.approvedRequests}
            description="Approved requests"
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Rejected Requests"
            value={stats.rejectedRequests}
            description="Rejected requests"
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            isLoading={isLoading}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Services"
            value={stats.totalServices}
            description="Available services"
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Total Grants"
            value={stats.totalGrants}
            description="Processed grants"
            icon={<FileCheck className="h-5 w-5 text-green-500" />}
            isLoading={isLoading}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent System Logs</CardTitle>
              <CardDescription>Latest activities in the system</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/manager/logs">View All Logs</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-2 py-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 border-b border-slate-200 dark:border-slate-800 py-3 last:border-0"
                  >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                      <Database className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {log.Method} {log.Object}
                      </p>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 space-x-2">
                        <span>{log.Citizen?.UserName || "Unknown User"}</span>
                        <span>•</span>
                        <span>{new Date(log.Created).toLocaleString()}</span>
                        {log.IpAddress && (
                          <>
                            <span>•</span>
                            <span>{log.IpAddress}</span>
                          </>
                        )}
                      </div>
                      {log.Message && <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{log.Message}</p>}
                      {log.RecordId && log.RecordId !== "n/a" && (
                        <p className="text-xs mt-1 text-slate-400">Record ID: {log.RecordId}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400">No recent logs found</p>
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
  isLoading,
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  isLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-1"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
