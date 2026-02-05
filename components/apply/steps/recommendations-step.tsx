"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, Plus, Send, Clock, CheckCircle, AlertCircle, X, RefreshCw } from "lucide-react";

interface RecommendationsStepProps {
  application: Doc<"applications">;
  onComplete: () => void;
}

const recommenderTypes = [
  { value: "educator", label: "Educator (teacher, professor, counselor)" },
  { value: "community_group", label: "Community Group (church, nonprofit, organization leader)" },
  { value: "other", label: "Other (employer, mentor, coach)" },
];

interface RecommenderForm {
  recommenderEmail: string;
  recommenderName: string;
  recommenderType: "educator" | "community_group" | "other";
  recommenderOrganization: string;
  relationship: string;
}

export function RecommendationsStep({ application, onComplete }: RecommendationsStepProps) {
  const { toast } = useToast();
  const createRecommendation = useMutation(api.recommendations.create);
  const sendReminder = useMutation(api.recommendations.sendReminder);
  const resendEmail = useMutation(api.recommendations.resendEmail);
  const recommendations = useQuery(api.recommendations.getByApplication, {
    applicationId: application._id,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<RecommenderForm>({
    recommenderEmail: "",
    recommenderName: "",
    recommenderType: "educator",
    recommenderOrganization: "",
    relationship: "",
  });

  const handleChange = (field: keyof RecommenderForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.recommenderEmail || !formData.recommenderName || !formData.recommenderType) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.recommenderEmail)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if already have 2 recommendations
      if (recommendations && recommendations.length >= 2) {
        toast({
          title: "Maximum reached",
          description: "You can only request 2 recommendations.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await createRecommendation({
        applicationId: application._id,
        ...formData,
      });

      toast({
        title: "Request sent!",
        description: `An email has been sent to ${formData.recommenderName}.`,
      });

      // Reset form
      setFormData({
        recommenderEmail: "",
        recommenderName: "",
        recommenderType: "educator",
        recommenderOrganization: "",
        relationship: "",
      });
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async (recommendationId: Id<"recommendations">, name: string) => {
    try {
      await sendReminder({ recommendationId });
      toast({
        title: "Reminder sent!",
        description: `A reminder has been sent to ${name}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendEmail = async (recommendationId: Id<"recommendations">, name: string) => {
    try {
      await resendEmail({ recommendationId });
      toast({
        title: "Email resent!",
        description: `A new recommendation request has been sent to ${name} with a fresh link.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-gray-600">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "email_sent":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            <Send className="mr-1 h-3 w-3" />
            Email Sent
          </Badge>
        );
      case "viewed":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Viewed
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Received
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const hasEducatorOrCommunity = recommendations?.some(
    (r: any) => r.recommenderType === "educator" || r.recommenderType === "community_group"
  );

  const allSubmitted = recommendations?.length === 2 && recommendations.every(
    (r: any) => r.status === "submitted"
  );

  return (
    <div className="space-y-6">
      {/* Requirements Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-900 mb-2">Recommendation Requirements</h4>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li>You need exactly 2 letters of recommendation</li>
          <li>At least one must be from an educator or community group leader</li>
          <li>Both must be submitted before you can complete your application</li>
        </ul>
      </div>

      {/* Current Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Your Recommendations</h4>
          {recommendations.map((rec: any) => (
            <Card key={rec._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{rec.recommenderName}</h5>
                      {getStatusBadge(rec.status)}
                    </div>
                    <p className="text-sm text-gray-600">{rec.recommenderEmail}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {recommenderTypes.find((t) => t.value === rec.recommenderType)?.label}
                      {rec.recommenderOrganization && ` • ${rec.recommenderOrganization}`}
                    </p>
                    {rec.relationship && (
                      <p className="text-sm text-gray-500 italic mt-1">
                        &ldquo;{rec.relationship}&rdquo;
                      </p>
                    )}
                    {rec.status === "submitted" && rec.submittedAt && (
                      <p className="text-sm text-green-600 mt-2">
                        Submitted on {new Date(rec.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {rec.status !== "submitted" && (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendReminder(rec._id, rec.recommenderName || "")}
                      >
                        Send Reminder
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => handleResendEmail(rec._id, rec.recommenderName || "")}
                        title="Resend with a new link (use if they didn't receive it)"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Resend Email
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Recommender Form */}
      {showAddForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Recommender</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recommenderName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recommenderName"
                    value={formData.recommenderName}
                    onChange={(e) => handleChange("recommenderName", e.target.value)}
                    placeholder="Dr. Sarah Johnson"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommenderEmail">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recommenderEmail"
                    type="email"
                    value={formData.recommenderEmail}
                    onChange={(e) => handleChange("recommenderEmail", e.target.value)}
                    placeholder="sarah.johnson@school.edu"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    We&apos;ll send them a secure link to upload their letter
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommenderType">
                  Recommender Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.recommenderType}
                  onValueChange={(value) => handleChange("recommenderType", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {recommenderTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommenderOrganization">Organization/School</Label>
                <Input
                  id="recommenderOrganization"
                  value={formData.recommenderOrganization}
                  onChange={(e) => handleChange("recommenderOrganization", e.target.value)}
                  placeholder="Cass Technical High School"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">How does this person know you?</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => handleChange("relationship", e.target.value)}
                  placeholder="e.g., AP History teacher for 2 years"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        recommendations && recommendations.length < 2 && (
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full py-6 border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Recommender ({recommendations.length}/2)
          </Button>
        )
      )}

      {/* Validation Messages */}
      {!hasEducatorOrCommunity && recommendations && recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <AlertCircle className="inline mr-2 h-4 w-4" />
            <strong>Requirement:</strong> At least one recommender must be an educator or community group leader.
          </p>
        </div>
      )}

      {/* Continue Button */}
      <div className="pt-4 border-t space-y-3">
        {allSubmitted ? (
          <Button
            onClick={onComplete}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            Save & Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : recommendations && recommendations.length >= 2 ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                <Clock className="inline mr-2 h-4 w-4" />
                Waiting for <strong>{recommendations.filter((r: any) => r.status !== "submitted").length} recommendation(s)</strong> to be submitted by your recommenders.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                You can continue with the rest of your application while waiting.
              </p>
            </div>
            <Button
              onClick={onComplete}
              variant="outline"
              className="w-full"
            >
              Continue to Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-800">
              Please add {2 - (recommendations?.length || 0)} more recommender(s) to proceed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
