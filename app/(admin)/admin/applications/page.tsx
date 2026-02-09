"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Eye,
  FileText,
  GraduationCap,
  MapPin,
  Mail,
  Filter,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  tableRowAnimation,
} from "@/lib/motion";
import { ResponsiveTable, MobilePagination } from "@/components/responsive-table";

const ITEMS_PER_PAGE = 25;

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending_recommendations", label: "Pending Recommendations" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "finalist", label: "Finalist" },
  { value: "selected", label: "Selected" },
  { value: "not_selected", label: "Not Selected" },
  { value: "withdrawn", label: "Withdrawn" },
];

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "submitted":
    case "under_review":
      return "secondary";
    case "finalist":
    case "selected":
      return "default";
    case "not_selected":
    case "withdrawn":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string) {
  return statusOptions.find((s) => s.value === status)?.label || status;
}

function ApplicationRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );
}

// Mobile Application Card
function MobileApplicationCard({
  app,
  index,
}: {
  app: {
    _id: string;
    firstName?: string;
    lastName?: string;
    collegeName?: string;
    city?: string;
    gpa?: number;
    status: string;
    recommendationsSubmitted: number;
    recommendationsCount: number;
  };
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card border rounded-lg p-4 space-y-3 shadow-sm"
    >
      {/* Header with avatar and name */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {app.firstName?.[0] || "?"}
            {app.lastName?.[0] || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {app.firstName} {app.lastName}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {app.collegeName || "No college listed"}
          </p>
        </div>
        <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8">
          <Link href={`/admin/applications/${app._id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">City:</span>{" "}
          <span className="text-foreground">{app.city || "N/A"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">GPA:</span>{" "}
          <span className={app.gpa && app.gpa >= 3.5 ? "text-green-600 font-medium" : "text-foreground"}>
            {app.gpa ? app.gpa.toFixed(2) : "N/A"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Recs:</span>{" "}
          <span className={app.recommendationsSubmitted >= 2 ? "text-green-600 font-medium" : "text-foreground"}>
            {app.recommendationsSubmitted}/{app.recommendationsCount}
          </span>
        </div>
        <div className="flex justify-end">
          <Badge variant={getStatusBadgeVariant(app.status)} className="text-xs">
            {getStatusLabel(app.status)}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const shouldReduceMotion = useReducedMotion();
  const exportCSV = useAction(api.admin.exportApplicationsToCSV);
  const bulkUpdateStatus = useMutation(api.admin.bulkUpdateStatus);

  const applicationsData = useQuery(
    api.admin.getAllApplications,
    {
      status: statusFilter as any,
      search: searchQuery || undefined,
    }
  );

  const applications = applicationsData?.applications || [];
  const totalCount = applicationsData?.totalCount || 0;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApplications = applications.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await exportCSV({ status: statusFilter !== "all" ? statusFilter : undefined });
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  if (applicationsData === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Applications</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage and review all scholarship applications
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Skeleton className="h-10 w-full sm:w-80" />
              <Skeleton className="h-10 w-full sm:w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recommendations</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ApplicationRowSkeleton key={i} />
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : "initial"}
      animate="animate"
      variants={fadeInUp}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Applications</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and review all scholarship applications
          </p>
        </div>
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="shrink-0 w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </motion.div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          {/* Search and Filter - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground sm:hidden" />
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                No applications found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedItems.size > 0 && selectedItems.size === paginatedApplications.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems(new Set(paginatedApplications.map(a => a._id)));
                            } else {
                              setSelectedItems(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recommendations</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApplications.map((app: typeof applications[0], index: number) => (
                      <motion.tr
                        key={app._id}
                        initial={shouldReduceMotion ? {} : "initial"}
                        animate="animate"
                        variants={tableRowAnimation}
                        transition={{ delay: index * 0.03 }}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(app._id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedItems);
                              if (checked) { newSelected.add(app._id); } else { newSelected.delete(app._id); }
                              setSelectedItems(newSelected);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {app.firstName?.[0] || "?"}
                                {app.lastName?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {app.firstName} {app.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {app.collegeName || "No college listed"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {app.city || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.gpa ? (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3 text-muted-foreground" />
                              <span
                                className={
                                  app.gpa >= 3.5
                                    ? "text-green-600 font-medium"
                                    : ""
                                }
                              >
                                {app.gpa.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(app.status)}>
                            {getStatusLabel(app.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span
                              className={
                                app.recommendationsSubmitted >= 2
                                  ? "text-green-600 font-medium"
                                  : ""
                              }
                            >
                              {app.recommendationsSubmitted}/{app.recommendationsCount}
                            </span>
                            <span className="text-muted-foreground">received</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/applications/${app._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {paginatedApplications.map((app: typeof applications[0], index: number) => (
                  <MobileApplicationCard key={app._id} app={app} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <MobilePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalCount}
                  itemsPerPage={ITEMS_PER_PAGE}
                  startIndex={startIndex}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedItems.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedItems.size} selected</span>
          <Select onValueChange={async (status) => {
            try {
              await bulkUpdateStatus({
                applicationIds: Array.from(selectedItems) as any[],
                status: status as any,
              });
              toast.success(`Updated ${selectedItems.size} applications`);
              setSelectedItems(new Set());
            } catch (error) {
              toast.error("Failed to update applications");
            }
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.filter(s => s.value !== "all").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
            Clear
          </Button>
        </div>
      )}
    </motion.div>
  );
}
