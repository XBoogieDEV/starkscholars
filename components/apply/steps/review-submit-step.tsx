"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Shield,
  FileCheck,
  Award,
  AlertTriangle,
  Info,
} from "lucide-react";
import Link from "next/link";

interface ReviewSubmitStepProps {
  application: Doc<"applications">;
  onComplete: () => void;
}

// Requirement checklist item type
interface RequirementItem {
  id: string;
  label: string;
  met: boolean;
  value?: string | number;
  link: string;
  icon: React.ReactNode;
  description?: string;
}

// Certification type
interface CertificationState {
  accurate: boolean;
  publish: boolean;
  disqualify: boolean;
}

export function ReviewSubmitStep({ application, onComplete }: ReviewSubmitStepProps) {
  const { toast } = useToast();

  // Fetch recommendations and validation status
  const recommendations = useQuery(api.recommendations.getByApplication, {
    applicationId: application._id,
  });
  const validationStatus = useQuery(api.applications.getValidationStatus, {
    applicationId: application._id,
  });

  const submitApplication = useMutation(api.applications.submit);

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [signature, setSignature] = useState("");
  const [certifications, setCertifications] = useState<CertificationState>({
    accurate: false,
    publish: false,
    disqualify: false,
  });
  const [touched, setTouched] = useState({
    signature: false,
    certifications: false,
  });

  // Build requirements checklist
  const requirements: RequirementItem[] = useMemo(() => {
    if (!validationStatus) return [];

    return [
      {
        id: "steps",
        label: "All 7 steps completed",
        met: validationStatus.allStepsCompleted,
        value: `${application.completedSteps.length}/7`,
        link: "/apply/dashboard",
        icon: <CheckCircle2 className="h-4 w-4" />,
        description: "Complete all sections of the application",
      },
      {
        id: "personal",
        label: "Personal information complete",
        met: validationStatus.personalComplete,
        link: "/apply/step/1",
        icon: <User className="h-4 w-4" />,
        description: "Name, phone, and date of birth required",
      },
      {
        id: "address",
        label: "Address verified (Michigan resident)",
        met: validationStatus.addressComplete && validationStatus.michiganResident,
        value: validationStatus.michiganResident ? "MI Resident" : "Not confirmed",
        link: "/apply/step/2",
        icon: <Home className="h-4 w-4" />,
        description: "Michigan residency is required",
      },
      {
        id: "education",
        label: "Education information complete",
        met: validationStatus.educationComplete,
        link: "/apply/step/3",
        icon: <GraduationCap className="h-4 w-4" />,
        description: "High school, college, and GPA required",
      },
      {
        id: "gpa",
        label: "GPA requirement met (≥ 3.0)",
        met: validationStatus.gpaMet,
        value: application.gpa?.toFixed(2) || "N/A",
        link: "/apply/step/3",
        icon: <Award className="h-4 w-4" />,
        description: "Minimum 3.0 GPA required",
      },
      {
        id: "fulltime",
        label: "Full-time student status confirmed",
        met: validationStatus.fullTimeStudent,
        value: application.isFullTimeStudent === true ? "Yes" : "No",
        link: "/apply/step/4",
        icon: <Shield className="h-4 w-4" />,
        description: "Must be enrolled full-time",
      },
      {
        id: "files",
        label: "Required documents uploaded",
        met: validationStatus.filesMet,
        value: [
          validationStatus.profilePhotoUploaded ? "Photo" : null,
          validationStatus.transcriptUploaded ? "Transcript" : null,
          validationStatus.essayUploaded ? "Essay" : null,
        ].filter(Boolean).join(", ") || "None",
        link: "/apply/step/5",
        icon: <Upload className="h-4 w-4" />,
        description: "Profile photo, transcript, and essay required",
      },
      {
        id: "essay",
        label: "Essay word count valid (250-500 words)",
        met: validationStatus.essayValid,
        value: `${validationStatus.wordCount || 0} words`,
        link: "/apply/step/5",
        icon: <FileText className="h-4 w-4" />,
        description: "Essay must be between 250-500 words",
      },
      {
        id: "recommendations",
        label: "Recommendations received (2 required)",
        met: validationStatus.recommendationsMet,
        value: `${validationStatus.recommendationsCount || 0}/2 submitted`,
        link: "/apply/step/6",
        icon: <Users className="h-4 w-4" />,
        description: "At least 2 recommendations must be submitted",
      },
    ];
  }, [validationStatus, application]);

  // Calculate completion stats
  const { passedCount, totalCount, completionPercentage, allRequirementsMet } = useMemo(() => {
    const total = requirements.length;
    const passed = requirements.filter((r) => r.met).length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    return {
      passedCount: passed,
      totalCount: total,
      completionPercentage: percentage,
      allRequirementsMet: passed === total && total > 0,
    };
  }, [requirements]);

  // Check if all certifications are checked
  const allCertificationsChecked = certifications.accurate && certifications.publish && certifications.disqualify;

  // Check if signature is valid
  const fullName = `${application.firstName} ${application.lastName}`.toLowerCase().trim();
  const signatureLower = signature.toLowerCase().trim();
  const signatureValid = signatureLower === fullName && signature.length > 0;

  // Determine if submit button should be enabled
  const canSubmit = allRequirementsMet && allCertificationsChecked && signatureValid;

  // Get specific validation errors for display
  const getValidationErrors = (): string[] => {
    const errors: string[] = [];

    if (!allRequirementsMet) {
      requirements.forEach((req) => {
        if (!req.met) {
          errors.push(req.label);
        }
      });
    }

    if (!allCertificationsChecked) {
      if (!certifications.accurate) errors.push("Certification: Information accuracy");
      if (!certifications.publish) errors.push("Certification: Publishing consent");
      if (!certifications.disqualify) errors.push("Certification: Disqualification acknowledgment");
    }

    if (signature && !signatureValid) {
      errors.push("Signature does not match your full legal name");
    }

    return errors;
  };

  // Handle submit button click
  const handleSubmitClick = () => {
    setTouched({ signature: true, certifications: true });

    if (!canSubmit) {
      const errors = getValidationErrors();
      if (errors.length > 0) {
        toast({
          title: "Cannot submit application",
          description: `Please complete: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? ` and ${errors.length - 3} more...` : ""}`,
          variant: "destructive",
        });
        setShowValidationDetails(true);
      }
      return;
    }

    setShowConfirmDialog(true);
  };

  // Handle final submission
  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Final client-side validation
      if (!signatureValid) {
        toast({
          title: "Signature mismatch",
          description: "Your electronic signature must match your full legal name exactly.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!allCertificationsChecked) {
        toast({
          title: "Certifications required",
          description: "Please check all certification checkboxes.",
          variant: "destructive",
        });
        setIsLoading(false);
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  // Get section icon
  const getSectionIcon = (link: string) => {
    if (link.includes("/1")) return <User className="h-4 w-4" />;
    if (link.includes("/2")) return <Home className="h-4 w-4" />;
    if (link.includes("/3")) return <GraduationCap className="h-4 w-4" />;
    if (link.includes("/4")) return <HelpCircle className="h-4 w-4" />;
    if (link.includes("/5")) return <Upload className="h-4 w-4" />;
    if (link.includes("/6")) return <Users className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // Get status color based on percentage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-600";
    if (percentage >= 75) return "bg-amber-600";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!validationStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-3 text-gray-600">Loading validation status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="text-gray-600 mt-2">
          Review your application and complete the certification before submitting
        </p>
      </div>

      {/* Progress Overview Card */}
      <Card className="border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Application Completion</h3>
              <p className="text-sm text-gray-500">
                {passedCount} of {totalCount} requirements met
              </p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${completionPercentage === 100 ? "text-green-600" : "text-amber-600"
                }`}>
                {completionPercentage}%
              </span>
            </div>
          </div>

          <Progress
            value={completionPercentage}
            className="h-3"
          />

          {/* Status message */}
          <div className="mt-4 flex items-center gap-2">
            {allRequirementsMet ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">
                  All requirements met! You can submit your application.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-amber-700">
                  Please complete all requirements before submitting.
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowValidationDetails(true)}
                  className="text-amber-700 underline"
                >
                  View details
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requirements Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-amber-600" />
            Requirements Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="space-y-2">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${req.met
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                    }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {req.met ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={req.met ? "text-gray-900" : "text-red-700 font-medium"}>
                          {req.label}
                        </span>
                        {req.description && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{req.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {req.value && (
                        <span className="text-sm text-gray-500">
                          Current: {req.value}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={req.link} className="flex items-center gap-1">
                      {getSectionIcon(req.link)}
                      <Edit className="h-3 w-3" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

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
              <p className="mt-1">
                <Badge
                  variant={application.isMichiganResident ? "default" : "destructive"}
                  className={application.isMichiganResident ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                >
                  {application.isMichiganResident ? "MI Resident ✓" : "MI Resident ✗"}
                </Badge>
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
                {(application.gpa || 0) >= 3.0 ? (
                  <Badge className="ml-2 bg-green-100 text-green-800">Meets requirement</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">Below 3.0</Badge>
                )}
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
              <p className="mt-1">
                <Badge
                  variant={application.isFullTimeStudent ? "default" : "destructive"}
                  className={application.isFullTimeStudent ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                >
                  {application.isFullTimeStudent ? "Full-time ✓" : "Full-time ✗"}
                </Badge>
              </p>
            </div>
          </div>

          {/* Documents */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Documents
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <strong>Profile Photo:</strong>
                {application.profilePhotoId ? (
                  <Badge className="bg-green-100 text-green-800">Uploaded ✓</Badge>
                ) : (
                  <Badge variant="destructive">Missing ✗</Badge>
                )}
              </p>
              <p className="flex items-center gap-2">
                <strong>Transcript:</strong>
                {application.transcriptFileId ? (
                  <Badge className="bg-green-100 text-green-800">Uploaded ✓</Badge>
                ) : (
                  <Badge variant="destructive">Missing ✗</Badge>
                )}
              </p>
              <p className="flex items-center gap-2">
                <strong>Essay:</strong>
                {application.essayWordCount ? (
                  <Badge className={
                    (application.essayWordCount >= 250 && application.essayWordCount <= 500)
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }>
                    {application.essayWordCount} words
                    {(application.essayWordCount >= 250 && application.essayWordCount <= 500) ? " ✓" : " (250-500 required)"}
                  </Badge>
                ) : (
                  <Badge variant="destructive">Missing ✗</Badge>
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
            <div className="text-sm text-gray-600 space-y-2">
              {recommendations?.map((rec: any, idx: number) => (
                <p key={rec._id} className="flex items-center gap-2">
                  <strong>#{idx + 1}:</strong> {rec.recommenderName || rec.recommenderEmail}
                  {rec.status === "submitted" ? (
                    <Badge className="bg-green-100 text-green-800">Received ✓</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600">
                      {rec.status === "pending" ? "Pending" :
                        rec.status === "email_sent" ? "Email sent" :
                          rec.status === "viewed" ? "Viewed" : rec.status}
                    </Badge>
                  )}
                </p>
              ))}
              {(!recommendations || recommendations.length === 0) && (
                <p className="text-red-600 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  No recommendations requested yet
                </p>
              )}
              {recommendations && recommendations.length < 2 && (
                <p className="text-amber-600 text-sm mt-2">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  At least 2 recommendations are required
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications & Signature */}
      <Card className={allRequirementsMet ? "" : "opacity-75"}>
        <CardHeader>
          <CardTitle className="text-lg">Certification & Signature</CardTitle>
          <p className="text-sm text-gray-500">
            Please review and confirm the following before submitting
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Certifications */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Required Certifications</h4>

            <div className={`flex items-start gap-3 p-3 rounded-lg border ${certifications.accurate ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
              }`}>
              <Checkbox
                id="cert-accurate"
                checked={certifications.accurate}
                onCheckedChange={(checked) =>
                  setCertifications((prev) => ({ ...prev, accurate: checked as boolean }))
                }
                disabled={!allRequirementsMet}
              />
              <div className="flex-1">
                <Label htmlFor="cert-accurate" className="text-sm font-normal cursor-pointer">
                  I certify that all information provided in this application is true and accurate
                  to the best of my knowledge.
                </Label>
                {!certifications.accurate && touched.certifications && (
                  <p className="text-red-500 text-xs mt-1">This certification is required</p>
                )}
              </div>
            </div>

            <div className={`flex items-start gap-3 p-3 rounded-lg border ${certifications.publish ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
              }`}>
              <Checkbox
                id="cert-publish"
                checked={certifications.publish}
                onCheckedChange={(checked) =>
                  setCertifications((prev) => ({ ...prev, publish: checked as boolean }))
                }
                disabled={!allRequirementsMet}
              />
              <div className="flex-1">
                <Label htmlFor="cert-publish" className="text-sm font-normal cursor-pointer">
                  I understand that if selected, my name, photograph, city, state, major, and
                  university may be published on the William R. Stark Class website, social media,
                  and publications nationally or internationally.
                </Label>
                {!certifications.publish && touched.certifications && (
                  <p className="text-red-500 text-xs mt-1">This certification is required</p>
                )}
              </div>
            </div>

            <div className={`flex items-start gap-3 p-3 rounded-lg border ${certifications.disqualify ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
              }`}>
              <Checkbox
                id="cert-disqualify"
                checked={certifications.disqualify}
                onCheckedChange={(checked) =>
                  setCertifications((prev) => ({ ...prev, disqualify: checked as boolean }))
                }
                disabled={!allRequirementsMet}
              />
              <div className="flex-1">
                <Label htmlFor="cert-disqualify" className="text-sm font-normal cursor-pointer">
                  I understand that false information may result in disqualification from this
                  scholarship program.
                </Label>
                {!certifications.disqualify && touched.certifications && (
                  <p className="text-red-500 text-xs mt-1">This certification is required</p>
                )}
              </div>
            </div>
          </div>

          {/* Electronic Signature */}
          <div className="pt-4 border-t">
            <Label htmlFor="signature" className="text-base font-medium flex items-center gap-2">
              Electronic Signature
              <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              Type your full legal name exactly as it appears: <strong>{application.firstName} {application.lastName}</strong>
            </p>
            <Input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, signature: true }))}
              placeholder={`${application.firstName} ${application.lastName}`}
              className={`max-w-md ${touched.signature && signature && !signatureValid
                ? "border-red-500 focus-visible:ring-red-500"
                : signatureValid
                  ? "border-green-500 focus-visible:ring-green-500"
                  : ""
                }`}
              disabled={!allRequirementsMet}
            />
            {touched.signature && signature && !signatureValid && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Signature must match exactly: &ldquo;{application.firstName} {application.lastName}&rdquo;
              </p>
            )}
            {signatureValid && (
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Signature verified
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            {!allRequirementsMet && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>
                    Please complete all application requirements before submitting.
                    Check the requirements checklist above for details.
                  </span>
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmitClick}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
              disabled={isLoading}
            >
              <Send className="mr-2 h-4 w-4" />
              {allRequirementsMet ? "Submit Application" : "Complete Requirements to Submit"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-3">
              By submitting, you confirm all information is accurate and complete.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Validation Details Dialog */}
      <Dialog open={showValidationDetails} onOpenChange={setShowValidationDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Requirements Check
            </DialogTitle>
            <DialogDescription>
              The following items need to be completed before you can submit:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
            {requirements
              .filter((r) => !r.met)
              .map((req) => (
                <div key={req.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">{req.label}</p>
                    {req.description && (
                      <p className="text-sm text-red-600">{req.description}</p>
                    )}
                    <Button variant="link" size="sm" asChild className="h-auto p-0 text-red-700">
                      <Link href={req.link}>Fix this →</Link>
                    </Button>
                  </div>
                </div>
              ))}
            {!allCertificationsChecked && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Certifications not complete</p>
                  <p className="text-sm text-red-600">
                    All 3 certifications must be checked
                  </p>
                </div>
              </div>
            )}
            {signature && !signatureValid && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Invalid signature</p>
                  <p className="text-sm text-red-600">
                    Must match: {application.firstName} {application.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowValidationDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-center text-sm text-gray-600">
                By clicking &ldquo;Submit,&rdquo; you confirm that:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>All information is accurate and complete</li>
                <li>Your electronic signature matches your legal name</li>
                <li>You agree to all certifications</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
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
