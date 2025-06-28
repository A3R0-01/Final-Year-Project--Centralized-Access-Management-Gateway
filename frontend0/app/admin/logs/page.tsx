"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Search, User, Briefcase, Clock, FileText, Filter, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { directApi } from "@/lib/api-direct"

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
  Grantee?: string
}

interface FilterState {
  searchQuery: string
  method: string
  object: string
  citizenUserName: string
  citizenNationalId: string
  ipAddress: string
  dateFrom: string
  dateTo: string
  grantee: string
  timeFilter: string
}

export default function AdminLogsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("citizens")

  const [citizenLogs, setCitizenLogs] = useState<LogEntry[]>([])
  const [granteeLogs, setGranteeLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    method: "",
    object: "",
    citizenUserName: "",
    citizenNationalId: "",
    ipAddress: "",
    dateFrom: "",
    dateTo: "",
    grantee: "",
    timeFilter: "all",
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [filters, activeTab, citizenLogs, granteeLogs])

  const buildQueryParams = (logType: "citizen" | "grantee") => {
    const params = new URLSearchParams()

    // Django filtering using double underscores for related fields
    if (filters.citizenUserName) params.append("Citizen__UserName__icontains", filters.citizenUserName)
    if (filters.citizenNationalId) params.append("Citizen__NationalId__icontains", filters.citizenNationalId)
    if (filters.method) params.append("Method__icontains", filters.method)
    if (filters.object) params.append("Object__icontains", filters.object)
    if (filters.ipAddress) params.append("IpAddress__icontains", filters.ipAddress)
    if (filters.dateFrom) params.append("Created__gte", filters.dateFrom)
    if (filters.dateTo) params.append("Created__lte", filters.dateTo)

    // Grantee-specific filters
    if (filters.grantee && logType === "grantee") {
      params.append("Grantee__icontains", filters.grantee)
    }

    return params.toString()
  }

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      // Fetch citizen logs
      const citizenQueryParams = buildQueryParams("citizen")
      const citizenUrl = citizenQueryParams ? `?${citizenQueryParams}` : ""
      const citizenResponse = await directApi.admin.getLogs.citizen(citizenUrl)
      if (citizenResponse.ok) {
        const citizenData = await citizenResponse.json()
        setCitizenLogs(citizenData)
      }

      // Fetch grantee logs
      const granteeQueryParams = buildQueryParams("grantee")
      const granteeUrl = granteeQueryParams ? `?${granteeQueryParams}` : ""
      const granteeResponse = await directApi.admin.getLogs.grantee(granteeUrl)
      if (granteeResponse.ok) {
        const granteeData = await granteeResponse.json()
        setGranteeLogs(granteeData)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast({
        title: "Error",
        description: "Failed to load logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterLogs = () => {
    const query = filters.searchQuery.toLowerCase()
    let filtered = []
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Select logs based on active tab
    const logs = activeTab === "citizens" ? citizenLogs : granteeLogs

    // Apply time filter
    let timeFiltered = logs
    if (filters.timeFilter !== "all") {
      timeFiltered = logs.filter((log) => {
        const logDate = new Date(log.Created)
        switch (filters.timeFilter) {
          case "day":
            return logDate >= oneDayAgo
          case "week":
            return logDate >= oneWeekAgo
          case "month":
            return logDate >= oneMonthAgo
          default:
            return true
        }
      })
    }

    // Apply search filter
    if (filters.searchQuery.trim() === "") {
      filtered = timeFiltered
    } else {
      filtered = timeFiltered.filter((log) => {
        return (
          log.Citizen?.UserName?.toLowerCase().includes(query) ||
          log.Method?.toLowerCase().includes(query) ||
          log.Object?.toLowerCase().includes(query) ||
          log.Message?.toLowerCase().includes(query) ||
          log.Grantee?.toLowerCase().includes(query)
        )
      })
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
    if (filters.grantee) active.push("grantee")
    if (filters.timeFilter !== "all") active.push("timeFilter")

    setActiveFilters(active)
  }

  const clearFilter = (filterKey: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [filterKey]: filterKey === "timeFilter" ? "all" : "" }))
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
      grantee: "",
      timeFilter: "all",
    }))
  }

  const applyServerFilters = () => {
    fetchLogs()
  }

  const getMethodBadge = (method: string) => {
    const methodLower = method?.toLowerCase() || ""
    let color = ""

    if (methodLower.includes("post") || methodLower.includes("create")) {
      color = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    } else if (methodLower.includes("patch") || methodLower.includes("put") || methodLower.includes("update")) {
      color = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    } else if (methodLower.includes("delete")) {
      color = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    } else if (methodLower.includes("get") || methodLower.includes("read")) {
      color = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
    } else {
      color = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    }

    return (
      <Badge variant="outline" className={color}>
        {method}
      </Badge>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
            <p className="text-muted-foreground">Monitor system activity and user actions</p>
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
              value={filters.timeFilter}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, timeFilter: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="day">Last 24 hours</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
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

                  {activeTab === "grantees" && (
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
            {filters.timeFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Time: {filters.timeFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => clearFilter("timeFilter")} />
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

        <Tabs defaultValue="citizens" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="citizens" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Citizen Logs</span>
            </TabsTrigger>
            <TabsTrigger value="grantees" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>Grantee Logs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="citizens" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Citizen Activity Logs</CardTitle>
                <CardDescription>Monitor citizen actions in the system ({filteredLogs.length} records)</CardDescription>
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
                          <TableHead>Citizen</TableHead>
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
                              <div>
                                <div className="font-medium">{log.Citizen?.UserName || "N/A"}</div>
                                <div className="text-xs text-muted-foreground">{log.Citizen?.NationalId}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getMethodBadge(log.Method)}</TableCell>
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
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No logs found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      {activeFilters.length > 0
                        ? "No logs match your filter criteria. Try adjusting your filters."
                        : "There are no citizen activity logs recorded yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grantees" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Grantee Activity Logs</CardTitle>
                <CardDescription>Monitor grantee actions in the system ({filteredLogs.length} records)</CardDescription>
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
                          <TableHead>Citizen</TableHead>
                          <TableHead>Grantee</TableHead>
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
                              <div>
                                <div className="font-medium">{log.Citizen?.UserName || "N/A"}</div>
                                <div className="text-xs text-muted-foreground">{log.Citizen?.NationalId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {log.Grantee || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>{getMethodBadge(log.Method)}</TableCell>
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
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No logs found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      {activeFilters.length > 0
                        ? "No logs match your filter criteria. Try adjusting your filters."
                        : "There are no grantee activity logs recorded yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
