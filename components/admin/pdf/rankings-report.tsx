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

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: BODY },
  header: { marginBottom: 20, borderBottom: `2px solid ${GOLD}`, paddingBottom: 12 },
  title: { fontSize: 22, color: NAVY, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 12, color: GOLD, letterSpacing: 1 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 4 },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY },
  statLabel: { fontSize: 8, color: MUTED, marginTop: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: NAVY, padding: 8, borderRadius: 4 },
  tableHeaderText: { color: "#fff", fontSize: 9, fontFamily: "Helvetica-Bold" },
  tableRow: { flexDirection: "row", padding: 8, borderBottom: "1px solid #E2E8F0" },
  tableRowAlt: { flexDirection: "row", padding: 8, borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" },
  cell: { fontSize: 9 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTop: `1px solid ${GOLD}`, paddingTop: 8 },
  footerText: { fontSize: 8, color: MUTED },
});

interface RankingData {
  application: {
    _id: string;
    firstName?: string;
    lastName?: string;
    gpa?: number;
    collegeName?: string;
    major?: string;
    status: string;
  };
  averageRating: number;
  evaluationCount: number;
}

interface RankingsReportProps {
  rankings: RankingData[];
  totalApplications: number;
  totalEvaluations: number;
  committeeCount: number;
}

export function RankingsReport({ rankings, totalApplications, totalEvaluations, committeeCount }: RankingsReportProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Stark Scholars</Text>
          <Text style={styles.subtitle}>CANDIDATE RANKINGS REPORT</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalApplications}</Text>
            <Text style={styles.statLabel}>CANDIDATES</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalEvaluations}</Text>
            <Text style={styles.statLabel}>EVALUATIONS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{committeeCount}</Text>
            <Text style={styles.statLabel}>COMMITTEE MEMBERS</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { width: 35 }]}>Rank</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Name</Text>
          <Text style={[styles.tableHeaderText, { width: 40 }]}>GPA</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>College</Text>
          <Text style={[styles.tableHeaderText, { width: 55 }]}>Avg Rating</Text>
          <Text style={[styles.tableHeaderText, { width: 40 }]}># Evals</Text>
          <Text style={[styles.tableHeaderText, { width: 60 }]}>Status</Text>
        </View>

        {/* Table Rows */}
        {rankings.map((ranking, index) => {
          const app = ranking.application;
          return (
            <View key={app._id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.cell, { width: 35, fontFamily: "Helvetica-Bold" }]}>{index + 1}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{app.firstName} {app.lastName}</Text>
              <Text style={[styles.cell, { width: 40 }]}>{app.gpa?.toFixed(2) || "N/A"}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{app.collegeName || "N/A"}</Text>
              <Text style={[styles.cell, { width: 55, fontFamily: "Helvetica-Bold" }]}>{ranking.averageRating.toFixed(2)} / 5.0</Text>
              <Text style={[styles.cell, { width: 40 }]}>{ranking.evaluationCount}</Text>
              <Text style={[styles.cell, { width: 60 }]}>{app.status.replace("_", " ")}</Text>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.footerText}>CONFIDENTIAL - Stark Scholars</Text>
        </View>
      </Page>
    </Document>
  );
}
