"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type UserRole = "citizen" | "manager" | "admin" | "grantee"

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams?.get("role") as UserRole) || "citizen"

  const [role, setRole] = useState<UserRole>(defaultRole)
  const [error, setError] = useState("")

  // Update the login form to collect both citizen and role-specific credentials
  const [formData, setFormData] = useState({
    Email: "",
    password: "",
    ManagerUserName: "",
    AdministratorUserName: "",
    GranteeUserName: "",
    ManagerPassword: "",
    AdministratorPassword: "",
    GranteePassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.Email || !formData.password) {
      setError("Email and password are required")
      return
    }

    try {
      // For non-citizen roles, we need to ensure role-specific username and password are provided
      if (role !== "citizen") {
        if (role === "manager") {
          if (!formData.ManagerUserName) {
            setError("Manager username is required")
            return
          }
          if (!formData.ManagerPassword) {
            setError("Manager password is required")
            return
          }
        } else if (role === "admin") {
          if (!formData.AdministratorUserName) {
            setError("Administrator username is required")
            return
          }
          if (!formData.AdministratorPassword) {
            setError("Administrator password is required")
            return
          }
        } else if (role === "grantee") {
          if (!formData.GranteeUserName) {
            setError("Grantee username is required")
            return
          }
          if (!formData.GranteePassword) {
            setError("Grantee password is required")
            return
          }
        }
      }

      // For each role, pass the appropriate role-specific credentials
      if (role === "manager") {
        await login(formData.Email, formData.password, role, formData.ManagerUserName, formData.ManagerPassword)
      } else if (role === "admin") {
        await login(
          formData.Email,
          formData.password,
          role,
          formData.AdministratorUserName,
          formData.AdministratorPassword,
        )
      } else if (role === "grantee") {
        await login(formData.Email, formData.password, role, formData.GranteeUserName, formData.GranteePassword)
      } else {
        await login(formData.Email, formData.password, role)
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    }
  }

  const roleTitles = {
    citizen: "Citizen Portal",
    manager: "Site Manager Portal",
    admin: "Administrator Portal",
    grantee: "Grantee Portal",
  }

  const roleColors = {
    citizen: "bg-blue-500",
    manager: "bg-purple-500",
    admin: "bg-emerald-500",
    grantee: "bg-amber-500",
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-10 h-10 rounded-md ${roleColors[role]} flex items-center justify-center`}>
              <span className="text-white font-bold">{roleTitles[role].charAt(0)}</span>
            </div>
            <CardTitle className="text-2xl">{roleTitles[role]}</CardTitle>
          </div>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>

        <Tabs defaultValue={role} onValueChange={(value) => setRole(value as UserRole)}>
          <TabsList className="grid grid-cols-4 mx-6">
            <TabsTrigger value="citizen">Citizen</TabsTrigger>
            <TabsTrigger value="manager">Manager</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="grantee">Grantee</TabsTrigger>
          </TabsList>

          {["citizen", "manager", "admin", "grantee"].map((roleType) => (
            <TabsContent key={roleType} value={roleType}>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Citizen credentials section */}
                  <div className="space-y-4">
                    {roleType !== "citizen" && (
                      <div className="font-medium text-sm text-gray-500 dark:text-gray-400 pt-2">
                        Citizen Account Credentials
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="Email">Email</Label>
                      <Input
                        id="Email"
                        name="Email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.Email}
                        onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Role-specific credentials section */}
                  {roleType !== "citizen" && (
                    <div className="space-y-4 pt-2 border-t">
                      <div className="font-medium text-sm text-gray-500 dark:text-gray-400 pt-2">
                        {roleType === "manager"
                          ? "Manager Account Credentials"
                          : roleType === "admin"
                            ? "Administrator Account Credentials"
                            : "Grantee Account Credentials"}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={
                            roleType === "manager"
                              ? "ManagerUserName"
                              : roleType === "admin"
                                ? "AdministratorUserName"
                                : "GranteeUserName"
                          }
                        >
                          {roleType === "manager"
                            ? "Manager Username"
                            : roleType === "admin"
                              ? "Administrator Username"
                              : "Grantee Username"}
                        </Label>
                        <Input
                          id={
                            roleType === "manager"
                              ? "ManagerUserName"
                              : roleType === "admin"
                                ? "AdministratorUserName"
                                : "GranteeUserName"
                          }
                          name={
                            roleType === "manager"
                              ? "ManagerUserName"
                              : roleType === "admin"
                                ? "AdministratorUserName"
                                : "GranteeUserName"
                          }
                          value={
                            roleType === "manager"
                              ? formData.ManagerUserName
                              : roleType === "admin"
                                ? formData.AdministratorUserName
                                : formData.GranteeUserName
                          }
                          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                          placeholder="Username"
                          required={roleType !== "citizen"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor={
                            roleType === "manager"
                              ? "ManagerPassword"
                              : roleType === "admin"
                                ? "AdministratorPassword"
                                : "GranteePassword"
                          }
                        >
                          {roleType === "manager"
                            ? "Manager Password"
                            : roleType === "admin"
                              ? "Administrator Password"
                              : "Grantee Password"}
                        </Label>
                        <Input
                          id={
                            roleType === "manager"
                              ? "ManagerPassword"
                              : roleType === "admin"
                                ? "AdministratorPassword"
                                : "GranteePassword"
                          }
                          name={
                            roleType === "manager"
                              ? "ManagerPassword"
                              : roleType === "admin"
                                ? "AdministratorPassword"
                                : "GranteePassword"
                          }
                          type="password"
                          value={
                            roleType === "manager"
                              ? formData.ManagerPassword
                              : roleType === "admin"
                                ? formData.AdministratorPassword
                                : formData.GranteePassword
                          }
                          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                          required={roleType !== "citizen"}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>

                  {roleType === "citizen" && (
                    <div className="text-center text-sm">
                      Don't have an account?{" "}
                      <Link
                        href="/auth/register"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </CardFooter>
              </form>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}
