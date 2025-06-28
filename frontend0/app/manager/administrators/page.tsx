"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { UserCog, Search, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateResourceDialog } from "@/components/dialogs/create-resource-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DialogFooter } from "@/components/ui/dialog"
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

export default function ManagerAdministratorsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [administrators, setAdministrators] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAdministrators, setFilteredAdministrators] = useState<any[]>([])
  const [citizens, setCitizens] = useState<any[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    AdministratorUserName: "",
    FirstEmail: "",
    SecondEmail: "",
    password: "",
    Department: "",
    Active: true,
    GranteeLimit: 20,
    Citizen: "",
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAdministrators()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAdministrators(administrators)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = administrators.filter(
        (admin) =>
          admin.AdministratorUserName?.toLowerCase().includes(query) ||
          admin.FirstEmail?.toLowerCase().includes(query) ||
          admin.Citizen?.UserName?.toLowerCase().includes(query),
      )
      setFilteredAdministrators(filtered)
    }
  }, [searchQuery, administrators])

  useEffect(() => {
    fetchDepartments()
  }, [])

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

  useEffect(() => {
    fetchCitizens()
  }, [])

  const fetchCitizens = async () => {
    try {
      const response = await directApi.manager.getCitizens()
      if (response.ok) {
        const data = await response.json()
        setCitizens(data)
      }
    } catch (error) {
      console.error("Error fetching citizens:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, Department: value }))
  }

  const handleCreateAdministrator = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create payload and exclude SecondEmail if it's empty or just whitespace
      const payload = { ...formData }
      if (!formData.SecondEmail || formData.SecondEmail.trim() === "") {
        delete payload.SecondEmail
      }

      const response = await directApi.manager.createAdministrator(payload)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create administrator")
      }

      toast({
        title: "Administrator created",
        description: "The administrator has been created successfully.",
        variant: "default",
      })

      // Reset form and refresh administrators
      setFormData({
        AdministratorUserName: "",
        FirstEmail: "",
        SecondEmail: "",
        password: "",
        Department: "",
        Active: true,
        GranteeLimit: 20,
        Citizen: "",
      })
      setIsDialogOpen(false)
      fetchAdministrators()
    } catch (error: any) {
      console.error("Error creating administrator:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create administrator. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAdministrator = async (id: string, adminName: string) => {
    setDeletingId(id)
    try {
      const response = await directApi.manager.deleteAdministrator(id)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete administrator")
      }

      toast({
        title: "Administrator deleted",
        description: `${adminName} has been deleted successfully.`,
        variant: "default",
      })

      // Refresh administrators list
      fetchAdministrators()
    } catch (error: any) {
      console.error("Error deleting administrator:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete administrator. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const fetchAdministrators = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.manager.getAdministrators()
      if (response.ok) {
        const data = await response.json()
        setAdministrators(data)
        setFilteredAdministrators(data)
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administrators</h1>
            <p className="text-muted-foreground">Manage department administrators in the system</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search administrators..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <CreateResourceDialog
              title="Create Administrator"
              description="Add a new department administrator to the system"
              triggerLabel="New Administrator"
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            >
              <form onSubmit={handleCreateAdministrator} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="AdministratorUserName">Username</Label>
                  <Input
                    id="AdministratorUserName"
                    name="AdministratorUserName"
                    value={formData.AdministratorUserName}
                    onChange={handleChange}
                    placeholder="e.g. admin_user"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="FirstEmail">Primary Email</Label>
                  <Input
                    id="FirstEmail"
                    name="FirstEmail"
                    type="email"
                    value={formData.FirstEmail}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="SecondEmail">Secondary Email (Optional)</Label>
                  <Input
                    id="SecondEmail"
                    name="SecondEmail"
                    type="email"
                    value={formData.SecondEmail || ""}
                    onChange={handleChange}
                    placeholder="backup@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
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
                  <Label htmlFor="Citizen">Citizen</Label>
                  <Select
                    value={formData.Citizen}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, Citizen: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a citizen" />
                    </SelectTrigger>
                    <SelectContent>
                      {citizens.map((citizen) => (
                        <SelectItem key={citizen.id} value={citizen.id}>
                          {citizen.UserName} - {citizen.FirstName} {citizen.Surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="GranteeLimit">Grantee Limit</Label>
                  <Input
                    id="GranteeLimit"
                    name="GranteeLimit"
                    type="number"
                    min="10"
                    max="100"
                    value={formData.GranteeLimit}
                    onChange={handleChange}
                    required
                  />
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
                    {isSubmitting ? "Creating..." : "Create Administrator"}
                  </Button>
                </DialogFooter>
              </form>
            </CreateResourceDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>Department administrators in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                ))}
              </div>
            ) : filteredAdministrators.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Citizen</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdministrators.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.AdministratorUserName}</TableCell>
                        <TableCell>{admin.Citizen?.UserName || "N/A"}</TableCell>
                        <TableCell>{admin.FirstEmail}</TableCell>
                        <TableCell>{new Date(admin.Created).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/manager/administrators/${admin.id}`}>View</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/manager/administrators/${admin.id}/edit`}>Edit</Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={deletingId === admin.id}
                                >
                                  {deletingId === admin.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Administrator</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete administrator "{admin.AdministratorUserName}"? This
                                    action cannot be undone and will permanently remove the administrator from the
                                    system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteAdministrator(admin.id, admin.AdministratorUserName)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
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
                <UserCog className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No administrators found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                  {searchQuery
                    ? "No administrators match your search criteria. Try a different search term."
                    : "There are no administrators registered in the system yet."}
                </p>
                <Button asChild>
                  <Link href="/manager/administrators/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Administrator
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
