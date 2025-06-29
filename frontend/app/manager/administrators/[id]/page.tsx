"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { directApi } from "@/lib/api-direct"
import { ArrowLeft, Edit, User, Building } from "lucide-react"

export default function ManagerAdministratorDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [administrator, setAdministrator] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdministrator = async () => {
      try {
        setLoading(true)
        const response = await directApi.manager.getAdministrator(id as string)
        if (response.ok) {
          const data = await response.json()
          setAdministrator(data)
        } else {
          throw new Error("Failed to fetch administrator details")
        }
      } catch (err: any) {
        console.error("Error fetching administrator:", err)
        toast({
          title: "Error",
          description: "Failed to load administrator details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAdministrator()
    }
  }, [id, toast])

  if (loading) {
    return (
      <DashboardLayout role="manager">
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="animate-pulse">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!administrator) {
    return (
      <DashboardLayout role="manager">
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Administrator not found</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              The administrator you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push("/manager/administrators")} className="mt-4">
              Back to Administrators
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="manager">
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Administrator Details</h1>
          </div>
          <Button onClick={() => router.push(`/manager/administrators/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Administrator
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Administrator Information</span>
              </CardTitle>
              <CardDescription>Basic administrator details and account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
                <p className="text-lg font-semibold">{administrator.AdministratorUserName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Email</label>
                <p className="text-lg">{administrator.FirstEmail}</p>
              </div>

              {administrator.SecondEmail && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Secondary Email</label>
                  <p className="text-lg">{administrator.SecondEmail}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Grantee Limit</label>
                <p className="text-lg font-semibold">{administrator.GranteeLimit}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</label>
                <p className="text-lg">{new Date(administrator.Created).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                <p className="text-lg">{new Date(administrator.Updated).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Citizen Information</span>
              </CardTitle>
              <CardDescription>Associated citizen account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {administrator.Citizen ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Citizen Username</label>
                    <p className="text-lg font-semibold">{administrator.Citizen.UserName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">National ID</label>
                    <p className="text-lg">{administrator.Citizen.NationalId}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Citizen ID</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{administrator.Citizen.id}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No citizen information available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>System Information</span>
            </CardTitle>
            <CardDescription>Administrator system details and metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Administrator ID</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{administrator.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                <Badge variant="secondary">Administrator</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
