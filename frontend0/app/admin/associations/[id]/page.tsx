"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  Edit,
  Trash,
  Users,
  Plus,
  Mail,
  Globe,
  FileText,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminAssociationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [association, setAssociation] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [grantees, setGrantees] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("services")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAssociationDetails()
    }
  }, [params.id])

  useEffect(() => {
    if (params.id && activeTab === "services") {
      fetchAssociationServices()
    } else if (params.id && activeTab === "grantees") {
      fetchAssociationGrantees()
    }
  }, [params.id, activeTab])

  const fetchAssociationDetails = async () => {
    setIsLoading(true)
    try {
      // Fetch association details
      const response = await directApi.admin.getAssociation(params.id as string)
      if (response.ok) {
        const data = await response.json()
        setAssociation(data)
      } else {
        throw new Error("Failed to fetch association details")
      }
    } catch (error) {
      console.error("Error fetching association details:", error)
      toast({
        title: "Error",
        description: "Failed to load association details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssociationServices = async () => {
    try {
      // Use the proper filtering format with double underscores for related fields
      const servicesResponse = await directApi.admin.getServices({
        Association__PublicId: params.id as string,
      })

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData)
      } else {
        throw new Error("Failed to fetch association services")
      }
    } catch (error) {
      console.error("Error fetching association services:", error)
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchAssociationGrantees = async () => {
    try {
      // Use the proper filtering format with double underscores for related fields
      const granteesResponse = await directApi.admin.getGrantees({
        Association__PublicId: params.id as string,
      })

      if (granteesResponse.ok) {
        const granteesData = await granteesResponse.json()
        setGrantees(granteesData)
      } else {
        throw new Error("Failed to fetch association grantees")
      }
    } catch (error) {
      console.error("Error fetching association grantees:", error)
      toast({
        title: "Error",
        description: "Failed to load grantees. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await directApi.admin.deleteAssociation(params.id as string)
      if (response.ok) {
        toast({
          title: "Association deleted",
          description: "The association has been deleted successfully.",
          variant: "default",
        })
        router.push("/admin/associations")
      } else {
        throw new Error("Failed to delete association")
      }
    } catch (error) {
      console.error("Error deleting association:", error)
      toast({
        title: "Error",
        description: "Failed to delete association. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/associations">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="animate-pulse h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>

          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-60 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!association) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Building className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">Association not found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
            The association you are looking for does not exist or you do not have permission to view it.
          </p>
          <Button asChild>
            <Link href="/admin/associations">Back to Associations</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/associations">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{association.Title}</h1>
            {association.Active !== undefined && (
              <Badge
                variant={association.Active ? "success" : "secondary"}
                className={association.Active ? "bg-green-100 text-green-800" : ""}
              >
                {association.Active ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/associations/${params.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the association and all related data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Association Details</CardTitle>
            <CardDescription>View detailed information about this association</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p>{association.Title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">
                      {association.Description || "No description provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{association.Email || "No email provided"}</p>
                  </div>
                  {association.Website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={association.Website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {association.Website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Department Information</h3>
                <div className="space-y-4">
                  {association.Department && (
                    <>
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <Link
                            href={`/admin/departments/${association.Department.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {association.Department.Title}
                          </Link>
                        </div>
                      </div>
                      {association.Department.Email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{association.Department.Email}</p>
                        </div>
                      )}
                      {association.Department.Telephone && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{association.Department.Telephone}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(association.Created).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-3 mr-1" />
                      <span>{new Date(association.Created).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(association.Updated || association.Created).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-3 mr-1" />
                      <span>{new Date(association.Updated || association.Created).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="services" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="services" className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>Services</span>
            </TabsTrigger>
            <TabsTrigger value="grantees" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Grantees</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Services provided by this association</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/admin/services/new?association=${params.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {services.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Visibility</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.Title}</TableCell>
                            <TableCell>
                              <Badge
                                variant={service.Active ? "success" : "secondary"}
                                className={service.Active ? "bg-green-100 text-green-800" : ""}
                              >
                                {service.Active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={service.Restricted ? "outline" : "default"}
                                className={!service.Restricted ? "bg-blue-100 text-blue-800" : ""}
                              >
                                {service.Restricted ? "Restricted" : "Public"}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(service.Created).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/services/${service.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Building className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No services found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                      This association does not have any services yet.
                    </p>
                    <Button asChild>
                      <Link href={`/admin/services/new?association=${params.id}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grantees" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Grantees</CardTitle>
                  <CardDescription>Grantees associated with this association</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/admin/grantees/new?association=${params.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Grantee
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {grantees.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Citizen</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grantees.map((grantee) => (
                          <TableRow key={grantee.id}>
                            <TableCell className="font-medium">{grantee.GranteeUserName}</TableCell>
                            <TableCell>{grantee.FirstEmail}</TableCell>
                            <TableCell>
                              {grantee.Citizen && grantee.Citizen.UserName ? grantee.Citizen.UserName : "N/A"}
                            </TableCell>
                            <TableCell>{new Date(grantee.Created).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/grantees/${grantee.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No grantees found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                      This association does not have any grantees yet.
                    </p>
                    <Button asChild>
                      <Link href={`/admin/grantees/new?association=${params.id}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Grantee
                      </Link>
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
