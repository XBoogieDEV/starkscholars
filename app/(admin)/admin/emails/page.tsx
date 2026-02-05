"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Mail,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { fadeInUp } from "@/lib/motion";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

const emailTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "recommendation_request", label: "Recommendation Request" },
  { value: "recommendation_reminder", label: "Recommendation Reminder" },
  { value: "recommendation_received", label: "Recommendation Received" },
  { value: "welcome", label: "Welcome" },
  { value: "email_verification", label: "Email Verification" },
  { value: "password_reset", label: "Password Reset" },
  { value: "application_submitted", label: "Application Submitted" },
  { value: "application_withdrawn", label: "Application Withdrawn" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "bounced", label: "Bounced" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "sent":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Sent
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-200">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "bounced":
      return (
        <Badge variant="destructive" className="bg-orange-100 text-orange-800">
          <AlertCircle className="mr-1 h-3 w-3" />
          Bounced
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTypeLabel(type: string) {
  const option = emailTypeOptions.find((t) => t.value === type);
  return option?.label || type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function EmailRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );
}

export default function EmailsPage() {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const shouldReduceMotion = useReducedMotion();

  // Fetch email logs
  const emailLogs = useQuery(api.emails.listEmailLogs, {
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    limit: 200,
  });

  // Admin resend mutation for recommendations
  const adminResendEmail = useMutation(api.recommendations.adminResendEmail);

  // Filter by search query (recipient email)
  const filteredLogs = emailLogs?.filter((log) => {
    if (!searchQuery) return true;
    return log.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  // Stats
  const stats = {
    total: emailLogs?.length || 0,
    sent: emailLogs?.filter((l) => l.status === "sent").length || 0,
    failed: emailLogs?.filter((l) => l.status === "failed").length || 0,
    pending: emailLogs?.filter((l) => l.status === "pending").length || 0,
  };

  const handleResend = async (log: typeof filteredLogs[0]) => {
    // Only allow resend for recommendation-related emails
    if (
      log.type === "recommendation_request" ||
      log.type === "recommendation_reminder"
    ) {
      if (!log.relatedId) {
        toast({
          title: "Cannot resend",
          description: "No recommendation ID associated with this email.",
          variant: "destructive",
        });
        return;
      }

      try {
        await adminResendEmail({
          recommendationId: log.relatedId as Id<"recommendations">,
        });
        toast({
          title: "Email resent!",
          description: `A new recommendation request has been sent to ${log.recipientEmail}.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to resend email.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Resend not available",
        description: "Automatic resend is only available for recommendation emails.",
        variant: "destructive",
      });
    }
  };

  if (emailLogs === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Email Logs</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Monitor and manage all system emails
          </p>
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <EmailRowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
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
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Email Logs</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Monitor and manage all system emails
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sent Successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.sent}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email History
          </CardTitle>
          <CardDescription>
            View all emails sent by the system with their delivery status
          </CardDescription>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {emailTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
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
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                No emails found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search criteria
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead className="hidden md:table-cell">Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(log.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.recipientEmail}
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[250px] truncate text-sm text-muted-foreground">
                        {log.subject}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                        {log.error && (
                          <p className="text-xs text-red-600 mt-1 max-w-[150px] truncate" title={log.error}>
                            {log.error}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {log.sentAt ? formatDate(log.sentAt) : formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        {(log.type === "recommendation_request" || log.type === "recommendation_reminder") &&
                          log.status !== "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResend(log)}
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Resend
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredLogs.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing {filteredLogs.length} email{filteredLogs.length !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
