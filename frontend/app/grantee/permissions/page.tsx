"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, Shield, Calendar, Clock, Users, Briefcase, Plus, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { directApi } from "@/lib/api-direct"

const createPermissionSchema = z.object({
  Name: z.string().min(1, "Permission name is required").max(100, "Name must be 100 characters or less"),
  Description: z.string().min(1, "Description is required"),
  StartTime: z.string().min(1, "Start time is required"),
  EndTime: z.string().min(1, "End time is required"),
  PublicService: z.string().min(1, "Service selection is required"),
  Citizens: z.array(z.string()).min(1, "At least one citizen must be selected"),
})

type CreatePermissionFormData = z.infer<typeof createPermissionSchema>

export default function GranteePermissionsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [permissions, setPermissions] = useState<any[]>([])
  const [filteredPermissions, setFilteredPermissions] = useState<any[]>([])
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [serviceSearchQuery, setServiceSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [citizens, setCitizens] = useState<any[]>([])

  const form = useForm<CreatePermissionFormData>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      Name: "",
      Description: "",
      StartTime: "",
      EndTime: "",
      PublicService: "",
      Citizens: [],
    },
  })

  useEffect(() => {
    fetchPermissions()
    fetchServices()
    fetchCitizens()
  }, [])

  useEffect(() => {
    // Filter permissions based on both search queries
    let filtered = permissions

    // Filter by general search (name, description)
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (permission) =>
          permission.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          permission.Description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by service name/title
    if (serviceSearchQuery.trim()) {
      filtered = filtered.filter((permission) =>
        permission.PublicService?.Title?.toLowerCase().includes(serviceSearchQuery.toLowerCase()),
      )
    }

    setFilteredPermissions(filtered)
  }, [searchQuery, serviceSearchQuery, permissions])

  const fetchPermissions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grantee/permission/service/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch permissions")
      }

      const data = await response.json()
      setPermissions(data)
      setFilteredPermissions(data)
    } catch (error) {
      console.error("Error fetching permissions:", error)
      setError("Failed to load permissions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await directApi.grantee.getServices()
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchCitizens = async () => {
    try {
      const response = await directApi.grantee.getCitizens()
      if (response.ok) {
        const data = await response.json()
        setCitizens(data)
      }
    } catch (error) {
      console.error("Error fetching citizens:", error)
    }
  }

  const onSubmitCreatePermission = async (data: CreatePermissionFormData) => {
    setIsCreating(true)
    try {
      const response = await directApi.grantee.createServicePermission({
        Name: data.Name,
        Description: data.Description,
        StartTime: new Date(data.StartTime).toISOString(),
        EndTime: new Date(data.EndTime).toISOString(),
        PublicService: data.PublicService,
        Citizens: data.Citizens,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Permission created successfully",
        })
        setIsCreateDialogOpen(false)
        form.reset()
        fetchPermissions()
      } else {
        throw new Error("Failed to create permission")
      }
    } catch (error) {
      console.error("Error creating permission:", error)
      toast({
        title: "Error",
        description: "Failed to create permission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (permission: any) => {
    const now = new Date()
    const startTime = new Date(permission.StartTime)
    const endTime = new Date(permission.EndTime)

    if (startTime > now) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <Clock className="h-3 w-3 mr-1" />
          Upcoming
        </Badge>
      )
    } else if (endTime < now || !permission.PermissionOpen) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <Clock className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Permissions</h1>
            <p className="text-muted-foreground">Manage permissions for your services</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Permission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Permission</DialogTitle>
                <DialogDescription>
                  Create a new service permission for citizens to access your services.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitCreatePermission)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="Name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permission Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter permission name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter permission description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="StartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="EndTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="PublicService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.Title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Citizens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Citizens</FormLabel>
                        <FormDescription>Select citizens who will have access to this permission</FormDescription>
                        <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                          {citizens.map((citizen) => (
                            <div key={citizen.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={citizen.id}
                                checked={field.value?.includes(citizen.id) || false}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), citizen.id]
                                    : (field.value || []).filter((id) => id !== citizen.id)
                                  field.onChange(updatedValue)
                                }}
                              />
                              <label
                                htmlFor={citizen.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {citizen.FirstName} {citizen.Surname} ({citizen.Email})
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Permission"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search permissions by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Filter by service name..."
              value={serviceSearchQuery}
              onChange={(e) => setServiceSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredPermissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {permissions.length === 0 ? "No permissions found" : "No matching permissions"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {permissions.length === 0
                  ? "You haven't created any service permissions yet."
                  : "Try adjusting your search criteria."}
              </p>
              {permissions.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Permission
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPermissions.map((permission) => (
              <Card key={permission.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{permission.Name}</CardTitle>
                      <CardDescription>Permission ID: {permission.id}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(permission)}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        <Shield className="h-3 w-3" />
                        Service
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{permission.Description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Service:</span>
                      <span className="truncate">{permission.PublicService?.Title || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Citizens:</span>
                      <span>{Array.isArray(permission.Citizens) ? permission.Citizens.length : 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Ends:</span>
                      <span className="truncate">
                        {permission.EndTime ? new Date(permission.EndTime).toLocaleDateString() : "No end date"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm">
                      <Link href={`/grantee/permissions/${permission.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results summary */}
        {!isLoading && !error && (
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredPermissions.length} of {permissions.length} permissions
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
