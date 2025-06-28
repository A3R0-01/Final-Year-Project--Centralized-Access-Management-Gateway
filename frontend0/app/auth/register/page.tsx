"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const { register, isLoading } = useAuth()

  // Update the registration form to match the backend requirements
  const [formData, setFormData] = useState({
    UserName: "",
    Email: "",
    FirstName: "",
    SecondName: "",
    Surname: "",
    NationalId: "",
    DOB: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (
      !formData.UserName ||
      !formData.Email ||
      !formData.FirstName ||
      !formData.Surname ||
      !formData.NationalId ||
      !formData.DOB ||
      !formData.password
    ) {
      setError("All fields are required except Second Name")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    try {
      // Format the data to match the backend API
      const registrationData = {
        UserName: formData.UserName,
        Email: formData.Email,
        FirstName: formData.FirstName,
        SecondName: formData.SecondName || null,
        Surname: formData.Surname,
        NationalId: formData.NationalId,
        DOB: new Date(formData.DOB).toISOString(),
        password: formData.password,
      }

      await register(registrationData)
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <CardTitle className="text-2xl">Citizen Registration</CardTitle>
          </div>
          <CardDescription>Create a new account to access citizen services</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="UserName">Username</Label>
              <Input id="UserName" name="UserName" value={formData.UserName} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="FirstName">First Name</Label>
                <Input id="FirstName" name="FirstName" value={formData.FirstName} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="Surname" value={formData.Surname} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="Email"
                type="email"
                placeholder="name@example.com"
                value={formData.Email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="NationalId">National ID</Label>
              <Input id="NationalId" name="NationalId" value={formData.NationalId} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="DOB">Date of Birth</Label>
              <Input id="DOB" name="DOB" type="date" value={formData.DOB} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login?role=citizen"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
