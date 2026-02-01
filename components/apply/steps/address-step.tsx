"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddressStepProps {
  application: Doc<"applications">;
  onComplete: () => void;
}

// Michigan ZIP code ranges
const MICHIGAN_ZIP_RANGES = [
  [48001, 49971], // Main Michigan range
];

const isMichiganZip = (zip: string): boolean => {
  const zipNum = parseInt(zip, 10);
  if (isNaN(zipNum)) return false;
  return MICHIGAN_ZIP_RANGES.some(([min, max]) => zipNum >= min && zipNum <= max);
};

export function AddressStep({ application, onComplete }: AddressStepProps) {
  const { toast } = useToast();
  const updateStep2 = useMutation(api.applications.updateStep2);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    streetAddress: application.streetAddress || "",
    city: application.city || "",
    state: application.state || "MI",
    zipCode: application.zipCode || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.streetAddress || !formData.city || !formData.zipCode) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Validate Michigan ZIP
      if (!isMichiganZip(formData.zipCode)) {
        toast({
          title: "Invalid ZIP Code",
          description: "You must be a Michigan resident to apply. Please enter a valid Michigan ZIP code (48001-49971).",
          variant: "destructive",
        });
        return;
      }

      await updateStep2({
        applicationId: application._id,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: "MI",
        zipCode: formData.zipCode,
      });

      toast({
        title: "Saved!",
        description: "Your address has been saved.",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Michigan Residents Only Alert */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Michigan Residents Only:</strong> This scholarship is only available to 
          permanent residents of the State of Michigan.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="streetAddress">
          Street Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="streetAddress"
          value={formData.streetAddress}
          onChange={(e) => handleChange("streetAddress", e.target.value)}
          placeholder="Enter your street address"
          required
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="City"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value="MI"
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500">Michigan only</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">
            ZIP Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="48001"
            maxLength={5}
            required
          />
          <p className="text-xs text-gray-500">Michigan ZIP: 48001-49971</p>
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
