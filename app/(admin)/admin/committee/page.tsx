"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Shield,
  Users,
  Loader2,
  UserPlus,
} from "lucide-react";

type CommitteeMember = {
  _id: Id<"committeeMembers">;
  userId: Id<"user">;
  name: string;
  title: string;
  phone?: string;
  isChairman: boolean;
  isExOfficio: boolean;
  order: number;
  email: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CommitteePage() {
  const members = useQuery(api.committeeMembers.list);
  const eligibleUsers = useQuery(api.committeeMembers.getEligibleUsers);
  const createMember = useMutation(api.committeeMembers.create);
  const updateMember = useMutation(api.committeeMembers.update);
  const removeMember = useMutation(api.committeeMembers.remove);
  const createInvite = useMutation(api.userInvites.create);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for add
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [addName, setAddName] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addIsChairman, setAddIsChairman] = useState(false);
  const [addIsExOfficio, setAddIsExOfficio] = useState(false);

  // Form state for edit
  const [editMember, setEditMember] = useState<CommitteeMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIsChairman, setEditIsChairman] = useState(false);
  const [editIsExOfficio, setEditIsExOfficio] = useState(false);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteIsChairman, setInviteIsChairman] = useState(false);
  const [inviteIsExOfficio, setInviteIsExOfficio] = useState(false);

  // Remove state
  const [removingMember, setRemovingMember] = useState<CommitteeMember | null>(
    null
  );

  function resetInviteForm() {
    setInviteEmail("");
    setInviteName("");
    setInviteTitle("");
    setInvitePhone("");
    setInviteIsChairman(false);
    setInviteIsExOfficio(false);
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
        role: "committee",
        name: inviteName || undefined,
        title: inviteTitle || undefined,
        phone: invitePhone || undefined,
        isChairman: inviteIsChairman || undefined,
        isExOfficio: inviteIsExOfficio || undefined,
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

  function resetAddForm() {
    setSelectedUserId("");
    setAddName("");
    setAddTitle("");
    setAddPhone("");
    setAddIsChairman(false);
    setAddIsExOfficio(false);
  }

  function handleSelectUser(userId: string) {
    setSelectedUserId(userId);
    const user = eligibleUsers?.find((u) => u._id === userId);
    if (user) {
      setAddName(user.name || "");
    }
  }

  function openEditDialog(member: CommitteeMember) {
    setEditMember(member);
    setEditName(member.name);
    setEditTitle(member.title);
    setEditPhone(member.phone || "");
    setEditIsChairman(member.isChairman);
    setEditIsExOfficio(member.isExOfficio);
    setEditOpen(true);
  }

  function openRemoveDialog(member: CommitteeMember) {
    setRemovingMember(member);
    setRemoveOpen(true);
  }

  async function handleAdd() {
    if (!selectedUserId || !addName || !addTitle) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await createMember({
        userId: selectedUserId as Id<"user">,
        name: addName,
        title: addTitle,
        phone: addPhone || undefined,
        isChairman: addIsChairman,
        isExOfficio: addIsExOfficio,
      });
      toast.success("Committee member added successfully");
      setAddOpen(false);
      resetAddForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to add committee member");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!editMember || !editName || !editTitle) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await updateMember({
        id: editMember._id,
        name: editName,
        title: editTitle,
        phone: editPhone || undefined,
        isChairman: editIsChairman,
        isExOfficio: editIsExOfficio,
      });
      toast.success("Committee member updated successfully");
      setEditOpen(false);
      setEditMember(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update committee member");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!removingMember) return;
    setSaving(true);
    try {
      await removeMember({ id: removingMember._id });
      toast.success("Committee member removed");
      setRemoveOpen(false);
      setRemovingMember(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove committee member");
    } finally {
      setSaving(false);
    }
  }

  // Loading state
  if (members === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Committee Members
            </h2>
            <p className="text-muted-foreground">
              Manage scholarship committee members and their roles
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Committee Members
          </h2>
          <p className="text-muted-foreground">
            Manage scholarship committee members and their roles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { resetInviteForm(); setInviteOpen(true); }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
          <Button onClick={() => { resetAddForm(); setAddOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
        </div>
        {members.some((m) => m.isChairman) && (
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            <span>
              {members.filter((m) => m.isChairman).length} chairman
            </span>
          </div>
        )}
      </div>

      {/* Member grid */}
      {members.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-12">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No Committee Members</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Add committee members to enable application evaluation and
                review workflows.
              </p>
              <Button onClick={() => { resetAddForm(); setAddOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Member
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{member.name}</h3>
                      {member.isChairman && (
                        <Badge variant="default" className="text-xs">
                          Chairman
                        </Badge>
                      )}
                      {member.isExOfficio && (
                        <Badge variant="secondary" className="text-xs">
                          Ex-Officio
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {member.title}
                    </p>
                    {member.email && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => openRemoveDialog(member)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Committee Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-user">Select User</Label>
              <Select value={selectedUserId} onValueChange={handleSelectUser}>
                <SelectTrigger id="add-user">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {eligibleUsers?.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                  {eligibleUsers?.length === 0 && (
                    <SelectItem value="__none" disabled>
                      No eligible users available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-title">Title / Role</Label>
              <Input
                id="add-title"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="e.g. Committee Member"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Phone (optional)</Label>
              <Input
                id="add-phone"
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="add-chairman">Chairman</Label>
              <Switch
                id="add-chairman"
                checked={addIsChairman}
                onCheckedChange={setAddIsChairman}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="add-exofficio">Ex-Officio</Label>
              <Switch
                id="add-exofficio"
                checked={addIsExOfficio}
                onCheckedChange={setAddIsExOfficio}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAdd} disabled={saving || !selectedUserId || !addName || !addTitle}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Committee Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title / Role</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Committee Member"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone (optional)</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-chairman">Chairman</Label>
              <Switch
                id="edit-chairman"
                checked={editIsChairman}
                onCheckedChange={setEditIsChairman}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-exofficio">Ex-Officio</Label>
              <Switch
                id="edit-exofficio"
                checked={editIsExOfficio}
                onCheckedChange={setEditIsExOfficio}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={saving || !editName || !editTitle}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Committee Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">{removingMember?.name}</span> from
              the committee? Their user role will be reset to applicant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Committee Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
              />
              <p className="text-xs text-muted-foreground">
                An invitation email will be sent to this address
              </p>
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
            <div className="space-y-2">
              <Label htmlFor="invite-title">Title (optional)</Label>
              <Input
                id="invite-title"
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
                placeholder="e.g. Committee Member"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-phone">Phone (optional)</Label>
              <Input
                id="invite-phone"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="invite-chairman">Chairman</Label>
              <Switch
                id="invite-chairman"
                checked={inviteIsChairman}
                onCheckedChange={setInviteIsChairman}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="invite-exofficio">Ex-Officio</Label>
              <Switch
                id="invite-exofficio"
                checked={inviteIsExOfficio}
                onCheckedChange={setInviteIsExOfficio}
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
    </div>
  );
}
