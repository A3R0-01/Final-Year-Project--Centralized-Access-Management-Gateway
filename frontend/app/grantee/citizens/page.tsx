"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { Users, Search } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function GranteeCitizensPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [citizens, setCitizens] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCitizens, setFilteredCitizens] = useState<any[]>([])

  useEffect(() => {
    fetchCitizens()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCitizens(citizens)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = citizens.filter(
        (citizen) =>
          citizen.UserName?.toLowerCase().includes(query) ||
          citizen.Email?.toLowerCase().includes(query) ||
          citizen.FirstName?.toLowerCase().includes(query) ||
          citizen.Surname?.toLowerCase().includes(query) ||
          citizen.NationalId?.toLowerCase().includes(query),
      )
      setFilteredCitizens(filtered)
    }
  }, [searchQuery, citizens])

  const fetchCitizens = async () => {
    setIsLoading(true)
    try {
      const response = await directApi.grantee.getCitizens()
      if (response.ok) {
        const data = await response.json()
        setCitizens(data)
        setFilteredCitizens(data)
      } else {
        throw new Error("Failed to fetch citizens")
      }
    } catch (error) {
      console.error("Error fetching citizens:", error)
      toast({
        title: "Error",
        description: "Failed to load citizens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Citizens</h1>
            <p className="text-muted-foreground">View and manage citizen information</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search citizens..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Citizens</CardTitle>
            <CardDescription>Citizens who can request services and receive grants</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                ))}
              </div>
            ) : filteredCitizens.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCitizens.map((citizen) => (
                      <TableRow key={citizen.id}>
                        <TableCell className="font-medium">{citizen.UserName}</TableCell>
                        <TableCell>{`${citizen.FirstName} ${citizen.SecondName ? citizen.SecondName + " " : ""}${citizen.Surname}`}</TableCell>
                        <TableCell>{citizen.Email}</TableCell>
                        <TableCell>{citizen.NationalId}</TableCell>
                        <TableCell>{citizen.requests?.length || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/grantee/citizens/${citizen.id}`}>View Profile</Link>
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
                    : "There are no citizens registered in the system yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
