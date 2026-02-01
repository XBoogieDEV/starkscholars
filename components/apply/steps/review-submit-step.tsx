"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Send,
  User,
  Home,
  GraduationCap,
  HelpCircle,
  Upload,
  Users,
  FileText,
  Edit,
} from "lucide-react";
import Link from "next/link";

interface ReviewSubmitStepProps {
  application: Doc<"applications">;
  onComplete: () => void;
}

interface Requirement {
  id: string;
  label: string;
  check: (app: Doc<"applications">, recs: any[]) => boolean;
  link: string;
}

const requirements: Requirement[] = [
  {
    id: "personal",
    label: "Personal Information complete",
    check: (app) => !!(app.firstName && app.lastName && app.phone && app.dateOfBirth),
    link: "/apply/step/1",
  },
  {
    id: "address",
    label: "Address verified (Michigan resident)",
    check: (app) => !!(app.streetAddress && app.city && app.state === "MI" && app.zipCode),
    link: "/apply/step/2",
  },
  {
    id: "education",
    label: "Education information complete",
    check: (app) => !!(app.highSchoolName && app.gpa && app.collegeName && app.yearInCollege),
    link: "/apply/step/3",
  },
  {
    id: "gpa",
    label: "GPA requirement met (≥ 3.0)",
    check: (app) => (app.gpa || 0) >= 3.0,
    link: "/apply/step/3",
  },
  {
    id: "eligibility",
    label: "Eligibility questions answered",
    check: (app) => app.isFullTimeStudent === true && app.isMichiganResident === true,
    link: "/apply/step/4",
  },
  {
    id: "essay",
    label: "Essay complete (450-550 words)",
    check: (app) => {
      const wordCount = app.essayWordCount || 0;
      return wordCount >= 450 && wordCount <= 550;
    },
    link: "/apply/step/5",
  },
  {
    id: "transcript",
    label: "Transcript uploaded",
    check: (app) => !!app.transcriptFileId,
    link: "/apply/step/5",
  },
  {
    id: "recommendations",
    label: "2 Recommendations received",
    check: (app, recs) => recs?.length === 2 && recs.every((r: any) => r.status === "submitted"),
    link: "/apply/step/6",
  },
];

export function ReviewSubmitStep({ application, onComplete }: ReviewSubmitStepProps) {
  const { toast } = useToast();
  const recommendations = useQuery(api.recommendations.getByApplication, {
    applicationId: application._id,
  });
  const submitApplication = useMutation(api.applications.submit);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [signature, setSignature] = useState("");
  const [certifications, setCertifications] = useState({
    accurate: false,
    publish: false,
    disqualify: false,
  });

  const checks = requirements.map((req) => ({
    ...req,
    passed: req.check(application, recommendations || []),
  }));

  const allPassed = checks.every((c) => c.passed);
  const passedCount = checks.filter((c) => c.passed).length;

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Validate signature matches name
      const fullName = `${application.firstName} ${application.lastName}`.toLowerCase().trim();
      const sigLower = signature.toLowerCase().trim();
      
      if (sigLower !== fullName) {
        toast({
          title: "Signature mismatch",
          description: "Your electronic signature must match your full legal name exactly.",
          variant: "destructive",
        });
        return;
      }

      await submitApplication({
        applicationId: application._id,
        signature,
      });

      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully.",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const getSectionIcon = (link: string) => {
    if (link.includes("/1")) return <User className="h-4 w-4" />;
    if (link.includes("/2")) return <Home className="h-4 w-4" />;
    if (link.includes("/3")) return <GraduationCap className="h-4 w-4" />;
    if (link.includes("/4")) return <HelpCircle className="h-4 w-4" />;
    if (link.includes("/5")) return <Upload className="h-4 w-4" />;
    if (link.includes("/6")) return <Users className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Application Checklist</h3>
          <span className="text-sm text-gray-600">
            {passedCount} of {checks.length} complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-amber-600 h-2 rounded-full transition-all"
            style={{ width: `${(passedCount / checks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              check.passed
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {check.passed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={check.passed ? "text-gray-900" : "text-red-700"}>
                {check.label}
              </span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={check.link} className="flex items-center gap-1">
                {getSectionIcon(check.link)}
                <Edit className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Application Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Name:</strong> {application.firstName} {application.lastName}
              </p>
              <p>
                <strong>Phone:</strong> {application.phone}
              </p>
              <p>
                <strong>DOB:</strong> {application.dateOfBirth}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Address
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{application.streetAddress}</p>
              <p>
                {application.city}, {application.state} {application.zipCode}
              </p>
            </div>
          </div>

          {/* Education */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>High School:</strong> {application.highSchoolName}
              </p>
              <p>
                <strong>GPA:</strong> {application.gpa}
                {application.actScore && ` | ACT: ${application.actScore}`}
                {application.satScore && ` | SAT: ${application.satScore}`}
              </p>
              <p>
                <strong>College:</strong> {application.collegeName}
              </p>
              <p>
                <strong>Year:</strong> {application.yearInCollege}
                {application.major && ` | Major: ${application.major}`}
              </p>
            </div>
          </div>

          {/* Documents */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Documents
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Transcript:</strong>{" "}
                {application.transcriptFileId ? (
                  <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                ) : (
                  <Badge variant="destructive">Missing</Badge>
                )}
              </p>
              <p>
                <strong>Essay:</strong>{" "}
                {application.essayWordCount ? (
                  <Badge className="bg-green-100 text-green-800">
                    {application.essayWordCount} words
                  </Badge>
                ) : (
                  <Badge variant="destructive">Missing</Badge>
                )}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recommendations
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              {recommendations?.map((rec: any, idx: number) => (
                <p key={rec._id}>
                  <strong>#{idx + 1}:</strong> {rec.recommenderName} -{" "}
                  {rec.status === "submitted" ? (
                    <Badge className="bg-green-100 text-green-800">Received</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600">
                      {rec.status}
                    </Badge>
                  )}
                </p>
              ))}
              {(!recommendations || recommendations.length === 0) && (
                <p className="text-red-600">No recommendations requested yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className={allPassed ? "" : "opacity-50 pointer-events-none"}>
        <CardHeader>
          <CardTitle className="text-lg">Certification & Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="cert-accurate"
              checked={certifications.accurate}
              onCheckedChange={(checked) =>
                setCertifications((prev) => ({ ...prev, accurate: checked as boolean }))
              }
            />
            <Label htmlFor="cert-accurate" className="text-sm font-normal cursor-pointer">
              I certify that all information provided in this application is true and accurate
              to the best of my knowledge.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cert-publish"
              checked={certifications.publish}
              onCheckedChange={(checked) =>
                setCertifications((prev) => ({ ...prev, publish: checked as boolean }))
              }
            />
            <Label htmlFor="cert-publish" className="text-sm font-normal cursor-pointer">
              I understand that if selected, my name, photograph, city, state, major, and
              university may be published on the William R. Stark Class website, social media,
              and publications nationally or internationally.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cert-disqualify"
              checked={certifications.disqualify}
              onCheckedChange={(checked) =>
                setCertifications((prev) => ({ ...prev, disqualify: checked as boolean }))
              }
            />
            <Label htmlFor="cert-disqualify" className="text-sm font-normal cursor-pointer">
              I understand that false information may result in disqualification from this
              scholarship program.
            </Label>
          </div>

          <div className="pt-4 border-t">
            <Label htmlFor="signature" className="text-base font-medium">
              Electronic Signature <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-2">
              Type your full legal name: {application.firstName} {application.lastName}
            </p>
            <Input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder={`${application.firstName} ${application.lastName}`}
              className="max-w-md"
            />
          </div>

          <Button
            onClick={() => setShowConfirmDialog(true)}
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={
              !allPassed ||
              !certifications.accurate ||
              !certifications.publish ||
              !certifications.disqualify ||
              !signature
            }
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Application
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your application? You will not be able to make
              changes after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <p className="text-center text-sm text-gray-600">
              By clicking &ldquo;Submit,&rdquo; you confirm that all information is accurate
              and complete.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
