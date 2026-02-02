"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ratingLabels,
  ratingEmojis,
  ratingColors,
  ratingPoints,
} from "@/convex/evaluations";
import {
  ArrowLeft,
  MapPin,
  GraduationCap,
  Star,
  FileText,
  Users,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ratingOptions: Array<{
  value: keyof typeof ratingLabels;
  label: string;
  emoji: string;
  description: string;
}> = [
  {
    value: "strong_yes",
    label: "Strong Yes",
    emoji: "😍",
    description: "Exceptional candidate, strongly recommend",
  },
  {
    value: "yes",
    label: "Yes",
    emoji: "😊",
    description: "Good candidate, recommend",
  },
  {
    value: "maybe",
    label: "Maybe",
    emoji: "😐",
    description: "Borderline candidate, needs discussion",
  },
  {
    value: "no",
    label: "No",
    emoji: "😕",
    description: "Does not meet criteria",
  },
  {
    value: "strong_no",
    label: "Strong No",
    emoji: "😞",
    description: "Significantly below criteria",
  },
];

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as Id<"applications">;

  const data = useQuery(api.evaluations.getCandidateDetails, { applicationId });
  const submitEvaluation = useMutation(api.evaluations.submit);

  const [rating, setRating] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Set initial values if evaluation exists
  const existingEvaluation = data?.myEvaluation;
  if (existingEvaluation && !rating && !isSubmitting) {
    setRating(existingEvaluation.rating);
    setNotes(existingEvaluation.notes || "");
  }

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading candidate...</div>
      </div>
    );
  }

  if (!data?.application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Candidate not found
        </h2>
        <Link href="/committee/candidates">
          <Button className="mt-4">Back to Candidates</Button>
        </Link>
      </div>
    );
  }

  const { application, myEvaluation, otherEvaluations, recommendations } = data;

  const hasEvaluated = !!myEvaluation;

  const handleSubmit = async () => {
    if (!rating) return;

    setIsSubmitting(true);
    try {
      await submitEvaluation({
        applicationId: applicationId as Id<"applications">,
        rating: rating as typeof ratingOptions[number]["value"],
        notes: notes || undefined,
      });
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = `${application.firstName?.[0] || ""}${
    application.lastName?.[0] || ""
  }`.toUpperCase();

  const photoUrl = application.profilePhotoId
    ? `/api/storage/${application.profilePhotoId}`
    : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/committee/candidates">
        <Button variant="ghost" className="pl-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Candidates
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`${application.firstName} ${application.lastName}`}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {application.firstName} {application.lastName}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 flex-wrap">
                {application.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {application.city}
                  </span>
                )}
                {application.collegeName && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {application.collegeName}
                  </span>
                )}
                {application.gpa && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    GPA: {application.gpa.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {hasEvaluated ? (
              <Badge
                className={
                  ratingColors[myEvaluation.rating as keyof typeof ratingColors]
                }
              >
                {
                  ratingEmojis[
                    myEvaluation.rating as keyof typeof ratingEmojis
                  ]
                }{" "}
                {
                  ratingLabels[
                    myEvaluation.rating as keyof typeof ratingLabels
                  ]
                }
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-200"
              >
                <Clock className="h-3 w-3 mr-1" />
                Needs Your Review
              </Badge>
            )}
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-2 mt-3">
            {application.major && (
              <Badge variant="secondary">{application.major}</Badge>
            )}
            {application.yearInCollege && (
              <Badge variant="secondary">
                {application.yearInCollege.charAt(0).toUpperCase() +
                  application.yearInCollege.slice(1)}
              </Badge>
            )}
            <Badge variant="outline">
              <FileText className="h-3 w-3 mr-1" />
              {recommendations.length}/2 recommendations
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Application Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="essay">Essay</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="recommendations">
                Recommendations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* AI Summary Card */}
              {application.aiSummary && (
                <Card className="border-amber-200 bg-amber-50/30">
                  <CardHeader>
                    <CardTitle className="text-amber-900 flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-600" />
                      AI-Generated Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{application.aiSummary}</p>

                    {application.aiHighlights &&
                      application.aiHighlights.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Key Highlights
                          </h4>
                          <ul className="space-y-2">
                            {application.aiHighlights.map((highlight, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-gray-700"
                              >
                                <span className="text-amber-500 mt-0.5">•</span>
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}

              {/* Education Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      High School
                    </h4>
                    <p className="text-gray-900">
                      {application.highSchoolName || "N/A"}
                    </p>
                    {application.highSchoolCity && (
                      <p className="text-sm text-gray-600">
                        {application.highSchoolCity},{" "}
                        {application.highSchoolState}
                      </p>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      College/University
                    </h4>
                    <p className="text-gray-900">
                      {application.collegeName || "N/A"}
                    </p>
                    {application.collegeCity && (
                      <p className="text-sm text-gray-600">
                        {application.collegeCity}, {application.collegeState}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2">
                      {application.yearInCollege && (
                        <span className="text-sm text-gray-600">
                          <strong>Year:</strong>{" "}
                          {application.yearInCollege.charAt(0).toUpperCase() +
                            application.yearInCollege.slice(1)}
                        </span>
                      )}
                      {application.major && (
                        <span className="text-sm text-gray-600">
                          <strong>Major:</strong> {application.major}
                        </span>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Academic Performance
                    </h4>
                    <div className="flex gap-4 mt-2">
                      {application.gpa && (
                        <span className="text-sm text-gray-600">
                          <strong>GPA:</strong> {application.gpa.toFixed(2)}
                        </span>
                      )}
                      {application.actScore && (
                        <span className="text-sm text-gray-600">
                          <strong>ACT:</strong> {application.actScore}
                        </span>
                      )}
                      {application.satScore && (
                        <span className="text-sm text-gray-600">
                          <strong>SAT:</strong> {application.satScore}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="essay" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Essay</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.essayText ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {application.essayText}
                      </p>
                    </div>
                  ) : application.essayFileId ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Essay uploaded as file. Download to view.
                      </p>
                      <Button className="mt-4" variant="outline">
                        Download Essay
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No essay submitted.</p>
                  )}
                  {application.essayWordCount && (
                    <p className="text-sm text-gray-500 mt-4">
                      Word count: {application.essayWordCount}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transcript" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.transcriptFileId ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Transcript uploaded.</p>
                      <Button className="mt-4" variant="outline">
                        View Transcript
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      No transcript uploaded.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation Letters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, idx) => (
                      <div key={rec._id}>
                        {idx > 0 && <Separator className="my-4" />}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              Recommendation {idx + 1}
                            </h4>
                            <Badge variant="outline">{rec.recommenderType}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            <strong>From:</strong> {rec.recommenderName}
                          </p>
                          {rec.recommenderOrganization && (
                            <p className="text-sm text-gray-600">
                              <strong>Organization:</strong>{" "}
                              {rec.recommenderOrganization}
                            </p>
                          )}
                          {rec.letterText ? (
                            <div className="mt-3 p-4 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {rec.letterText}
                              </p>
                            </div>
                          ) : rec.letterFileId ? (
                            <Button variant="outline" size="sm">
                              View Letter
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">
                      No recommendations received yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Evaluation Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Your Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Overall Rating
                </Label>
                <RadioGroup
                  value={rating}
                  onValueChange={setRating}
                  className="space-y-2"
                >
                  {ratingOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                        rating === option.value
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{option.emoji}</span>
                          <span className="font-medium">{option.label}</span>
                        </span>
                        <span className="text-sm text-gray-500 block mt-0.5">
                          {option.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Notes */}
              <div>
                <Label
                  htmlFor="notes"
                  className="text-base font-medium mb-2 block"
                >
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional comments or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!rating || isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : hasEvaluated ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update Evaluation
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Evaluation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Other Committee Ratings - Only visible after submitting */}
          {hasEvaluated && otherEvaluations && otherEvaluations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Other Committee Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {otherEvaluations.map((evaluation: any) => (
                  <div
                    key={evaluation._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {evaluation.evaluator?.name || "Committee Member"}
                      </p>
                      {evaluation.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          &quot;{evaluation.notes.substring(0, 50)}
                          {evaluation.notes.length > 50 ? "..." : ""}&quot;
                        </p>
                      )}
                    </div>
                    <Badge
                      className={
                        ratingColors[
                          evaluation.rating as keyof typeof ratingColors
                        ]
                      }
                    >
                      {
                        ratingEmojis[
                          evaluation.rating as keyof typeof ratingEmojis
                        ]
                      }
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {hasEvaluated &&
            (!otherEvaluations || otherEvaluations.length === 0) && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500">
                    No other committee ratings yet.
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
