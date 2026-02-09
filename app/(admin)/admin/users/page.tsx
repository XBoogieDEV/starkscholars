"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  UserPlus,
  Users,
  Mail,
  RotateCw,
  XCircle,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function roleBadge(role: string | undefined) {
  switch (role) {
    case "admin":
      return <Badge variant="default">Admin</Badge>;
    case "committee":
      return <Badge variant="secondary">Committee</Badge>;
    case "applicant":
      return <Badge variant="outline">Applicant</Badge>;
    default:
      return <Badge variant="outline">{role || "Unknown"}</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "accepted":
      return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
    case "revoked":
      return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
    case "expired":
      return <Badge variant="outline" className="text-muted-foreground"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(ts: number | undefined) {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UsersPage() {
  const users = useQuery(api.users.listAll);
  const invites = useQuery(api.userInvites.list);
  const createInvite = useMutation(api.userInvites.create);
  const revokeInvite = useMutation(api.userInvites.revoke);
  const resendInvite = useMutation(api.userInvites.resend);

  // Filter state
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "committee">("committee");
  const [inviteName, setInviteName] = useState("");
  const [saving, setSaving] = useState(false);

  // Revoke dialog state
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<Id<"userInvites"> | null>(null);

  // Action loading states
  const [resendingId, setResendingId] = useState<string | null>(null);

  function resetInviteForm() {
    setInviteEmail("");
    setInviteRole("committee");
    setInviteName("");
  }

  async function handleInvite() {
    if (!inviteEmail) {
      toast.error("Email is required");
      return;
    }
    setSaving(true);
    try {
      await createInvite({
        email: inviteEmail,
        role: inviteRole,
        name: inviteName || undefined,
      });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteOpen(false);
      resetInviteForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke() {
    if (!revokingId) return;
    setSaving(true);
    try {
      await revokeInvite({ id: revokingId });
      toast.success("Invitation revoked");
      setRevokeOpen(false);
      setRevokingId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke invitation");
    } finally {
      setSaving(false);
    }
  }

  async function handleResend(id: Id<"userInvites">) {
    setResendingId(id);
    try {
      await resendInvite({ id });
      toast.success("Invitation resent");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  }

  // Filter users
  const filteredUsers = users
    ? roleFilter === "all"
      ? users
      : users.filter((u) => u.role === roleFilter)
    : [];

  // Loading
  if (users === undefined || invites === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">Manage users and send invitations</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users and send invitations
          </p>
        </div>
        <Button onClick={() => { resetInviteForm(); setInviteOpen(true); }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{users.length} total user{users.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="h-4 w-4" />
          <span>{invites.filter(i => i.status === "pending").length} pending invite{invites.filter(i => i.status === "pending").length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Section A: Current Users */}
      <Card>
        <CardHeader>
          <CardTitle>Current Users</CardTitle>
          <CardDescription>All registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={roleFilter} onValueChange={setRoleFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">
                All ({users.length})
              </TabsTrigger>
              <TabsTrigger value="admin">
                Admin ({users.filter(u => u.role === "admin").length})
              </TabsTrigger>
              <TabsTrigger value="committee">
                Committee ({users.filter(u => u.role === "committee").length})
              </TabsTrigger>
              <TabsTrigger value="applicant">
                Applicant ({users.filter(u => u.role === "applicant").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users found for this filter.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{roleBadge(user.role)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(user.lastLoginAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section B: Pending Invites */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Manage pending and past invitations</CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No invitations sent yet. Click &quot;Invite User&quot; to get started.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite._id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>{roleBadge(invite.role)}</TableCell>
                      <TableCell>{statusBadge(invite.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{invite.invitedByName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invite.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invite.expiresAt)}</TableCell>
                      <TableCell className="text-right">
                        {invite.status === "pending" && (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResend(invite._id)}
                              disabled={resendingId === invite._id}
                            >
                              {resendingId === invite._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCw className="h-4 w-4" />
                              )}
                              <span className="ml-1">Resend</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setRevokingId(invite._id);
                                setRevokeOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "committee")}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="committee">Committee Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Name (optional)</Label>
              <Input
                id="invite-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Full name"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleInvite} disabled={saving || !inviteEmail}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this invitation? The recipient will no longer be able to use the invitation link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
