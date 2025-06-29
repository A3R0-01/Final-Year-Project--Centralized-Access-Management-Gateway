"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import {
  Menu,
  Home,
  Users,
  FileText,
  Building2,
  LogOut,
  User,
  Shield,
  UserCheck,
  Gift,
  Activity,
  Globe,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "citizen" | "manager" | "admin" | "grantee"
}

const navigationItems = {
  citizen: [
    { name: "Dashboard", href: "/citizen/dashboard", icon: Home },
    { name: "Services", href: "/citizen/services", icon: Globe },
    { name: "Requests", href: "/citizen/requests", icon: FileText },
    { name: "Grants", href: "/citizen/grants", icon: Gift },
    { name: "Departments", href: "/citizen/departments", icon: Building2 },
    { name: "Associations", href: "/citizen/associations", icon: Users },
  ],
  manager: [
    { name: "Dashboard", href: "/manager/dashboard", icon: Home },
    { name: "Users", href: "/manager/users", icon: Users },
    { name: "Citizens", href: "/manager/citizens", icon: User },
    { name: "Administrators", href: "/manager/administrators", icon: Shield },
    { name: "Grantees", href: "/manager/grantees", icon: UserCheck },
    { name: "Departments", href: "/manager/departments", icon: Building2 },
    { name: "Associations", href: "/manager/associations", icon: Users },
    { name: "Services", href: "/manager/services", icon: Globe },
    { name: "Requests", href: "/manager/requests", icon: FileText },
    { name: "Grants", href: "/manager/grants", icon: Gift },
    { name: "Permissions", href: "/manager/permissions", icon: Shield },
    { name: "Logs", href: "/manager/logs", icon: Activity },
  ],
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Citizens", href: "/admin/citizens", icon: User },
    { name: "Grantees", href: "/admin/grantees", icon: UserCheck },
    { name: "Departments", href: "/admin/departments", icon: Building2 },
    { name: "Associations", href: "/admin/associations", icon: Users },
    { name: "Services", href: "/admin/services", icon: Globe },
    { name: "Requests", href: "/admin/requests", icon: FileText },
    { name: "Grants", href: "/admin/grants", icon: Gift },
    { name: "Permissions", href: "/admin/permissions", icon: Shield },
    { name: "Logs", href: "/admin/logs", icon: Activity },
  ],
  grantee: [
    { name: "Dashboard", href: "/grantee/dashboard", icon: Home },
    { name: "Citizens", href: "/grantee/citizens", icon: User },
    { name: "Services", href: "/grantee/services", icon: Globe },
    { name: "Requests", href: "/grantee/requests", icon: FileText },
    { name: "Grants", href: "/grantee/grants", icon: Gift },
    { name: "Permissions", href: "/grantee/permissions", icon: Shield },
    { name: "Logs", href: "/grantee/logs", icon: Activity },
  ],
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/login")
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const navigation = navigationItems[role] || []

  const isActivePath = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Access Management</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActivePath(item.href)
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center flex-shrink-0 px-4 py-5">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Access Management</h1>
            </div>
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActivePath(item.href)
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{role} Portal</h2>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(role === "citizen" || role === "manager") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/${role}/profile`}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
