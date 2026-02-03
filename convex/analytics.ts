import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDashboardMetrics = query({
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get all applications
    const applications = await ctx.db.query("applications").collect();
    const users = await ctx.db.query("user").collect();
    const evaluations = await ctx.db.query("evaluations").collect();
    const recommendations = await ctx.db.query("recommendations").collect();

    // Calculate metrics
    const totalApplications = applications.length;
    const submittedApplications = applications.filter(a =>
      a.status === "submitted" || a.status === "under_review" ||
      a.status === "finalist" || a.status === "selected"
    ).length;

    const draftApplications = applications.filter(a =>
      a.status === "draft" || a.status === "in_progress"
    ).length;

    const withdrawnApplications = applications.filter(a =>
      a.status === "withdrawn"
    ).length;

    // Applications over time (last 30 days)
    const applicationsByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      applicationsByDay[key] = 0;
    }

    applications.forEach(app => {
      if (app.createdAt > thirtyDaysAgo) {
        const date = new Date(app.createdAt).toISOString().split('T')[0];
        if (applicationsByDay[date] !== undefined) {
          applicationsByDay[date]++;
        }
      }
    });

    // Completion rate (started vs submitted)
    const completionRate = totalApplications > 0
      ? Math.round((submittedApplications / totalApplications) * 100)
      : 0;

    // Average time to submit (for submitted applications)
    const submittedWithTime = applications.filter(a =>
      a.submittedAt && a.createdAt
    );

    const avgTimeToSubmit = submittedWithTime.length > 0
      ? submittedWithTime.reduce((sum, a) =>
        sum + (a.submittedAt! - a.createdAt), 0
      ) / submittedWithTime.length
      : 0;

    // Step completion rates
    const stepCompletionRates = [1, 2, 3, 4, 5, 6, 7].map(step => {
      const completed = applications.filter(a =>
        a.completedSteps?.includes(step)
      ).length;
      return {
        step,
        name: getStepName(step),
        rate: totalApplications > 0
          ? Math.round((completed / totalApplications) * 100)
          : 0,
        completed,
        total: totalApplications
      };
    });

    // Top cities
    const cityCounts: Record<string, number> = {};
    applications.forEach(app => {
      if (app.city) {
        cityCounts[app.city] = (cityCounts[app.city] || 0) + 1;
      }
    });

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));

    // College distribution
    const collegeCounts: Record<string, number> = {};
    applications.forEach(app => {
      if (app.collegeName) {
        collegeCounts[app.collegeName] = (collegeCounts[app.collegeName] || 0) + 1;
      }
    });

    const topColleges = Object.entries(collegeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([college, count]) => ({ college, count }));

    // GPA distribution
    const gpaRanges: Record<string, number> = {
      "4.0+": 0,
      "3.5-3.99": 0,
      "3.0-3.49": 0,
      "Below 3.0": 0
    };

    applications.forEach(app => {
      if (app.gpa) {
        if (app.gpa >= 4.0) gpaRanges["4.0+"]++;
        else if (app.gpa >= 3.5) gpaRanges["3.5-3.99"]++;
        else if (app.gpa >= 3.0) gpaRanges["3.0-3.49"]++;
        else gpaRanges["Below 3.0"]++;
      }
    });

    // Recommendation statistics
    const recommendationStats = {
      total: recommendations.length,
      pending: recommendations.filter(r => r.status === "pending").length,
      submitted: recommendations.filter(r => r.status === "submitted").length,
      viewed: recommendations.filter(r => r.status === "viewed").length,
    };

    // Committee evaluation progress
    const committeeMembers = users.filter(u =>
      u.role === "committee" || u.role === "admin"
    );

    const evaluationProgress = committeeMembers.map(member => {
      const memberEvals = evaluations.filter(e =>
        e.evaluatorId === member._id
      ).length;
      return {
        id: member._id,
        name: member.name || member.email,
        completed: memberEvals,
        total: submittedApplications,
        percentage: submittedApplications > 0
          ? Math.round((memberEvals / submittedApplications) * 100)
          : 0
      };
    }).sort((a, b) => b.completed - a.completed);

    // Status breakdown
    const statusBreakdown = {
      draft: applications.filter(a => a.status === "draft").length,
      in_progress: applications.filter(a => a.status === "in_progress").length,
      pending_recommendations: applications.filter(a => a.status === "pending_recommendations").length,
      submitted: applications.filter(a => a.status === "submitted").length,
      under_review: applications.filter(a => a.status === "under_review").length,
      finalist: applications.filter(a => a.status === "finalist").length,
      selected: applications.filter(a => a.status === "selected").length,
      not_selected: applications.filter(a => a.status === "not_selected").length,
      withdrawn: applications.filter(a => a.status === "withdrawn").length,
    };

    return {
      summary: {
        totalApplications,
        submittedApplications,
        draftApplications,
        withdrawnApplications,
        completionRate,
        avgTimeToSubmitDays: Math.round(avgTimeToSubmit / (1000 * 60 * 60 * 24) * 10) / 10,
        totalEvaluations: evaluations.length,
        totalRecommendations: recommendations.length,
      },
      applicationsByDay: Object.entries(applicationsByDay).map(([date, count]) => ({
        date,
        count
      })),
      stepCompletionRates,
      topCities,
      topColleges,
      gpaDistribution: Object.entries(gpaRanges).map(([range, count]) => ({
        range,
        count
      })),
      recommendationStats,
      evaluationProgress,
      statusBreakdown,
      userStats: {
        totalUsers: users.length,
        applicants: users.filter(u => u.role === "applicant").length,
        committee: users.filter(u => u.role === "committee").length,
        admins: users.filter(u => u.role === "admin").length,
      }
    };
  }
});

export const getRealTimeStats = query({
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const applications = await ctx.db.query("applications").collect();
    const recommendations = await ctx.db.query("recommendations").collect();

    return {
      applicationsToday: applications.filter(a =>
        a.createdAt > oneDayAgo
      ).length,
      submissionsToday: applications.filter(a =>
        a.submittedAt && a.submittedAt > oneDayAgo
      ).length,
      pendingRecommendations: recommendations.filter(r =>
        r.status === "pending"
      ).length,
      pendingSubmissions: applications.filter(a =>
        a.status === "draft" || a.status === "in_progress"
      ).length,
    };
  }
});

// Helper function to get step names
function getStepName(step: number): string {
  const stepNames: Record<number, string> = {
    1: "Personal Information",
    2: "Address",
    3: "Education",
    4: "Eligibility",
    5: "Documents & Essay",
    6: "Recommendations",
    7: "Review & Submit",
  };
  return stepNames[step] || `Step ${step}`;
}
