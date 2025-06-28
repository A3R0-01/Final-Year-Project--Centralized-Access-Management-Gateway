"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Building, Search, Mail, Globe } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CitizenAssociationsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [associations, setAssociations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAssociations, setFilteredAssociations] = useState<any[]>([])

  useEffect(() => {
    fetchAssociations()
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/association/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch associations")
      }

      const data = await response.json()
      setAssociations(data)
      setFilteredAssociations(data)
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

  return (
    <DashboardLayout role="citizen">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Associations</h1>
            <p className="text-muted-foreground">Browse government associations and their services</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search associations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Associations</CardTitle>
            <CardDescription>Government associations providing public services</CardDescription>
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
                      <TableHead>Association Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssociations.map((association) => (
                      <TableRow key={association.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-slate-500" />
                            <div>
                              <div className="font-medium">{association.Title}</div>
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                {association.Email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{association.Email}</span>
                                  </div>
                                )}
                                {association.Website && (
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    <a
                                      href={association.Website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline"
                                    >
                                      Website
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{association.Department?.Title || "N/A"}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={association.Description}>
                            {association.Description || "No description available"}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(association.Created).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Building className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No associations found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  {searchQuery
                    ? "No associations match your search criteria. Try a different search term."
                    : "There are no associations available at the moment."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
