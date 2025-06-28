"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Building, Briefcase, Users, FileText, LinkIcon, Mail, Phone } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminDepartmentDetailPage() {
  const params = useParams()
  const departmentId = params?.id as string
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [department, setDepartment] = useState<any>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    fetchDepartmentDetails()
  }, [departmentId])

  const fetchDepartmentDetails = async () => {
    if (!departmentId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/department/${departmentId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch department details")
      }

      const data = await response.json()
      setDepartment(data)
      console.log("Department data loaded:", data)
    } catch (error) {
      console.error("Error fetching department details:", error)
      setError("Failed to load department details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/departments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Department Details</h1>
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
                <Tabs defaultValue="details" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="details">Department Details</TabsTrigger>
                    <TabsTrigger value="associations">Associations</TabsTrigger>
                    <TabsTrigger value="administrators">Administrators</TabsTrigger>
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
                            <span>{new Date(department.Updated).toLocaleString()}</span>
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
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            Services
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{department.services_count || 0}</div>
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
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="associations" className="mt-4">
                    {department.associations && department.associations.length > 0 ? (
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
                                <TableCell>{association.services?.length || 0}</TableCell>
                                <TableCell>{new Date(association.Created).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/associations/${association.id}`}>View</Link>
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
                            <Link href="/admin/associations/new">Create Association</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="administrators" className="mt-4">
                    {department.administrators && department.administrators.length > 0 ? (
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
                                    <Link href={`/admin/users/administrator/${admin.id}`}>View</Link>
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
                            <Link href="/admin/users/new-administrator">Create Administrator</Link>
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
                    <Link href="/admin/departments">Back to Departments</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/admin/departments/${departmentId}/edit`}>Edit Department</Link>
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
