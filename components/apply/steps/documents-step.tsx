"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowRight, Loader2, Upload, File, X, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DocumentsStepProps {
  application: Doc<"applications">;
  onComplete: () => void;
}

const ESSAY_MIN_WORDS = 250;
const ESSAY_MAX_WORDS = 500;

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
};

const isValidFileType = (file: File): boolean => {
  // Check MIME type
  if (ALLOWED_FILE_TYPES.includes(file.type)) return true;

  // Check extension as fallback
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  return ALLOWED_EXTENSIONS.includes(ext);
};

export function DocumentsStep({ application, onComplete }: DocumentsStepProps) {
  const { toast } = useToast();
  const updateStep5 = useMutation(api.applications.updateStep5);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    transcript?: "uploading" | "success" | "error";
  }>({});
  const [essayText, setEssayText] = useState(application.essayText || "");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<{
    transcript?: File;
  }>({});

  const transcriptRef = useRef<HTMLInputElement>(null);

  const wordCount = countWords(essayText);
  const isEssayMinMet = wordCount >= ESSAY_MIN_WORDS;
  const isOverLimit = wordCount > ESSAY_MAX_WORDS;

  const handleFileChange = (type: "transcript", file: File | null) => {
    if (file) {
      // Validate file type
      if (!isValidFileType(file)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, JPG, or PNG file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Transcript must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setFiles((prev) => ({ ...prev, [type]: file }));
    }
  };

  const uploadFileToStorage = async (file: File, type: "transcript" | "essay"): Promise<string> => {
    // Step 1: Request upload URL from Convex
    const uploadUrl = await generateUploadUrl({ type });

    // Step 2: Upload file directly to Convex storage
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
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
    e.preventDefault();
    setIsLoading(true);
    setUploadStatus({});

    try {
      // Validate minimum essay words
      if (!isEssayMinMet) {
        toast({
          title: "Essay too short",
          description: `Your essay must be at least ${ESSAY_MIN_WORDS} words. Current: ${wordCount} words.`,
          variant: "destructive",
        });
        return;
      }

      // Warn if over limit (but don't block)
      if (isOverLimit) {
        toast({
          title: "Essay over limit",
          description: `Your essay exceeds ${ESSAY_MAX_WORDS} words. Consider trimming it before final submission.`,
          variant: "default",
        });
      }

      let transcriptFileId: string | undefined;

      // Upload transcript if provided
      if (files.transcript) {
        setUploadStatus({ transcript: "uploading" });
        try {
          transcriptFileId = await uploadFileToStorage(files.transcript, "transcript");
          setUploadStatus({ transcript: "success" });
        } catch (error) {
          setUploadStatus({ transcript: "error" });
          throw new Error("Failed to upload transcript. Please try again.");
        }
      }

      // Save to application
      await updateStep5({
        applicationId: application._id,
        essayText: essayText,
        essayWordCount: wordCount,
        transcriptFileId: transcriptFileId as Id<"_storage"> | undefined,
      });

      toast({
        title: "Saved!",
        description: "Your documents have been saved.",
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
      setUploadProgress(0);
    }
  };

  const getWordCountColor = () => {
    if (wordCount < ESSAY_MIN_WORDS) return "text-red-500";
    if (wordCount > ESSAY_MAX_WORDS) return "text-amber-600";
    return "text-green-600";
  };

  const getProgressValue = () => {
    if (wordCount < ESSAY_MIN_WORDS) {
      return (wordCount / ESSAY_MIN_WORDS) * 50;
    }
    if (wordCount > ESSAY_MAX_WORDS) {
      return 100;
    }
    return 50 + ((wordCount - ESSAY_MIN_WORDS) / (ESSAY_MAX_WORDS - ESSAY_MIN_WORDS)) * 50;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Transcript Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Transcript</h3>
        <p className="text-sm text-gray-600">
          Upload your official or unofficial transcript showing your current GPA.
          Accepted formats: PDF, JPG, PNG (max 10MB)
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors">
          <input
            ref={transcriptRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange("transcript", e.target.files?.[0] || null)}
            className="hidden"
          />

          {files.transcript ? (
            <div className="flex items-center justify-center gap-2">
              <File className="h-5 w-5 text-amber-600" />
              <span className="text-sm">{files.transcript.name}</span>
              {uploadStatus.transcript === "success" && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              {uploadStatus.transcript === "uploading" && (
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiles((prev) => ({ ...prev, transcript: undefined }));
                  setUploadStatus({});
                  if (transcriptRef.current) transcriptRef.current.value = "";
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
              onClick={() => transcriptRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Transcript
            </Button>
          )}
        </div>

        {uploadStatus.transcript === "uploading" && (
          <p className="text-sm text-amber-600 flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Uploading transcript...
          </p>
        )}
      </div>

      {/* Essay Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold text-gray-900">Essay</h3>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="font-medium text-amber-900">Essay Topic:</p>
          <p className="text-amber-800 italic">
            &ldquo;How Will Furthering My Studies Help Me Improve My Community?&rdquo;
          </p>
        </div>

        <p className="text-sm text-gray-600">
          Write a {ESSAY_MIN_WORDS}-{ESSAY_MAX_WORDS} word essay on the topic above.
          Be specific about your community and how your field of study relates to community impact.
        </p>

        <div className="space-y-2">
          <Textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="Start writing your essay here..."
            className="min-h-[300px]"
            disabled={isLoading}
          />

          {/* Word Count */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={getWordCountColor()}>
                {wordCount} / {ESSAY_MAX_WORDS} words
              </span>
              <span className="text-gray-500">
                {wordCount < ESSAY_MIN_WORDS
                  ? `${ESSAY_MIN_WORDS - wordCount} more needed`
                  : wordCount > ESSAY_MAX_WORDS
                    ? `${wordCount - ESSAY_MAX_WORDS} over limit`
                    : "Valid range"}
              </span>
            </div>
            <Progress
              value={getProgressValue()}
              className={`h-2 ${wordCount > ESSAY_MAX_WORDS ? "bg-red-200" : ""}`}
            />
          </div>
        </div>

        {/* Writing Tips */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <p className="font-medium text-gray-900 mb-2">Tips for a strong essay:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Be specific about your community and its needs</li>
            <li>Explain how your field of study relates to community impact</li>
            <li>Share personal experiences that shaped your perspective</li>
            <li>Describe concrete actions you plan to take</li>
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700"
          disabled={isLoading || !isEssayMinMet}
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
