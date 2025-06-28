"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Users, Search, Plus, User, Briefcase } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [citizens, setCitizens] = useState<any[]>([])
  const [grantees, setGrantees] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("citizens")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // Fetch citizens
      const citizensResponse = await directApi.admin.getCitizens()
      if (citizensResponse.ok) {
        const citizensData = await citizensResponse.json()
        setCitizens(citizensData)
      }

      // Fetch grantees
      const granteesResponse = await directApi.admin.getGrantees()
      if (granteesResponse.ok) {
        const granteesData = await granteesResponse.json()
        setGrantees(granteesData)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredUsers = () => {
    if (searchQuery.trim() === "") {
      return activeTab === "citizens" ? citizens : grantees
    }

    const query = searchQuery.toLowerCase()

    if (activeTab === "citizens") {
      return citizens.filter(
        (citizen) =>
          citizen.UserName?.toLowerCase().includes(query) ||
          citizen.Email?.toLowerCase().includes(query) ||
          citizen.FirstName?.toLowerCase().includes(query) ||
          citizen.Surname?.toLowerCase().includes(query) ||
          citizen.NationalId?.toLowerCase().includes(query),
      )
    } else {
      return grantees.filter(
        (grantee) =>
          grantee.GranteeUserName?.toLowerCase().includes(query) ||
          grantee.FirstEmail?.toLowerCase().includes(query) ||
          grantee.Citizen?.UserName?.toLowerCase().includes(query) ||
          grantee.Association ||
          grantee.Citizen?.UserName?.toLowerCase().includes(query) ||
          grantee.Association?.Title?.toLowerCase().includes(query),
      )
    }
  }

  const filteredUsers = getFilteredUsers()

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage citizens and grantees in your department</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === "grantees" && (
              <Button asChild>
                <Link href="/admin/users/new-grantee" className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  New Grantee
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="citizens" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="citizens" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Citizens</span>
            </TabsTrigger>
            <TabsTrigger value="grantees" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>Grantees</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="citizens" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Citizens</CardTitle>
                <CardDescription>Registered citizens in your department</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    ))}
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>National ID</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((citizen) => (
                          <TableRow key={citizen.id}>
                            <TableCell className="font-medium">{citizen.UserName}</TableCell>
                            <TableCell>{`${citizen.FirstName} ${citizen.SecondName ? citizen.SecondName + " " : ""}${citizen.Surname}`}</TableCell>
                            <TableCell>{citizen.Email}</TableCell>
                            <TableCell>{citizen.NationalId}</TableCell>
                            <TableCell>{new Date(citizen.Created).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/users/citizen/${citizen.id}`}>View</Link>
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
                    <h3 className="text-lg font-medium mb-2">No citizens found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      {searchQuery
                        ? "No citizens match your search criteria. Try a different search term."
                        : "There are no citizens registered in your department yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grantees" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Grantees</CardTitle>
                <CardDescription>Service grantees in your department</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    ))}
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Citizen</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Association</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((grantee) => (
                          <TableRow key={grantee.id}>
                            <TableCell className="font-medium">{grantee.GranteeUserName}</TableCell>
                            <TableCell>{grantee.Citizen?.UserName || "N/A"}</TableCell>
                            <TableCell>{grantee.FirstEmail}</TableCell>
                            <TableCell>{grantee.Association?.Title || "Not Assigned"}</TableCell>
                            <TableCell>{new Date(grantee.Created).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/admin/users/grantee/${grantee.id}`}>View</Link>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/admin/users/grantee/${grantee.id}/edit`}>Edit</Link>
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
                    <Briefcase className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No grantees found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
                      {searchQuery
                        ? "No grantees match your search criteria. Try a different search term."
                        : "There are no grantees registered in your department yet."}
                    </p>
                    <Button asChild>
                      <Link href="/admin/users/new-grantee">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Grantee
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
