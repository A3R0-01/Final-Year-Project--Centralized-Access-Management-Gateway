"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Users, FileText, FileCheck, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

// Helper function to safely format currency
const formatCurrency = (amount: any): string => {
  // Check if amount is undefined, null, or not a number
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "$0.00"
  }
  return `$${Number(amount).toFixed(2)}`
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

export default function GranteeDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCitizens: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalGrants: 0,
    activeGrants: 0,
  })
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [recentGrants, setRecentGrants] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch citizens
        const citizensResponse = await directApi.grantee.getCitizens()

        // Fetch requests
        const requestsResponse = await directApi.grantee.getRequests()

        // Fetch grants
        const grantsResponse = await directApi.grantee.getGrants()

        if (citizensResponse.ok && requestsResponse.ok && grantsResponse.ok) {
          const citizensData = await citizensResponse.json()
          const requestsData = await requestsResponse.json()
          const grantsData = await grantsResponse.json()

          // Calculate request stats
          const pendingRequests = requestsData.filter((req: any) => !req.Granted && !req.Decline).length
          const approvedRequests = requestsData.filter((req: any) => req.Granted && !req.Decline).length
          const rejectedRequests = requestsData.filter((req: any) => req.Decline).length

          // Calculate grant stats
          const activeGrants = grantsData.filter((grant: any) => grant.Granted && !grant.Decline).length

          setStats({
            totalCitizens: citizensData.length,
            totalRequests: requestsData.length,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            totalGrants: grantsData.length,
            activeGrants,
          })

          // Get the most recent pending requests
          const pendingRequestsList = requestsData
            .filter((req: any) => !req.Granted && !req.Decline)
            .sort((a: any, b: any) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
            .slice(0, 5)

          setRecentRequests(pendingRequestsList)
          setRecentGrants(grantsData.slice(0, 5))
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-slate-500" />
    }
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grantee Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the grantee portal. Process citizen requests and manage grants.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <StatsCard
            title="Total Citizens"
            value={stats.totalCitizens}
            description="Registered users"
            icon={<Users className="h-5 w-5 text-blue-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Total Requests"
            value={stats.totalRequests}
            description="All service requests"
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
          <StatsCard
            title="Total Grants"
            value={stats.totalGrants}
            description="All processed grants"
            icon={<FileCheck className="h-5 w-5 text-emerald-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Active Grants"
            value={stats.activeGrants}
            description="Currently active"
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            isLoading={isLoading}
          />
        </div>

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
            <TabsTrigger value="grants">Recent Grants</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Pending Requests</h2>
              <Button asChild size="sm">
                <Link href="/grantee/requests">View All</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentRequests.length > 0 ? (
              <div className="space-y-2">
                {recentRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{request.service_name || "Service Request"}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            From: {request.citizen_name || "Citizen"} • Submitted on{" "}
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/grantee/requests/${request.id}`}>Process</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No pending requests found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="grants" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Grants</h2>
              <Button asChild size="sm">
                <Link href="/grantee/grants">View All</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentGrants.length > 0 ? (
              <div className="space-y-2">
                {recentGrants.map((grant) => (
                  <Card key={grant.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{grant.title || "Grant"}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            To: {grant.citizen_name || "Citizen"} • Awarded on{" "}
                            {new Date(grant.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{formatCurrency(grant.amount)}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              grant.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {grant.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No grants found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
