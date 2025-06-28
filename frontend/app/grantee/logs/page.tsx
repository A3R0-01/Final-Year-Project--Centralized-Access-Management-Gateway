"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ClipboardList, Search, User, Clock, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

interface LogEntry {
  id: string
  Citizen: {
    id: string
    UserName: string
    NationalId: string
  }
  Method: string
  Object: string
  RecordId?: string
  Message: string
  IpAddress: string
  Created: string
  Updated: string
}

export default function GranteeLogsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLogs(logs)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = logs.filter(
        (log) =>
          log.Method?.toLowerCase().includes(query) ||
          log.Object?.toLowerCase().includes(query) ||
          log.Citizen?.UserName?.toLowerCase().includes(query) ||
          log.Message?.toLowerCase().includes(query),
      )
      setFilteredLogs(filtered)
    }
  }, [searchQuery, logs])

  const getMethodBadgeColor = (method: string) => {
    const methodLower = method?.toLowerCase() || ""
    if (methodLower.includes("post") || methodLower.includes("create"))
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    if (methodLower.includes("patch") || methodLower.includes("put") || methodLower.includes("update"))
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    if (methodLower.includes("delete")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    if (methodLower.includes("get") || methodLower.includes("read"))
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
  }

  return (
    <DashboardLayout role="grantee">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground">View system activity logs related to your services</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Log access for grantees is currently being configured. This feature will be available soon to help you
            monitor activity related to your services and grants.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Service Activity Logs</CardTitle>
            <CardDescription>Monitor activity related to your services and grants</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                ))}
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Object</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span>{format(new Date(log.Created), "MMM d, yyyy HH:mm:ss")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-500" />
                            <div>
                              <div className="font-medium">{log.Citizen?.UserName || "System"}</div>
                              <div className="text-xs text-muted-foreground">{log.Citizen?.NationalId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getMethodBadgeColor(log.Method)}>
                            {log.Method}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.Object}</TableCell>
                        <TableCell className="max-w-xs truncate" title={log.Message}>
                          {log.Message}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.IpAddress || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardList className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No logs available</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  {searchQuery
                    ? "No logs match your search criteria."
                    : "Log access for grantees is being configured. Check back soon for activity logs related to your services."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
