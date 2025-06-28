"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Building, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CitizenDepartmentsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [departments, setDepartments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([])

  useEffect(() => {
    fetchDepartments()
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
      const response = await directApi.citizen.getDepartments()
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
        setFilteredDepartments(data)
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

  return (
    <DashboardLayout role="citizen">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Government Departments</h1>
            <p className="text-muted-foreground">Browse departments and their services</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search departments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
            <CardDescription>View government departments and their details</CardDescription>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.Title}</TableCell>
                        <TableCell className="max-w-xs truncate">{department.Description}</TableCell>
                        <TableCell>{department.associations?.length || 0}</TableCell>
                        <TableCell>{new Date(department.Created).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Building className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No departments found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  {searchQuery
                    ? "No departments match your search criteria. Try a different search term."
                    : "There are no departments in the system yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
