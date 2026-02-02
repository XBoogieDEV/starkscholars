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
    
    // Get file metadata from Convex storage
    const file = await ctx.storage.get(storageId);
    if (!file) throw new Error("File not found");
    
    // Validate file type
    const allowedTypes = ALLOWED_FILE_TYPES[fileType];
    if (!allowedTypes.includes(file.contentType)) {
      // Delete invalid upload
      await ctx.storage.delete(storageId);
      throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }
    
    // Validate file size
    const maxSize = MAX_FILE_SIZES[fileType];
    if (file.size > maxSize) {
      // Delete oversized upload
      await ctx.storage.delete(storageId);
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }
    
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
    
    return { 
      success: true, 
      storageId,
      contentType: file.contentType,
      size: file.size
    };
  }
});

// Query to get file info (for displaying to users)
export const getFileInfo = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const file = await ctx.storage.get(storageId);
    if (!file) return null;
    
    return {
      contentType: file.contentType,
      size: file.size,
      url: await ctx.storage.getUrl(storageId)
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
