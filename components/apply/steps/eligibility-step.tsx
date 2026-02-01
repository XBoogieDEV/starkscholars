"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EligibilityStepProps {
  application: Doc<"applications">;
  onComplete: () => void;
}

interface Question {
  id: string;
  question: string;
  required: boolean;
  warning?: string;
}

const questions: Question[] = [
  {
    id: "isFirstTimeApplying",
    question: "Is this your first time applying for this scholarship?",
    required: false,
  },
  {
    id: "isPreviousRecipient",
    question: "Are you a previous recipient of this scholarship?",
    required: false,
  },
  {
    id: "isFullTimeStudent",
    question: "Are you currently enrolled as a full-time student?",
    required: true,
    warning: "You must be a full-time student to qualify for this scholarship.",
  },
  {
    id: "isMichiganResident",
    question: "Are you a permanent resident of Michigan?",
    required: true,
    warning: "You must be a Michigan resident to qualify for this scholarship.",
  },
];

export function EligibilityStep({ application, onComplete }: EligibilityStepProps) {
  const { toast } = useToast();
  const updateStep4 = useMutation(api.applications.updateStep4);
  
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState({
    isFirstTimeApplying: application.isFirstTimeApplying?.toString() || "",
    isPreviousRecipient: application.isPreviousRecipient?.toString() || "",
    isFullTimeStudent: application.isFullTimeStudent?.toString() || "",
    isMichiganResident: application.isMichiganResident?.toString() || "",
  });

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required questions
      for (const q of questions) {
        if (q.required && !answers[q.id as keyof typeof answers]) {
          toast({
            title: "Missing answer",
            description: `Please answer: ${q.question}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Validate eligibility requirements
      if (answers.isFullTimeStudent !== "true") {
        toast({
          title: "Eligibility Requirement",
          description: "You must be a full-time student to apply for this scholarship.",
          variant: "destructive",
        });
        return;
      }

      if (answers.isMichiganResident !== "true") {
        toast({
          title: "Eligibility Requirement",
          description: "You must be a Michigan resident to apply for this scholarship.",
          variant: "destructive",
        });
        return;
      }

      await updateStep4({
        applicationId: application._id,
        isFirstTimeApplying: answers.isFirstTimeApplying === "true",
        isPreviousRecipient: answers.isPreviousRecipient === "true",
        isFullTimeStudent: answers.isFullTimeStudent === "true",
        isMichiganResident: answers.isMichiganResident === "true",
      });

      toast({
        title: "Saved!",
        description: "Your eligibility information has been saved.",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEligible = 
    answers.isFullTimeStudent === "true" && 
    answers.isMichiganResident === "true";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {questions.map((q) => {
          const answer = answers[q.id as keyof typeof answers];
          const showWarning = q.warning && answer === "false";

          return (
            <div key={q.id} className="space-y-3">
              <Label className="text-base">
                {q.question}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              <RadioGroup
                value={answer}
                onValueChange={(value) => handleChange(q.id, value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`${q.id}-yes`} />
                  <Label htmlFor={`${q.id}-yes`} className="cursor-pointer font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`${q.id}-no`} />
                  <Label htmlFor={`${q.id}-no`} className="cursor-pointer font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>

              {showWarning && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{q.warning}</AlertDescription>
                </Alert>
              )}
            </div>
          );
        })}
      </div>

      {/* Eligibility Summary */}
      {isEligible && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>You are eligible!</strong> You meet the basic eligibility requirements 
            for the William R. Stark Financial Assistance Program.
          </AlertDescription>
        </Alert>
      )}

      <div className="pt-4 border-t">
        <Button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700"
          disabled={isLoading || !isEligible}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
