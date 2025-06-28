"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Users, Search, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminAssociationsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [associations, setAssociations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAssociations, setFilteredAssociations] = useState<any[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Email: "",
    Website: "",
    Department: "",
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [associationToDelete, setAssociationToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchAssociations()
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAssociations(associations)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = associations.filter(
        (association) =>
          association.Title?.toLowerCase().includes(query) ||
          association.Description?.toLowerCase().includes(query) ||
          association.Department?.Title?.toLowerCase().includes(query),
      )
      setFilteredAssociations(filtered)
    }
  }, [searchQuery, associations])

  const fetchAssociations = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.admin.getAssociations()
      if (response.ok) {
        const data = await response.json()
        setAssociations(data)
        setFilteredAssociations(data)
      } else {
        throw new Error("Failed to fetch associations")
      }
    } catch (error) {
      console.error("Error fetching associations:", error)
      toast({
        title: "Error",
        description: "Failed to load associations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await directApi.admin.getDepartments()
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Department: value }))
  }

  const handleCreateAssociation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.Title || !formData.Description || !formData.Email || !formData.Department) {
        throw new Error("All required fields must be filled")
      }

      const response = await directApi.admin.createAssociation(formData)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create association")
      }

      toast({
        title: "Association created",
        description: "The association has been created successfully.",
        variant: "default",
      })

      // Reset form and refresh associations
      setFormData({
        Title: "",
        Description: "",
        Email: "",
        Website: "",
        Department: "",
      })
      setIsDialogOpen(false)
      fetchAssociations()
    } catch (error: any) {
      console.error("Error creating association:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create association. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAssociation = async () => {
    if (!associationToDelete) return

    setIsDeleting(true)
    try {
      const response = await directApi.admin.deleteAssociation(associationToDelete.id)

      if (!response.ok) {
        throw new Error("Failed to delete association")
      }

      toast({
        title: "Association deleted",
        description: `${associationToDelete.Title} has been deleted successfully.`,
        variant: "default",
      })

      // Refresh the associations list
      fetchAssociations()
    } catch (error: any) {
      console.error("Error deleting association:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete association. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setAssociationToDelete(null)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Associations</h1>
            <p className="text-muted-foreground">Manage associations in your department</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search associations..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  New Association
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateAssociation}>
                  <DialogHeader>
                    <DialogTitle>Create Association</DialogTitle>
                    <DialogDescription>Add a new association to a department</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="Title">Association Name</Label>
                      <Input
                        id="Title"
                        name="Title"
                        value={formData.Title}
                        onChange={handleChange}
                        placeholder="e.g. Passport Office"
                        required
                      />
                    </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="Email">Email</Label>
                      <Input
                        id="Email"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleChange}
                        placeholder="association@example.gov"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Website">Website (Optional)</Label>
                      <Input
                        id="Website"
                        name="Website"
                        type="url"
                        value={formData.Website}
                        onChange={handleChange}
                        placeholder="https://association.gov"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Description">Description</Label>
                      <Textarea
                        id="Description"
                        name="Description"
                        value={formData.Description}
                        onChange={handleChange}
                        placeholder="Describe the association's purpose and responsibilities"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Association"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Department Associations</CardTitle>
            <CardDescription>View and manage associations in your department</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                ))}
              </div>
            ) : filteredAssociations.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssociations.map((association) => (
                      <TableRow key={association.id}>
                        <TableCell className="font-medium">{association.Title}</TableCell>
                        <TableCell>{association.Department?.Title || "Not Assigned"}</TableCell>
                        <TableCell>{new Date(association.Created).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/associations/${association.id}`}>View</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/associations/${association.id}/edit`}>Edit</Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAssociationToDelete(association)
                                setDeleteDialogOpen(true)
                              }}
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
                <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No associations found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                  {searchQuery
                    ? "No associations match your search criteria. Try a different search term."
                    : "There are no associations in your department yet."}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Association
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Association</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{associationToDelete?.Title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteAssociation} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Association"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
