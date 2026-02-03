import { v } from "convex/values";
import { query, mutation, action, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";

// ============================================
// ADMIN DASHBOARD QUERIES
// ============================================

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("Email not available");
    }

    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Get all applications
    const applications = await ctx.db.query("applications").collect();

    // Get all users
    const users = await ctx.db.query("user").collect();

    // Get all recommendations
    const recommendations = await ctx.db.query("recommendations").collect();

    // Calculate metrics
    const totalAccounts = users.length;
    const submittedApplications = applications.filter(
      (a) => a.status === "submitted" || a.status === "under_review" || a.status === "finalist" || a.status === "selected" || a.status === "not_selected"
    ).length;
    const draftApplications = applications.filter(
      (a) => a.status === "draft" || a.status === "in_progress"
    ).length;
    const pendingRecommendations = recommendations.filter(
      (r) => r.status !== "submitted"
    ).length;

    // Recent applications (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentApplications = applications
      .filter((a) => a.createdAt > thirtyDaysAgo)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    return {
      totalAccounts,
      totalApplications: applications.length,
      submittedApplications,
      draftApplications,
      pendingRecommendations,
      recentApplications: recentApplications.map((a) => ({
        _id: a._id,
        firstName: a.firstName,
        lastName: a.lastName,
        status: a.status,
        createdAt: a.createdAt,
        submittedAt: a.submittedAt,
      })),
    };
  },
});

export const getAllApplications = query({
  args: {
    status: v.optional(v.union(
      v.literal("all"),
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("pending_recommendations"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("finalist"),
      v.literal("selected"),
      v.literal("not_selected"),
      v.literal("withdrawn")
    )),
    search: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("Email not available");
    }

    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const limit = args.limit ?? 50;
    let applications;

    const statusFilter = args.status;
    if (statusFilter && statusFilter !== "all") {
      applications = await ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", statusFilter))
        .collect();
    } else {
      applications = await ctx.db.query("applications").collect();
    }

    // Apply search filter
    if (args.search && args.search.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      applications = applications.filter(
        (a) =>
          (a.firstName?.toLowerCase().includes(searchLower)) ||
          (a.lastName?.toLowerCase().includes(searchLower)) ||
          (a.city?.toLowerCase().includes(searchLower))
      );
    }

    // Sort by submitted date (most recent first), then by created date
    applications.sort((a, b) => {
      if (a.submittedAt && b.submittedAt) {
        return b.submittedAt - a.submittedAt;
      }
      if (a.submittedAt) return -1;
      if (b.submittedAt) return 1;
      return b.createdAt - a.createdAt;
    });

    // Get recommendations count for each application
    const applicationsWithRecommendations = await Promise.all(
      applications.map(async (app) => {
        const recommendations = await ctx.db
          .query("recommendations")
          .withIndex("by_application", (q) => q.eq("applicationId", app._id))
          .collect();

        const submittedCount = recommendations.filter(
          (r) => r.status === "submitted"
        ).length;

        return {
          ...app,
          recommendationsCount: recommendations.length,
          recommendationsSubmitted: submittedCount,
        };
      })
    );

    return {
      applications: applicationsWithRecommendations,
      totalCount: applicationsWithRecommendations.length,
    };
  },
});

export const getApplicationDetails = query({
  args: { id: v.id("applications") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("Email not available");
    }

    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const application = await ctx.db.get(id);
    if (!application) {
      throw new Error("Application not found");
    }

    // Get recommendations
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_application", (q) => q.eq("applicationId", id))
      .collect();

    // Get evaluations
    const evaluations = await ctx.db
      .query("evaluations")
      .withIndex("by_application", (q) => q.eq("applicationId", id))
      .collect();

    // Get evaluator details
    const evaluationsWithDetails = await Promise.all(
      evaluations.map(async (eval_) => {
        const evaluator = await ctx.db.get(eval_.evaluatorId);
        return {
          ...eval_,
          evaluatorName: evaluator?.name || evaluator?.email || "Unknown",
        };
      })
    );

    // Get activity log
    const activityLog = await ctx.db
      .query("activityLog")
      .withIndex("by_application", (q) => q.eq("applicationId", id))
      .order("desc")
      .take(20);

    return {
      application,
      recommendations,
      evaluations: evaluationsWithDetails,
      activityLog,
    };
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("draft"),
      v.literal("in_progress"),
      v.literal("pending_recommendations"),
      v.literal("submitted"),
      v.literal("under_review"),
      v.literal("finalist"),
      v.literal("selected"),
      v.literal("not_selected"),
      v.literal("withdrawn")
    ),
  },
  handler: async (ctx, { applicationId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("Email not available");
    }

    const user = await ctx.db
      .query("user")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(applicationId, {
      status,
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activityLog", {
      applicationId,
      userId: user._id,
      action: "status_changed",
      details: `Status changed to ${status}`,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================
// CSV EXPORT
// ============================================

interface ApplicationWithDetails {
  _id: string;
  _creationTime: number;
  userId: string;
  status: string;
  currentStep: number;
  completedSteps: number[];
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  highSchoolName?: string;
  gpa?: number;
  actScore?: number;
  satScore?: number;
  collegeName?: string;
  yearInCollege?: string;
  major?: string;
  submittedAt?: number;
  aiSummary?: string;
  recommendationCount: number;
}

export const getApplicationsForExport = internalQuery({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args): Promise<ApplicationWithDetails[]> => {
    let apps = await ctx.db.query("applications").collect();

    if (args.status && args.status !== "all") {
      apps = apps.filter(a => a.status === args.status);
    }

    // Get user data and recommendations for each application
    const applicationsWithDetails: ApplicationWithDetails[] = await Promise.all(
      apps.map(async (app) => {
        const user = await ctx.db.get(app.userId);
        const recommendations = await ctx.db
          .query("recommendations")
          .withIndex("by_application", q => q.eq("applicationId", app._id))
          .collect();

        return {
          ...app,
          email: user?.email || "",
          recommendationCount: recommendations.filter(r => r.status === "submitted").length,
        };
      })
    );

    return applicationsWithDetails;
  },
});

interface ExportResult {
  csv: string;
  filename: string;
}

export const exportApplicationsToCSV = action({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args): Promise<ExportResult> => {
    // Verify admin authorization
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.getByEmail, { email: identity.email });
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Get all applications with user data
    const applications: ApplicationWithDetails[] = await ctx.runQuery(internal.admin.getApplicationsForExport, {
      status: args.status
    });

    // CSV Headers
    const headers = [
      "ID", "First Name", "Last Name", "Email", "City", "State", "ZIP",
      "High School", "GPA", "ACT", "SAT", "College", "Year", "Major",
      "Status", "Submitted At", "Recommendations Received", "AI Summary"
    ];

    // CSV Rows
    const rows: string[][] = applications.map((app: ApplicationWithDetails) => [
      app._id,
      app.firstName || "",
      app.lastName || "",
      app.email || "",
      app.city || "",
      app.state || "",
      app.zipCode || "",
      app.highSchoolName || "",
      app.gpa?.toString() || "",
      app.actScore?.toString() || "",
      app.satScore?.toString() || "",
      app.collegeName || "",
      app.yearInCollege || "",
      app.major || "",
      app.status,
      app.submittedAt ? new Date(app.submittedAt).toISOString() : "",
      app.recommendationCount?.toString() || "0",
      (app.aiSummary || "").replace(/"/g, '""').replace(/\n/g, " ")
    ]);

    // Create CSV content with proper escaping
    const csvContent: string = [
      headers.join(","),
      ...rows.map((row: string[]) =>
        row.map((cell: string) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escaped = String(cell).replace(/"/g, '""');
          if (escaped.includes(",") || escaped.includes('"') || escaped.includes("\n")) {
            return `"${escaped}"`;
          }
          return escaped;
        }).join(",")
      )
    ].join("\n");

    return {
      csv: csvContent,
      filename: `scholarship-applications-${new Date().toISOString().split('T')[0]}.csv`
    };
  },
});
