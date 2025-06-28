import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8 pt-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
            Core Access Management System
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl">
            A comprehensive platform for managing citizens, services, and administrative functions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-12">
            <RoleCard
              title="Citizen Portal"
              description="Access public services, submit requests, and track grants"
              href="/auth/login?role=citizen"
              color="bg-blue-500"
            />
            <RoleCard
              title="Site Manager Portal"
              description="Comprehensive system administration and oversight"
              href="/auth/login?role=manager"
              color="bg-purple-500"
            />
            <RoleCard
              title="Administrator Portal"
              description="Manage departments, services, and user permissions"
              href="/auth/login?role=admin"
              color="bg-emerald-500"
            />
            <RoleCard
              title="Grantee Portal"
              description="Process citizen requests and manage grants"
              href="/auth/login?role=grantee"
              color="bg-amber-500"
            />
          </div>

          <div className="mt-8">
            <p className="text-slate-600 dark:text-slate-400 mb-4">New citizen? Register for an account</p>
            <Button asChild size="lg">
              <Link href="/auth/register">Register Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

function RoleCard({
  title,
  description,
  href,
  color,
}: {
  title: string
  description: string
  href: string
  color: string
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg ${color} mb-4 mx-auto flex items-center justify-center`}>
          <span className="text-white text-xl font-bold">{title.charAt(0)}</span>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto pt-4">
        <Button asChild className="w-full">
          <Link href={href}>Login</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
