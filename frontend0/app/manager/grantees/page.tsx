"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { UserCheck, Search, Plus, Trash2 } from "lucide-react"
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

export default function ManagerGranteesPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [grantees, setGrantees] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGrantees, setFilteredGrantees] = useState<any[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [associations, setAssociations] = useState<any[]>([])
  const [administrators, setAdministrators] = useState<any[]>([])
  const [citizens, setCitizens] = useState<any[]>([])

  const [formData, setFormData] = useState({
    GranteeUserName: "",
    FirstEmail: "",
    SecondEmail: "",
    password: "",
    Association: "",
    Administrator: "",
    Citizen: "",
    Active: true,
  })

  const [deletingGranteeId, setDeletingGranteeId] = useState<string | null>(null)

  useEffect(() => {
    fetchGrantees()
    fetchAssociations()
    fetchAdministrators()
    fetchCitizens()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGrantees(grantees)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = grantees.filter(
        (grantee) =>
          grantee.GranteeUserName?.toLowerCase().includes(query) ||
          grantee.FirstEmail?.toLowerCase().includes(query) ||
          grantee.Citizen?.UserName?.toLowerCase().includes(query) ||
          grantee.Association?.Title?.toLowerCase().includes(query),
      )
      setFilteredGrantees(filtered)
    }
  }, [searchQuery, grantees])

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

  const fetchAdministrators = async () => {
    try {
      const response = await directApi.manager.getAdministrators()
      if (response.ok) {
        const data = await response.json()
        setAdministrators(data)
      }
    } catch (error) {
      console.error("Error fetching administrators:", error)
    }
  }

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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateGrantee = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format the data according to what the API expects
      const granteeData = {
        GranteeUserName: formData.GranteeUserName,
        FirstEmail: formData.FirstEmail,
        SecondEmail: formData.SecondEmail || null,
        password: formData.password,
        Association: formData.Association,
        Administrator: formData.Administrator,
        Citizen: formData.Citizen,
        Active: formData.Active,
      }

      console.log("Submitting grantee data:", granteeData)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/grantee/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(granteeData),
      })

      const responseText = await response.text()
      console.log("Response status:", response.status)
      console.log("Response text:", responseText)

      if (!response.ok) {
        let errorMessage = "Failed to create grantee"
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ")
        } catch (e) {
          console.error("Error parsing error response:", e)
        }
        throw new Error(errorMessage)
      }

      toast({
        title: "Grantee created",
        description: "The grantee has been created successfully.",
        variant: "default",
      })

      // Reset form and refresh grantees
      setFormData({
        GranteeUserName: "",
        FirstEmail: "",
        SecondEmail: "",
        password: "",
        Association: "",
        Administrator: "",
        Citizen: "",
        Active: true,
      })
      setIsDialogOpen(false)
      fetchGrantees()
    } catch (error: any) {
      console.error("Error creating grantee:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create grantee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchGrantees = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.manager.getGrantees()
      if (response.ok) {
        const data = await response.json()
        setGrantees(data)
        setFilteredGrantees(data)
      } else {
        throw new Error("Failed to fetch grantees")
      }
    } catch (error) {
      console.error("Error fetching grantees:", error)
      toast({
        title: "Error",
        description: "Failed to load grantees. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGrantee = async (granteeId: string, granteeName: string) => {
    setDeletingGranteeId(granteeId)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/grantee/${granteeId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete grantee")
      }

      toast({
        title: "Grantee deleted",
        description: `${granteeName} has been deleted successfully.`,
        variant: "default",
      })

      // Refresh the grantees list
      fetchGrantees()
    } catch (error: any) {
      console.error("Error deleting grantee:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete grantee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingGranteeId(null)
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Grantees</h1>
            <p className="text-muted-foreground">Manage service grantees in the system</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search grantees..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <CreateResourceDialog
              title="Create Grantee"
              description="Add a new service grantee to the system"
              triggerLabel="New Grantee"
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            >
              <form onSubmit={handleCreateGrantee} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="GranteeUserName">Username</Label>
                  <Input
                    id="GranteeUserName"
                    name="GranteeUserName"
                    value={formData.GranteeUserName}
                    onChange={handleChange}
                    placeholder="e.g. grantee_user"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="FirstEmail">Email</Label>
                  <Input
                    id="FirstEmail"
                    name="FirstEmail"
                    type="email"
                    value={formData.FirstEmail}
                    onChange={handleChange}
                    placeholder="grantee@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="SecondEmail">Secondary Email (Optional)</Label>
                  <Input
                    id="SecondEmail"
                    name="SecondEmail"
                    type="email"
                    value={formData.SecondEmail}
                    onChange={handleChange}
                    placeholder="secondary@example.com"
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
                  <Label htmlFor="Association">Association</Label>
                  <Select
                    value={formData.Association}
                    onValueChange={(value) => handleSelectChange("Association", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an association" />
                    </SelectTrigger>
                    <SelectContent>
                      {associations.map((association) => (
                        <SelectItem key={association.id} value={association.id}>
                          {association.Title} ({association.Department?.Title || "No Department"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Administrator">Administrator</Label>
                  <Select
                    value={formData.Administrator}
                    onValueChange={(value) => handleSelectChange("Administrator", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an administrator" />
                    </SelectTrigger>
                    <SelectContent>
                      {administrators.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.AdministratorUserName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Citizen">Citizen</Label>
                  <Select
                    value={formData.Citizen}
                    onValueChange={(value) => handleSelectChange("Citizen", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a citizen" />
                    </SelectTrigger>
                    <SelectContent>
                      {citizens.map((citizen) => (
                        <SelectItem key={citizen.id} value={citizen.id}>
                          {citizen.UserName}
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
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Grantee"}
                  </Button>
                </DialogFooter>
              </form>
            </CreateResourceDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grantees</CardTitle>
            <CardDescription>Service grantees in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                ))}
              </div>
            ) : filteredGrantees.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Association</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrantees.map((grantee) => (
                      <TableRow key={grantee.id}>
                        <TableCell className="font-medium">{grantee.GranteeUserName}</TableCell>
                        <TableCell>
                          {grantee.FirstName} {grantee.LastName}
                        </TableCell>
                        <TableCell>{grantee.FirstEmail}</TableCell>
                        <TableCell>{grantee.Association?.Title || "Not Assigned"}</TableCell>
                        <TableCell>{new Date(grantee.Created).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/manager/grantees/${grantee.id}`}>View</Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={deletingGranteeId === grantee.id}
                                >
                                  {deletingGranteeId === grantee.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Grantee</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{grantee.GranteeUserName}</strong>? This
                                    action cannot be undone and will permanently remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteGrantee(grantee.id, grantee.GranteeUserName)}
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
                <UserCheck className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No grantees found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                  {searchQuery
                    ? "No grantees match your search criteria. Try a different search term."
                    : "There are no grantees registered in the system yet."}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Grantee
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
