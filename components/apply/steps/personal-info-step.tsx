"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowRight, Loader2, Upload, User, X, CheckCircle } from "lucide-react";
import Image from "next/image";

interface PersonalInfoStepProps {
  application: Doc<"applications">;
  onComplete: () => void;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const isValidImageType = (file: File): boolean => {
  // Check MIME type
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true;

  // Check extension as fallback
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
};

export function PersonalInfoStep({ application, onComplete }: PersonalInfoStepProps) {
  const { toast } = useToast();
  const updateStep1 = useMutation(api.applications.updateStep1);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [photoUploadStatus, setPhotoUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    firstName: application.firstName || "",
    lastName: application.lastName || "",
    phone: application.phone || "",
    dateOfBirth: application.dateOfBirth || "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const photoRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!isValidImageType(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "File too large",
        description: "Profile photo must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setProfilePhoto(file);
    setPhotoUploadStatus("idle");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhotoToStorage = async (file: File): Promise<string> => {
    // Step 1: Request upload URL from Convex
    const uploadUrl = await generateUploadUrl({ type: "profile_photo" });

    // Step 2: Upload file directly to Convex storage
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "image/jpeg",
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    // Step 3: Get storageId from response
    const result = await response.json();

    if (!result.storageId) {
      throw new Error("No storageId returned from upload");
    }

    return result.storageId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("[STEP1] handleSubmit triggered");
    e.preventDefault();
    setIsLoading(true);
    setPhotoUploadStatus("idle");

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.dateOfBirth) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Validate phone format (basic)
      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast({
          title: "Invalid phone number",
          description: "Please enter phone as (XXX) XXX-XXXX",
          variant: "destructive",
        });
        return;
      }

      let profilePhotoId: string | undefined;

      // Upload profile photo if provided
      if (profilePhoto) {
        console.log("[STEP1] Uploading photo...");
        setPhotoUploadStatus("uploading");
        try {
          profilePhotoId = await uploadPhotoToStorage(profilePhoto);
          console.log("[STEP1] Photo uploaded:", profilePhotoId);
          setPhotoUploadStatus("success");
        } catch (error) {
          console.error("[STEP1] Photo upload failed:", error);
          setPhotoUploadStatus("error");
          throw new Error("Failed to upload profile photo. Please try again.");
        }
      }

      console.log("[STEP1] Calling updateStep1 mutation...");

      await updateStep1({
        applicationId: application._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        profilePhotoId: profilePhotoId as Id<"_storage"> | undefined,
      });

      console.log("[STEP1] Mutation complete, calling onComplete");
      toast({
        title: "Saved!",
        description: "Your personal information has been saved.",
      });

      onComplete();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo Upload */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Profile Photo <span className="text-gray-500 font-normal">(Optional)</span></Label>
        <p className="text-sm text-gray-600">
          Upload a professional headshot. Accepted formats: JPG, PNG (max 5MB)
        </p>

        <div className="flex items-center gap-6">
          {/* Photo Preview or Placeholder */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Profile preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-gray-400" />
              )}
            </div>
            {photoUploadStatus === "uploading" && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
            {photoUploadStatus === "success" && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex flex-col gap-2">
            <input
              ref={photoRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              capture="user"
              onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
              className="hidden"
              aria-label="Profile photo upload"
            />

            {profilePhoto ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{profilePhoto.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setProfilePhoto(null);
                    setPhotoPreview(null);
                    setPhotoUploadStatus("idle");
                    if (photoRef.current) photoRef.current.value = "";
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => photoRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            placeholder="Enter your first name"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            placeholder="Enter your last name"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
            placeholder="(555) 555-5555"
            required
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">Format: (XXX) XXX-XXXX</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            required
            disabled={isLoading}
          />
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
