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
    profilePhotoUrl?: string | null;
    myEvaluation?: {
      rating: string;
    };
    evaluationCount?: number;
    recommendationCount?: number;
    averageRating?: number;
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

  // Photo URL is resolved server-side in the Convex query
  const photoUrl = candidate.profilePhotoUrl || null;

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
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {candidate.firstName} {candidate.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
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
                  <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1">
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
                      <Badge variant="outline" className="text-primary border-primary/20 text-xs">
                        <span className="hidden sm:inline">Needs Review</span>
                        <span className="sm:hidden">Review</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                  {candidate.gpa && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-primary/80" />
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
                <p className="text-sm text-foreground/80 line-clamp-3">
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
                      className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary/80 mt-0.5 shrink-0">•</span>
                      <span className="line-clamp-1">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-border/50 gap-3 sm:gap-0 mt-auto">
              <div className="text-xs sm:text-sm text-muted-foreground">
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
                        ? "bg-muted text-foreground/80 hover:bg-muted"
                        : "bg-primary hover:bg-primary/90"
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
