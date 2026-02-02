import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { api } from "./_generated/api";

/**
 * AI Module for generating application summaries using Groq
 */

export const generateSummary = internalAction({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, { applicationId }) => {
    // Get application details
    const application = await ctx.runQuery(internal.applications.getByIdInternal, {
      id: applicationId,
    });

    if (!application) {
      throw new Error("Application not found");
    }

    // Get recommendations for this application
    const recommendations = await ctx.runQuery(internal.recommendations.getByApplicationInternal, {
      applicationId,
    });

    // Check if API key is configured
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === "your-groq-api-key") {
      console.log("GROQ_API_KEY not configured, skipping AI summary generation");
      return { success: false, reason: "API key not configured" };
    }

    try {
      // Build prompt for Groq
      const prompt = buildApplicationPrompt(application, recommendations);

      // Call Groq API (OpenAI-compatible)
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that analyzes scholarship applications and provides concise summaries and highlights.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${error}`);
      }

      const result = await response.json();
      const aiContent = result.choices[0]?.message?.content || "";

      // Parse summary and highlights
      const { summary, highlights } = parseAIResponse(aiContent);

      // Update application with AI summary
      await ctx.runMutation(internal.applications.updateAISummary, {
        id: applicationId,
        summary,
        highlights,
      });

      return { success: true, summary, highlights };
    } catch (error) {
      console.error("Error generating AI summary:", error);
      return { success: false, reason: String(error) };
    }
  },
});

/**
 * Build the prompt for Groq based on application data
 */
function buildApplicationPrompt(application: any, recommendations: any[]): string {
  const sections = [];

  sections.push("Please analyze this scholarship application and provide a brief summary and 3-5 key highlights.\n");
  sections.push("## Applicant Information");
  sections.push(`Name: ${application.firstName || ""} ${application.lastName || ""}`);
  sections.push(`City: ${application.city || "N/A"}, Michigan`);
  sections.push(`High School: ${application.highSchoolName || "N/A"}`);
  sections.push(`College: ${application.collegeName || "N/A"}, ${application.yearInCollege || "N/A"}`);
  sections.push(`Major: ${application.major || "N/A"}`);
  sections.push(`GPA: ${application.gpa || "N/A"}`);

  if (application.actScore) {
    sections.push(`ACT: ${application.actScore}`);
  }
  if (application.satScore) {
    sections.push(`SAT: ${application.satScore}`);
  }

  sections.push("\n## Essay");
  if (application.essayText) {
    sections.push(application.essayText.substring(0, 2000) + (application.essayText.length > 2000 ? "..." : ""));
  } else {
    sections.push("Essay text not available for AI analysis");
  }

  if (recommendations && recommendations.length > 0) {
    sections.push("\n## Recommendations");
    recommendations.forEach((rec, index) => {
      if (rec.letterText) {
        sections.push(`\nRecommendation ${index + 1} from ${rec.recommenderName || "Anonymous"}:`);
        sections.push(rec.letterText.substring(0, 1000) + (rec.letterText.length > 1000 ? "..." : ""));
      }
    });
  }

  sections.push("\n---\n");
  sections.push("Please provide your response in this exact format:");
  sections.push("SUMMARY: [2-3 sentence summary of the candidate's strengths and fit for the scholarship]");
  sections.push("HIGHLIGHTS:");
  sections.push("- [Key highlight 1]");
  sections.push("- [Key highlight 2]");
  sections.push("- [Key highlight 3]");
  sections.push("- [Key highlight 4 - optional]");
  sections.push("- [Key highlight 5 - optional]");

  return sections.join("\n");
}

/**
 * Parse Groq's response into structured summary and highlights
 */
function parseAIResponse(content: string): { summary: string; highlights: string[] } {
  const lines = content.split("\n");
  let summary = "";
  const highlights: string[] = [];
  let inHighlights = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("SUMMARY:")) {
      summary = trimmed.replace("SUMMARY:", "").trim();
    } else if (trimmed === "HIGHLIGHTS:") {
      inHighlights = true;
    } else if (inHighlights && trimmed.startsWith("- ")) {
      highlights.push(trimmed.substring(2).trim());
    } else if (inHighlights && trimmed.length > 0 && !trimmed.startsWith("-")) {
      // Continue summary if it spans multiple lines
      if (summary && !inHighlights) {
        summary += " " + trimmed;
      }
    }
  }

  return {
    summary: summary || "AI summary not available",
    highlights: highlights.length > 0 ? highlights : ["No highlights generated"],
  };
}
