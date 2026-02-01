"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

// Import step components
import { PersonalInfoStep } from "@/components/apply/steps/personal-info-step";
import { AddressStep } from "@/components/apply/steps/address-step";
import { EducationStep } from "@/components/apply/steps/education-step";
import { EligibilityStep } from "@/components/apply/steps/eligibility-step";
import { DocumentsStep } from "@/components/apply/steps/documents-step";

const steps = [
  { id: 1, title: "Personal Information", component: PersonalInfoStep },
  { id: 2, title: "Address", component: AddressStep },
  { id: 3, title: "Education", component: EducationStep },
  { id: 4, title: "Eligibility", component: EligibilityStep },
  { id: 5, title: "Documents & Essay", component: DocumentsStep },
  { id: 6, title: "Recommendations", component: null }, // TODO
  { id: 7, title: "Review & Submit", component: null }, // TODO
];

export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const stepNumber = parseInt(params.step as string, 10);

  const application = useQuery(api.applications.getMyApplication);
  const updateCurrentStep = useMutation(api.applications.updateCurrentStep);

  // Validate step number
  useEffect(() => {
    if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 7) {
      router.push("/apply/dashboard");
    }
  }, [stepNumber, router]);

  // Update current step when visiting
  useEffect(() => {
    if (application && stepNumber >= 1 && stepNumber <= 7) {
      updateCurrentStep({
        applicationId: application._id,
        step: stepNumber,
      });
    }
  }, [application, stepNumber, updateCurrentStep]);

  if (!application || isNaN(stepNumber) || stepNumber < 1 || stepNumber > 7) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  const step = steps[stepNumber - 1];
  const StepComponent = step.component;

  const prevStep = stepNumber > 1 ? stepNumber - 1 : null;
  const nextStep = stepNumber < 7 ? stepNumber + 1 : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/apply/dashboard" className="hover:text-amber-600">
            Dashboard
          </Link>
          <span>/</span>
          <span>Step {stepNumber} of 7</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{step.title}</h1>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex gap-1">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`h-2 flex-1 rounded-full ${
                s.id <= stepNumber
                  ? "bg-amber-600"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {StepComponent ? (
            <StepComponent
              application={application}
              onComplete={() => {
                if (nextStep) {
                  router.push(`/apply/step/${nextStep}`);
                }
              }}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">This step is coming soon.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <div>
          {prevStep ? (
            <Button variant="outline" asChild>
              <Link href={`/apply/step/${prevStep}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/apply/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {nextStep && StepComponent && (
            <Button variant="outline" asChild>
              <Link href={`/apply/step/${nextStep}`}>
                Skip for now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
