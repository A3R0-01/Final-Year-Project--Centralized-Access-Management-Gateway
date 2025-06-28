"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Building,
  Briefcase,
  Users,
  FileText,
  Edit,
  Plus,
  Shield,
  Mail,
  Phone,
  LinkIcon,
  Calendar,
  Clock,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DepartmentDetailPage() {
  const params = useParams()
  const departmentId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [department, setDepartment] = useState<any>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  const [isAssociationsLoading, setIsAssociationsLoading] = useState(false)
  const [isAdministratorsLoading, setIsAdministratorsLoading] = useState(false)
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false)
  const [isServicesLoading, setIsServicesLoading] = useState(false)

  useEffect(() => {
    fetchDepartmentDetails()
  }, [departmentId])

  const fetchDepartmentDetails = async () => {
    if (!departmentId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/manager/department/${departmentId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch department details")
      }

      const data = await response.json()
      setDepartment(data)

      // Fetch associations for this department
      const associationsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manager/association/?Department__PublicId=${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (associationsResponse.ok) {
        const associationsData = await associationsResponse.json()

        // Fetch service counts for each association
        const associationsWithServiceCounts = await Promise.all(
          associationsData.map(async (association: any) => {
            try {
              const servicesResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/manager/service/?Association__PublicId=${association.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                  },
                },
              )

              if (servicesResponse.ok) {
                const servicesData = await servicesResponse.json()
                return {
                  ...association,
                  serviceCount: servicesData.length || 0,
                }
              }
              return {
                ...association,
                serviceCount: 0,
              }
            } catch (error) {
              console.error(`Error fetching services for association ${association.id}:`, error)
              return {
                ...association,
                serviceCount: 0,
              }
            }
          }),
        )

        setDepartment((prev) => ({
          ...prev,
          associations: associationsWithServiceCounts,
        }))
      }

      // Fetch administrators for this department
      const adminsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manager/administrator/?department__PublicId=${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json()
        setDepartment((prev) => ({
          ...prev,
          administrators: adminsData,
        }))
      }

      // Fetch permissions for this department
      const permissionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/manager/permission/department/?Department__PublicId=${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json()
        setDepartment((prev) => ({
          ...prev,
          permissions: permissionsData,
        }))
      }

      console.log("Department data loaded with related records:", data)
    } catch (error) {
      console.error("Error fetching department details:", error)
      setError("Failed to load department details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadTabData = async (tab) => {
    if (!departmentId) return

    if (tab === "associations" && (!department?.associations || department.associations.length === 0)) {
      setIsAssociationsLoading(true)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manager/association/?Department__PublicId=${departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        )

        if (response.ok) {
          const associationsData = await response.json()

          // Fetch service counts for each association
          const associationsWithServiceCounts = await Promise.all(
            associationsData.map(async (association: any) => {
              try {
                const servicesResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/manager/service/?Association__PublicId=${association.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                  },
                )

                if (servicesResponse.ok) {
                  const servicesData = await servicesResponse.json()
                  return {
                    ...association,
                    serviceCount: servicesData.length || 0,
                  }
                }
                return {
                  ...association,
                  serviceCount: 0,
                }
              } catch (error) {
                console.error(`Error fetching services for association ${association.id}:`, error)
                return {
                  ...association,
                  serviceCount: 0,
                }
              }
            }),
          )

          setDepartment((prev) => ({
            ...prev,
            associations: associationsWithServiceCounts,
          }))
        }
      } catch (error) {
        console.error("Error fetching associations:", error)
      } finally {
        setIsAssociationsLoading(false)
      }
    }

    if (tab === "administrators" && (!department?.administrators || department.administrators.length === 0)) {
      setIsAdministratorsLoading(true)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manager/administrator/?department__PublicId=${departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          setDepartment((prev) => ({
            ...prev,
            administrators: data,
          }))
        }
      } catch (error) {
        console.error("Error fetching administrators:", error)
      } finally {
        setIsAdministratorsLoading(false)
      }
    }

    if (tab === "permissions" && (!department?.permissions || department.permissions.length === 0)) {
      setIsPermissionsLoading(true)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manager/permission/department/?Department__PublicId=${departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          setDepartment((prev) => ({
            ...prev,
            permissions: data,
          }))
        }
      } catch (error) {
        console.error("Error fetching permissions:", error)
      } finally {
        setIsPermissionsLoading(false)
      }
    }

    if (tab === "services" && (!department?.services || department.services.length === 0)) {
      setIsServicesLoading(true)
      try {
        // First get all associations for this department
        const associationsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/manager/association/?Department__PublicId=${departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        )

        if (associationsResponse.ok) {
          const associationsData = await associationsResponse.json()

          // If we have associations, fetch services for each association
          if (associationsData && associationsData.length > 0) {
            const associationIds = associationsData.map((assoc) => assoc.id).join(",")

            const servicesResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/manager/service/?Association__PublicId__in=[${associationIds}]`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              },
            )

            if (servicesResponse.ok) {
              const servicesData = await servicesResponse.json()
              setDepartment((prev) => ({
                ...prev,
                services: servicesData,
              }))
            }
          } else {
            setDepartment((prev) => ({
              ...prev,
              services: [],
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setIsServicesLoading(false)
      }
    }
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/manager/departments">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Department Details</h1>
          </div>
          {department && (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/manager/permission/new?type=department&departmentId=${departmentId}`}>
                  <Shield className="h-4 w-4 mr-2" />
                  Add Permission
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/manager/departments/${departmentId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Department
                </Link>
              </Button>
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
        ) : department ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">{department.Title}</CardTitle>
                    <CardDescription>Department ID: {department.id}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    <Building className="h-5 w-5" />
                    <span>Department</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="details"
                  onValueChange={(value) => {
                    setActiveTab(value)
                    loadTabData(value)
                  }}
                >
                  <TabsList>
                    <TabsTrigger value="details">Department Details</TabsTrigger>
                    <TabsTrigger value="associations">Associations</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="administrators">Administrators</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</h3>
                      <p className="whitespace-pre-line">{department.Description || "No description provided"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Contact Information
                        </h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-500" />
                            <span>{department.Email || "No email provided"}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-500" />
                            <span>{department.Telephone || "No phone provided"}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-slate-500" />
                            {department.Website ? (
                              <a
                                href={department.Website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {department.Website}
                              </a>
                            ) : (
                              <span>No website provided</span>
                            )}
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Timestamps</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="font-medium">Created:</span>
                            <span>{new Date(department.Created).toLocaleString()}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="font-medium">Last Updated:</span>
                            <span>{new Date(department.Updated || department.Created).toLocaleString()}</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-slate-500" />
                            Associations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{department.associations?.length || 0}</div>
                          <p className="text-xs text-muted-foreground">Total associations in this department</p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild variant="ghost" size="sm" className="w-full">
                            <Link href={`/manager/associations/new?departmentId=${departmentId}`}>
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Association
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            Services
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{department.services?.length || 0}</div>
                          <p className="text-xs text-muted-foreground">Total services in this department</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-500" />
                            Administrators
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{department.administrators?.length || 0}</div>
                          <p className="text-xs text-muted-foreground">Administrators managing this department</p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild variant="ghost" size="sm" className="w-full">
                            <Link href={`/manager/permission/new?type=department&departmentId=${departmentId}`}>
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Administrator
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="associations" className="mt-4">
                    <div className="flex justify-end mb-4">
                      <Button asChild>
                        <Link href={`/manager/associations/new?departmentId=${departmentId}`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Association
                        </Link>
                      </Button>
                    </div>
                    {isAssociationsLoading ? (
                      <div className="space-y-4 mt-4">
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      </div>
                    ) : department.associations && department.associations.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Association Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Services</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {department.associations.map((association: any) => (
                              <TableRow key={association.id}>
                                <TableCell className="font-medium">{association.Title}</TableCell>
                                <TableCell className="max-w-xs truncate">{association.Description}</TableCell>
                                <TableCell>{association.serviceCount ?? 0}</TableCell>
                                <TableCell>{new Date(association.Created).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/manager/associations/${association.id}`}>View</Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                          <Briefcase className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No associations found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            This department doesn't have any associations yet.
                          </p>
                          <Button asChild>
                            <Link href={`/manager/associations/new?departmentId=${departmentId}`}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Association
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="services" className="mt-4">
                    <div className="flex justify-end mb-4">
                      <Button asChild>
                        <Link href={`/manager/services/new?departmentId=${departmentId}`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Link>
                      </Button>
                    </div>
                    {isServicesLoading ? (
                      <div className="space-y-4 mt-4">
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      </div>
                    ) : department.services && department.services.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Service Name</TableHead>
                              <TableHead>Machine Name</TableHead>
                              <TableHead>Association</TableHead>
                              <TableHead>Restricted</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {department.services.map((service: any) => (
                              <TableRow key={service.id}>
                                <TableCell className="font-medium">{service.Title}</TableCell>
                                <TableCell>{service.MachineName}</TableCell>
                                <TableCell>{service.Association?.Title || "Unknown"}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={service.Restricted ? "destructive" : "success"}
                                    className={
                                      service.Restricted
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    }
                                  >
                                    {service.Restricted ? "Restricted" : "Public"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/manager/services/${service.id}`}>View</Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No services found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            This department doesn't have any services yet.
                          </p>
                          <Button asChild>
                            <Link href={`/manager/services/new?departmentId=${departmentId}`}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Service
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="administrators" className="mt-4">
                    <div className="flex justify-end mb-4">
                      <Button asChild>
                        <Link href={`/manager/permission/new?type=department&departmentId=${departmentId}`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Administrator
                        </Link>
                      </Button>
                    </div>
                    {isAdministratorsLoading ? (
                      <div className="space-y-4 mt-4">
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      </div>
                    ) : department.administrators && department.administrators.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Username</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {department.administrators.map((admin: any) => (
                              <TableRow key={admin.id}>
                                <TableCell className="font-medium">{admin.AdministratorUserName}</TableCell>
                                <TableCell>{admin.FirstEmail}</TableCell>
                                <TableCell>{new Date(admin.Created).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/manager/users/administrator/${admin.id}`}>View</Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                          <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No administrators found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            This department doesn't have any administrators assigned yet.
                          </p>
                          <Button asChild>
                            <Link href={`/manager/permission/new?type=department&departmentId=${departmentId}`}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Administrator
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="permissions" className="mt-4">
                    <div className="flex justify-end mb-4">
                      <Button asChild>
                        <Link href={`/manager/permission/new?type=department&departmentId=${departmentId}`}>
                          <Shield className="h-4 w-4 mr-2" />
                          Add Permission
                        </Link>
                      </Button>
                    </div>
                    {isPermissionsLoading ? (
                      <div className="space-y-4 mt-4">
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      </div>
                    ) : department.permissions && department.permissions.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Time Period</TableHead>
                              <TableHead>Citizens</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {department.permissions.map((permission: any) => (
                              <TableRow key={permission.id}>
                                <TableCell className="font-medium">{permission.Name}</TableCell>
                                <TableCell className="max-w-xs truncate">{permission.Description}</TableCell>
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
                                <TableCell>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1 text-xs">
                                      <Calendar className="h-3 w-3" />
                                      <span>Start: {new Date(permission.StartTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs mt-1">
                                      <Clock className="h-3 w-3" />
                                      <span>End: {new Date(permission.EndTime).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {permission.Citizens && permission.Citizens.length > 0 ? (
                                    <span className="text-sm">{permission.Citizens.length} citizens</span>
                                  ) : (
                                    <span className="text-sm">No citizens</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/manager/permission/${permission.id}`}>View</Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                          <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-medium mb-2">No permissions found</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            This department doesn't have any permissions assigned yet.
                          </p>
                          <Button asChild>
                            <Link href={`/manager/permission/new?type=department&departmentId=${departmentId}`}>
                              <Shield className="h-4 w-4 mr-2" />
                              Add Permission
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href="/manager/departments">Back to Departments</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/manager/departments/${departmentId}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Department
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </>
        ) : (
          <Alert>
            <AlertDescription>Department not found</AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  )
}
