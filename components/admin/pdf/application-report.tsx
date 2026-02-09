import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

const NAVY = "#0F172A";
const GOLD = "#D4AF37";
const BODY = "#334155";
const MUTED = "#64748B";
const LIGHT_BG = "#F8FAFC";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: BODY },
  header: { marginBottom: 20, borderBottom: `2px solid ${GOLD}`, paddingBottom: 12 },
  title: { fontSize: 22, color: NAVY, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 12, color: GOLD, letterSpacing: 1 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 8, borderBottom: `1px solid ${GOLD}`, paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 140, color: MUTED, fontSize: 9 },
  value: { flex: 1, fontSize: 10 },
  infoBox: { backgroundColor: LIGHT_BG, padding: 10, borderRadius: 4, marginBottom: 8 },
  badge: { backgroundColor: GOLD, color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: 8, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${GOLD}`, paddingTop: 8 },
  footerText: { fontSize: 8, color: MUTED },
  essayText: { fontSize: 9, lineHeight: 1.6, color: BODY },
  evaluationRow: { flexDirection: "row", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #E2E8F0" },
});

interface ApplicationData {
  application: {
    _id: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    highSchoolName?: string;
    highSchoolCity?: string;
    highSchoolState?: string;
    graduationDate?: string;
    gpa?: number;
    actScore?: number;
    satScore?: number;
    collegeName?: string;
    collegeCity?: string;
    collegeState?: string;
    yearInCollege?: string;
    major?: string;
    isFirstTimeApplying?: boolean;
    isPreviousRecipient?: boolean;
    isFullTimeStudent?: boolean;
    isMichiganResident?: boolean;
    essayText?: string;
    essayWordCount?: number;
    status: string;
    aiSummary?: string;
    aiHighlights?: string[];
    createdAt: number;
    submittedAt?: number;
  };
  recommendations: Array<{
    recommenderName?: string;
    recommenderEmail: string;
    recommenderType: string;
    status: string;
  }>;
  evaluations: Array<{
    evaluatorName?: string;
    rating: string;
    notes?: string;
  }>;
}

function InfoRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Not provided"}</Text>
    </View>
  );
}

const ratingLabels: Record<string, string> = {
  strong_yes: "Strong Yes (5)",
  yes: "Yes (4)",
  maybe: "Maybe (3)",
  no: "No (2)",
  strong_no: "Strong No (1)",
};

export function ApplicationReport({ data }: { data: ApplicationData }) {
  const { application: app, recommendations, evaluations } = data;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Stark Scholars</Text>
          <Text style={styles.subtitle}>APPLICATION REPORT</Text>
        </View>

        {/* Applicant Name + Status */}
        <View style={[styles.section, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: NAVY }}>
            {app.firstName} {app.lastName}
          </Text>
          <Text style={styles.badge}>{app.status.replace("_", " ").toUpperCase()}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow label="Full Name" value={`${app.firstName || ""} ${app.lastName || ""}`} />
          <InfoRow label="Phone" value={app.phone} />
          <InfoRow label="Date of Birth" value={app.dateOfBirth} />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <InfoRow label="Street" value={app.streetAddress} />
          <InfoRow label="City" value={app.city} />
          <InfoRow label="State" value={app.state} />
          <InfoRow label="ZIP" value={app.zipCode} />
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.infoBox}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>High School</Text>
            <InfoRow label="School" value={app.highSchoolName} />
            <InfoRow label="City / State" value={`${app.highSchoolCity || ""}, ${app.highSchoolState || ""}`} />
            <InfoRow label="Graduation Date" value={app.graduationDate} />
          </View>
          <View style={styles.infoBox}>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>College/University</Text>
            <InfoRow label="College" value={app.collegeName} />
            <InfoRow label="City / State" value={`${app.collegeCity || ""}, ${app.collegeState || ""}`} />
            <InfoRow label="Year" value={app.yearInCollege} />
            <InfoRow label="Major" value={app.major} />
            <InfoRow label="GPA" value={app.gpa?.toFixed(2)} />
            {app.actScore && <InfoRow label="ACT" value={app.actScore.toString()} />}
            {app.satScore && <InfoRow label="SAT" value={app.satScore.toString()} />}
          </View>
        </View>

        {/* Eligibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility</Text>
          <InfoRow label="First Time Applying" value={app.isFirstTimeApplying === undefined ? undefined : app.isFirstTimeApplying ? "Yes" : "No"} />
          <InfoRow label="Previous Recipient" value={app.isPreviousRecipient === undefined ? undefined : app.isPreviousRecipient ? "Yes" : "No"} />
          <InfoRow label="Full-Time Student" value={app.isFullTimeStudent === undefined ? undefined : app.isFullTimeStudent ? "Yes" : "No"} />
          <InfoRow label="Michigan Resident" value={app.isMichiganResident === undefined ? undefined : app.isMichiganResident ? "Yes" : "No"} />
        </View>

        {/* Essay Excerpt */}
        {app.essayText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Essay Excerpt ({app.essayWordCount || 0} words)</Text>
            <Text style={styles.essayText}>
              {app.essayText.substring(0, 500)}{app.essayText.length > 500 ? "..." : ""}
            </Text>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations ({recommendations.length})</Text>
          {recommendations.map((rec, i) => (
            <View key={i} style={[styles.row, { marginBottom: 6 }]}>
              <Text style={[styles.value, { flex: 2 }]}>{rec.recommenderName || rec.recommenderEmail}</Text>
              <Text style={[styles.value, { flex: 1 }]}>{rec.recommenderType}</Text>
              <Text style={[styles.value, { flex: 1, textAlign: "right" }]}>{rec.status === "submitted" ? "Received" : "Pending"}</Text>
            </View>
          ))}
        </View>

        {/* Evaluations */}
        {evaluations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Committee Evaluations ({evaluations.length})</Text>
            {evaluations.map((ev, i) => (
              <View key={i} style={styles.evaluationRow}>
                <Text style={{ flex: 1 }}>{(ev as any).evaluatorName || "Evaluator"}</Text>
                <Text style={{ flex: 1, textAlign: "right" }}>{ratingLabels[ev.rating] || ev.rating}</Text>
              </View>
            ))}
          </View>
        )}

        {/* AI Summary */}
        {app.aiSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Summary</Text>
            <Text style={styles.essayText}>{app.aiSummary}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.footerText}>CONFIDENTIAL - Stark Scholars</Text>
        </View>
      </Page>
    </Document>
  );
}
