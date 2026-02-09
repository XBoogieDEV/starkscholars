"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Clock, Mail, Shield, Award, Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const allSettings = useQuery(api.settings.getAll);
  const deadline = useQuery(api.settings.getDeadline);
  const isDeadlinePassed = useQuery(api.settings.isDeadlinePassed);
  const setSetting = useMutation(api.settings.set);

  // Deadline state
  const [deadlineValue, setDeadlineValue] = useState("");
  const [savingDeadline, setSavingDeadline] = useState(false);

  // Email config state
  const [emailAutoReminders, setEmailAutoReminders] = useState(true);
  const [emailReminderInterval, setEmailReminderInterval] = useState("7");
  const [emailMaxReminders, setEmailMaxReminders] = useState("2");
  const [emailFromName, setEmailFromName] = useState("Stark Scholars");
  const [savingEmail, setSavingEmail] = useState(false);

  // Application settings state
  const [applicationsOpen, setApplicationsOpen] = useState(true);
  const [maxRecommendations, setMaxRecommendations] = useState("2");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [savingApp, setSavingApp] = useState(false);

  // Selection config state
  const [maxRecipients, setMaxRecipients] = useState("2");
  const [scholarshipAmount, setScholarshipAmount] = useState("$500");
  const [savingSelection, setSavingSelection] = useState(false);

  // Load settings when data arrives
  useEffect(() => {
    if (deadline !== undefined) {
      const date = new Date(deadline);
      // Format as datetime-local value
      const formatted = date.toISOString().slice(0, 16);
      setDeadlineValue(formatted);
    }
  }, [deadline]);

  useEffect(() => {
    if (allSettings) {
      // Email settings
      if (allSettings.email_auto_reminders_enabled !== undefined) setEmailAutoReminders(allSettings.email_auto_reminders_enabled === "true");
      if (allSettings.email_reminder_interval_days) setEmailReminderInterval(allSettings.email_reminder_interval_days);
      if (allSettings.email_max_reminders) setEmailMaxReminders(allSettings.email_max_reminders);
      if (allSettings.email_from_name) setEmailFromName(allSettings.email_from_name);

      // App settings
      if (allSettings.applications_open !== undefined) setApplicationsOpen(allSettings.applications_open === "true");
      if (allSettings.max_recommendations_per_application) setMaxRecommendations(allSettings.max_recommendations_per_application);
      if (allSettings.maintenance_mode !== undefined) setMaintenanceMode(allSettings.maintenance_mode === "true");
      if (allSettings.maintenance_message) setMaintenanceMessage(allSettings.maintenance_message);

      // Selection settings
      if (allSettings.max_scholarship_recipients) setMaxRecipients(allSettings.max_scholarship_recipients);
      if (allSettings.scholarship_amount) setScholarshipAmount(allSettings.scholarship_amount);
    }
  }, [allSettings]);

  const saveDeadline = async () => {
    setSavingDeadline(true);
    try {
      const timestamp = new Date(deadlineValue).getTime();
      await setSetting({ key: "application_deadline", value: timestamp.toString() });
      toast.success("Deadline updated successfully");
    } catch (error) {
      toast.error("Failed to save deadline");
    } finally {
      setSavingDeadline(false);
    }
  };

  const saveEmailSettings = async () => {
    setSavingEmail(true);
    try {
      await setSetting({ key: "email_auto_reminders_enabled", value: emailAutoReminders.toString() });
      await setSetting({ key: "email_reminder_interval_days", value: emailReminderInterval });
      await setSetting({ key: "email_max_reminders", value: emailMaxReminders });
      await setSetting({ key: "email_from_name", value: emailFromName });
      toast.success("Email settings saved");
    } catch (error) {
      toast.error("Failed to save email settings");
    } finally {
      setSavingEmail(false);
    }
  };

  const saveAppSettings = async () => {
    setSavingApp(true);
    try {
      await setSetting({ key: "applications_open", value: applicationsOpen.toString() });
      await setSetting({ key: "max_recommendations_per_application", value: maxRecommendations });
      await setSetting({ key: "maintenance_mode", value: maintenanceMode.toString() });
      await setSetting({ key: "maintenance_message", value: maintenanceMessage });
      toast.success("Application settings saved");
    } catch (error) {
      toast.error("Failed to save application settings");
    } finally {
      setSavingApp(false);
    }
  };

  const saveSelectionSettings = async () => {
    setSavingSelection(true);
    try {
      await setSetting({ key: "max_scholarship_recipients", value: maxRecipients });
      await setSetting({ key: "scholarship_amount", value: scholarshipAmount });
      toast.success("Selection settings saved");
    } catch (error) {
      toast.error("Failed to save selection settings");
    } finally {
      setSavingSelection(false);
    }
  };

  if (allSettings === undefined || deadline === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure system settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Application Deadline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Application Deadline
            </CardTitle>
            <CardDescription>
              Set the deadline for scholarship applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              {isDeadlinePassed ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Deadline Passed
                </Badge>
              ) : (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Applications Open
                </Badge>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline Date & Time</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadlineValue}
                onChange={(e) => setDeadlineValue(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button onClick={saveDeadline} disabled={savingDeadline}>
              {savingDeadline ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Deadline
            </Button>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Configuration
            </CardTitle>
            <CardDescription>Configure email notification and reminder settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-send Reminders</Label>
                <p className="text-sm text-muted-foreground">Automatically send recommendation reminders</p>
              </div>
              <Switch checked={emailAutoReminders} onCheckedChange={setEmailAutoReminders} />
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="reminderInterval">Reminder Interval (days)</Label>
                <Input
                  id="reminderInterval"
                  type="number"
                  min="1"
                  max="30"
                  value={emailReminderInterval}
                  onChange={(e) => setEmailReminderInterval(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxReminders">Max Reminders</Label>
                <Input
                  id="maxReminders"
                  type="number"
                  min="0"
                  max="10"
                  value={emailMaxReminders}
                  onChange={(e) => setEmailMaxReminders(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fromName">Email From Name</Label>
              <Input
                id="fromName"
                value={emailFromName}
                onChange={(e) => setEmailFromName(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button onClick={saveEmailSettings} disabled={savingEmail}>
              {savingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Email Settings
            </Button>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Application Settings
            </CardTitle>
            <CardDescription>Control application availability and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Accept New Applications</Label>
                <p className="text-sm text-muted-foreground">Allow new scholarship applications to be submitted</p>
              </div>
              <Switch checked={applicationsOpen} onCheckedChange={setApplicationsOpen} />
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="maxRecs">Max Recommendations per Application</Label>
              <Input
                id="maxRecs"
                type="number"
                min="1"
                max="5"
                value={maxRecommendations}
                onChange={(e) => setMaxRecommendations(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Show maintenance message to all users</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            {maintenanceMode && (
              <div className="grid gap-2">
                <Label htmlFor="maintMsg">Maintenance Message</Label>
                <Textarea
                  id="maintMsg"
                  placeholder="The system is currently under maintenance..."
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={3}
                />
              </div>
            )}
            <Button onClick={saveAppSettings} disabled={savingApp}>
              {savingApp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Application Settings
            </Button>
          </CardContent>
        </Card>

        {/* Selection Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Selection Configuration
            </CardTitle>
            <CardDescription>Configure scholarship selection parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="maxRecipients">Max Scholarship Recipients</Label>
                <Input
                  id="maxRecipients"
                  type="number"
                  min="1"
                  max="10"
                  value={maxRecipients}
                  onChange={(e) => setMaxRecipients(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Scholarship Amount</Label>
                <Input
                  id="amount"
                  value={scholarshipAmount}
                  onChange={(e) => setScholarshipAmount(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={saveSelectionSettings} disabled={savingSelection}>
              {savingSelection ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Selection Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
