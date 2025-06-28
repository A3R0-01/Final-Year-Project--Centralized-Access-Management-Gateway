"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Briefcase, Search, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CheckboxGroup, CheckboxItem } from "@/components/ui/checkbox-group"
import { ScrollArea } from "@/components/ui/scroll-area"
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

export default function AdminServicesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [associations, setAssociations] = useState<any[]>([])
  const [grantees, setGrantees] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    Title: "",
    MachineName: "",
    Description: "",
    Email: "",
    URL: "",
    Association: "",
    Restricted: false,
    Visibility: true,
    Grantee: [] as string[],
  })
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
    fetchAssociations()
    fetchGrantees()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredServices(services)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = services.filter(
        (service) =>
          service.Title?.toLowerCase().includes(query) ||
          service.Description?.toLowerCase().includes(query) ||
          service.Association?.Title?.toLowerCase().includes(query) ||
          service.Association?.Department?.Title?.toLowerCase().includes(query),
      )
      setFilteredServices(filtered)
    }
  }, [searchQuery, services])

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.admin.getServices()
      if (response.ok) {
        const data = await response.json()
        setServices(data)
        setFilteredServices(data)
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
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssociations = async () => {
    try {
      const response = await directApi.admin.getAssociations()
      if (response.ok) {
        const data = await response.json()
        setAssociations(data)
      } else {
        throw new Error("Failed to fetch associations")
      }
    } catch (error) {
      console.error("Error fetching associations:", error)
      toast({
        title: "Error",
        description: "Failed to load associations. Some features may be limited.",
        variant: "destructive",
      })
    }
  }

  const fetchGrantees = async () => {
    try {
      const response = await directApi.admin.getGrantees()
      if (response.ok) {
        const data = await response.json()
        setGrantees(data)
      } else {
        throw new Error("Failed to fetch grantees")
      }
    } catch (error) {
      console.error("Error fetching grantees:", error)
      toast({
        title: "Error",
        description: "Failed to load grantees. Some features may be limited.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAssociationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Association: value }))
  }

  const handleGranteeChange = (value: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, Grantee: [...prev.Grantee, value] }
      } else {
        return { ...prev, Grantee: prev.Grantee.filter((id) => id !== value) }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await directApi.admin.createService(formData)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create service")
      }

      toast({
        title: "Service created",
        description: "The service has been created successfully.",
        variant: "default",
      })

      // Reset form and refresh services
      setFormData({
        Title: "",
        MachineName: "",
        Description: "",
        Email: "",
        URL: "",
        Association: "",
        Restricted: false,
        Visibility: false,
        Grantee: [] as string[],
      })
      setIsDialogOpen(false)
      fetchServices()
    } catch (error: any) {
      console.error("Error creating service:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    setDeletingServiceId(serviceId)

    try {
      const response = await directApi.admin.deleteService(serviceId)

      if (response.ok) {
        toast({
          title: "Service deleted",
          description: `${serviceName} has been deleted successfully.`,
          variant: "default",
        })
        fetchServices() // Refresh the list
      } else {
        throw new Error("Failed to delete service")
      }
    } catch (error: any) {
      console.error("Error deleting service:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete service. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingServiceId(null)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">Manage public services offered by your department</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  New Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create Service</DialogTitle>
                    <DialogDescription>Add a new public service to your department</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="Title">Service Name</Label>
                      <Input
                        id="Title"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                        placeholder="e.g. Passport Application"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="MachineName">Machine Name</Label>
                      <Input
                        id="MachineName"
                        name="MachineName"
                        value={formData.MachineName}
                        onChange={handleChange}
                        placeholder="e.g. passport_application"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Association">Association</Label>
                      <Select value={formData.Association} onValueChange={handleAssociationChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an association" />
                        </SelectTrigger>
                        <SelectContent>
                          {associations.map((association) => (
                            <SelectItem key={association.id} value={association.id}>
                              {association.Title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Description">Description</Label>
                      <Textarea
                        id="Description"
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        placeholder="Describe the service's purpose and requirements"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="URL">Website URL</Label>
                      <Input
                        id="URL"
                        name="URL"
                        type="url"
                        value={formData.URL}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Email">Contact Email</Label>
                      <Input
                        id="Email"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleChange}
                        placeholder="contact@example.com"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="Restricted"
                        checked={formData.Restricted}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, Restricted: checked }))}
                      />
                      <Label htmlFor="Restricted">Restricted Access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="Visibility"
                        checked={formData.Visibility}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, Visibility: checked }))}
                      />
                      <Label htmlFor="Visibility">Visible to Public</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Assign Grantees</Label>
                      <ScrollArea className="h-[200px] border rounded-md p-4">
                        <CheckboxGroup>
                          {grantees.length > 0 ? (
                            grantees.map((grantee) => (
                              <CheckboxItem
                                key={grantee.id}
                                id={`grantee-${grantee.id}`}
                                checked={formData.Grantee.includes(grantee.id)}
                                onCheckedChange={(checked) => handleGranteeChange(grantee.id, checked)}
                                label={`${grantee.GranteeUserName} (${grantee.Association?.Title || "No Association"})`}
                              />
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No grantees available. Create grantees first.
                            </p>
                          )}
                        </CheckboxGroup>
                      </ScrollArea>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Service"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Department Services</CardTitle>
            <CardDescription>View and manage public services for your department</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                ))}
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Association</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.Title}</TableCell>
                        <TableCell>{service.Association?.Title || "N/A"}</TableCell>
                        <TableCell>{service.requests?.length || 0}</TableCell>
                        <TableCell>{new Date(service.Created).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/services/${service.id}`}>View</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/services/${service.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                                  disabled={deletingServiceId === service.id}
                                >
                                  {deletingServiceId === service.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{service.Title}"? This action cannot be undone and
                                    will permanently remove the service and all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteService(service.id, service.Title)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Service
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
                <Briefcase className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No services found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                  {searchQuery
                    ? "No services match your search criteria. Try a different search term."
                    : "There are no services in your department yet."}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
