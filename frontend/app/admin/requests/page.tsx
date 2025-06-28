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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

export default function AdminRequestsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      const response = await directApi.admin.getRequests()
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
        setFilteredRequests(data)
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

  const handleDeleteRequest = async (requestId: string) => {
    setDeletingId(requestId)
    try {
      const response = await directApi.admin.deleteRequest(requestId)
      if (response.ok) {
        toast({
          title: "Success",
          description: "Request deleted successfully.",
        })
        // Remove the deleted request from the local state
        setRequests((prev) => prev.filter((request) => request.id !== requestId))
        setFilteredRequests((prev) => prev.filter((request) => request.id !== requestId))
      } else {
        throw new Error("Failed to delete request")
      }
    } catch (error) {
      console.error("Error deleting request:", error)
      toast({
        title: "Error",
        description: "Failed to delete request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Requests</h1>
            <p className="text-muted-foreground">View and monitor service requests for your department</p>
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

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
                    ? "View all service requests for your department"
                    : activeTab === "pending"
                      ? "Requests awaiting approval or rejection"
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
                            <TableCell>
                              {request.Citizen ? (
                                <div>
                                  <div className="font-medium">{request.Citizen.UserName}</div>
                                  <div className="text-sm text-muted-foreground">{request.Citizen.Email}</div>
                                </div>
                              ) : (
                                "Unknown"
                              )}
                            </TableCell>
                            <TableCell>
                              {request.PublicService ? (
                                <div>
                                  <div className="font-medium">{request.PublicService.Title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {request.PublicService.MachineName}
                                  </div>
                                </div>
                              ) : (
                                "Unknown"
                              )}
                            </TableCell>
                            <TableCell>{new Date(request.Created).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(request)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/admin/requests/${request.id}`}>View Details</Link>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={deletingId === request.id}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 bg-transparent"
                                    >
                                      {deletingId === request.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Request</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this request? This action cannot be undone.
                                        <br />
                                        <br />
                                        <strong>Subject:</strong> {request.Subject}
                                        <br />
                                        <strong>Citizen:</strong> {request.Citizen?.UserName || "Unknown"}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteRequest(request.id)}
                                        className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                      >
                                        Delete Request
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
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
                        : `There are no ${activeTab !== "all" ? activeTab + " " : ""}requests for your department yet.`}
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
