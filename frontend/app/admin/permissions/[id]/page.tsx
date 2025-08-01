"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Shield, Calendar, Clock, User, Building, Users, Briefcase, Edit, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { directApi } from "@/lib/api-direct"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminPermissionDetailPage() {
  const params = useParams()
  const permissionId = params?.id as string
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [permission, setPermission] = useState<any>(null)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    fetchPermissionDetails()
  }, [permissionId])

  const fetchPermissionDetails = async () => {
    if (!permissionId) return

    setIsLoading(true)
    try {
      // Determine the permission type and fetch accordingly
      let response

      // Try department permission first
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/department/${permissionId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        // Try association permission
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/association/${permissionId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
      }

      if (!response.ok) {
        // Try service permission
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/permission/service/${permissionId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
      }

      if (!response.ok) {
        throw new Error("Failed to fetch permission details")
      }

      const data = await response.json()
      setPermission(data)
    } catch (error) {
      console.error("Error fetching permission details:", error)
      setError("Failed to load permission details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      // Determine the permission type and update accordingly
      let response
      const newStatus = !permission.Active

      if (permission.Department) {
        response = await directApi.admin.updateDepartmentPermission(permissionId, { Active: newStatus })
      } else if (permission.Association) {
        response = await directApi.admin.updateAssociationPermission(permissionId, { Active: newStatus })
      } else if (permission.PublicService) {
        response = await directApi.admin.updateServicePermission(permissionId, { Active: newStatus })
      }

      if (!response.ok) {
        throw new Error("Failed to update permission status")
      }

      toast({
        title: "Permission updated",
        description: `Permission has been ${newStatus ? "activated" : "deactivated"}.`,
        variant: "default",
      })

      // Refresh permission details
      fetchPermissionDetails()
    } catch (error) {
      console.error("Error updating permission:", error)
      toast({
        title: "Error",
        description: "Failed to update permission status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Determine the permission type and delete accordingly
      let response

      if (permission.Department) {
        response = await directApi.admin.deleteDepartmentPermission(permissionId)
      } else if (permission.Association) {
        response = await directApi.admin.deleteAssociationPermission(permissionId)
      } else if (permission.PublicService) {
        response = await directApi.admin.deleteServicePermission(permissionId)
      }

      if (!response.ok) {
        throw new Error("Failed to delete permission")
      }

      toast({
        title: "Permission deleted",
        description: "The permission has been deleted successfully.",
        variant: "default",
      })

      router.push("/admin/permissions")
    } catch (error) {
      console.error("Error deleting permission:", error)
      toast({
        title: "Error",
        description: "Failed to delete permission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const getPermissionType = () => {
    if (permission?.Department) return "Department"
    if (permission?.Association) return "Association"
    if (permission?.PublicService) return "Service"
    return "Unknown"
  }

  const getPermissionTarget = () => {
    if (permission?.Department) return permission.Department.Title
    if (permission?.Association) return permission.Association.Title
    if (permission?.PublicService) return permission.PublicService.Title
    return "Unknown"
  }

  const getPermissionUser = () => {
    if (permission?.Administrator) return permission.Administrator.AdministratorUserName
    if (permission?.Grantee) return permission.Grantee.GranteeUserName
    return "Unknown"
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/permissions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Permission Details</h1>
          </div>
          {permission && (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/admin/permissions/${permissionId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Permission
                </Link>
              </Button>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Permission</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this permission? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete Permission"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {isLoading ? (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : permission ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{permission.Name || "Unnamed Permission"}</CardTitle>
                  <CardDescription>Permission ID: {permission.id}</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <Shield className="h-5 w-5" />
                  <span>{getPermissionType()} Permission</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h3>
                <p className="whitespace-pre-line">{permission.Description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Permission Type</h3>
                  <div className="flex items-center gap-2">
                    {permission.Department && <Building className="h-4 w-4 text-slate-500" />}
                    {permission.Association && <Users className="h-4 w-4 text-slate-500" />}
                    {permission.PublicService && <Briefcase className="h-4 w-4 text-slate-500" />}
                    <p>{getPermissionType()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Target</h3>
                  <p>{getPermissionTarget()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">User</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <p>{getPermissionUser()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={permission.Active ? "success" : "secondary"}
                      className={
                        permission.Active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      }
                    >
                      {permission.Active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Switch checked={permission.Active} onCheckedChange={handleToggleStatus} id="permission-status" />
                      <Label htmlFor="permission-status">{permission.Active ? "Deactivate" : "Activate"}</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Start Time</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <p>{permission.StartTime ? new Date(permission.StartTime).toLocaleString() : "Not specified"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">End Time</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <p>{permission.EndTime ? new Date(permission.EndTime).toLocaleString() : "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Created</h3>
                <p>{new Date(permission.Created).toLocaleString()}</p>
              </div>

              {permission.Citizens && permission.Citizens.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Assigned Citizens</h3>
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {permission.Citizens.map((citizen: any) => (
                          <tr key={citizen.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {citizen.FirstName} {citizen.Surname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{citizen.UserName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{citizen.Email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/admin/permissions">Back to Permissions</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Alert>
            <AlertDescription>Permission not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
