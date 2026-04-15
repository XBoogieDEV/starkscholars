"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, File, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function RecommendationPage() {
  const params = useParams();
  const token = params.token as string;
  const { toast } = useToast();
  
  const recommendation = useQuery(api.recommendations.getByToken, { token });
  const application = useQuery(
    api.applications.getById,
    recommendation ? { id: recommendation.applicationId } : "skip"
  );
  const markAsViewed = useMutation(api.recommendations.markAsViewed);
  const submitRecommendation = useMutation(api.recommendations.submitRecommendation);
  const generateUploadUrl = useMutation(api.storage.generateRecommendationUploadUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    recommenderName: "",
    recommenderTitle: "",
    recommenderOrganization: "",
    confirmAccuracy: false,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mark as viewed when page loads
  useEffect(() => {
    if (recommendation && recommendation.status === "email_sent") {
      markAsViewed({ token });
    }
  }, [recommendation, token, markAsViewed]);

  if (recommendation === undefined || application === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Invalid Link</h1>
            <p className="text-muted-foreground">
              This recommendation link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recommendation.tokenExpiresAt < Date.now()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-primary/80 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Link Expired</h1>
            <p className="text-muted-foreground">
              This recommendation link has expired. Please contact the applicant to request a new invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recommendation.status === "submitted" || isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Thank You!</h1>
            <p className="text-muted-foreground mb-4">
              Your recommendation has been submitted successfully. The applicant has been notified.
            </p>
            <p className="text-sm text-muted-foreground">
              You can close this page now.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate
      if (!file) {
        toast({
          title: "Missing file",
          description: "Please upload your recommendation letter.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.recommenderName) {
        toast({
          title: "Missing name",
          description: "Please enter your full name.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.confirmAccuracy) {
        toast({
          title: "Confirmation required",
          description: "Please confirm that this letter is your own work.",
          variant: "destructive",
        });
        return;
      }

      // Upload file with progress tracking, timeout, and retry
      const attemptUpload = async (): Promise<string> => {
        const uploadUrl = await generateUploadUrl({ token });
        return new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const timeoutId = setTimeout(() => {
            xhr.abort();
            reject(new Error("Upload timed out after 60 seconds"));
          }, 60000);

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            clearTimeout(timeoutId);
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const result = JSON.parse(xhr.responseText);
                if (!result.storageId) {
                  reject(new Error("No storageId returned"));
                  return;
                }
                resolve(result.storageId);
              } catch {
                reject(new Error("Invalid upload response"));
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            clearTimeout(timeoutId);
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            clearTimeout(timeoutId);
          });

          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      };

      let storageId: string;
      try {
        storageId = await attemptUpload();
      } catch (firstError) {
        console.warn("Upload failed, retrying...", firstError);
        setUploadProgress(0);
        storageId = await attemptUpload();
      }

      // Submit recommendation
      await submitRecommendation({
        token,
        letterFileId: storageId as Id<"_storage">,
        recommenderName: formData.recommenderName,
        recommenderTitle: formData.recommenderTitle,
        recommenderOrganization: formData.recommenderOrganization,
      });

      setIsSubmitted(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      let description = "Failed to submit. Please try again.";
      if (msg.includes("Token expired") || msg.includes("token expired")) {
        description = "This link has expired. Please contact the applicant to request a new invitation.";
      } else if (msg.includes("Invalid token") || msg.includes("invalid token")) {
        description = "This link is no longer valid. Please contact the applicant.";
      } else if (msg.includes("Already submitted") || msg.includes("already submitted")) {
        description = "This recommendation has already been submitted.";
      } else if (
        msg.includes("Upload") ||
        msg.includes("upload") ||
        msg.includes("Network") ||
        msg.includes("network") ||
        msg.includes("timed out")
      ) {
        description = "File upload failed. Please check your connection and try again.";
      }
      toast({
        title: "Submission failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary font-serif mb-2">
            William R. Stark Financial Assistance Program
          </h1>
          <p className="text-muted-foreground">Letter of Recommendation</p>
        </div>

        {/* Applicant Info */}
        {application && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Applicant Information</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                  {application.firstName?.[0]}{application.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {application.firstName} {application.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{application.highSchoolName}</p>
                  <p className="text-sm text-muted-foreground">
                    {application.collegeName} • {application.yearInCollege && 
                      application.yearInCollege.charAt(0).toUpperCase() + application.yearInCollege.slice(1)
                    }
                  </p>
                  {recommendation.relationship && (
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Relationship: {recommendation.relationship}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guidelines */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              What to Include in Your Letter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>How long and in what capacity you have known the applicant</li>
              <li>The applicant&apos;s academic abilities and achievements</li>
              <li>The applicant&apos;s character and personal qualities</li>
              <li>Examples of community involvement or leadership</li>
              <li>Why you believe they deserve this scholarship</li>
            </ul>
          </CardContent>
        </Card>

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>
                  Upload Letter <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <File className="h-5 w-5 text-primary" />
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Letter
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground/70">
                  Accepted: PDF, DOC, DOCX • Max size: 5MB
                </p>
                {isLoading && uploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading...{` ${uploadProgress}%`}
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}
              </div>

              {/* Recommender Info */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-foreground">Your Information</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="recommenderName">
                      Your Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="recommenderName"
                      value={formData.recommenderName}
                      onChange={(e) => setFormData({ ...formData, recommenderName: e.target.value })}
                      placeholder="Dr. Sarah Johnson"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recommenderTitle">Title/Position</Label>
                    <Input
                      id="recommenderTitle"
                      value={formData.recommenderTitle}
                      onChange={(e) => setFormData({ ...formData, recommenderTitle: e.target.value })}
                      placeholder="AP History Teacher"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommenderOrganization">Organization/School</Label>
                  <Input
                    id="recommenderOrganization"
                    value={formData.recommenderOrganization}
                    onChange={(e) => setFormData({ ...formData, recommenderOrganization: e.target.value })}
                    placeholder="Cass Technical High School"
                  />
                </div>
              </div>

              {/* Confirmation */}
              <div className="flex items-start gap-3 pt-4 border-t">
                <Checkbox
                  id="confirm"
                  checked={formData.confirmAccuracy}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, confirmAccuracy: checked as boolean })
                  }
                />
                <Label htmlFor="confirm" className="text-sm font-normal cursor-pointer">
                  I confirm that this letter is my own work and accurately represents my assessment of the applicant.
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Recommendation"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Questions? Contact the scholarship committee at</p>
          <a href="mailto:blackgoldmine@sbcglobal.net" className="text-primary hover:underline">
            blackgoldmine@sbcglobal.net
          </a>
          <p className="mt-2">
            This link expires on {new Date(recommendation.tokenExpiresAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
