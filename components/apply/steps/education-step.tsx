"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2 } from "lucide-react";

interface EducationStepProps {
  application: Doc<"applications">;
  onComplete: () => void;
}

const yearOptions = [
  { value: "freshman", label: "Freshman" },
  { value: "sophomore", label: "Sophomore" },
  { value: "junior", label: "Junior" },
  { value: "senior", label: "Senior" },
];

export function EducationStep({ application, onComplete }: EducationStepProps) {
  const { toast } = useToast();
  const updateStep3 = useMutation(api.applications.updateStep3);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // High School
    highSchoolName: application.highSchoolName || "",
    highSchoolCity: application.highSchoolCity || "",
    highSchoolState: application.highSchoolState || "MI",
    graduationDate: application.graduationDate || "",
    gpa: application.gpa || "",
    actScore: application.actScore?.toString() || "",
    satScore: application.satScore?.toString() || "",
    // College
    collegeName: application.collegeName || "",
    collegeCity: application.collegeCity || "",
    collegeState: application.collegeState || "",
    yearInCollege: application.yearInCollege || "",
    major: application.major || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        "highSchoolName",
        "highSchoolCity",
        "graduationDate",
        "gpa",
        "collegeName",
        "collegeCity",
        "collegeState",
        "yearInCollege",
      ];
      
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          toast({
            title: "Missing fields",
            description: "Please fill in all required fields.",
            variant: "destructive",
          });
          return;
        }
      }

      // Validate GPA (3.0 minimum)
      const gpa = parseFloat(String(formData.gpa));
      if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
        toast({
          title: "Invalid GPA",
          description: "Please enter a valid GPA between 0.0 and 4.0.",
          variant: "destructive",
        });
        return;
      }

      if (gpa < 3.0) {
        toast({
          title: "GPA Requirement",
          description: "You need a minimum GPA of 3.0 to qualify for this scholarship.",
          variant: "destructive",
        });
        return;
      }

      await updateStep3({
        applicationId: application._id,
        highSchoolName: formData.highSchoolName,
        highSchoolCity: formData.highSchoolCity,
        highSchoolState: formData.highSchoolState,
        graduationDate: formData.graduationDate,
        gpa,
        actScore: formData.actScore ? parseInt(formData.actScore, 10) : undefined,
        satScore: formData.satScore ? parseInt(formData.satScore, 10) : undefined,
        collegeName: formData.collegeName,
        collegeCity: formData.collegeCity,
        collegeState: formData.collegeState,
        yearInCollege: formData.yearInCollege as "freshman" | "sophomore" | "junior" | "senior",
        major: formData.major || undefined,
      });

      toast({
        title: "Saved!",
        description: "Your education information has been saved.",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* High School Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">High School</h3>
        
        <div className="space-y-2">
          <Label htmlFor="highSchoolName">
            High School Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="highSchoolName"
            value={formData.highSchoolName}
            onChange={(e) => handleChange("highSchoolName", e.target.value)}
            placeholder="Enter your high school name"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="highSchoolCity">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="highSchoolCity"
              value={formData.highSchoolCity}
              onChange={(e) => handleChange("highSchoolCity", e.target.value)}
              placeholder="City"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="highSchoolState">State</Label>
            <Input
              id="highSchoolState"
              value="MI"
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="graduationDate">
            Graduation Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="graduationDate"
            type="month"
            value={formData.graduationDate}
            onChange={(e) => handleChange("graduationDate", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Academic Performance */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold text-gray-900">Academic Performance</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="gpa">
              GPA <span className="text-red-500">*</span>
            </Label>
            <Input
              id="gpa"
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              value={formData.gpa}
              onChange={(e) => handleChange("gpa", e.target.value)}
              placeholder="3.50"
              required
            />
            <p className="text-xs text-gray-500">Minimum 3.0 required</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actScore">ACT Score (Optional)</Label>
            <Input
              id="actScore"
              type="number"
              min="1"
              max="36"
              value={formData.actScore}
              onChange={(e) => handleChange("actScore", e.target.value)}
              placeholder="28"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="satScore">SAT Score (Optional)</Label>
            <Input
              id="satScore"
              type="number"
              min="400"
              max="1600"
              value={formData.satScore}
              onChange={(e) => handleChange("satScore", e.target.value)}
              placeholder="1320"
            />
          </div>
        </div>
      </div>

      {/* College Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold text-gray-900">College/University</h3>
        
        <div className="space-y-2">
          <Label htmlFor="collegeName">
            College Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="collegeName"
            value={formData.collegeName}
            onChange={(e) => handleChange("collegeName", e.target.value)}
            placeholder="Enter your college name"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="collegeCity">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="collegeCity"
              value={formData.collegeCity}
              onChange={(e) => handleChange("collegeCity", e.target.value)}
              placeholder="City"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collegeState">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="collegeState"
              value={formData.collegeState}
              onChange={(e) => handleChange("collegeState", e.target.value)}
              placeholder="State"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="yearInCollege">
              Year in College <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.yearInCollege}
              onValueChange={(value) => handleChange("yearInCollege", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Intended Major</Label>
            <Input
              id="major"
              value={formData.major}
              onChange={(e) => handleChange("major", e.target.value)}
              placeholder="e.g., Computer Science"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700"
          disabled={isLoading}
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
