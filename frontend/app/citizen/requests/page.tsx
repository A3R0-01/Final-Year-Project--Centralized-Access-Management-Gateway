"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ClipboardList, Search, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CitizenRequestsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [priority, setPriority] = useState("normal")
  const [category, setCategory] = useState("")

  useEffect(() => {
    fetchRequests()
    fetchServices()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRequests(requests)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = requests.filter(
        (request) =>
          request.Subject?.toLowerCase().includes(query) ||
          request.Message?.toLowerCase().includes(query) ||
          request.PublicService?.Title?.toLowerCase().includes(query),
      )
      setFilteredRequests(filtered)
    }
  }, [searchQuery, requests])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.citizen.getRequests()
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

  const fetchServices = async () => {
    try {
      const response = await directApi.citizen.getServices()
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      } else {
        throw new Error("Failed to fetch services")
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!subject.trim()) {
        throw new Error("Please enter a subject for your request")
      }

      if (!message.trim()) {
        throw new Error("Please enter a message describing your request")
      }

      if (!serviceId) {
        throw new Error("Please select a service for your request")
      }

      const response = await directApi.citizen.createRequest({
        Subject: subject,
        Message: message,
        PublicService: serviceId,
        Priority: priority,
        Category: category || undefined,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create request")
      }

      toast({
        title: "Request submitted",
        description: "Your service request has been submitted successfully.",
        variant: "default",
      })

      // Reset form and refresh requests
      setSubject("")
      setMessage("")
      setServiceId("")
      setPriority("normal")
      setCategory("")
      setIsDialogOpen(false)
      fetchRequests()
    } catch (error: any) {
      console.error("Error creating request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (request: any) => {
    if (request.Decline) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3.5 w-3.5" />
          <span>Rejected</span>
        </Badge>
      )
    } else if (request.Granted) {
      return (
        <Badge variant="success" className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Approved</span>
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>Pending</span>
        </Badge>
      )
    }
  }

  return (
    <DashboardLayout role="citizen">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
            <p className="text-muted-foreground">View and manage your service requests</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create New Request</DialogTitle>
                    <DialogDescription>Fill out the form below to submit a new service request</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">Service *</Label>
                      <Select value={serviceId} onValueChange={setServiceId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.Title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of your request"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Provide details about your request"
                        rows={5}
                        required
                        maxLength={2000}
                      />
                      <p className="text-xs text-muted-foreground">{message.length}/2000 characters</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority *</Label>
                        <Select value={priority} onValueChange={setPriority} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category (Optional)</Label>
                        <Input
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="Request category"
                          maxLength={50}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>View and track the status of your service requests</CardDescription>
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
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.Subject}</TableCell>
                        <TableCell>{request.PublicService?.Title || "Unknown Service"}</TableCell>
                        <TableCell>{getStatusBadge(request)}</TableCell>
                        <TableCell>{new Date(request.Created).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/citizen/requests/${request.id}`}>View Details</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardList className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No requests found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                  {searchQuery
                    ? "No requests match your search criteria. Try a different search term."
                    : "You haven't submitted any service requests yet."}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
