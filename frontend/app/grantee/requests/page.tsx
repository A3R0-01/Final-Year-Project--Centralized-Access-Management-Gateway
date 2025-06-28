"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { FileText, Search, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function GranteeRequestsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    let filtered = [...requests]

    // Filter by status if not "all"
    if (activeTab !== "all") {
      filtered = filtered.filter((request) => {
        if (activeTab === "pending") return !request.Granted && !request.Decline
        if (activeTab === "approved") return request.Granted && !request.Decline
        if (activeTab === "rejected") return request.Decline
        return true
      })
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (request) =>
          request.Subject?.toLowerCase().includes(query) ||
          request.Message?.toLowerCase().includes(query) ||
          request.PublicService?.Title?.toLowerCase().includes(query) ||
          request.Citizen?.UserName?.toLowerCase().includes(query) ||
          request.Citizen?.Email?.toLowerCase().includes(query),
      )
    }

    setFilteredRequests(filtered)
  }, [searchQuery, activeTab, requests])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.grantee.getRequests()
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
        setFilteredRequests(data.filter((request) => !request.Granted && !request.Decline))
      } else {
        throw new Error("Failed to fetch requests")
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast({
        title: "Error",
        description: "Failed to load requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (request: any) => {
    if (request.Decline) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Rejected
        </Badge>
      )
    } else if (request.Granted) {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Approved
        </Badge>
      )
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        >
          <Clock className="h-3.5 w-3.5 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Requests</h1>
            <p className="text-muted-foreground">Process and manage citizen service requests</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Requests"
                    : activeTab === "pending"
                      ? "Pending Requests"
                      : activeTab === "approved"
                        ? "Approved Requests"
                        : "Rejected Requests"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "all"
                    ? "View all service requests"
                    : activeTab === "pending"
                      ? "Requests awaiting your approval or rejection"
                      : activeTab === "approved"
                        ? "Requests that have been approved"
                        : "Requests that have been rejected"}
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
                ) : filteredRequests.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Citizen</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.Subject}</TableCell>
                            <TableCell>{request.Citizen?.UserName || "Unknown"}</TableCell>
                            <TableCell>{request.PublicService?.Title || "Unknown"}</TableCell>
                            <TableCell>{new Date(request.Created).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(request)}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/grantee/requests/${request.id}`}>
                                  {!request.Granted && !request.Decline ? "Process" : "View Details"}
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No requests found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      {searchQuery
                        ? "No requests match your search criteria. Try a different search term."
                        : `There are no ${activeTab !== "all" ? activeTab + " " : ""}requests in the system yet.`}
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
