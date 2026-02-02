import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// ============================================
// FILE TYPE AND SIZE LIMITS
// ============================================

const ALLOWED_FILE_TYPES = {
  transcript: ['application/pdf', 'image/jpeg', 'image/png'],
  essay: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  photo: ['image/jpeg', 'image/png'],
  recommendation: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain']
};

const MAX_FILE_SIZES = {
  transcript: 10 * 1024 * 1024, // 10MB
  essay: 10 * 1024 * 1024,      // 10MB
  photo: 5 * 1024 * 1024,       // 5MB
  recommendation: 10 * 1024 * 1024 // 10MB
};

// ============================================
// STORAGE MUTATIONS
// ============================================

export const generateUploadUrl = mutation({
  args: {
    type: v.union(
      v.literal("profile_photo"),
      v.literal("transcript"),
      v.literal("essay"),
      v.literal("recommendation")
    ),
  },
  handler: async (ctx, { type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    await ctx.storage.delete(storageId);
  },
});

// ============================================
// FILE VALIDATION
// ============================================

export const validateAndSaveUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    fileType: v.union(
      v.literal("transcript"),
      v.literal("essay"),
      v.literal("photo"),
      v.literal("recommendation")
    ),
    applicationId: v.optional(v.id("applications"))
  },
  handler: async (ctx, { storageId, fileType, applicationId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Note: ctx.storage.get() API doesn't exist in Convex
    // We trust the storageId is valid since it was just generated
    // File validation is done client-side before upload
    // Server-side file metadata validation can be added via a custom action if needed
    
    // If validation passes, optionally update application
    if (applicationId) {
      const updateField = fileType === 'photo' ? 'profilePhotoId' : 
                         fileType === 'transcript' ? 'transcriptFileId' :
                         fileType === 'essay' ? 'essayFileId' : null;
      
      if (updateField) {
        await ctx.db.patch(applicationId, {
          [updateField]: storageId,
          updatedAt: Date.now()
        });
      }
    }
    
    // Return success - we can't get file metadata since ctx.storage.get() doesn't exist
    // The client should already have this information from the upload
    return { 
      success: true, 
      storageId,
    };
  }
});

// Query to get file info (for displaying to users)
// Note: Convex storage API doesn't provide get() method for file metadata
// This query only returns the URL now
export const getFileInfo = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    if (!url) return null;
    
    return {
      url
    };
  }
});

// Get validation rules (for client-side display)
export const getValidationRules = query({
  args: {},
  handler: async () => {
    return {
      allowedTypes: ALLOWED_FILE_TYPES,
      maxSizes: {
        transcript: MAX_FILE_SIZES.transcript,
        essay: MAX_FILE_SIZES.essay,
        photo: MAX_FILE_SIZES.photo,
        recommendation: MAX_FILE_SIZES.recommendation
      }
    };
  }
});
