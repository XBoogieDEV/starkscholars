"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ratingLabels, ratingEmojis, ratingColors } from "@/convex/evaluations";
import { MapPin, GraduationCap, Star, FileText } from "lucide-react";
import { cardHover, badgeBounce } from "@/lib/motion";

interface CandidateCardProps {
  candidate: {
    _id: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    collegeName?: string;
    major?: string;
    gpa?: number;
    aiSummary?: string;
    aiHighlights?: string[];
    profilePhotoId?: string;
    myEvaluation?: {
      rating: string;
    };
    evaluationCount?: number;
    recommendationCount?: number;
  };
  showEvaluateButton?: boolean;
  compact?: boolean;
}

export function CandidateCard({
  candidate,
  showEvaluateButton = false,
  compact = false,
}: CandidateCardProps) {
  const hasEvaluated = !!candidate.myEvaluation;
  const rating = candidate.myEvaluation?.rating as keyof typeof ratingLabels;
  const shouldReduceMotion = useReducedMotion();

  // Build photo URL if available
  const photoUrl = candidate.profilePhotoId
    ? `/api/storage/${candidate.profilePhotoId}` // Adjust based on your storage setup
    : null;

  const initials = `${candidate.firstName?.[0] || ""}${
    candidate.lastName?.[0] || ""
  }`.toUpperCase();

  if (compact) {
    return (
      <motion.div
        whileHover={shouldReduceMotion ? {} : "hover"}
        initial="rest"
        animate="rest"
      >
        <motion.div variants={cardHover}>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={`${candidate.firstName} ${candidate.lastName}`}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-amber-100 text-amber-800">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {candidate.firstName} {candidate.lastName}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {candidate.collegeName}
                  </p>
                </div>
                {hasEvaluated ? (
                  <motion.div
                    initial={shouldReduceMotion ? {} : "initial"}
                    animate="animate"
                    variants={badgeBounce}
                  >
                    <Badge className={ratingColors[rating]}>
                      {ratingEmojis[rating]} {ratingLabels[rating]}
                    </Badge>
                  </motion.div>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : "hover"}
      initial="rest"
      animate="rest"
      className="h-full"
    >
      <motion.div variants={cardHover} className="h-full">
        <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
          <CardContent className="p-4 sm:p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 shrink-0">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={`${candidate.firstName} ${candidate.lastName}`}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-amber-100 text-amber-800 text-base sm:text-lg">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 mt-1">
                      {candidate.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{candidate.city}</span>
                        </span>
                      )}
                      {candidate.collegeName && (
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <GraduationCap className="h-3 w-3 shrink-0" />
                          <span className="truncate">{candidate.collegeName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasEvaluated ? (
                      <motion.div
                        initial={shouldReduceMotion ? {} : "initial"}
                        animate="animate"
                        variants={badgeBounce}
                      >
                        <Badge className={`${ratingColors[rating]} text-xs`}>
                          <span className="hidden sm:inline">{ratingEmojis[rating]} {ratingLabels[rating]}</span>
                          <span className="sm:hidden">{ratingEmojis[rating]}</span>
                        </Badge>
                      </motion.div>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 text-xs">
                        <span className="hidden sm:inline">Needs Review</span>
                        <span className="sm:hidden">Review</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                  {candidate.gpa && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500" />
                      GPA: {candidate.gpa.toFixed(2)}
                    </span>
                  )}
                  {candidate.major && (
                    <span className="flex items-center gap-1 hidden sm:flex">
                      <GraduationCap className="h-3 w-3" />
                      {candidate.major}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {candidate.recommendationCount || 0}/2 recs
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {candidate.aiSummary && (
              <div className="mb-4 flex-1">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {candidate.aiSummary}
                </p>
              </div>
            )}

            {/* AI Highlights */}
            {candidate.aiHighlights && candidate.aiHighlights.length > 0 && (
              <div className="mb-4">
                <ul className="space-y-1">
                  {candidate.aiHighlights.slice(0, 3).map((highlight, index) => (
                    <li
                      key={index}
                      className="text-xs sm:text-sm text-gray-600 flex items-start gap-2"
                    >
                      <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                      <span className="line-clamp-1">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100 gap-3 sm:gap-0 mt-auto">
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">{candidate.evaluationCount || 0}</span>{" "}
                <span className="hidden sm:inline">
                  committee {candidate.evaluationCount === 1 ? "rating" : "ratings"} received
                </span>
                <span className="sm:hidden">ratings</span>
              </div>

              {showEvaluateButton && (
                <Link href={`/committee/candidates/${candidate._id}`} className="w-full sm:w-auto">
                  <Button
                    className={`w-full sm:w-auto ${
                      hasEvaluated
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                    variant={hasEvaluated ? "outline" : "default"}
                    size="sm"
                  >
                    {hasEvaluated ? (
                      <>
                        <span className="hidden sm:inline">Update Evaluation</span>
                        <span className="sm:hidden">Update</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Evaluate</span>
                        <span className="sm:hidden">Review</span>
                      </>
                    )}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
