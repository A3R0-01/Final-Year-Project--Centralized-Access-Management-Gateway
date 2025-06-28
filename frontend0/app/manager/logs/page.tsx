"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { ClipboardList, Search, User, Filter, Clock, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { directApi } from "@/lib/api-direct"

type LogType = "citizen" | "grantee" | "administrator" | "manager"

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
  Administrator?: string
  Grantee?: string
  SiteManager?: string
}

interface FilterState {
  searchQuery: string
  logType: LogType
  method: string
  object: string
  citizenUserName: string
  citizenNationalId: string
  ipAddress: string
  dateFrom: string
  dateTo: string
  administrator: string
  grantee: string
  siteManager: string
}

export default function ManagerLogsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    logType: "citizen",
    method: "",
    object: "",
    citizenUserName: "",
    citizenNationalId: "",
    ipAddress: "",
    dateFrom: "",
    dateTo: "",
    administrator: "",
    grantee: "",
    siteManager: "",
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    fetchLogs()
  }, [filters.logType])

  useEffect(() => {
    applyFilters()
  }, [filters, logs])

  const buildQueryParams = () => {
    const params = new URLSearchParams()

    // Django filtering using double underscores for related fields
    if (filters.citizenUserName) params.append("Citizen__UserName__icontains", filters.citizenUserName)
    if (filters.citizenNationalId) params.append("Citizen__NationalId__icontains", filters.citizenNationalId)
    if (filters.method) params.append("Method__icontains", filters.method)
    if (filters.object) params.append("Object__icontains", filters.object)
    if (filters.ipAddress) params.append("IpAddress__icontains", filters.ipAddress)
    if (filters.dateFrom) params.append("Created__gte", filters.dateFrom)
    if (filters.dateTo) params.append("Created__lte", filters.dateTo)

    // Role-specific filters
    if (filters.administrator && filters.logType === "administrator") {
      params.append("Administrator__icontains", filters.administrator)
    }
    if (filters.grantee && filters.logType === "grantee") {
      params.append("Grantee__icontains", filters.grantee)
    }
    if (filters.siteManager && filters.logType === "manager") {
      params.append("SiteManager__icontains", filters.siteManager)
    }

    return params.toString()
  }

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const queryParams = buildQueryParams()
      const url = queryParams ? `?${queryParams}` : ""
      let response

      switch (filters.logType) {
        case "citizen":
          response = await directApi.manager.getLogs.citizen(url)
          break
        case "grantee":
          response = await directApi.manager.getLogs.grantee(url)
          break
        case "administrator":
          response = await directApi.manager.getLogs.administrator(url)
          break
        case "manager":
          response = await directApi.manager.getLogs.manager(url)
          break
        default:
          response = await directApi.manager.getLogs.citizen(url)
      }

      if (response.ok) {
        const data = await response.json()
        setLogs(data)
        setFilteredLogs(data)
      } else {
        throw new Error(`Failed to fetch ${filters.logType} logs`)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast({
        title: "Error",
        description: `Failed to load ${filters.logType} logs. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = logs

    // Apply search query filter
    if (filters.searchQuery.trim() !== "") {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.Method?.toLowerCase().includes(query) ||
          log.Object?.toLowerCase().includes(query) ||
          log.Citizen?.UserName?.toLowerCase().includes(query) ||
          log.Message?.toLowerCase().includes(query) ||
          log.Administrator?.toLowerCase().includes(query) ||
          log.Grantee?.toLowerCase().includes(query) ||
          log.SiteManager?.toLowerCase().includes(query),
      )
    }

    setFilteredLogs(filtered)
    updateActiveFilters()
  }

  const updateActiveFilters = () => {
    const active: string[] = []
    if (filters.searchQuery) active.push("search")
    if (filters.method) active.push("method")
    if (filters.object) active.push("object")
    if (filters.citizenUserName) active.push("citizenUserName")
    if (filters.citizenNationalId) active.push("citizenNationalId")
    if (filters.ipAddress) active.push("ipAddress")
    if (filters.dateFrom) active.push("dateFrom")
    if (filters.dateTo) active.push("dateTo")
    if (filters.administrator) active.push("administrator")
    if (filters.grantee) active.push("grantee")
    if (filters.siteManager) active.push("siteManager")

    setActiveFilters(active)
  }

  const clearFilter = (filterKey: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [filterKey]: "" }))
  }

  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: "",
      method: "",
      object: "",
      citizenUserName: "",
      citizenNationalId: "",
      ipAddress: "",
      dateFrom: "",
      dateTo: "",
      administrator: "",
      grantee: "",
      siteManager: "",
    }))
  }

  const applyServerFilters = () => {
    fetchLogs()
  }

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

  const getLogTypeLabel = (log: LogEntry) => {
    if (log.Administrator) return `Admin: ${log.Administrator}`
    if (log.Grantee) return `Grantee: ${log.Grantee}`
    if (log.SiteManager) return `Manager: ${log.SiteManager}`
    return "Citizen"
  }

  return (
    <DashboardLayout role="manager">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
            <p className="text-muted-foreground">View and monitor system activity logs</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs..."
                className="pl-8 w-full"
                value={filters.searchQuery}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              />
            </div>
            <Select
              value={filters.logType}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, logType: value as LogType }))}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Log Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="citizen">Citizen Logs</SelectItem>
                <SelectItem value="grantee">Grantee Logs</SelectItem>
                <SelectItem value="administrator">Admin Logs</SelectItem>
                <SelectItem value="manager">Manager Logs</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Advanced Filters</h4>
                    {activeFilters.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="method">Method</Label>
                      <Input
                        id="method"
                        placeholder="GET, POST, etc."
                        value={filters.method}
                        onChange={(e) => setFilters((prev) => ({ ...prev, method: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="object">Object</Label>
                      <Input
                        id="object"
                        placeholder="Object name"
                        value={filters.object}
                        onChange={(e) => setFilters((prev) => ({ ...prev, object: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="citizenUserName">Citizen Username</Label>
                      <Input
                        id="citizenUserName"
                        placeholder="Username"
                        value={filters.citizenUserName}
                        onChange={(e) => setFilters((prev) => ({ ...prev, citizenUserName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="citizenNationalId">National ID</Label>
                      <Input
                        id="citizenNationalId"
                        placeholder="National ID"
                        value={filters.citizenNationalId}
                        onChange={(e) => setFilters((prev) => ({ ...prev, citizenNationalId: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ipAddress">IP Address</Label>
                    <Input
                      id="ipAddress"
                      placeholder="192.168.1.1"
                      value={filters.ipAddress}
                      onChange={(e) => setFilters((prev) => ({ ...prev, ipAddress: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="dateFrom">Date From</Label>
                      <Input
                        id="dateFrom"
                        type="datetime-local"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateTo">Date To</Label>
                      <Input
                        id="dateTo"
                        type="datetime-local"
                        value={filters.dateTo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                      />
                    </div>
                  </div>

                  {filters.logType === "administrator" && (
                    <div>
                      <Label htmlFor="administrator">Administrator</Label>
                      <Input
                        id="administrator"
                        placeholder="Administrator name"
                        value={filters.administrator}
                        onChange={(e) => setFilters((prev) => ({ ...prev, administrator: e.target.value }))}
                      />
                    </div>
                  )}

                  {filters.logType === "grantee" && (
                    <div>
                      <Label htmlFor="grantee">Grantee</Label>
                      <Input
                        id="grantee"
                        placeholder="Grantee name"
                        value={filters.grantee}
                        onChange={(e) => setFilters((prev) => ({ ...prev, grantee: e.target.value }))}
                      />
                    </div>
                  )}

                  {filters.logType === "manager" && (
                    <div>
                      <Label htmlFor="siteManager">Site Manager</Label>
                      <Input
                        id="siteManager"
                        placeholder="Manager name"
                        value={filters.siteManager}
                        onChange={(e) => setFilters((prev) => ({ ...prev, siteManager: e.target.value }))}
                      />
                    </div>
                  )}

                  <Button onClick={applyServerFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("searchQuery")} />
              </Badge>
            )}
            {filters.method && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Method: {filters.method}
                <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("method")} />
              </Badge>
            )}
            {filters.object && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Object: {filters.object}
                <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("object")} />
              </Badge>
            )}
            {filters.citizenUserName && (
              <Badge variant="secondary" className="flex items-center gap-1">
                User: {filters.citizenUserName}
                <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("citizenUserName")} />
              </Badge>
            )}
            {filters.ipAddress && (
              <Badge variant="secondary" className="flex items-center gap-1">
                IP: {filters.ipAddress}
                <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("ipAddress")} />
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="secondary" className="flex items-center gap-1">
                From: {format(new Date(filters.dateFrom), "MMM d, yyyy")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("dateFrom")} />
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="secondary" className="flex items-center gap-1">
                To: {format(new Date(filters.dateTo), "MMM d, yyyy")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("dateTo")} />
              </Badge>
            )}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Activity Logs - {filters.logType.charAt(0).toUpperCase() + filters.logType.slice(1)}</CardTitle>
            <CardDescription>View system activity and user actions ({filteredLogs.length} records)</CardDescription>
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
                      {filters.logType !== "citizen" && <TableHead>Role Info</TableHead>}
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
                        {filters.logType !== "citizen" && (
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {getLogTypeLabel(log)}
                            </Badge>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ClipboardList className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No logs found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  {activeFilters.length > 0
                    ? "No logs match your filter criteria. Try adjusting your filters."
                    : `There are no ${filters.logType} logs in the system yet.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
