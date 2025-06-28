"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { FileCheck, Search, CheckCircle, XCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { directApi } from "@/lib/api-direct"

export default function ManagerGrantsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [grants, setGrants] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGrants, setFilteredGrants] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchGrants()
  }, [])

  useEffect(() => {
    let filtered = [...grants]

    // Filter by status if not "all"
    if (activeTab !== "all") {
      filtered = filtered.filter((grant) => {
        if (activeTab === "active") {
          return grant.Granted && !grant.Decline && (!grant.EndDate || new Date(grant.EndDate) >= new Date())
        }
        if (activeTab === "declined") return grant.Decline
        if (activeTab === "expired") {
          return grant.Granted && !grant.Decline && grant.EndDate && new Date(grant.EndDate) < new Date()
        }
        return true
      })
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (grant) =>
          grant.Message?.toLowerCase().includes(query) ||
          grant.Request?.Subject?.toLowerCase().includes(query) ||
          grant.Request?.PublicService?.Title?.toLowerCase().includes(query) ||
          grant.Request?.Citizen?.UserName?.toLowerCase().includes(query) ||
          grant.Request?.Citizen?.Email?.toLowerCase().includes(query),
      )
    }

    setFilteredGrants(filtered)
  }, [searchQuery, activeTab, grants])

  const fetchGrants = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.manager.getGrants()
      if (response.ok) {
        const data = await response.json()
        setGrants(data)
        setFilteredGrants(data)
      } else {
        throw new Error("Failed to fetch grants")
      }
    } catch (error) {
      console.error("Error fetching grants:", error)
      toast({
        title: "Error",
        description: "Failed to load grants. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (grant: any) => {
    if (grant.Decline) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Declined
        </Badge>
      )
    } else if (grant.Granted) {
      if (grant.EndDate && new Date(grant.EndDate) < new Date()) {
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Expired
          </Badge>
        )
      }
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Active
        </Badge>
      )
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        >
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grants</h1>
            <p className="text-muted-foreground">Manage and monitor grants issued to citizens</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search grants..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Grants</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Grants"
                    : activeTab === "active"
                      ? "Active Grants"
                      : activeTab === "declined"
                        ? "Declined Grants"
                        : "Expired Grants"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "all"
                    ? "View all grants in the system"
                    : activeTab === "active"
                      ? "Grants that are currently active"
                      : activeTab === "declined"
                        ? "Grants that have been declined"
                        : "Grants that have expired"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    ))}
                  </div>
                ) : filteredGrants.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request</TableHead>
                          <TableHead>Citizen</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGrants.map((grant) => (
                          <TableRow key={grant.id}>
                            <TableCell className="font-medium">{grant.Request?.Subject || "Unknown"}</TableCell>
                            <TableCell>{grant.Request?.Citizen?.UserName || "Unknown"}</TableCell>
                            <TableCell>{grant.Request?.PublicService?.Title || "Unknown"}</TableCell>
                            <TableCell>
                              {grant.StartDate ? new Date(grant.StartDate).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>
                              {grant.EndDate ? new Date(grant.EndDate).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell>{getStatusBadge(grant)}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/manager/grants/${grant.id}`}>View Grant</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileCheck className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No grants found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      {searchQuery
                        ? "No grants match your search criteria. Try a different search term."
                        : `There are no ${activeTab !== "all" ? activeTab + " " : ""}grants in the system yet.`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
