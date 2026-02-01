"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [isLoading, setIsLoading] = useState(false);
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
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-gray-600">
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
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h1>
            <p className="text-gray-600">
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
            <h1 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600 mb-4">
              Your recommendation has been submitted successfully. The applicant has been notified.
            </p>
            <p className="text-sm text-gray-500">
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

      // Upload file
      const uploadUrl = await generateUploadUrl({ type: "recommendation" });
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      const { storageId } = await response.json();

      // Submit recommendation
      await submitRecommendation({
        token,
        letterFileId: storageId,
        recommenderName: formData.recommenderName,
        recommenderTitle: formData.recommenderTitle,
        recommenderOrganization: formData.recommenderOrganization,
      });

      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-amber-800 mb-2">
            William R. Stark Financial Assistance Program
          </h1>
          <p className="text-gray-600">Letter of Recommendation</p>
        </div>

        {/* Applicant Info */}
        {application && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Applicant Information</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-2xl font-bold text-amber-800">
                  {application.firstName?.[0]}{application.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {application.firstName} {application.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{application.highSchoolName}</p>
                  <p className="text-sm text-gray-600">
                    {application.collegeName} • {application.yearInCollege && 
                      application.yearInCollege.charAt(0).toUpperCase() + application.yearInCollege.slice(1)
                    }
                  </p>
                  {recommendation.relationship && (
                    <p className="text-sm text-gray-500 mt-1">
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
            <ul className="list-disc list-inside space-y-2 text-gray-700">
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <File className="h-5 w-5 text-amber-600" />
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
                <p className="text-sm text-gray-500">
                  Accepted: PDF, DOC, DOCX • Max size: 5MB
                </p>
              </div>

              {/* Recommender Info */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900">Your Information</h3>
                
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
                className="w-full bg-amber-600 hover:bg-amber-700"
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
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Questions? Contact the scholarship committee at</p>
          <a href="mailto:blackgoldmine@sbcglobal.net" className="text-amber-600 hover:underline">
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
