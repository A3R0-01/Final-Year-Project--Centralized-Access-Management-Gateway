"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { FileCheck, Clock, CheckCircle, XCircle, FileText } from "lucide-react"
import Link from "next/link"
import { directApi } from "@/lib/api-direct"

export default function CitizenDashboard() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
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
    async function fetchDashboardData() {
      try {
        // Fetch requests
        const requestsResponse = await directApi.citizen.getRequests()
        if (!requestsResponse.ok) {
          throw new Error("Failed to fetch requests")
        }

        const requestsData = await requestsResponse.json()
        setRecentRequests(requestsData.slice(0, 5))

        // Calculate request stats
        const pendingRequests = requestsData.filter((req: any) => !req.Granted && !req.Decline).length
        const approvedRequests = requestsData.filter((req: any) => req.Granted && !req.Decline).length
        const rejectedRequests = requestsData.filter((req: any) => req.Decline).length

        // Fetch grants
        const grantsResponse = await directApi.citizen.getGrants()
        if (!grantsResponse.ok) {
          throw new Error("Failed to fetch grants")
        }

        const grantsData = await grantsResponse.json()
        setRecentGrants(grantsData.slice(0, 5))

        // Calculate grant stats
        const activeGrants = grantsData.filter((grant: any) => grant.Granted && !grant.Decline).length

        setStats({
          totalRequests: requestsData.length,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalGrants: grantsData.length,
          activeGrants,
        })
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

  // Helper function to safely format currency
  const formatCurrency = (amount: any) => {
    // Check if amount exists and is a number
    if (amount !== undefined && amount !== null) {
      // Convert to number if it's a string
      const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

      // Check if it's a valid number
      if (!isNaN(numAmount)) {
        return `$${numAmount.toFixed(2)}`
      }
    }

    // Return a default value if amount is undefined or not a number
    return "$0.00"
  }

  const getStatusIcon = (request: any) => {
    if (request.Decline) {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else if (request.Granted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  const getStatusText = (request: any) => {
    if (request.Decline) {
      return "Rejected"
    } else if (request.Granted) {
      return "Approved"
    } else {
      return "Pending"
    }
  }

  return (
    <DashboardLayout role="citizen">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citizen Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your citizen portal. Manage your requests and grants.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Requests"
            value={stats.totalRequests}
            description="All service requests"
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Pending Requests"
            value={stats.pendingRequests}
            description="Awaiting approval"
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            isLoading={isLoading}
          />
          <StatsCard
            title="Total Grants"
            value={stats.totalGrants}
            description="All received grants"
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
            <TabsTrigger value="requests">Recent Requests</TabsTrigger>
            <TabsTrigger value="grants">Recent Grants</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Requests</h2>
              <Button asChild size="sm">
                <Link href="/citizen/requests">View All</Link>
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
                          <h3 className="font-medium">{request.Subject || "Service Request"}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Submitted on {new Date(request.Created).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request)}
                          <span className="capitalize">{getStatusText(request)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No requests found</p>
                  <Button asChild className="mt-4">
                    <Link href="/citizen/services">Browse Services</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="grants" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Grants</h2>
              <Button asChild size="sm">
                <Link href="/citizen/grants">View All</Link>
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
                          <h3 className="font-medium">{grant.Message || "Grant"}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Awarded on {new Date(grant.Created).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{formatCurrency(grant.Amount)}</span>
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
