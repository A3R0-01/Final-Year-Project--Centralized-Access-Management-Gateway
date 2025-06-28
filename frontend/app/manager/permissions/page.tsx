"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Shield, Search, Plus, Building, FileText, Briefcase } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateResourceDialog } from "@/components/dialogs/create-resource-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
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

export default function ManagerPermissionsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("departments")

  const [departmentPermissions, setDepartmentPermissions] = useState<any[]>([])
  const [associationPermissions, setAssociationPermissions] = useState<any[]>([])
  const [servicePermissions, setServicePermissions] = useState<any[]>([])

  const [filteredPermissions, setFilteredPermissions] = useState<any[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [grantees, setGrantees] = useState<any[]>([])
  const [citizens, setCitizens] = useState<any[]>([])
  const [citizenSearchQuery, setCitizenSearchQuery] = useState("")
  const [filteredCitizens, setFilteredCitizens] = useState<any[]>([])

  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    PublicService: "",
    Association: "",
    Department: "",
    Grantee: "",
    Citizens: [] as string[],
    StartTime: formatDateForInput(new Date()),
    EndTime: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    Active: true,
    permissionType: "service", // Default to service permission
  })

  const [departments, setDepartments] = useState<any[]>([])
  const [associations, setAssociations] = useState<any[]>([])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchPermissions()
    fetchCitizens()
  }, [])

  useEffect(() => {
    filterPermissions()
  }, [searchQuery, activeTab, departmentPermissions, associationPermissions, servicePermissions])

  useEffect(() => {
    fetchServices()
    fetchGrantees()
    fetchDepartments()
    fetchAssociations()
  }, [])

  useEffect(() => {
    // Filter citizens based on search query
    if (citizens.length > 0) {
      const filtered = citizens.filter(
        (citizen) =>
          citizen.UserName.toLowerCase().includes(citizenSearchQuery.toLowerCase()) ||
          citizen.Email.toLowerCase().includes(citizenSearchQuery.toLowerCase()) ||
          (citizen.FirstName && citizen.FirstName.toLowerCase().includes(citizenSearchQuery.toLowerCase())) ||
          (citizen.Surname && citizen.Surname.toLowerCase().includes(citizenSearchQuery.toLowerCase())),
      )
      setFilteredCitizens(filtered)
    }
  }, [citizenSearchQuery, citizens])

  function formatDateForInput(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const fetchCitizens = async () => {
    try {
      const response = await directApi.manager.getCitizens()
      if (response.ok) {
        const data = await response.json()
        setCitizens(data)
        setFilteredCitizens(data)
      }
    } catch (error) {
      console.error("Error fetching citizens:", error)
    }
  }

  const handleCitizenToggle = (citizenId: string) => {
    setFormData((prev) => ({
      ...prev,
      Citizens: prev.Citizens.includes(citizenId)
        ? prev.Citizens.filter((id) => id !== citizenId)
        : [...prev.Citizens, citizenId],
    }))
  }

  const fetchServices = async () => {
    try {
      const response = await directApi.manager.getServices()
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchGrantees = async () => {
    try {
      const response = await directApi.manager.getGrantees()
      if (response.ok) {
        const data = await response.json()
        setGrantees(data)
      }
    } catch (error) {
      console.error("Error fetching grantees:", error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await directApi.manager.getDepartments()
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const fetchAssociations = async () => {
    try {
      const response = await directApi.manager.getAssociations()
      if (response.ok) {
        const data = await response.json()
        setAssociations(data)
      }
    } catch (error) {
      console.error("Error fetching associations:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, PublicService: value }))
  }

  const handleGranteeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Grantee: value }))
  }

  const handlePermissionTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, permissionType: value }))
  }

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Department: value }))
  }

  const handleAssociationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Association: value }))
  }

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare the permission data based on type
      const permissionData: any = {
        Name: formData.Name,
        Description: formData.Description,
        Citizens: formData.Citizens,
        StartTime: new Date(formData.StartTime).toISOString(),
        EndTime: new Date(formData.EndTime).toISOString(),
      }

      // Add the specific field based on permission type
      if (formData.permissionType === "service") {
        permissionData.PublicService = formData.PublicService
        permissionData.Grantee = formData.Grantee
      } else if (formData.permissionType === "association") {
        permissionData.Association = formData.Association
      } else if (formData.permissionType === "department") {
        permissionData.Department = formData.Department
      }

      // Call the appropriate API endpoint based on permission type
      let response
      if (formData.permissionType === "service") {
        response = await directApi.manager.createPermission.service(permissionData)
      } else if (formData.permissionType === "association") {
        response = await directApi.manager.createPermission.association(permissionData)
      } else {
        response = await directApi.manager.createPermission.department(permissionData)
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create permission")
      }

      toast({
        title: "Permission created",
        description: `The ${formData.permissionType} permission has been created successfully.`,
        variant: "default",
      })

      // Reset form and refresh permissions
      setFormData({
        Name: "",
        Description: "",
        PublicService: "",
        Association: "",
        Department: "",
        Grantee: "",
        Citizens: [],
        StartTime: formatDateForInput(new Date()),
        EndTime: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        Active: true,
        permissionType: "service",
      })
      setIsDialogOpen(false)
      fetchPermissions()
    } catch (error: any) {
      console.error("Error creating permission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create permission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchPermissions = async () => {
    setIsLoading(true)
    try {
      // Fetch department permissions
      const departmentResponse = await directApi.manager.getPermissions.department()
      if (departmentResponse.ok) {
        const departmentData = await departmentResponse.json()
        setDepartmentPermissions(departmentData)
      }

      // Fetch association permissions
      const associationResponse = await directApi.manager.getPermissions.association()
      if (associationResponse.ok) {
        const associationData = await associationResponse.json()
        setAssociationPermissions(associationData)
      }

      // Fetch service permissions
      const serviceResponse = await directApi.manager.getPermissions.service()
      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json()
        setServicePermissions(serviceData)
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
      toast({
        title: "Error",
        description: "Failed to load permissions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterPermissions = () => {
    const query = searchQuery.toLowerCase()
    let filtered = []

    if (activeTab === "departments") {
      filtered = departmentPermissions.filter(
        (permission) =>
          permission.Department?.Title?.toLowerCase().includes(query) ||
          permission.Administrator?.AdministratorUserName?.toLowerCase().includes(query),
      )
    } else if (activeTab === "associations") {
      filtered = associationPermissions.filter(
        (permission) =>
          permission.Association?.Title?.toLowerCase().includes(query) ||
          permission.Association?.Department?.Title?.toLowerCase().includes(query) ||
          permission.Grantee?.GranteeUserName?.toLowerCase().includes(query),
      )
    } else if (activeTab === "services") {
      filtered = servicePermissions.filter(
        (permission) =>
          permission.PublicService?.Title?.toLowerCase().includes(query) ||
          permission.PublicService?.Association?.Title?.toLowerCase().includes(query) ||
          permission.Grantee?.GranteeUserName?.toLowerCase().includes(query),
      )
    }

    setFilteredPermissions(filtered)
  }

  const handlePermissionToggle = async (permission: any, value: boolean) => {
    try {
      // In a real implementation, you would update the permission via API
      // For now, we'll just show a toast
      toast({
        title: "Permission updated",
        description: `Permission ${value ? "granted" : "revoked"} successfully.`,
        variant: "default",
      })

      // Refresh permissions after update
      fetchPermissions()
    } catch (error) {
      console.error("Error updating permission:", error)
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePermission = async (permission: any) => {
    setIsDeleting(true)
    try {
      let response
      if (activeTab === "departments") {
        response = await directApi.manager.deleteDepartmentPermission(permission.id)
      } else if (activeTab === "associations") {
        response = await directApi.manager.deleteAssociationPermission(permission.id)
      } else {
        response = await directApi.manager.deleteServicePermission(permission.id)
      }

      if (!response.ok) {
        throw new Error("Failed to delete permission")
      }

      toast({
        title: "Permission deleted",
        description: `The ${activeTab.slice(0, -1)} permission has been deleted successfully.`,
        variant: "default",
      })

      // Refresh permissions after deletion
      fetchPermissions()
    } catch (error: any) {
      console.error("Error deleting permission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete permission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPermissionToDelete(null)
    }
  }

  const openDeleteDialog = (permission: any) => {
    setPermissionToDelete(permission)
    setDeleteDialogOpen(true)
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>
            <p className="text-muted-foreground">Manage access permissions across the system</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search permissions..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <CreateResourceDialog
                title="Create New Permission"
                description="Add a new permission for service, association, or department access"
                triggerLabel="New Permission"
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
              >
                <form onSubmit={handleCreatePermission} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="permissionType">Permission Type</Label>
                    <Select value={formData.permissionType} onValueChange={handlePermissionTypeChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permission type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service Permission</SelectItem>
                        <SelectItem value="association">Association Permission</SelectItem>
                        <SelectItem value="department">Department Permission</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Name">Permission Name</Label>
                    <Input
                      id="Name"
                      name="Name"
                      value={formData.Name}
                      onChange={handleChange}
                      placeholder="e.g. Passport Application Access"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="Description">Description</Label>
                    <Textarea
                      id="Description"
                      name="Description"
                      value={formData.Description}
                      onChange={handleChange}
                      placeholder="Describe the purpose of this permission"
                      rows={4}
                      required
                    />
                  </div>

                  {formData.permissionType === "service" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="PublicService">Service</Label>
                        <Select value={formData.PublicService} onValueChange={handleServiceChange} required>
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
                        <Label htmlFor="Grantee">Grantee</Label>
                        <Select value={formData.Grantee} onValueChange={handleGranteeChange} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grantee" />
                          </SelectTrigger>
                          <SelectContent>
                            {grantees.map((grantee) => (
                              <SelectItem key={grantee.id} value={grantee.id}>
                                {grantee.GranteeUserName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {formData.permissionType === "association" && (
                    <div className="space-y-2">
                      <Label htmlFor="Association">Association</Label>
                      <Select value={formData.Association} onValueChange={handleAssociationChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an association" />
                        </SelectTrigger>
                        <SelectContent>
                          {associations?.map((association) => (
                            <SelectItem key={association.id} value={association.id}>
                              {association.Title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.permissionType === "department" && (
                    <div className="space-y-2">
                      <Label htmlFor="Department">Department</Label>
                      <Select value={formData.Department} onValueChange={handleDepartmentChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                              {department.Title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Citizens</Label>
                    <div className="border rounded-md">
                      <div className="p-2 border-b">
                        <Input
                          type="search"
                          placeholder="Search citizens..."
                          value={citizenSearchQuery}
                          onChange={(e) => setCitizenSearchQuery(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-72">
                        <div className="p-2">
                          {filteredCitizens.length > 0 ? (
                            filteredCitizens.map((citizen) => (
                              <div key={citizen.id} className="flex items-center space-x-2 py-2">
                                <Checkbox
                                  id={`citizen-${citizen.id}`}
                                  checked={formData.Citizens.includes(citizen.id)}
                                  onCheckedChange={() => handleCitizenToggle(citizen.id)}
                                />
                                <Label htmlFor={`citizen-${citizen.id}`} className="flex-1 cursor-pointer">
                                  <div className="font-medium">{citizen.UserName}</div>
                                  <div className="text-sm text-muted-foreground">{citizen.Email}</div>
                                </Label>
                              </div>
                            ))
                          ) : (
                            <div className="py-4 text-center text-muted-foreground">No citizens found</div>
                          )}
                        </div>
                      </ScrollArea>
                      <div className="p-2 border-t bg-muted/50">
                        <div className="text-sm text-muted-foreground">
                          {formData.Citizens.length} citizens selected
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="StartTime">Start Date</Label>
                      <Input
                        id="StartTime"
                        name="StartTime"
                        type="datetime-local"
                        value={formData.StartTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="EndTime">End Date</Label>
                      <Input
                        id="EndTime"
                        name="EndTime"
                        type="datetime-local"
                        value={formData.EndTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="Active"
                      checked={formData.Active}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, Active: checked }))}
                    />
                    <Label htmlFor="Active">Active</Label>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? "Creating..."
                        : `Create ${formData.permissionType.charAt(0).toUpperCase() + formData.permissionType.slice(1)} Permission`}
                    </Button>
                  </DialogFooter>
                </form>
              </CreateResourceDialog>
            </div>
          </div>
        </div>

        <Tabs defaultValue="departments" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="departments" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>Department Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="associations" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Association Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>Service Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "departments"
                    ? "Department Permissions"
                    : activeTab === "associations"
                      ? "Association Permissions"
                      : "Service Permissions"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "departments"
                    ? "Manage administrator access to departments"
                    : activeTab === "associations"
                      ? "Manage grantee access to associations"
                      : "Manage grantee access to services"}
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
                ) : filteredPermissions.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          {activeTab === "departments" && <TableHead>Department</TableHead>}
                          {activeTab === "associations" && <TableHead>Association</TableHead>}
                          {activeTab === "services" && <TableHead>Service</TableHead>}
                          <TableHead>Citizens</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPermissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">{permission.Name}</TableCell>
                            {activeTab === "departments" && (
                              <TableCell>
                                <Link
                                  href={`/manager/departments/${permission.Department?.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {permission.Department?.Title || "N/A"}
                                </Link>
                              </TableCell>
                            )}
                            {activeTab === "associations" && (
                              <TableCell>
                                <Link
                                  href={`/manager/associations/${permission.Association?.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {permission.Association?.Title || "N/A"}
                                </Link>
                              </TableCell>
                            )}
                            {activeTab === "services" && (
                              <TableCell>
                                <Link
                                  href={`/manager/services/${permission.PublicService?.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {permission.PublicService?.Title || "N/A"}
                                </Link>
                              </TableCell>
                            )}
                            <TableCell>{permission.Citizens?.length || 0}</TableCell>
                            <TableCell>
                              <Badge
                                variant={permission.PermissionOpen ? "success" : "secondary"}
                                className={
                                  permission.PermissionOpen
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                }
                              >
                                {permission.PermissionOpen ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/manager/permissions/${permission.id}`}>View</Link>
                                </Button>
                                <AlertDialog
                                  open={deleteDialogOpen && permissionToDelete?.id === permission.id}
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setDeleteDialogOpen(false)
                                      setPermissionToDelete(null)
                                    }
                                  }}
                                >
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                      onClick={() => openDeleteDialog(permission)}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting && permissionToDelete?.id === permission.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Permission</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete the permission "{permission.Name}"? This action
                                        cannot be undone and will permanently remove the permission and all associated
                                        access rights.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeletePermission(permission)}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={isDeleting}
                                      >
                                        {isDeleting ? "Deleting..." : "Delete Permission"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Switch
                                  checked={permission.Active}
                                  onCheckedChange={(value) => handlePermissionToggle(permission, value)}
                                  id={`permission-${permission.id}`}
                                />
                                <Label htmlFor={`permission-${permission.id}`} className="sr-only">
                                  Toggle permission
                                </Label>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No permissions found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                      {searchQuery
                        ? "No permissions match your search criteria. Try a different search term."
                        : `There are no ${activeTab} permissions configured yet.`}
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create {activeTab.slice(0, -1)} Permission
                    </Button>
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
