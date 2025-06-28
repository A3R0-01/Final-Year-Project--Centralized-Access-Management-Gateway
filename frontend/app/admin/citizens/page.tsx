"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { User, Search, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminCitizensPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [citizens, setCitizens] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCitizens, setFilteredCitizens] = useState<any[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [citizenToDelete, setCitizenToDelete] = useState<any>(null)

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
      const response = await directApi.admin.getCitizens()
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

  const handleDeleteCitizen = (citizen: any) => {
    setCitizenToDelete(citizen)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCitizen = async () => {
    if (!citizenToDelete) return

    setDeletingId(citizenToDelete.id)
    try {
      const response = await directApi.admin.deleteCitizen(citizenToDelete.id)
      if (!response.ok) {
        throw new Error("Failed to delete citizen")
      }

      toast({
        title: "Citizen deleted",
        description: "The citizen has been deleted successfully.",
        variant: "default",
      })

      // Remove from local state
      setCitizens((prev) => prev.filter((c) => c.id !== citizenToDelete.id))
      setDeleteDialogOpen(false)
      setCitizenToDelete(null)
    } catch (error) {
      console.error("Error deleting citizen:", error)
      toast({
        title: "Error",
        description: "Failed to delete citizen. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Citizens</h1>
            <p className="text-muted-foreground">Manage registered citizens in your department</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search citizens..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link href="/admin/citizens/new">
                <Plus className="h-4 w-4 mr-2" />
                New Citizen
              </Link>
            </Button>
          </div>
        </div>

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
            ) : filteredCitizens.length > 0 ? (
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
                    {filteredCitizens.map((citizen) => (
                      <TableRow key={citizen.id}>
                        <TableCell className="font-medium">{citizen.UserName}</TableCell>
                        <TableCell>{`${citizen.FirstName} ${citizen.SecondName ? citizen.SecondName + " " : ""}${citizen.Surname}`}</TableCell>
                        <TableCell>{citizen.Email}</TableCell>
                        <TableCell>{citizen.NationalId}</TableCell>
                        <TableCell>{new Date(citizen.Created).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/admin/citizens/${citizen.id}`}>View</Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCitizen(citizen)}
                              disabled={deletingId === citizen.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deletingId === citizen.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
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
                <User className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
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
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Citizen</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the citizen "{citizenToDelete?.UserName}" ({citizenToDelete?.Email})? This
              action cannot be undone and will affect all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCitizen} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
