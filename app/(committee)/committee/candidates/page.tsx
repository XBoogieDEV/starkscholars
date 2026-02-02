"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "@/components/committee/candidate-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  ClipboardCheck,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  cardHover,
} from "@/lib/motion";

export default function CandidatesPage() {
  const candidates = useQuery(api.evaluations.getCandidatesForEvaluation);
  const [searchQuery, setSearchQuery] = useState("");
  const shouldReduceMotion = useReducedMotion();

  if (candidates === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading candidates...</div>
      </div>
    );
  }

  // Filter candidates based on search
  const filteredCandidates = candidates.filter((c) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(searchLower) ||
      c.lastName?.toLowerCase().includes(searchLower) ||
      c.city?.toLowerCase().includes(searchLower) ||
      c.collegeName?.toLowerCase().includes(searchLower) ||
      c.major?.toLowerCase().includes(searchLower)
    );
  });

  // Group candidates
  const pendingCandidates = filteredCandidates.filter((c) => !c.myEvaluation);
  const evaluatedCandidates = filteredCandidates.filter((c) => c.myEvaluation);

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : "initial"}
      animate="animate"
      variants={fadeInUp}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Candidates
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Review and evaluate scholarship applicants
          </p>
        </div>
        
        {/* Stats badges - wrap on mobile */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-2"
        >
          <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
            <Users className="h-3 w-3 mr-1" />
            {candidates.length} Total
          </Badge>
          <Badge className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 text-xs sm:text-sm">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {evaluatedCandidates.length} Evaluated
          </Badge>
          <Badge className="bg-amber-100 text-amber-800 px-2 sm:px-3 py-1 text-xs sm:text-sm">
            <ClipboardCheck className="h-3 w-3 mr-1" />
            {pendingCandidates.length} Pending
          </Badge>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, city, school, or major..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Candidates List */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="pending" className="text-xs sm:text-sm py-2 sm:py-2.5">
            <span className="hidden sm:inline">To Evaluate</span>
            <span className="sm:hidden">Pending</span>
            {" "}({pendingCandidates.length})
          </TabsTrigger>
          <TabsTrigger value="evaluated" className="text-xs sm:text-sm py-2 sm:py-2.5">
            <span className="hidden sm:inline">Evaluated</span>
            <span className="sm:hidden">Done</span>
            {" "}({evaluatedCandidates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 sm:mt-6">
          {pendingCandidates.length > 0 ? (
            <motion.div
              variants={shouldReduceMotion ? {} : staggerContainer}
              initial="initial"
              animate="animate"
              className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            >
              {pendingCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate._id}
                  variants={shouldReduceMotion ? {} : staggerItem}
                  whileHover={shouldReduceMotion ? {} : "hover"}
                  initial="rest"
                  animate="rest"
                  custom={index}
                >
                  <motion.div variants={cardHover}>
                    <CandidateCard
                      candidate={candidate}
                      showEvaluateButton
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 sm:p-8 text-center">
                  <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-sm text-green-700">
                    You&apos;ve evaluated all available candidates. Great work!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="evaluated" className="mt-4 sm:mt-6">
          {evaluatedCandidates.length > 0 ? (
            <motion.div
              variants={shouldReduceMotion ? {} : staggerContainer}
              initial="initial"
              animate="animate"
              className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            >
              {evaluatedCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate._id}
                  variants={shouldReduceMotion ? {} : staggerItem}
                  whileHover={shouldReduceMotion ? {} : "hover"}
                  initial="rest"
                  animate="rest"
                  custom={index}
                >
                  <motion.div variants={cardHover}>
                    <CandidateCard
                      candidate={candidate}
                      showEvaluateButton
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <ClipboardCheck className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    No Evaluations Yet
                  </h3>
                  <p className="text-sm text-gray-600">
                    You haven&apos;t evaluated any candidates yet. Start reviewing!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
