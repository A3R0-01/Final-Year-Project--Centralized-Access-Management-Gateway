"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  Building,
  ChevronDown,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Shield,
  User,
  Users,
  Briefcase,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { setupTokenRefresh, cleanupTokenRefresh } from "@/lib/token-refresh"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}

const NavItem = ({ href, icon, label, active, onClick }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        active ? "bg-muted font-medium text-primary" : "text-muted-foreground",
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </Link>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "citizen" | "manager" | "admin" | "grantee"
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [refreshIntervalId, setRefreshIntervalId] = useState<number | null>(null)

  useEffect(() => {
    // Set up token refresh
    const intervalId = setupTokenRefresh()
    setRefreshIntervalId(intervalId)

    // Clean up on unmount
    return () => {
      if (refreshIntervalId) {
        cleanupTokenRefresh(refreshIntervalId)
      }
    }
  }, [])

  // Check if the current page is a "new" or "edit" page to handle it specially
  const isFormPage = pathname?.includes("/new") || pathname?.includes("/edit")

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Helper function to determine if a nav item should be active
  const isNavItemActive = (basePath: string) => {
    if (!pathname) return false

    // For form pages (/new or /edit), don't highlight any nav item
    if (isFormPage) return false

    // For normal pages, check if the pathname starts with the base path
    return pathname.startsWith(basePath)
  }

  const renderNavItems = () => {
    if (role === "citizen") {
      return (
        <>
          <NavItem
            href="/citizen/dashboard"
            icon={<Home className="h-4 w-4" />}
            label="Dashboard"
            active={pathname === "/citizen/dashboard"}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/citizen/services"
            icon={<Briefcase className="h-4 w-4" />}
            label="Services"
            active={isNavItemActive("/citizen/services")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/citizen/requests"
            icon={<ClipboardList className="h-4 w-4" />}
            label="My Requests"
            active={isNavItemActive("/citizen/requests")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/citizen/grants"
            icon={<FileText className="h-4 w-4" />}
            label="My Grants"
            active={isNavItemActive("/citizen/grants")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/citizen/departments"
            icon={<Building className="h-4 w-4" />}
            label="Departments"
            active={isNavItemActive("/citizen/departments")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/citizen/associations"
            icon={<Users className="h-4 w-4" />}
            label="Associations"
            active={isNavItemActive("/citizen/associations")}
            onClick={closeMobileMenu}
          />
        </>
      )
    } else if (role === "manager") {
      return (
        <>
          <NavItem
            href="/manager/dashboard"
            icon={<Home className="h-4 w-4" />}
            label="Dashboard"
            active={pathname === "/manager/dashboard"}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/departments"
            icon={<Building className="h-4 w-4" />}
            label="Departments"
            active={isNavItemActive("/manager/departments")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/associations"
            icon={<Users className="h-4 w-4" />}
            label="Associations"
            active={isNavItemActive("/manager/associations")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/services"
            icon={<Briefcase className="h-4 w-4" />}
            label="Services"
            active={isNavItemActive("/manager/services")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/citizens"
            icon={<User className="h-4 w-4" />}
            label="Citizens"
            active={isNavItemActive("/manager/citizens")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/administrators"
            icon={<Shield className="h-4 w-4" />}
            label="Administrators"
            active={isNavItemActive("/manager/administrators")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/grantees"
            icon={<Users className="h-4 w-4" />}
            label="Grantees"
            active={isNavItemActive("/manager/grantees")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/requests"
            icon={<ClipboardList className="h-4 w-4" />}
            label="Requests"
            active={isNavItemActive("/manager/requests")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/grants"
            icon={<FileText className="h-4 w-4" />}
            label="Grants"
            active={isNavItemActive("/manager/grants")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/permissions"
            icon={<Shield className="h-4 w-4" />}
            label="Permissions"
            active={isNavItemActive("/manager/permissions")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/manager/logs"
            icon={<Clock className="h-4 w-4" />}
            label="Activity Logs"
            active={isNavItemActive("/manager/logs")}
            onClick={closeMobileMenu}
          />
        </>
      )
    } else if (role === "admin") {
      return (
        <>
          <NavItem
            href="/admin/dashboard"
            icon={<Home className="h-4 w-4" />}
            label="Dashboard"
            active={pathname === "/admin/dashboard"}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/departments"
            icon={<Building className="h-4 w-4" />}
            label="Departments"
            active={isNavItemActive("/admin/departments")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/associations"
            icon={<Users className="h-4 w-4" />}
            label="Associations"
            active={isNavItemActive("/admin/associations")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/services"
            icon={<Briefcase className="h-4 w-4" />}
            label="Services"
            active={isNavItemActive("/admin/services")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/citizens"
            icon={<User className="h-4 w-4" />}
            label="Citizens"
            active={isNavItemActive("/admin/citizens")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/grantees"
            icon={<Users className="h-4 w-4" />}
            label="Grantees"
            active={isNavItemActive("/admin/grantees")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/requests"
            icon={<ClipboardList className="h-4 w-4" />}
            label="Requests"
            active={isNavItemActive("/admin/requests")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/grants"
            icon={<FileText className="h-4 w-4" />}
            label="Grants"
            active={isNavItemActive("/admin/grants")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/permissions"
            icon={<Shield className="h-4 w-4" />}
            label="Permissions"
            active={isNavItemActive("/admin/permissions")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/admin/logs"
            icon={<Clock className="h-4 w-4" />}
            label="Activity Logs"
            active={isNavItemActive("/admin/logs")}
            onClick={closeMobileMenu}
          />
        </>
      )
    } else if (role === "grantee") {
      return (
        <>
          <NavItem
            href="/grantee/dashboard"
            icon={<Home className="h-4 w-4" />}
            label="Dashboard"
            active={pathname === "/grantee/dashboard"}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/grantee/services"
            icon={<Briefcase className="h-4 w-4" />}
            label="Services"
            active={isNavItemActive("/grantee/services")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/grantee/citizens"
            icon={<User className="h-4 w-4" />}
            label="Citizens"
            active={isNavItemActive("/grantee/citizens")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/grantee/requests"
            icon={<ClipboardList className="h-4 w-4" />}
            label="Requests"
            active={isNavItemActive("/grantee/requests")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/grantee/grants"
            icon={<FileText className="h-4 w-4" />}
            label="Grants"
            active={isNavItemActive("/grantee/grants")}
            onClick={closeMobileMenu}
          />
          <NavItem
            href="/grantee/permissions"
            icon={<Shield className="h-4 w-4" />}
            label="Permissions"
            active={isNavItemActive("/grantee/permissions")}
            onClick={closeMobileMenu}
          />
        </>
      )
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden bg-transparent">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-2 text-lg font-medium">{renderNavItems()}</nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Link href={`/${role}/dashboard`} className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6" />
            <span className="hidden md:inline-block">Access Management</span>
          </Link>
        </div>
        <div className="flex-1"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-sm font-normal">
                <div className="font-medium">{user?.name || "User"}</div>
                <div className="text-xs text-muted-foreground capitalize">{role}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(role === "citizen" || role === "manager") && (
              <DropdownMenuItem asChild>
                <Link href={`/${role}/profile`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-16 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block border-r">
          <nav className="grid items-start px-4 py-6 lg:px-6 gap-2">{renderNavItems()}</nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
