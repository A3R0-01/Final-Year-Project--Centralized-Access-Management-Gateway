"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Building, Search, Plus, Edit, Trash2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ManagerDepartmentsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [departments, setDepartments] = useState<any[]>([])
  const [administrators, setAdministrators] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Email: "",
    Telephone: "",
    Website: "",
    Administrator: "",
    Active: true,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchDepartments()
    fetchAdministrators()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDepartments(departments)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = departments.filter(
        (department) =>
          department.Title?.toLowerCase().includes(query) || department.Description?.toLowerCase().includes(query),
      )
      setFilteredDepartments(filtered)
    }
  }, [searchQuery, departments])

  const fetchDepartments = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.manager.getDepartments()
      if (response.ok) {
        const data = await response.json()

        // Fetch association counts for each department
        const departmentsWithCounts = await Promise.all(
          data.map(async (department: any) => {
            try {
              const associationsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/manager/association/?Department__PublicId=${department.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                  },
                },
              )

              if (associationsResponse.ok) {
                const associations = await associationsResponse.json()
                return {
                  ...department,
                  associationsCount: associations.length,
                }
              }
              return {
                ...department,
                associationsCount: 0,
              }
            } catch (error) {
              console.error(`Error fetching associations for department ${department.id}:`, error)
              return {
                ...department,
                associationsCount: 0,
              }
            }
          }),
        )

        setDepartments(departmentsWithCounts)
        setFilteredDepartments(departmentsWithCounts)
      } else {
        throw new Error("Failed to fetch departments")
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to load departments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAdministrators = async () => {
    try {
      const response = await directApi.manager.getAdministrators()
      if (response.ok) {
        const data = await response.json()
        setAdministrators(data)
      } else {
        throw new Error("Failed to fetch administrators")
      }
    } catch (error) {
      console.error("Error fetching administrators:", error)
      toast({
        title: "Error",
        description: "Failed to load administrators. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await directApi.manager.createDepartment(formData)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create department")
      }

      toast({
        title: "Department created",
        description: "The department has been created successfully.",
        variant: "default",
      })

      // Reset form and refresh departments
      setFormData({
        Title: "",
        Description: "",
        Email: "",
        Telephone: "",
        Website: "",
        Administrator: "",
        Active: true,
      })
      setIsDialogOpen(false)
      fetchDepartments()
    } catch (error: any) {
      console.error("Error creating department:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create department. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDepartment = async (department: any) => {
    setDepartmentToDelete(department)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!departmentToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manager/department/${departmentToDelete.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to delete department")
      }

      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully.",
        variant: "default",
      })

      // Refresh departments list
      fetchDepartments()
      setDeleteDialogOpen(false)
      setDepartmentToDelete(null)
    } catch (error: any) {
      console.error("Error deleting department:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete department. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">Manage government departments in the system</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search departments..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  New Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create Department</DialogTitle>
                    <DialogDescription>Add a new government department to the system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="Title">Department Name</Label>
                      <Input
                        id="Title"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                        placeholder="e.g. Ministry of Education"
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
                        placeholder="Describe the department's purpose and responsibilities"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Email">Email</Label>
                      <Input
                        id="Email"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleChange}
                        placeholder="department@example.gov"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Telephone">Telephone</Label>
                      <Input
                        id="Telephone"
                        name="Telephone"
                        value={formData.Telephone}
                        onChange={handleChange}
                        placeholder="+1234567890"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Website">Website</Label>
                      <Input
                        id="Website"
                        name="Website"
                        type="url"
                        value={formData.Website}
                        onChange={handleChange}
                        placeholder="https://department.gov"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Administrator">Administrator</Label>
                      <Select
                        value={formData.Administrator}
                        onValueChange={(value) => handleSelectChange("Administrator", value)}
                        required
                      >
                        <SelectTrigger id="Administrator">
                          <SelectValue placeholder="Select an administrator" />
                        </SelectTrigger>
                        <SelectContent>
                          {administrators.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.AdministratorUserName} - {admin.Citizen?.UserName || "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="Active"
                        checked={formData.Active}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, Active: checked }))}
                      />
                      <Label htmlFor="Active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Department"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
            <CardDescription>View and manage government departments</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                ))}
              </div>
            ) : filteredDepartments.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Associations</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.Title}</TableCell>
                        <TableCell className="max-w-xs truncate">{department.Description}</TableCell>
                        <TableCell>{department.associationsCount || 0}</TableCell>
                        <TableCell>{new Date(department.Created).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/manager/departments/${department.id}`}>View</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/manager/departments/${department.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDepartment(department)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Building className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No departments found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                  {searchQuery
                    ? "No departments match your search criteria. Try a different search term."
                    : "There are no departments in the system yet."}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Department
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Department</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{departmentToDelete?.Title}"? This action cannot be undone and may
                affect associated data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Department"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
