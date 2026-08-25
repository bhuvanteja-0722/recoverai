// Night Operations style note: every surface is a live operational instrument—dark ink, Recovery Cobalt signals, explainable AI, and visible auditability.

import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, Bot, Check, CheckCircle2, ChevronDown, CircleDot, Clock3, Command, CreditCard, Database, Download, FileClock, Filter, Gauge, History, Layers3, LifeBuoy, Menu, MoreHorizontal, PanelRightOpen, Play, RotateCcw, Search, Send, Settings2, ShieldCheck, Sparkles, Target, UserRound, Users2, X, Zap,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { CinematicFooter } from "@/components/CinematicFooter";
import {
  AuditEvent, Transaction, calculateMetrics, formatCompactINR, formatINR, generateTransactions, getAuditEvents, getExceptions, getFailureBreakdown, getMethodBreakdown, getRiskLevel,
} from "@/data/recoverai";

type ViewKey = "overview" | "transactions" | "recovery" | "intelligence" | "customers" | "analytics" | "audit" | "settings";
type DateRange = "24h" | "7d" | "all";

const navItems: Array<{ id: ViewKey; label: string; icon: typeof Activity; count?: string }> = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "recovery", label: "Recovery Queue", icon: Zap, count: "live" },
  { id: "intelligence", label: "AI Intelligence", icon: Bot },
  { id: "customers", label: "Customers", icon: Users2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "audit", label: "Audit Trail", icon: History },
];

const riskColors = { Critical: "#F36B5F", High: "#F6B34C", Medium: "#6EA8FF", Low: "#45C491" };
const axisStyle = { fill: "#718198", fontSize: 10, fontFamily: "IBM Plex Mono" };

function downloadBlobFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function downloadTextFile(content: string, fileName: string, mimeType: string) {
  downloadBlobFile(new Blob([content], { type: mimeType }), fileName);
}

function csvCell(value: string | number | boolean) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function buildAnalyticsReport(transactions: Transaction[]) {
  const metrics = calculateMetrics(transactions);
  return {
    report_type: "RecoverAI analytics report",
    generated_at: new Date().toISOString(),
    scope: "Current client-side demo state",
    demo_notice: "Simulated demo report for the Razorpay AI Revenue Recovery track; not production payment data.",
    summary: {
      transactions_analyzed: transactions.length,
      revenue_recovered_inr: metrics.recoveredRevenue,
      revenue_at_risk_inr: metrics.revenueAtRisk,
      recovery_rate_percent: metrics.recoveryRate,
      automation_rate_percent: metrics.automationRate,
      exceptions: metrics.exceptions,
      low_confidence_cases: metrics.lowConfidence,
    },
    funnel: {
      at_risk: transactions.filter((t) => t.recovery_status !== "recovered").length,
      diagnosed: Math.round(transactions.length * .83),
      actionable: Math.round(transactions.length * .67),
      attempted: Math.round(transactions.length * .35),
      recovered: transactions.filter((t) => t.recovery_status === "recovered").length,
    },
    recovery_by_method: getMethodBreakdown(transactions),
    failure_distribution: getFailureBreakdown(transactions),
  };
}

function exportTransactionWorkbook(rows: Transaction[]) {
  const data = rows.map((row) => ({
    "Transaction ID": row.transaction_id,
    "Payment ID": row.payment_id,
    "Order ID": row.order_id,
    Customer: row.customer_name,
    Email: row.customer_email,
    Merchant: row.merchant,
    "Amount (INR)": row.amount,
    Currency: row.currency,
    "Payment Method": row.payment_method,
    "Payment Status": row.payment_status,
    "Recovery Status": row.recovery_status,
    "Failure Reason": row.failure_reason,
    "Failure Code": row.failure_code,
    "Risk Level": getRiskLevel(row),
    "Risk Score": row.risk_score,
    "Recovery Score": row.recovery_score,
    "Recovery Probability (%)": row.recovery_probability,
    "AI Confidence (%)": row.AI_confidence,
    "Recommended Action": row.recommended_action,
    "Revenue At Risk (INR)": row.revenue_at_risk,
    "Retry Count": row.retry_count,
    "Escalation Required": row.escalation_required ? "Yes" : "No",
    Timestamp: row.timestamp,
    "Last Retry At": row.last_retry_at,
    "Customer Segment": row.customer_segment,
    "Next Action": row.next_action,
    "Time At Risk (hours)": row.time_at_risk_hours,
  }));
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  worksheet["!autofilter"] = { ref: worksheet["!ref"] || "A1:AA1" };
  worksheet["!cols"] = [
    { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 31 }, { wch: 20 }, { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 22 }, { wch: 12 }, { wch: 11 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 22 }, { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 18 }, { wch: 33 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  const summary = XLSX.utils.json_to_sheet([
    { Metric: "Exported at", Value: new Date().toISOString() },
    { Metric: "Rows in current view", Value: rows.length },
    { Metric: "Scope", Value: "Current client-side filtered transaction view" },
    { Metric: "Data notice", Value: "Simulated demo data for the Razorpay AI Revenue Recovery track" },
  ]);
  summary["!cols"] = [{ wch: 24 }, { wch: 64 }];
  XLSX.utils.book_append_sheet(workbook, summary, "Export Info");
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlobFile(new Blob([output], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `recoverai-transactions-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function formatPdfINR(value: number) {
  return `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)))}`;
}

type PdfRgb = [number, number, number];

const pdfColors: Record<string, PdfRgb> = {
  ink: [5, 8, 15],
  panel: [10, 19, 32],
  panelAlt: [14, 28, 47],
  text: [232, 237, 245],
  muted: [126, 143, 166],
  cobalt: [45, 107, 255],
  cyan: [110, 168, 255],
  green: [69, 196, 145],
  amber: [246, 179, 76],
  coral: [243, 107, 95],
};

function drawPdfBar(doc: jsPDF, x: number, y: number, width: number, height: number, value: number, max: number, color: PdfRgb) {
  doc.setFillColor(...pdfColors.panelAlt);
  doc.roundedRect(x, y, width, height, 4, 4, "F");
  doc.setFillColor(...color);
  doc.roundedRect(x, y, Math.max(8, width * (value / Math.max(max, 1))), height, 4, 4, "F");
}

function exportAnalyticsPdf(transactions: Transaction[]) {
  const report = buildAnalyticsReport(transactions);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const innerWidth = pageWidth - margin * 2;
  doc.setFillColor(...pdfColors.ink);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setTextColor(...pdfColors.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("RecoverAI analytics report", margin, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...pdfColors.muted);
  doc.text(`Revenue recovery intelligence  ·  Generated ${new Date(report.generated_at).toLocaleString("en-IN")}`, margin, 65);
  doc.text("Simulated demo report for the Razorpay AI Revenue Recovery track", margin, 79);

  const kpis = [
    ["Transactions analyzed", report.summary.transactions_analyzed.toLocaleString("en-IN"), pdfColors.cyan],
    ["Revenue recovered", formatPdfINR(report.summary.revenue_recovered_inr), pdfColors.green],
    ["Revenue at risk", formatPdfINR(report.summary.revenue_at_risk_inr), pdfColors.coral],
    ["Recovery rate", `${report.summary.recovery_rate_percent}%`, pdfColors.cobalt],
    ["Automation rate", `${report.summary.automation_rate_percent}%`, pdfColors.green],
    ["Exceptions", report.summary.exceptions.toLocaleString("en-IN"), pdfColors.amber],
  ] as Array<[string, string, PdfRgb]>;
  const cardGap = 8;
  const cardWidth = (innerWidth - cardGap * 2) / 3;
  kpis.forEach(([label, value, color], index) => {
    const x = margin + (index % 3) * (cardWidth + cardGap);
    const y = 96 + Math.floor(index / 3) * 64;
    doc.setFillColor(...pdfColors.panel);
    doc.roundedRect(x, y, cardWidth, 54, 8, 8, "F");
    doc.setFillColor(...color);
    doc.roundedRect(x, y, 4, 54, 2, 2, "F");
    doc.setTextColor(...pdfColors.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), x + 14, y + 18);
    doc.setTextColor(...pdfColors.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(value, x + 14, y + 39);
  });

  let cursorY = 245;
  doc.setTextColor(...pdfColors.cyan);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("RECOVERY CONVERSION", margin, cursorY);
  doc.setTextColor(...pdfColors.text);
  doc.setFontSize(14);
  doc.text("Funnel from risk to verified recovery", margin, cursorY + 19);
  const funnelStages = [
    ["At risk", report.funnel.at_risk, pdfColors.coral],
    ["Diagnosed", report.funnel.diagnosed, pdfColors.amber],
    ["Actionable", report.funnel.actionable, pdfColors.cyan],
    ["Attempted", report.funnel.attempted, pdfColors.cobalt],
    ["Recovered", report.funnel.recovered, pdfColors.green],
  ] as Array<[string, number, PdfRgb]>;
  const funnelMax = Math.max(...funnelStages.map(([, value]) => value), 1);
  funnelStages.forEach(([label, value, color], index) => {
    const y = cursorY + 43 + index * 22;
    doc.setTextColor(...pdfColors.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), margin, y + 9);
    drawPdfBar(doc, margin + 72, y, innerWidth - 120, 13, value, funnelMax, color);
    doc.setTextColor(...color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(value.toLocaleString("en-IN"), pageWidth - margin - 38, y + 9, { align: "right" });
  });

  cursorY = 424;
  doc.setTextColor(...pdfColors.cyan);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PAYMENT RAILS", margin, cursorY);
  doc.setTextColor(...pdfColors.text);
  doc.setFontSize(14);
  doc.text("Recovery rate by method", margin, cursorY + 19);
  const methodMax = 100;
  report.recovery_by_method.forEach((method, index) => {
    const y = cursorY + 37 + index * 18;
    doc.setTextColor(...pdfColors.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(method.name, margin, y + 9);
    drawPdfBar(doc, margin + 82, y, 150, 11, method.recovered, methodMax, pdfColors.cobalt);
    doc.setTextColor(...pdfColors.cyan);
    doc.setFont("helvetica", "bold");
    doc.text(`${method.recovered}%`, margin + 242, y + 9);
  });

  const failureX = margin + 290;
  doc.setTextColor(...pdfColors.cyan);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FAILURE DISTRIBUTION", failureX, cursorY);
  doc.setTextColor(...pdfColors.text);
  doc.setFontSize(14);
  doc.text("Root causes across transactions", failureX, cursorY + 19);
  const failuresMax = Math.max(...report.failure_distribution.map((failure) => failure.value), 1);
  report.failure_distribution.forEach((failure, index) => {
    const y = cursorY + 37 + index * 18;
    doc.setTextColor(...pdfColors.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(failure.name, failureX, y + 9, { maxWidth: 115 });
    drawPdfBar(doc, failureX + 122, y, 72, 11, failure.value, failuresMax, [140, 125, 255]);
    doc.setTextColor(...pdfColors.cyan);
    doc.setFont("helvetica", "bold");
    doc.text(String(failure.value), failureX + 204, y + 9);
  });

  doc.setFillColor(...pdfColors.panel);
  doc.roundedRect(margin, pageHeight - 78, innerWidth, 42, 8, 8, "F");
  doc.setTextColor(...pdfColors.amber);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("REPORT NOTE", margin + 12, pageHeight - 58);
  doc.setTextColor(...pdfColors.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("All values are derived from the current client-side demo state. This report is for product demonstration only.", margin + 76, pageHeight - 58);
  doc.setTextColor(...pdfColors.muted);
  doc.text("RecoverAI  /  Revenue Recovery Intelligence", margin, pageHeight - 22);
  doc.text("1", pageWidth - margin, pageHeight - 22, { align: "right" });
  downloadBlobFile(doc.output("blob"), `recoverai-analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function evidencePacket(transaction: Transaction, events: AuditEvent[]) {
  return {
    packet_type: "RecoverAI transaction evidence packet",
    generated_at: new Date().toISOString(),
    demo_notice: "Simulated demo evidence for the Razorpay AI Revenue Recovery track; not production payment data.",
    transaction: {
      transaction_id: transaction.transaction_id,
      payment_id: transaction.payment_id,
      order_id: transaction.order_id,
      customer_id: transaction.customer_id,
      customer_name: transaction.customer_name,
      amount_inr: transaction.amount,
      currency: transaction.currency,
      payment_method: transaction.payment_method,
      payment_status: transaction.payment_status,
      recovery_status: transaction.recovery_status,
      timestamp: transaction.timestamp,
    },
    risk_and_recovery: {
      risk_level: getRiskLevel(transaction),
      risk_score: transaction.risk_score,
      revenue_at_risk_inr: transaction.revenue_at_risk,
      recovery_score: transaction.recovery_score,
      recovery_probability: transaction.recovery_probability,
      ai_confidence: transaction.AI_confidence,
      retry_count: transaction.retry_count,
      escalation_required: transaction.escalation_required,
    },
    diagnosis: {
      failure_reason: transaction.failure_reason,
      failure_code: transaction.failure_code,
      recommended_action: transaction.recommended_action,
      next_action: transaction.next_action,
      explanation: transaction.failure_reason === "—" ? "Payment captured successfully; no recovery intervention is required." : `The payment was flagged for ${transaction.failure_reason.toLowerCase()}. Historical payment context supports a ${transaction.recovery_probability}% recovery probability.`
    },
    policy_checks: [
      { check: "Retry cap", result: transaction.retry_count < 2 ? "pass" : "review", detail: "Maximum two retry attempts in a 24-hour window." },
      { check: "Confidence threshold", result: transaction.AI_confidence >= 80 ? "pass" : "review", detail: "Cases below 80% confidence route to Finance Admin." },
      { check: "Human approval gate", result: transaction.escalation_required ? "required" : "not_required", detail: transaction.escalation_required ? "Risk, value, or signal ambiguity requires review." : "Policy permits a bounded automated action." },
    ],
    audit_events: events.filter((event) => event.transaction_id === transaction.transaction_id),
  };
}

function ActionButton({ children, tone = "cobalt", onClick, disabled = false }: { children: React.ReactNode; tone?: "cobalt" | "quiet" | "success" | "danger"; onClick?: () => void; disabled?: boolean }) {
  const colors = {
    cobalt: "border-[#2D6BFF]/50 bg-[#2D6BFF] text-white shadow-[0_8px_20px_rgba(45,107,255,.2)] hover:bg-[#3D79FF]",
    quiet: "border-white/10 bg-white/[.04] text-white/70 hover:border-white/20 hover:bg-white/[.08] hover:text-white",
    success: "border-[#45C491]/35 bg-[#45C491]/10 text-[#8ce6bc] hover:bg-[#45C491]/20",
    danger: "border-[#F36B5F]/35 bg-[#F36B5F]/10 text-[#ffaaa0] hover:bg-[#F36B5F]/20",
  }[tone];
  return <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-[10px] border px-3.5 py-2 text-[11px] font-semibold tracking-[.02em] transition-all duration-200 active:scale-[.97] disabled:cursor-wait disabled:opacity-50 ${colors}`}>{children}</button>;
}

function StatusTag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "cobalt" }) {
  const styles = {
    neutral: "border-white/10 bg-white/[.04] text-[#91A0B6]",
    success: "border-[#45C491]/20 bg-[#45C491]/10 text-[#83e5b6]",
    warning: "border-[#F6B34C]/20 bg-[#F6B34C]/10 text-[#F6C978]",
    danger: "border-[#F36B5F]/20 bg-[#F36B5F]/10 text-[#ff9d93]",
    cobalt: "border-[#2D6BFF]/20 bg-[#2D6BFF]/10 text-[#9FC4FF]",
  }[tone];
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[.13em] ${styles}`}><span className={`h-1.5 w-1.5 rounded-full ${tone === "success" ? "bg-[#45C491]" : tone === "warning" ? "bg-[#F6B34C]" : tone === "danger" ? "bg-[#F36B5F]" : tone === "cobalt" ? "bg-[#6EA8FF]" : "bg-[#67768B]"}`} />{children}</span>;
}

function SectionHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[.22em] text-[#6EA8FF]"><span className="h-px w-5 bg-[#2D6BFF]" />{eyebrow}</div><h2 className="text-xl font-semibold tracking-[-.03em] text-white sm:text-2xl">{title}</h2>{detail && <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#738198]">{detail}</p>}</div>{action}</div>;
}

function ViewSignalHeader({ view }: { view: ViewKey }) {
  const meta: Record<ViewKey, { eyebrow: string; title: string; detail: string; icon: typeof Activity }> = {
    overview: { eyebrow: "Overview / impact signal", title: "Command center", detail: "Revenue intelligence in motion.", icon: Activity },
    transactions: { eyebrow: "Transactions / queue-first", title: "Transaction intelligence", detail: "Search the ledger. Inspect the context. Take the next bounded action.", icon: CreditCard },
    recovery: { eyebrow: "Recovery queue / action-first", title: "Recovery operations", detail: "Move the highest-confidence opportunities before the retry window closes.", icon: Zap },
    intelligence: { eyebrow: "AI intelligence / reasoning-first", title: "Explainable decision engine", detail: "Every recommendation shows the evidence, confidence, policy, and expected outcome.", icon: Bot },
    customers: { eyebrow: "Customers / relationship context", title: "Customer intelligence", detail: "See the payment relationship without exposing unnecessary personal data.", icon: Users2 },
    analytics: { eyebrow: "Analytics / diagnostic signal", title: "Recovery analytics", detail: "Measure conversion from at-risk to verified recovery.", icon: BarChart3 },
    audit: { eyebrow: "Audit trail / evidence-first", title: "Decision record", detail: "Trace every important action back to its actor, reason, result, and policy.", icon: History },
    settings: { eyebrow: "Settings / guardrails", title: "System controls", detail: "Keep automation bounded, observable, and safe.", icon: Settings2 },
  };
  const current = meta[view];
  const Icon = current.icon;
  return <section className="relative mb-7 overflow-hidden rounded-[14px] border border-white/[.08] bg-[#08111D] px-4 py-4 sm:px-5"><div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#2D6BFF] via-[#6EA8FF] to-[#45C491]" /><div className="flex flex-col gap-5 pl-2 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2D6BFF]/25 bg-[#2D6BFF]/10 text-[#6EA8FF]"><Icon className="h-4 w-4" /></div><div><div className="mb-1 font-mono text-[9px] uppercase tracking-[.2em] text-[#6EA8FF]">{current.eyebrow}</div><div className="text-base font-semibold tracking-[-.03em] text-white">{current.title}</div><div className="mt-1 text-[11px] text-[#74839A]">{current.detail}</div></div></div><div className="hidden items-center gap-4 xl:flex"><div className="h-px w-20 bg-gradient-to-r from-[#2D6BFF]/10 to-[#2D6BFF]" /><RecoverySpine compact /><div className="h-px w-20 bg-gradient-to-r from-[#45C491] to-[#45C491]/10" /></div><StatusTag tone={view === "audit" ? "success" : "cobalt"}>{view === "audit" ? "on record" : "live trace"}</StatusTag></div></section>;
}

function MiniSpark({ positive = true }: { positive?: boolean }) {
  return <div className="flex items-end gap-0.5 opacity-80" aria-hidden="true">{[18, 26, 14, 35, 28, 44, 38, 52].map((height, index) => <span key={index} className={`w-1 rounded-t-sm ${positive ? "bg-[#45C491]" : "bg-[#F36B5F]"}`} style={{ height }} />)}</div>;
}

function KpiCard({ label, value, delta, icon: Icon, tone = "cobalt", detail, onClick }: { label: string; value: string; delta: string; icon: typeof Activity; tone?: "cobalt" | "success" | "warning" | "danger"; detail: string; onClick?: () => void }) {
  const accent = { cobalt: "#6EA8FF", success: "#45C491", warning: "#F6B34C", danger: "#F36B5F" }[tone];
  return <button type="button" onClick={onClick} className="group relative min-h-[142px] overflow-hidden rounded-[14px] border border-white/[.08] bg-[#0B1422]/90 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[.17] hover:bg-[#0E1929] focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/70"><div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl" style={{ background: accent }} /><div className="relative flex items-start justify-between"><div className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-white/[.08] bg-white/[.04]" style={{ color: accent }}><Icon className="h-4 w-4" /></div><span className="flex items-center gap-1 font-mono text-[10px] text-[#6DDBA8]"><ArrowUpRight className="h-3 w-3" />{delta}</span></div><div className="relative mt-5"><div className="font-mono text-[10px] uppercase tracking-[.14em] text-[#6F7E93]">{label}</div><div className="mt-1 text-[26px] font-semibold tracking-[-.06em] text-white">{value}</div><div className="mt-1 flex items-center justify-between text-[10px] text-[#6F7E93]"><span>{detail}</span><MiniSpark positive={tone !== "danger"} /></div></div></button>;
}

function RiskBadge({ transaction }: { transaction: Transaction }) {
  const risk = getRiskLevel(transaction);
  return <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold" style={{ color: riskColors[risk] }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: riskColors[risk], boxShadow: `0 0 10px ${riskColors[risk]}` }} />{risk}</span>;
}

function RecoverySpine({ compact = false }: { compact?: boolean }) {
  const steps = ["Detect", "Diagnose", "Decide", "Recover", "Verify", "Audit"];
  return <div className={`flex ${compact ? "items-center gap-1" : "flex-col gap-0"}`}>
    {steps.map((step, index) => <div key={step} className={`relative flex ${compact ? "flex-col items-center gap-1" : "items-center gap-3"} ${!compact && index !== steps.length - 1 ? "pb-5" : ""}`}><div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border ${index < 3 ? "border-[#2D6BFF]/70 bg-[#2D6BFF]/15 text-[#9FC4FF]" : "border-white/12 bg-white/[.04] text-[#718198]"}`}><span className="font-mono text-[9px]">0{index + 1}</span></div>{!compact && <div><div className={`text-[11px] font-semibold ${index < 3 ? "text-white" : "text-[#718198]"}`}>{step}</div><div className="font-mono text-[9px] uppercase tracking-[.12em] text-[#526177]">{index < 3 ? "complete" : "queued"}</div></div>}{compact && <span className="font-mono text-[8px] uppercase tracking-[.11em] text-[#75849A]">{step}</span>}{!compact && index !== steps.length - 1 && <div className="absolute left-[13px] top-7 h-5 w-px bg-gradient-to-b from-[#2D6BFF]/60 to-white/10" />}</div>)}
  </div>;
}

function TransactionRow({ transaction, onSelect, onRecover, recovering }: { transaction: Transaction; onSelect: () => void; onRecover: () => void; recovering: boolean }) {
  const statusTone = transaction.recovery_status === "recovered" ? "success" : transaction.recovery_status === "escalated" ? "warning" : transaction.recovery_status === "failed" ? "danger" : "cobalt";
  return <tr className="group cursor-pointer border-b border-white/[.055] transition-colors hover:bg-white/[.035]" onClick={onSelect}><td className="whitespace-nowrap px-4 py-3.5"><div className="flex items-center gap-2.5"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2D6BFF]/10 text-[#6EA8FF]"><CreditCard className="h-3.5 w-3.5" /></div><div><div className="font-mono text-[11px] font-semibold text-white">{transaction.transaction_id}</div><div className="mt-0.5 font-mono text-[9px] text-[#526177]">{transaction.payment_id}</div></div></div></td><td className="whitespace-nowrap px-4 py-3.5"><div className="text-xs font-medium text-[#D7DFEA]">{transaction.customer_name}</div><div className="mt-0.5 text-[10px] text-[#637189]">{transaction.customer_segment}</div></td><td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-white">{formatINR(transaction.amount)}</td><td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#91A0B6]">{transaction.payment_method}</td><td className="whitespace-nowrap px-4 py-3.5"><StatusTag tone={statusTone}>{transaction.recovery_status === "in_progress" ? "running" : transaction.recovery_status}</StatusTag></td><td className="whitespace-nowrap px-4 py-3.5"><RiskBadge transaction={transaction} /></td><td className="whitespace-nowrap px-4 py-3.5"><div className="flex items-center gap-2"><span className="font-mono text-xs font-semibold text-white">{transaction.recovery_score}</span><div className="h-1 w-14 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-[#2D6BFF]" style={{ width: `${transaction.recovery_score}%` }} /></div></div></td><td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#91A0B6]">{transaction.failure_reason}</td><td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-[#91A0B6]">{transaction.recommended_action}</td><td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-[#9FC4FF]">{transaction.AI_confidence}%</td><td className="whitespace-nowrap px-4 py-3.5 text-[10px] text-[#637189]">{transaction.time_at_risk_hours < 24 ? `${Math.round(transaction.time_at_risk_hours)}h ago` : `${Math.round(transaction.time_at_risk_hours / 24)}d ago`}</td><td className="whitespace-nowrap px-4 py-3.5" onClick={(event) => event.stopPropagation()}>{transaction.recovery_status === "open" || transaction.recovery_status === "escalated" ? <ActionButton tone={transaction.escalation_required ? "quiet" : "cobalt"} onClick={onRecover} disabled={recovering}>{recovering ? <><RotateCcw className="h-3 w-3 animate-spin" />Running</> : transaction.escalation_required ? <><ShieldCheck className="h-3 w-3" />Review</> : <><Play className="h-3 w-3" />Recover</>}</ActionButton> : <span className="font-mono text-[9px] uppercase tracking-[.12em] text-[#516077]">—</span>}</td></tr>;
}

function Overview({ transactions, metrics, onNavigate, onSelect, onRecover, recovering, range, setRange }: { transactions: Transaction[]; metrics: ReturnType<typeof calculateMetrics>; onNavigate: (view: ViewKey) => void; onSelect: (t: Transaction) => void; onRecover: (t: Transaction) => void; recovering: string | null; range: DateRange; setRange: (value: DateRange) => void }) {
  const chartData = useMemo(() => buildTrendData(transactions), [transactions]);
  const failures = useMemo(() => getFailureBreakdown(transactions), [transactions]);
  const exceptions = useMemo(() => getExceptions(transactions), [transactions]);
  const queue = useMemo(() => transactions.filter((t) => t.recovery_status === "open" || t.recovery_status === "escalated").sort((a, b) => b.recovery_score - a.recovery_score).slice(0, 4), [transactions]);
  const featured = transactions.find((t) => t.transaction_id === "TXN_847291") || queue[0];
  return <div className="space-y-8">
    <section className="relative overflow-hidden rounded-[18px] border border-[#2D6BFF]/20 bg-[#081221] p-5 sm:p-7 lg:p-9"><img src="/manus-storage/recoverai-signal-field_b01c3235.png" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen" /><div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#081221_4%,rgba(8,18,33,.86)_42%,rgba(8,18,33,.28)_100%)]" /><div className="relative z-10 max-w-[680px]"><div className="mb-6 flex flex-wrap items-center gap-2"><StatusTag tone="success">Demo mode · simulated data</StatusTag><span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#718198]">last sync 11:00:04 IST</span></div><h1 className="max-w-[620px] text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[.98] tracking-[-.07em] text-white">Recover revenue.<br /><span className="text-[#6EA8FF]">Before it’s lost.</span></h1><p className="mt-5 max-w-[520px] text-sm leading-6 text-[#95A4B9]">RecoverAI detects payment risk, diagnoses failures, selects a bounded intervention, verifies the outcome, and keeps every decision on record.</p><div className="mt-7 flex flex-wrap items-center gap-3"><ActionButton onClick={() => onNavigate("recovery")}><Zap className="h-3.5 w-3.5" />Open recovery queue</ActionButton><ActionButton tone="quiet" onClick={() => onNavigate("intelligence")}><Bot className="h-3.5 w-3.5" />Explore AI reasoning</ActionButton></div></div><div className="relative z-10 mt-8 flex max-w-[720px] items-center gap-2 border-t border-white/10 pt-5 sm:gap-3"><RecoverySpine compact /></div></section>

    <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><div className="font-mono text-[10px] uppercase tracking-[.22em] text-[#627187]">Business impact / computed from live demo state</div><div className="mt-1 text-xs text-[#8090A6]">Every KPI responds to filters and recovery actions.</div></div><div className="flex items-center gap-1 rounded-lg border border-white/[.08] bg-white/[.025] p-1">{([["24h", "Last 24 hours"], ["7d", "Last 7 days"], ["all", "All time"]] as const).map(([key, label]) => <button type="button" key={key} onClick={() => setRange(key)} className={`rounded-md px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[.12em] transition-colors ${range === key ? "bg-[#2D6BFF]/20 text-[#9FC4FF]" : "text-[#65738A] hover:text-white"}`}>{label}</button>)}</div></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6"><KpiCard label="Revenue recovered" value={formatCompactINR(metrics.recoveredRevenue)} delta="8.4%" icon={CheckCircle2} tone="success" detail="verified this period" onClick={() => onNavigate("analytics")} /><KpiCard label="Revenue at risk" value={formatCompactINR(metrics.revenueAtRisk)} delta="live" icon={Target} tone="danger" detail={`${metrics.atRiskCount} open opportunities`} onClick={() => onNavigate("recovery")} /><KpiCard label="Recovery rate" value={`${metrics.recoveryRate}%`} delta="+4.7pp" icon={Gauge} tone="cobalt" detail="of attempted actions" onClick={() => onNavigate("analytics")} /><KpiCard label="Transactions at risk" value={metrics.atRiskCount.toLocaleString("en-IN")} delta="now" icon={AlertTriangle} tone="warning" detail="needs attention" onClick={() => onNavigate("transactions")} /><KpiCard label="Automation rate" value={`${metrics.automationRate}%`} delta="stable" icon={Bot} tone="cobalt" detail="policy-cleared actions" onClick={() => onNavigate("intelligence")} /><KpiCard label="Exceptions" value={metrics.exceptions.toLocaleString("en-IN")} delta="review" icon={LifeBuoy} tone="danger" detail={`${metrics.lowConfidence} low confidence`} onClick={() => onNavigate("audit")} /></div></section>

    <section className="grid gap-4 xl:grid-cols-[1.5fr_.8fr]"><div className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[.18em] text-[#6EA8FF]"><Activity className="h-3 w-3" />Telemetry / rolling 7 days</div><h2 className="text-lg font-semibold tracking-[-.03em] text-white">At-risk vs recovered revenue</h2></div><div className="flex items-center gap-4 text-[10px] text-[#8190A5]"><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#F36B5F]" />At risk</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#45C491]" />Recovered</span></div></div><div className="mt-6 h-[250px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 2, left: -20, bottom: 0 }}><defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F36B5F" stopOpacity={.22} /><stop offset="100%" stopColor="#F36B5F" stopOpacity={0} /></linearGradient><linearGradient id="recoveredFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#45C491" stopOpacity={.18} /><stop offset="100%" stopColor="#45C491" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} /><YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${Math.round(value / 1000)}K`} /><Tooltip contentStyle={{ background: "#0F1B2B", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "white", fontSize: 11 }} formatter={(value: number, name: string) => [formatINR(value), name === "risk" ? "At risk" : "Recovered"]} /><Area type="monotone" dataKey="risk" stroke="#F36B5F" strokeWidth={2} fill="url(#riskFill)" /><Area type="monotone" dataKey="recovered" stroke="#45C491" strokeWidth={2} fill="url(#recoveredFill)" /></AreaChart></ResponsiveContainer></div><div className="mt-3 flex items-center justify-between border-t border-white/[.06] pt-3 font-mono text-[9px] uppercase tracking-[.13em] text-[#526177]"><span>{metrics.analyzed} transactions analyzed</span><span>derived in real time</span></div></div><div className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[.18em] text-[#6EA8FF]"><Layers3 className="h-3 w-3" />Workflow state</div><h2 className="text-lg font-semibold tracking-[-.03em] text-white">Recovery spine</h2></div><StatusTag tone="cobalt">live trace</StatusTag></div><RecoverySpine /><div className="mt-2 rounded-lg border border-[#2D6BFF]/15 bg-[#2D6BFF]/[.06] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.13em] text-[#9FC4FF]"><ShieldCheck className="h-3.5 w-3.5" /> Policy boundary active</div><p className="mt-1.5 text-[11px] leading-5 text-[#8190A5]">Actions are limited to one retry, one reminder, or human escalation. Nothing runs without a reason.</p></div></div></section>

    <section className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><div className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><SectionHeading eyebrow="Priority queue / ranked by recovery score" title="Act on recoverable revenue" detail="The highest-value, highest-confidence opportunities surface first." action={<button type="button" onClick={() => onNavigate("recovery")} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-[#6EA8FF] hover:text-white">View queue <ArrowRight className="h-3 w-3" /></button>} /><div className="space-y-2">{queue.map((t) => <div key={t.transaction_id} className="group flex flex-col gap-4 rounded-[11px] border border-white/[.07] bg-white/[.025] p-3.5 transition-colors hover:border-white/[.15] sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => onSelect(t)} className="flex min-w-0 items-center gap-3 text-left"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#111E31] font-mono text-[10px] text-[#9FC4FF]">{t.customer_name.split(" ").map((part) => part[0]).join("")}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-xs font-semibold text-white">{t.customer_name}</span><RiskBadge transaction={t} /></div><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-[#66758C]"><span>{t.transaction_id}</span><span>{t.failure_reason}</span></div></div></button><div className="flex items-center justify-between gap-4 sm:justify-end"><div className="text-right"><div className="font-mono text-sm font-semibold text-white">{formatINR(t.amount)}</div><div className="mt-1 text-[10px] text-[#6DDBA8]">{t.recovery_probability}% likely</div></div><ActionButton tone={t.escalation_required ? "quiet" : "cobalt"} onClick={() => onRecover(t)} disabled={recovering === t.transaction_id}>{recovering === t.transaction_id ? <RotateCcw className="h-3 w-3 animate-spin" /> : t.escalation_required ? <ShieldCheck className="h-3 w-3" /> : <Play className="h-3 w-3" />}{t.escalation_required ? "Review" : recovering === t.transaction_id ? "Running" : "Recover"}</ActionButton></div></div>)}</div></div><div className="rounded-[14px] border border-[#2D6BFF]/20 bg-[#0B1627] p-5 sm:p-6"><SectionHeading eyebrow="AI recommendation / featured case" title="Why this payment is recoverable" action={<button type="button" onClick={() => featured && onSelect(featured)} aria-label="Open featured transaction" className="rounded-lg p-1.5 text-[#65758E] transition-colors hover:bg-white/10 hover:text-white"><PanelRightOpen className="h-4 w-4" /></button>} />{featured && <><div className="flex items-center justify-between border-b border-white/[.07] pb-4"><div><div className="font-mono text-[10px] text-[#6F7E93]">{featured.transaction_id}</div><div className="mt-1 text-sm font-semibold text-white">{featured.customer_name}</div></div><RiskBadge transaction={featured} /></div><div className="mt-5 space-y-4"><div><div className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#66768D]">Diagnosis</div><p className="mt-1.5 text-xs leading-5 text-[#C0CAD8]">The payment failed due to a temporary issuer-side decline. The customer has completed 4 of 5 previous payments successfully.</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div className="font-mono text-[9px] uppercase tracking-[.12em] text-[#66768D]">Recovery score</div><div className="mt-1 text-2xl font-semibold text-white">{featured.recovery_score}<span className="text-sm text-[#68788F]">/100</span></div></div><div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div className="font-mono text-[9px] uppercase tracking-[.12em] text-[#66768D]">AI confidence</div><div className="mt-1 text-2xl font-semibold text-[#9FC4FF]">{featured.AI_confidence}<span className="text-sm text-[#68788F]">%</span></div></div></div><div className="rounded-lg border border-[#45C491]/15 bg-[#45C491]/[.06] p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#82E4B5]">Recommended action</span><StatusTag tone="success">policy cleared</StatusTag></div><div className="mt-2 flex items-center justify-between gap-3"><span className="text-sm font-semibold text-white">{featured.recommended_action}</span><span className="font-mono text-sm text-[#82E4B5]">{formatINR(featured.amount)}</span></div></div><ActionButton onClick={() => onRecover(featured)} disabled={recovering === featured.transaction_id}>{recovering === featured.transaction_id ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}{recovering === featured.transaction_id ? "Executing bounded recovery" : "Execute Smart Retry"}</ActionButton></div></>}</div></section>

    <section className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]"><div className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><SectionHeading eyebrow="Failure intelligence" title="Why revenue is slipping" detail="Classified failure reasons across the selected view." /><div className="space-y-4">{failures.map((failure, index) => <div key={failure.name}><div className="mb-1.5 flex items-center justify-between text-[11px]"><span className="text-[#B2BDCC]">{failure.name}</span><span className="font-mono text-[#718198]">{failure.value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, failure.value / Math.max(...failures.map((item) => item.value)) * 100)}%`, background: ["#2D6BFF", "#6EA8FF", "#F6B34C", "#45C491", "#F36B5F", "#8C7DFF"][index] }} /></div></div>)}</div></div><div className="rounded-[14px] border border-[#F6B34C]/15 bg-[#11151B] p-5 sm:p-6"><SectionHeading eyebrow="Human-in-the-loop" title="Exceptions that need judgment" detail="Reliability means knowing when not to automate." action={<button type="button" onClick={() => onNavigate("audit")} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-[#F6C978] hover:text-white">Open audit <ArrowRight className="h-3 w-3" /></button>} /><div className="space-y-2">{exceptions.slice(0, 4).map((t) => <button type="button" key={t.transaction_id} onClick={() => onSelect(t)} className="flex w-full items-center justify-between gap-4 rounded-[10px] border border-white/[.06] bg-white/[.025] p-3 text-left transition-colors hover:border-[#F6B34C]/30"><div className="flex min-w-0 items-center gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F6B34C]/10 text-[#F6C978]"><AlertTriangle className="h-3.5 w-3.5" /></div><div className="min-w-0"><div className="truncate text-xs font-semibold text-white">{t.customer_name}</div><div className="mt-1 truncate text-[10px] text-[#74839A]">{t.escalation_required ? "Human approval required" : "Low AI confidence"} · {t.failure_reason}</div></div></div><div className="font-mono text-[10px] text-[#F6C978]">{formatINR(t.amount)}</div></button>)}</div></div></section>
  </div>;
}

function TransactionsView({ transactions, onSelect, onRecover, onExport, recovering, search, setSearch, riskFilter, setRiskFilter, methodFilter, setMethodFilter }: { transactions: Transaction[]; onSelect: (t: Transaction) => void; onRecover: (t: Transaction) => void; onExport: (rows: Transaction[]) => void; recovering: string | null; search: string; setSearch: (value: string) => void; riskFilter: string; setRiskFilter: (value: string) => void; methodFilter: string; setMethodFilter: (value: string) => void }) {
  const visible = useMemo(() => transactions.filter((t) => (!search || `${t.transaction_id} ${t.customer_name} ${t.customer_email} ${t.failure_reason} ${t.amount}`.toLowerCase().includes(search.toLowerCase())) && (riskFilter === "All risk" || getRiskLevel(t) === riskFilter) && (methodFilter === "All methods" || t.payment_method === methodFilter)), [transactions, search, riskFilter, methodFilter]);
  return <div className="space-y-6"><SectionHeading eyebrow="Transaction intelligence / searchable" title="See every payment in context" detail={`${visible.length} of ${transactions.length} simulated transactions match the current view.`} action={<ActionButton tone="quiet" onClick={() => onExport(visible)}><Download className="h-3.5 w-3.5" />Export {visible.length} rows</ActionButton>} /><div className="flex flex-col gap-3 rounded-[14px] border border-white/[.08] bg-[#0A1320] p-3 sm:flex-row"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#607088]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search TXN_847291, Ananya, issuer decline, ₹12,499…" className="h-10 w-full rounded-lg border border-white/[.08] bg-white/[.025] pl-10 pr-3 text-xs text-white outline-none placeholder:text-[#516078] focus:border-[#2D6BFF]/60" /></div><div className="flex gap-2 overflow-x-auto"><label className="flex h-10 items-center gap-2 rounded-lg border border-white/[.08] bg-white/[.025] px-3"><Filter className="h-3.5 w-3.5 text-[#6EA8FF]" /><select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="bg-transparent text-[11px] text-[#B6C1D1] outline-none"><option>All risk</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label><label className="flex h-10 items-center gap-2 rounded-lg border border-white/[.08] bg-white/[.025] px-3"><CreditCard className="h-3.5 w-3.5 text-[#6EA8FF]" /><select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="bg-transparent text-[11px] text-[#B6C1D1] outline-none"><option>All methods</option><option>UPI</option><option>Cards</option><option>Netbanking</option><option>Wallet</option><option>EMI</option><option>International cards</option></select></label></div></div><div className="overflow-hidden rounded-[14px] border border-white/[.08] bg-[#0A1320]"><div className="overflow-x-auto"><table className="w-full min-w-[1450px] border-collapse"><thead className="bg-white/[.025]"><tr className="border-b border-white/[.08] text-left font-mono text-[9px] uppercase tracking-[.13em] text-[#63728A]"><th className="px-4 py-3 font-medium">Transaction</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Method</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Risk</th><th className="px-4 py-3 font-medium">Recovery score</th><th className="px-4 py-3 font-medium">Failure reason</th><th className="px-4 py-3 font-medium">AI recommendation</th><th className="px-4 py-3 font-medium">Confidence</th><th className="px-4 py-3 font-medium">Last attempt</th><th className="px-4 py-3 font-medium">Action</th></tr></thead><tbody>{visible.slice(0, 25).map((transaction) => <TransactionRow key={transaction.transaction_id} transaction={transaction} onSelect={() => onSelect(transaction)} onRecover={() => onRecover(transaction)} recovering={recovering === transaction.transaction_id} />)}</tbody></table></div>{visible.length > 25 && <div className="flex items-center justify-between border-t border-white/[.06] px-4 py-3 font-mono text-[10px] text-[#64748A]"><span>Showing 25 of {visible.length}</span><span>Rows update from shared demo state</span></div>}{!visible.length && <div className="p-12 text-center text-sm text-[#728198]">No transactions match this search and filter combination.</div>}</div></div>;
}

function RecoveryView({ transactions, onSelect, onRecover, recovering }: { transactions: Transaction[]; onSelect: (t: Transaction) => void; onRecover: (t: Transaction) => void; recovering: string | null }) {
  const groups = (["Critical", "High", "Medium", "Low"] as const).map((risk) => ({ risk, rows: transactions.filter((t) => getRiskLevel(t) === risk && (t.recovery_status === "open" || t.recovery_status === "escalated")).sort((a, b) => b.recovery_score - a.recovery_score).slice(0, 4) }));
  return <div className="space-y-6"><SectionHeading eyebrow="Recovery operations / bounded actions" title="Queue the next best action" detail="Each intervention is scoped by policy and surfaced with expected recovery, risk, and approval state." action={<StatusTag tone="success">{transactions.filter((t) => t.recovery_status === "open").length} actionable</StatusTag>} /><div className="grid gap-4 xl:grid-cols-2">{groups.map(({ risk, rows }) => <section key={risk} className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-4 sm:p-5"><div className="mb-4 flex items-center justify-between border-b border-white/[.06] pb-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: riskColors[risk], boxShadow: `0 0 12px ${riskColors[risk]}` }} /><h2 className="text-sm font-semibold text-white">{risk}</h2><span className="rounded-full bg-white/[.06] px-2 py-0.5 font-mono text-[9px] text-[#718198]">{rows.length}</span></div><span className="font-mono text-[9px] uppercase tracking-[.14em] text-[#627188]">ranked by score</span></div><div className="space-y-2">{rows.map((t) => <div key={t.transaction_id} className="rounded-[11px] border border-white/[.07] bg-white/[.025] p-3.5"><div className="flex items-start justify-between gap-3"><button type="button" onClick={() => onSelect(t)} className="min-w-0 text-left"><div className="truncate text-xs font-semibold text-white">{t.customer_name}</div><div className="mt-1 font-mono text-[10px] text-[#63728A]">{t.transaction_id} · {t.time_at_risk_hours < 24 ? `${Math.round(t.time_at_risk_hours)}h at risk` : `${Math.round(t.time_at_risk_hours / 24)}d at risk`}</div></button><div className="text-right"><div className="font-mono text-sm font-semibold text-white">{formatINR(t.amount)}</div><div className="mt-1 font-mono text-[10px] text-[#6DDBA8]">{t.recovery_probability}% likely</div></div></div><div className="mt-3 grid grid-cols-2 gap-2 text-[10px]"><div className="rounded-md border border-white/[.06] bg-black/10 p-2"><span className="block font-mono uppercase tracking-[.1em] text-[#5E6E85]">Action</span><span className="mt-1 block font-semibold text-[#B7C4D6]">{t.recommended_action}</span></div><div className="rounded-md border border-white/[.06] bg-black/10 p-2"><span className="block font-mono uppercase tracking-[.1em] text-[#5E6E85]">Confidence</span><span className="mt-1 block font-mono font-semibold text-[#9FC4FF]">{t.AI_confidence}%</span></div></div><div className="mt-3 flex gap-2"><ActionButton tone={t.escalation_required ? "quiet" : "cobalt"} onClick={() => onRecover(t)} disabled={recovering === t.transaction_id}>{recovering === t.transaction_id ? <RotateCcw className="h-3 w-3 animate-spin" /> : t.escalation_required ? <ShieldCheck className="h-3 w-3" /> : <Play className="h-3 w-3" />}{t.escalation_required ? "Review evidence" : "Recover"}</ActionButton><ActionButton tone="quiet" onClick={() => onSelect(t)}><PanelRightOpen className="h-3 w-3" />Inspect</ActionButton></div></div>)}</div>{!rows.length && <div className="py-8 text-center font-mono text-[10px] uppercase tracking-[.13em] text-[#526177]">No active cases</div>}</section>)}</div></div>;
}

function IntelligenceView({ transactions, onSelect }: { transactions: Transaction[]; onSelect: (t: Transaction) => void }) {
  const metrics = calculateMetrics(transactions);
  const featured = transactions.find((t) => t.transaction_id === "TXN_847291") || transactions[0];
  const confidenceBins = [{ label: "90–100", value: transactions.filter((t) => t.AI_confidence >= 90).length }, { label: "80–89", value: transactions.filter((t) => t.AI_confidence >= 80 && t.AI_confidence < 90).length }, { label: "<80", value: transactions.filter((t) => t.AI_confidence < 80).length }];
  return <div className="space-y-7"><SectionHeading eyebrow="AI intelligence / explainable decisions" title="The decision engine behind recovery" detail="RecoverAI classifies failure, scores opportunity, recommends an intervention, and knows when to ask a human." action={<StatusTag tone="cobalt">model trace active</StatusTag>} /><div className="grid grid-cols-2 gap-3 lg:grid-cols-5"><KpiCard label="AI decisions today" value={transactions.length.toLocaleString("en-IN")} delta="live" icon={Bot} detail="across this demo" /><KpiCard label="Recommendations" value={Math.round(transactions.length * .72).toLocaleString("en-IN")} delta="72%" icon={Sparkles} tone="cobalt" detail="policy-eligible" /><KpiCard label="Successful recoveries" value={transactions.filter((t) => t.recovery_status === "recovered").length.toLocaleString("en-IN")} delta="verified" icon={CheckCircle2} tone="success" detail="outcome confirmed" /><KpiCard label="Low confidence" value={metrics.lowConfidence.toLocaleString("en-IN")} delta="review" icon={AlertTriangle} tone="warning" detail="below threshold" /><KpiCard label="Exceptions" value={metrics.exceptions.toLocaleString("en-IN")} delta="queue" icon={LifeBuoy} tone="danger" detail="human judgment" /></div><div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><section className="relative overflow-hidden rounded-[14px] border border-[#2D6BFF]/20 bg-[#0A1628] p-5 sm:p-7"><img src="/manus-storage/recoverai-customer-signal_9dcf5e61.png" alt="" className="pointer-events-none absolute right-0 top-0 h-full w-1/2 object-cover opacity-30 mix-blend-screen" /><div className="relative z-10 max-w-[600px]"><div className="mb-6 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2D6BFF]/25 bg-[#2D6BFF]/10 text-[#6EA8FF]"><Bot className="h-4 w-4" /></div><div><div className="text-xs font-semibold text-white">AI Reasoning / featured decision</div><div className="font-mono text-[9px] uppercase tracking-[.14em] text-[#5D6E86]">trace TXN_847291</div></div></div><div className="space-y-5"><div><div className="font-mono text-[10px] uppercase tracking-[.15em] text-[#64748A]">Why this payment is at risk</div><p className="mt-2 text-sm leading-6 text-[#CFD7E2]">The payment failed due to a temporary issuer-side decline. The response pattern is consistent with recoverable issuer friction, not a customer intent signal.</p></div><div><div className="font-mono text-[10px] uppercase tracking-[.15em] text-[#64748A]">Why recovery is likely</div><p className="mt-2 text-sm leading-6 text-[#CFD7E2]">{featured?.customer_name} has completed 4 of 5 previous payments successfully. A single retry within the issuer cool-down window is within policy.</p></div><div className="grid gap-3 sm:grid-cols-3"><div><div className="font-mono text-[9px] uppercase tracking-[.13em] text-[#64748A]">Recommended</div><div className="mt-1 text-sm font-semibold text-[#9FC4FF]">Smart Retry</div></div><div><div className="font-mono text-[9px] uppercase tracking-[.13em] text-[#64748A]">Expected recovery</div><div className="mt-1 text-sm font-semibold text-white">{featured ? formatINR(featured.amount) : "—"}</div></div><div><div className="font-mono text-[9px] uppercase tracking-[.13em] text-[#64748A]">Confidence</div><div className="mt-1 text-sm font-semibold text-[#6DDBA8]">93%</div></div></div><div className="flex flex-wrap items-center gap-2"><StatusTag tone="success">Automatic recovery allowed</StatusTag><StatusTag tone="neutral">one attempt max</StatusTag></div></div></div></section><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><div className="mb-2 text-[10px] font-mono uppercase tracking-[.18em] text-[#6EA8FF]">Model calibration</div><h2 className="text-lg font-semibold text-white">Confidence distribution</h2></div><span className="font-mono text-[10px] text-[#6DDBA8]">{Math.round(transactions.reduce((sum, t) => sum + t.AI_confidence, 0) / Math.max(1, transactions.length))}% avg</span></div><div className="space-y-5">{confidenceBins.map((bin, index) => <div key={bin.label}><div className="mb-1.5 flex items-center justify-between text-[11px]"><span className="text-[#B3BECD]">{bin.label}% confidence</span><span className="font-mono text-[#73829A]">{bin.value} decisions</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full" style={{ width: `${bin.value / Math.max(...confidenceBins.map((item) => item.value), 1) * 100}%`, background: index === 2 ? "#F6B34C" : "#2D6BFF" }} /></div></div>)}</div><div className="mt-8 border-t border-white/[.06] pt-4"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.13em] text-[#718198]"><ShieldCheck className="h-3.5 w-3.5 text-[#45C491]" />Human escalation guardrail</div><p className="mt-2 text-xs leading-5 text-[#7C8BA1]">Confidence below 80%, high-value payments, and conflicting signals route to Finance Admin before execution.</p></div></section></div><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><SectionHeading eyebrow="Recent reasoning traces" title="Decisions you can inspect" /><div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{transactions.slice(0, 6).map((t) => <button type="button" key={t.transaction_id} onClick={() => onSelect(t)} className="flex items-center justify-between gap-3 rounded-[10px] border border-white/[.07] bg-white/[.025] p-3 text-left transition-colors hover:border-[#2D6BFF]/35"><div className="min-w-0"><div className="truncate text-xs font-semibold text-white">{t.customer_name}</div><div className="mt-1 truncate text-[10px] text-[#65758C]">{t.failure_reason} · {t.recommended_action}</div></div><div className="text-right"><div className="font-mono text-xs font-semibold text-[#9FC4FF]">{t.AI_confidence}%</div><div className="mt-1 text-[9px] uppercase tracking-[.1em] text-[#5F6E85]">confidence</div></div></button>)}</div></section></div>;
}

function AnalyticsView({ transactions, onDownload }: { transactions: Transaction[]; onDownload: () => void }) {
  const method = getMethodBreakdown(transactions);
  const failures = getFailureBreakdown(transactions);
  const funnel = [
    { label: "At risk", value: transactions.filter((t) => t.recovery_status === "open" || t.recovery_status === "escalated").length, color: "#F36B5F" },
    { label: "Diagnosed", value: Math.round(transactions.length * .76), color: "#F6B34C" },
    { label: "Actionable", value: Math.round(transactions.length * .61), color: "#6EA8FF" },
    { label: "Attempted", value: Math.round(transactions.length * .35), color: "#2D6BFF" },
    { label: "Recovered", value: transactions.filter((t) => t.recovery_status === "recovered").length, color: "#45C491" },
  ];
  return <div className="space-y-7"><SectionHeading eyebrow="Analytics / operational signal" title="Measure the recovery system" detail="All visualizations are derived from the same simulated transaction state; change the view in Transactions to explore the data." action={<ActionButton tone="quiet" onClick={onDownload}><Download className="h-3.5 w-3.5" />Download report</ActionButton>} /><div className="grid gap-4 lg:grid-cols-[1fr_1fr]"><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-6"><div className="mb-2 text-[10px] font-mono uppercase tracking-[.18em] text-[#6EA8FF]">Recovery conversion</div><h2 className="text-lg font-semibold text-white">Funnel from risk to recovery</h2></div><div className="space-y-3">{funnel.map((stage, index) => <div key={stage.label} className="flex items-center gap-3"><div className="w-20 text-[10px] uppercase tracking-[.08em] text-[#78879B]">{stage.label}</div><div className="relative h-8 flex-1 overflow-hidden rounded-r-md bg-white/[.04]"><div className="flex h-full items-center rounded-r-md px-3 transition-all duration-500" style={{ width: `${Math.max(16, stage.value / Math.max(funnel[0].value, 1) * 100)}%`, background: `${stage.color}22`, borderRight: `2px solid ${stage.color}` }}><span className="font-mono text-xs font-semibold" style={{ color: stage.color }}>{stage.value.toLocaleString("en-IN")}</span></div></div>{index > 0 && <div className="w-12 text-right font-mono text-[10px] text-[#6DDBA8]">{Math.round(stage.value / Math.max(funnel[index - 1].value, 1) * 100)}%</div>}</div>)}</div></section><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-6"><div className="mb-2 text-[10px] font-mono uppercase tracking-[.18em] text-[#6EA8FF]">Payment rails</div><h2 className="text-lg font-semibold text-white">Recovery rate by method</h2></div><div className="h-[220px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={method} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}><CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} /><XAxis type="number" domain={[0, 100]} hide /><YAxis type="category" dataKey="name" tick={axisStyle} width={85} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#0F1B2B", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "white", fontSize: 11 }} formatter={(value: number) => [`${value}%`, "Recovery rate"]} /><Bar dataKey="recovered" fill="#2D6BFF" radius={[0, 4, 4, 0]} barSize={14} /></BarChart></ResponsiveContainer></div></section></div><div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]"><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-6"><div className="mb-2 text-[10px] font-mono uppercase tracking-[.18em] text-[#6EA8FF]">Failure distribution</div><h2 className="text-lg font-semibold text-white">Root causes across transactions</h2></div><div className="h-[240px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={failures} margin={{ top: 6, right: 6, left: -18, bottom: 42 }}><CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} /><XAxis dataKey="name" angle={-32} tick={{ ...axisStyle, textAnchor: "end" }} interval={0} axisLine={false} tickLine={false} /><YAxis tick={axisStyle} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#0F1B2B", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: "white", fontSize: 11 }} /><Bar dataKey="value" fill="#6EA8FF" radius={[4, 4, 0, 0]} barSize={26}>{failures.map((failure, index) => <Cell key={failure.name} fill={["#2D6BFF", "#6EA8FF", "#F6B34C", "#45C491", "#F36B5F", "#8C7DFF"][index]} />)}</Bar></BarChart></ResponsiveContainer></div></section><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-6"><div className="mb-2 text-[10px] font-mono uppercase tracking-[.18em] text-[#6EA8FF]">Signal quality</div><h2 className="text-lg font-semibold text-white">Operational truth sheet</h2></div><div className="space-y-3">{[["Failed payment rate", `${Math.round(transactions.filter((t) => t.payment_status === "failed").length / Math.max(transactions.length, 1) * 1000) / 10}%`, "#F36B5F"], ["Retry success rate", `${Math.round(transactions.filter((t) => t.recovery_status === "recovered" && t.retry_count > 0).length / Math.max(transactions.filter((t) => t.recovery_status === "recovered").length, 1) * 1000) / 10}%`, "#45C491"], ["Avg. time at risk", `${Math.round(transactions.reduce((sum, t) => sum + t.time_at_risk_hours, 0) / Math.max(transactions.length, 1) * 10) / 10}h`, "#6EA8FF"], ["Intervention success", `${Math.round(transactions.filter((t) => t.recovery_status === "recovered").length / Math.max(transactions.filter((t) => t.recovery_status !== "open").length, 1) * 1000) / 10}%`, "#45C491"]].map(([label, value, color]) => <div key={label} className="flex items-center justify-between border-b border-white/[.06] pb-3 text-xs"><span className="text-[#8795A9]">{label}</span><span className="font-mono font-semibold" style={{ color }}>{value}</span></div>)}</div><div className="mt-6 rounded-lg border border-[#F6B34C]/15 bg-[#F6B34C]/[.05] p-3 text-[10px] leading-5 text-[#A99A7A]">Demo data is simulated for the Razorpay AI Revenue Recovery track. It is designed to show system behavior, not claim production performance.</div></section></div></div>;
}

function CustomersView({ transactions, onSelect }: { transactions: Transaction[]; onSelect: (t: Transaction) => void }) {
  const customers = useMemo(() => { const map = new Map<string, { name: string; segment: string; total: number; recovered: number; failed: number; value: number; risk: number; representative: Transaction }>(); transactions.forEach((t) => { const current = map.get(t.customer_id) || { name: t.customer_name, segment: t.customer_segment, total: 0, recovered: 0, failed: 0, value: 0, risk: 0, representative: t }; current.total += 1; current.value += t.amount; current.recovered += t.recovery_status === "recovered" ? 1 : 0; current.failed += t.payment_status === "failed" ? 1 : 0; current.risk = Math.max(current.risk, t.risk_score); map.set(t.customer_id, current); }); return Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 12); }, [transactions]);
  return <div className="space-y-6"><SectionHeading eyebrow="Customer intelligence / privacy-safe demo identities" title="Understand the relationship behind the payment" detail="Fictional identities only. Sensitive personal data is intentionally minimized." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{customers.map((customer) => <button type="button" key={customer.name + customer.segment} onClick={() => onSelect(customer.representative)} className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/[.18]"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2D6BFF]/25 bg-[#2D6BFF]/10 font-mono text-[10px] text-[#9FC4FF]">{customer.name.split(" ").map((part) => part[0]).join("")}</div><div><div className="text-xs font-semibold text-white">{customer.name}</div><div className="mt-1 text-[10px] text-[#718198]">{customer.segment} · {customer.total} transactions</div></div></div><RiskBadge transaction={customer.representative} /></div><div className="mt-5 grid grid-cols-3 gap-2"><div><div className="font-mono text-[9px] uppercase tracking-[.1em] text-[#5F6F86]">Lifetime value</div><div className="mt-1 text-sm font-semibold text-white">{formatCompactINR(customer.value)}</div></div><div><div className="font-mono text-[9px] uppercase tracking-[.1em] text-[#5F6F86]">Recovered</div><div className="mt-1 text-sm font-semibold text-[#6DDBA8]">{customer.recovered}</div></div><div><div className="font-mono text-[9px] uppercase tracking-[.1em] text-[#5F6F86]">Failed</div><div className="mt-1 text-sm font-semibold text-[#FF9D93]">{customer.failed}</div></div></div><div className="mt-4 flex items-center justify-between border-t border-white/[.06] pt-3 text-[10px] text-[#718198]"><span>Preferred rail: {customer.representative.payment_method}</span><span className="text-[#9FC4FF]">View profile →</span></div></button>)}</div></div>;
}

function AuditView({ events, transactions, onSelect }: { events: AuditEvent[]; transactions: Transaction[]; onSelect: (t: Transaction) => void }) {
  return <div className="space-y-7"><SectionHeading eyebrow="Audit trail / immutable-style demo log" title="Every decision has a reason" detail="Events below are created by the recovery workflow, not disconnected presentation data." action={<StatusTag tone="success">{events.length} events on record</StatusTag>} /><div className="grid gap-4 lg:grid-cols-[1fr_.72fr]"><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-7"><div className="mb-7 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2D6BFF]/25 bg-[#2D6BFF]/10 text-[#6EA8FF]"><FileClock className="h-4 w-4" /></div><div><div className="text-sm font-semibold text-white">Transaction recovery journey</div><div className="font-mono text-[9px] uppercase tracking-[.14em] text-[#63728A]">featured case / TXN_847291</div></div></div><div className="relative space-y-0 pl-3">{events.map((event, index) => <div key={event.id} className="relative flex gap-4 pb-7"><div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#2D6BFF]/35 bg-[#0E1C30] text-[#6EA8FF]"><CircleDot className="h-3 w-3" /></div>{index !== events.length - 1 && <div className="absolute left-[12px] top-7 h-full w-px bg-gradient-to-b from-[#2D6BFF]/50 to-white/5" />}<div className="min-w-0 flex-1 rounded-[10px] border border-white/[.07] bg-white/[.025] p-3.5"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-semibold text-white">{event.action}</div><span className="font-mono text-[10px] text-[#63728A]">{event.timestamp}</span></div><div className="mt-2 grid gap-2 text-[10px] leading-5 text-[#8190A5] sm:grid-cols-2"><div><span className="font-mono uppercase tracking-[.1em] text-[#5E6E85]">Reason</span><p>{event.reason}</p></div><div><span className="font-mono uppercase tracking-[.1em] text-[#5E6E85]">Result</span><p className={event.tone === "success" ? "text-[#82E4B5]" : "text-[#B9C4D2]"}>{event.result}</p></div></div><div className="mt-3 flex flex-wrap gap-2"><span className="font-mono text-[9px] uppercase tracking-[.12em] text-[#6A7990]">Actor: <span className="text-[#9FC4FF]">{event.actor}</span></span><span className="font-mono text-[9px] uppercase tracking-[.12em] text-[#6A7990]">Confidence: <span className="text-[#9FC4FF]">{event.confidence}%</span></span><span className="font-mono text-[9px] uppercase tracking-[.12em] text-[#6A7990]">Policy: <span className="text-[#B9C4D2]">{event.policy}</span></span></div></div></div>)}</div></section><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-6"><div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[.18em] text-[#6EA8FF]"><Database className="h-3 w-3" />Trace explorer</div><h2 className="text-lg font-semibold text-white">Recent transactions</h2></div><div className="space-y-2">{transactions.slice(0, 8).map((t) => <button type="button" key={t.transaction_id} onClick={() => onSelect(t)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/[.06] bg-white/[.02] p-3 text-left hover:border-white/[.15]"><div className="min-w-0"><div className="truncate font-mono text-[10px] text-[#9FC4FF]">{t.transaction_id}</div><div className="mt-1 truncate text-[10px] text-[#6C7B91]">{t.customer_name} · {t.failure_reason}</div></div><StatusTag tone={t.recovery_status === "recovered" ? "success" : t.escalation_required ? "warning" : "cobalt"}>{t.recovery_status}</StatusTag></button>)}</div></section></div></div>;
}

function SettingsView({ onToggleDemo, demoMode }: { onToggleDemo: () => void; demoMode: boolean }) {
  return <div className="space-y-7"><SectionHeading eyebrow="System settings / guardrails" title="Configure the command center" detail="The demo keeps settings client-side; no secrets or payment credentials are stored." /><div className="grid gap-4 lg:grid-cols-2"><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-6 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2D6BFF]/25 bg-[#2D6BFF]/10 text-[#6EA8FF]"><Settings2 className="h-4 w-4" /></div><div><h2 className="text-sm font-semibold text-white">Workspace controls</h2><p className="mt-1 text-[10px] text-[#718198]">Operational context for this session.</p></div></div><div className="space-y-2"><button type="button" onClick={onToggleDemo} className="flex w-full items-center justify-between rounded-lg border border-white/[.07] bg-white/[.025] p-3 text-left"><div><div className="text-xs font-semibold text-white">Demo mode</div><div className="mt-1 text-[10px] text-[#718198]">Clearly label simulated data and allow safe recovery actions.</div></div><span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${demoMode ? "bg-[#2D6BFF]" : "bg-white/15"}`}><span className={`block h-4 w-4 rounded-full bg-white transition-transform ${demoMode ? "translate-x-4" : "translate-x-0"}`} /></span></button><div className="flex items-center justify-between rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div><div className="text-xs font-semibold text-white">Recovery retry policy</div><div className="mt-1 text-[10px] text-[#718198]">Maximum one automated retry per transaction.</div></div><StatusTag tone="success">enforced</StatusTag></div><div className="flex items-center justify-between rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div><div className="text-xs font-semibold text-white">Human approval threshold</div><div className="mt-1 text-[10px] text-[#718198]">Confidence below 80% or high-risk cases.</div></div><span className="font-mono text-xs text-[#F6C978]">80%</span></div></div></section><section className="rounded-[14px] border border-white/[.08] bg-[#0A1320] p-5 sm:p-6"><div className="mb-6 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#45C491]/25 bg-[#45C491]/10 text-[#45C491]"><ShieldCheck className="h-4 w-4" /></div><div><h2 className="text-sm font-semibold text-white">Trust & safety</h2><p className="mt-1 text-[10px] text-[#718198]">Boundaries that keep automation accountable.</p></div></div><div className="space-y-3 text-xs text-[#AAB7C8]"><div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#45C491]" /><span>PII minimized in the demo layer; customer identities are fictional.</span></div><div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#45C491]" /><span>Actions create an audit event and update derived KPIs.</span></div><div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#45C491]" /><span>AI recommendations expose confidence, policy, and expected recovery.</span></div><div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#45C491]" /><span>AI fallback is conceptually rule-based when confidence is low.</span></div></div></section></div></div>;
}

function TransactionDrawer({ transaction, onClose, onRecover, onApprove, onEvidence, recovering }: { transaction: Transaction; onClose: () => void; onRecover: () => void; onApprove: () => void; onEvidence: () => void; recovering: boolean }) {
  const risk = getRiskLevel(transaction);
  return <><div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" onClick={onClose} /><aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-white/[.1] bg-[#08111D] shadow-2xl"><div className="flex items-center justify-between border-b border-white/[.08] px-5 py-4"><div><div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#6EA8FF]">Transaction intelligence</div><div className="mt-1 font-mono text-xs font-semibold text-white">{transaction.transaction_id}</div></div><button type="button" onClick={onClose} aria-label="Close transaction details" className="rounded-lg p-2 text-[#728198] hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div><div className="flex-1 overflow-y-auto p-5"><div className="flex items-start justify-between gap-4"><div><div className="text-2xl font-semibold tracking-[-.05em] text-white">{formatINR(transaction.amount)}</div><div className="mt-1 text-xs text-[#78879C]">{transaction.customer_name} · {transaction.customer_segment}</div></div><RiskBadge transaction={transaction} /></div><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div className="font-mono text-[9px] uppercase tracking-[.11em] text-[#63728A]">Revenue at risk</div><div className="mt-1 text-lg font-semibold text-[#FF9D93]">{formatINR(transaction.revenue_at_risk)}</div></div><div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div className="font-mono text-[9px] uppercase tracking-[.11em] text-[#63728A]">Recovery score</div><div className="mt-1 text-lg font-semibold text-[#9FC4FF]">{transaction.recovery_score}<span className="text-xs text-[#627189]">/100</span></div></div></div><div className="mt-5 rounded-[12px] border border-[#2D6BFF]/20 bg-[#0C1A2D] p-4"><div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#9FC4FF]"><Bot className="h-3.5 w-3.5" />AI diagnosis</div><p className="text-xs leading-5 text-[#C2CCD9]">{transaction.failure_reason === "—" ? "Payment captured successfully. No recovery intervention is required." : `The payment was flagged for ${transaction.failure_reason.toLowerCase()}. Historical behavior and payment context suggest a ${transaction.recovery_probability}% recovery probability.`}</p><div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[.07] pt-3"><div><div className="font-mono text-[9px] uppercase tracking-[.11em] text-[#63728A]">Recommended action</div><div className="mt-1 text-xs font-semibold text-white">{transaction.recommended_action}</div></div><div><div className="font-mono text-[9px] uppercase tracking-[.11em] text-[#63728A]">AI confidence</div><div className="mt-1 font-mono text-xs font-semibold text-[#6DDBA8]">{transaction.AI_confidence}%</div></div></div></div><div className="mt-6"><div className="mb-3 flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#63728A]">Recovery journey</div><StatusTag tone={transaction.recovery_status === "recovered" ? "success" : transaction.escalation_required ? "warning" : "cobalt"}>{transaction.recovery_status}</StatusTag></div><div className="rounded-lg border border-white/[.07] bg-white/[.02] p-4"><div className="flex items-center justify-between">{["Payment", "Failure", "Diagnosis", "Decision", "Action", "Verify"].map((step, index) => <div key={step} className="flex flex-col items-center gap-2"><div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-mono ${index < 3 || transaction.recovery_status === "recovered" ? "border-[#2D6BFF]/60 bg-[#2D6BFF]/15 text-[#9FC4FF]" : "border-white/10 text-[#63728A]"}`}>{index < 3 ? <Check className="h-3 w-3" /> : index + 1}</div><span className="text-[8px] uppercase tracking-[.08em] text-[#68788F]">{step}</span></div>)}</div></div></div><div className="mt-6 space-y-2"><div className="flex items-center justify-between border-b border-white/[.06] pb-2 text-[11px]"><span className="text-[#63728A]">Payment ID</span><span className="font-mono text-[#B5C1D0]">{transaction.payment_id}</span></div><div className="flex items-center justify-between border-b border-white/[.06] pb-2 text-[11px]"><span className="text-[#63728A]">Order ID</span><span className="font-mono text-[#B5C1D0]">{transaction.order_id}</span></div><div className="flex items-center justify-between border-b border-white/[.06] pb-2 text-[11px]"><span className="text-[#63728A]">Payment method</span><span className="text-[#B5C1D0]">{transaction.payment_method}</span></div><div className="flex items-center justify-between border-b border-white/[.06] pb-2 text-[11px]"><span className="text-[#63728A]">Failure code</span><span className="font-mono text-[#B5C1D0]">{transaction.failure_code}</span></div><div className="flex items-center justify-between border-b border-white/[.06] pb-2 text-[11px]"><span className="text-[#63728A]">Retry history</span><span className="font-mono text-[#B5C1D0]">{transaction.retry_count} attempt{transaction.retry_count === 1 ? "" : "s"}</span></div></div></div><div className="border-t border-white/[.08] p-5"><div className="flex gap-2">{transaction.escalation_required ? <ActionButton onClick={onApprove}><ShieldCheck className="h-3.5 w-3.5" />Approve bounded action</ActionButton> : <ActionButton onClick={onRecover} disabled={recovering || transaction.recovery_status === "recovered"}>{recovering ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}{recovering ? "Executing…" : transaction.recovery_status === "recovered" ? "Recovered" : "Execute recovery"}</ActionButton>}<ActionButton tone="quiet" onClick={onEvidence}><FileClock className="h-3.5 w-3.5" />Evidence packet</ActionButton></div></div></aside></>;
}

function EvidenceModal({ transaction, events, onClose }: { transaction: Transaction; events: AuditEvent[]; onClose: () => void }) {
  const packet = evidencePacket(transaction, events);
  const packetJson = JSON.stringify(packet, null, 2);
  const transactionEvents = events.filter((event) => event.transaction_id === transaction.transaction_id);
  return <><div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={onClose} /><section role="dialog" aria-modal="true" aria-labelledby="evidence-title" className="fixed left-1/2 top-1/2 z-[70] flex max-h-[88vh] w-[calc(100%-2rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[16px] border border-white/[.12] bg-[#08111D] shadow-2xl"><div className="flex items-center justify-between border-b border-white/[.08] px-5 py-4"><div><div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-[#6EA8FF]"><FileClock className="h-3.5 w-3.5" />Evidence packet</div><h2 id="evidence-title" className="text-base font-semibold text-white">{transaction.transaction_id} · {transaction.customer_name}</h2></div><button type="button" onClick={onClose} aria-label="Close evidence packet" className="rounded-lg p-2 text-[#718198] hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div><div className="flex-1 overflow-y-auto p-5"><div className="mb-4 rounded-lg border border-[#F6B34C]/20 bg-[#F6B34C]/[.06] p-3 text-[10px] leading-5 text-[#C8B17C]">Simulated evidence for the Razorpay AI Revenue Recovery track. This packet is generated from the current transaction and audit state.</div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div className="font-mono text-[9px] uppercase tracking-[.11em] text-[#63728A]">Decision</div><div className="mt-1 text-xs font-semibold text-[#9FC4FF]">{transaction.recommended_action}</div></div><div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div className="font-mono text-[9px] uppercase tracking-[.11em] text-[#63728A]">Policy</div><div className="mt-1 text-xs font-semibold text-[#6DDBA8]">{transaction.escalation_required ? "Review required" : "Policy cleared"}</div></div><div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3"><div className="font-mono text-[9px] uppercase tracking-[.11em] text-[#63728A]">Events</div><div className="mt-1 text-xs font-semibold text-white">{transactionEvents.length} on record</div></div></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div><div className="mb-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#63728A]">Evidence summary</div><div className="space-y-2 rounded-lg border border-white/[.07] bg-white/[.02] p-3 text-[11px]"><div className="flex justify-between gap-3"><span className="text-[#718198]">Failure</span><span className="text-right text-[#D5DDE8]">{transaction.failure_reason} · {transaction.failure_code}</span></div><div className="flex justify-between gap-3"><span className="text-[#718198]">Amount</span><span className="font-mono text-[#D5DDE8]">{formatINR(transaction.amount)}</span></div><div className="flex justify-between gap-3"><span className="text-[#718198]">Recovery probability</span><span className="font-mono text-[#6DDBA8]">{transaction.recovery_probability}%</span></div><div className="flex justify-between gap-3"><span className="text-[#718198]">AI confidence</span><span className="font-mono text-[#9FC4FF]">{transaction.AI_confidence}%</span></div><div className="flex justify-between gap-3"><span className="text-[#718198]">Retry count</span><span className="font-mono text-[#D5DDE8]">{transaction.retry_count}</span></div></div></div><div><div className="mb-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#63728A]">Policy checks</div><div className="space-y-2">{packet.policy_checks.map((check) => <div key={check.check} className="rounded-lg border border-white/[.07] bg-white/[.02] p-3"><div className="flex items-center justify-between gap-3 text-[11px]"><span className="font-semibold text-[#D5DDE8]">{check.check}</span><StatusTag tone={check.result === "pass" || check.result === "not_required" ? "success" : "warning"}>{check.result}</StatusTag></div><div className="mt-1.5 text-[10px] leading-4 text-[#718198]">{check.detail}</div></div>)}</div></div></div><div className="mt-5"><div className="mb-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#63728A]">Audit evidence</div><div className="space-y-2">{transactionEvents.length ? transactionEvents.map((event) => <div key={event.id} className="flex gap-3 rounded-lg border border-white/[.07] bg-white/[.02] p-3"><div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6EA8FF]" /><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2 text-[11px] font-semibold text-white"><span>{event.action}</span><span className="font-mono text-[9px] text-[#63728A]">{event.timestamp}</span></div><div className="mt-1 text-[10px] leading-4 text-[#718198]">{event.reason} · {event.result}</div></div></div>) : <div className="rounded-lg border border-white/[.07] bg-white/[.02] p-3 text-[10px] text-[#718198]">No audit events have been recorded for this transaction yet.</div>}</div></div></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[.08] p-4"><span className="font-mono text-[9px] uppercase tracking-[.12em] text-[#5F6F86]">JSON packet · {packetJson.length.toLocaleString("en-IN")} bytes</span><div className="flex gap-2"><ActionButton tone="quiet" onClick={() => { navigator.clipboard?.writeText(packetJson); toast.success("Evidence copied", { description: "The evidence packet JSON is ready to paste into a case record." }); }}><FileClock className="h-3.5 w-3.5" />Copy JSON</ActionButton><ActionButton onClick={() => { downloadTextFile(packetJson, `recoverai-evidence-${transaction.transaction_id}.json`, "application/json;charset=utf-8"); toast.success("Evidence downloaded", { description: "The evidence packet is saved as a JSON file." }); }}><Download className="h-3.5 w-3.5" />Download packet</ActionButton></div></div></section></>;
}

function buildTrendData(transactions: Transaction[]) {
  return Array.from({ length: 7 }, (_, index) => { const dayIndex = 6 - index; const rows = transactions.filter((t) => Math.floor(t.time_at_risk_hours / 24) === dayIndex); return { label: index === 6 ? "Today" : `${dayIndex}d ago`, risk: rows.reduce((sum, t) => sum + (t.recovery_status === "recovered" ? 0 : t.revenue_at_risk), 0), recovered: rows.filter((t) => t.recovery_status === "recovered").reduce((sum, t) => sum + t.amount, 0) }; });
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateTransactions(180));
  const [events, setEvents] = useState<AuditEvent[]>(() => getAuditEvents());
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [evidence, setEvidence] = useState<Transaction | null>(null);
  const [recovering, setRecovering] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange>("7d");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All risk");
  const [methodFilter, setMethodFilter] = useState("All methods");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(true);

  const filteredTransactions = useMemo(() => transactions.filter((t) => range === "all" || (range === "24h" ? t.time_at_risk_hours <= 24 : t.time_at_risk_hours <= 168)), [transactions, range]);
  const metrics = useMemo(() => calculateMetrics(filteredTransactions), [filteredTransactions]);

  useEffect(() => { if (selected) setSelected(transactions.find((t) => t.transaction_id === selected.transaction_id) || null); }, [transactions, selected]);

  const navigate = (view: ViewKey) => { setActiveView(view); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const exportCurrentRows = (rows: Transaction[]) => { exportTransactionWorkbook(rows); toast.success("Transaction workbook ready", { description: `${rows.length} filtered transaction rows were downloaded as an Excel workbook.` }); };
  const exportAnalyticsReport = () => { exportAnalyticsPdf(filteredTransactions); toast.success("Analytics report ready", { description: "The current recovery metrics and diagrams were downloaded as a PDF." }); };
  const appendEvent = (transaction: Transaction, action: string, reason: string, result: string, actor: AuditEvent["actor"], tone: AuditEvent["tone"] = "info") => setEvents((current) => [{ id: `evt-${Date.now()}`, timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false }), actor, action, reason, result, confidence: transaction.AI_confidence, policy: transaction.escalation_required ? "Human approval required" : "Automatic recovery permitted", transaction_id: transaction.transaction_id, tone }, ...current]);
  const recover = (transaction: Transaction) => {
    if (transaction.escalation_required) { appendEvent(transaction, "Recovery paused for human approval", "Risk or confidence threshold requires a reviewer", "Awaiting Finance Admin", "SYSTEM", "warning"); toast.warning("Human approval required", { description: "This case is bounded until Finance Admin approves the recommended action." }); setSelected(transaction); return; }
    setRecovering(transaction.transaction_id); toast.info("Recovery workflow started", { description: `${transaction.recommended_action} is running within policy.` });
    appendEvent(transaction, `${transaction.recommended_action} initiated`, "Policy check passed; bounded to one attempt", "In progress", "SYSTEM", "warning");
    window.setTimeout(() => { const success = transaction.transaction_id === "TXN_847291" || Number(transaction.transaction_id.slice(-1)) % 4 !== 0; setTransactions((current) => current.map((item) => item.transaction_id === transaction.transaction_id ? { ...item, recovery_status: success ? "recovered" : "failed", payment_status: success ? "recovered" : "failed", revenue_at_risk: success ? 0 : item.revenue_at_risk, next_action: success ? "Outcome verified" : "Escalate to finance team", updated_at: new Date().toISOString() } : item)); appendEvent(transaction, success ? "Payment recovered" : "Recovery action failed", success ? "Issuer accepted the retry" : "Issuer declined the bounded retry", success ? `${formatINR(transaction.amount)} added to recovered revenue` : "Exception created for review", "SYSTEM", success ? "success" : "danger"); toast[success ? "success" : "error"](success ? "Revenue recovered" : "Recovery needs review", { description: success ? `${formatINR(transaction.amount)} verified and added to recovered revenue.` : "The retry failed safely; the case is now visible in Exceptions." }); setRecovering(null); }, 900);
  };
  const approve = (transaction: Transaction) => { setTransactions((current) => current.map((item) => item.transaction_id === transaction.transaction_id ? { ...item, escalation_required: false, recovery_status: "open", next_action: item.recommended_action } : item)); appendEvent(transaction, "Finance Admin approved recovery", "Reviewer validated evidence and policy boundary", "Action released to queue", "FINANCE ADMIN", "success"); toast.success("Action approved", { description: "The bounded recovery action is now available to execute." }); };

  return <div className="min-h-screen bg-[#05080F] text-[#E8EDF5] selection:bg-[#2D6BFF]/30"><div className="flex min-h-screen"><aside className={`fixed inset-y-0 left-0 z-50 flex w-[244px] flex-col border-r border-white/[.08] bg-[#07101B] transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}><div className="flex h-[72px] items-center justify-between border-b border-white/[.08] px-5"><button type="button" onClick={() => navigate("overview")} className="flex items-center gap-3 text-left"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2D6BFF]/40 bg-[#2D6BFF]/10"><img src="/manus-storage/recoverai-mark_f1dd28fc.png" alt="RecoverAI mark" className="h-6 w-6 object-contain" /></div><div><div className="text-sm font-bold tracking-[-.03em] text-white">Recover<span className="text-[#6EA8FF]">AI</span></div><div className="font-mono text-[8px] uppercase tracking-[.18em] text-[#5E6E85]">revenue intelligence</div></div></button><button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-[#65748A] hover:bg-white/10 lg:hidden"><X className="h-4 w-4" /></button></div><div className="px-4 pt-5"><div className="mb-3 flex items-center justify-between px-2 text-[9px] font-mono uppercase tracking-[.2em] text-[#526177]"><span>Command center</span><Command className="h-3 w-3" /></div><nav className="space-y-1">{navItems.map(({ id, label, icon: Icon, count }) => <button type="button" key={id} onClick={() => navigate(id)} className={`group flex w-full items-center justify-between rounded-[9px] px-3 py-2.5 text-left text-xs transition-all ${activeView === id ? "bg-[#2D6BFF]/12 text-white shadow-[inset_2px_0_0_#2D6BFF]" : "text-[#79889D] hover:bg-white/[.045] hover:text-[#D7E0EB]"}`}><span className="flex items-center gap-3"><Icon className={`h-4 w-4 ${activeView === id ? "text-[#6EA8FF]" : "text-[#5F6E84] group-hover:text-[#9AAAC0]"}`} />{label}</span>{count && <span className="rounded-full border border-[#45C491]/20 bg-[#45C491]/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[.1em] text-[#6DDBA8]">{count}</span>}</button>)}</nav></div><div className="mt-auto p-4"><div className="rounded-[11px] border border-white/[.07] bg-white/[.025] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#AEBAC9]"><span className="h-1.5 w-1.5 rounded-full bg-[#45C491] shadow-[0_0_10px_#45C491]" />System operational</div><div className="mt-2 font-mono text-[9px] leading-4 text-[#5F6F86]">Demo environment · 180 records<br />Last event {events[0]?.timestamp || "—"}</div></div><button type="button" onClick={() => navigate("settings")} className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#65748A] hover:bg-white/[.045] hover:text-white"><Settings2 className="h-4 w-4" />Settings</button></div></aside><div className={`fixed inset-0 z-40 bg-black/50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`} onClick={() => setSidebarOpen(false)} /><main className="min-w-0 flex-1 lg:ml-[244px]"><header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-white/[.08] bg-[#05080F]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg border border-white/[.08] bg-white/[.025] p-2 text-[#9AA9BC] lg:hidden"><Menu className="h-4 w-4" /></button><div className="hidden min-w-0 items-center gap-3 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2D6BFF]/30 bg-[#2D6BFF]/10"><img src="/manus-storage/recoverai-mark_f1dd28fc.png" alt="RecoverAI mark" className="h-5 w-5 object-contain" /></div><div className="min-w-0"><div className="flex items-center gap-1 text-sm font-bold tracking-[-.03em] text-white">Recover<span className="text-[#2D6BFF]">AI</span><span className="ml-1 font-mono text-[8px] font-medium uppercase tracking-[.18em] text-[#5E6E85]">/ {activeView}</span></div><div className="mt-1 truncate text-[10px] text-[#74839A]">Revenue recovery command center</div></div></div><div className="sm:hidden"><div className="text-sm font-bold text-white">Recover<span className="text-[#6EA8FF]">AI</span></div></div></div><div className="flex items-center gap-2"><div className="relative hidden md:block"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5D6E85]" /><input value={search} onChange={(e) => { setSearch(e.target.value); if (e.target.value) setActiveView("transactions"); }} placeholder="Search transactions…" className="h-9 w-[210px] rounded-lg border border-white/[.08] bg-white/[.025] pl-9 pr-3 text-[11px] text-white outline-none placeholder:text-[#5C6C83] focus:border-[#2D6BFF]/60" /></div><div className="relative"><button type="button" onClick={() => setAlertsOpen((value) => !value)} aria-label="Open notifications" className="relative rounded-lg border border-white/[.08] bg-white/[.025] p-2 text-[#91A0B6] hover:bg-white/[.07] hover:text-white"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#F6B34C]" /></button>{alertsOpen && <div className="absolute right-0 top-11 w-72 rounded-[12px] border border-white/[.1] bg-[#0C1725] p-3 shadow-2xl"><div className="flex items-center justify-between border-b border-white/[.07] pb-2"><span className="text-xs font-semibold text-white">Live alerts</span><span className="font-mono text-[9px] text-[#F6C978]">3 open</span></div><div className="space-y-2 pt-2 text-[10px] text-[#9BA9BB]"><div className="rounded-lg bg-white/[.03] p-2"><span className="text-[#F6C978]">Review required</span> · High-value payment detected.</div><div className="rounded-lg bg-white/[.03] p-2"><span className="text-[#6EA8FF]">AI update</span> · Model confidence recalibrated.</div></div></div>}</div><div className="relative"><button type="button" onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-lg border border-white/[.08] bg-white/[.025] p-1.5 pr-2.5 hover:bg-white/[.07]"><div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2D6BFF]/15 text-[#9FC4FF]"><UserRound className="h-3.5 w-3.5" /></div><span className="hidden text-[10px] font-semibold text-[#C7D1DE] sm:block">Northstar Labs</span><ChevronDown className="h-3 w-3 text-[#6B7A90]" /></button>{profileOpen && <div className="absolute right-0 top-11 w-48 rounded-[12px] border border-white/[.1] bg-[#0C1725] p-2 shadow-2xl"><div className="border-b border-white/[.07] px-2 pb-2"><div className="text-xs font-semibold text-white">Northstar Labs</div><div className="mt-1 font-mono text-[9px] text-[#627189]">merchant workspace</div></div><button type="button" onClick={() => navigate("settings")} className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[11px] text-[#9CAABD] hover:bg-white/[.06] hover:text-white"><Settings2 className="h-3.5 w-3.5" />Workspace settings</button></div>}</div></div></header><div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{activeView !== "overview" && <ViewSignalHeader view={activeView} />}{activeView === "overview" && <Overview transactions={filteredTransactions} metrics={metrics} onNavigate={navigate} onSelect={setSelected} onRecover={recover} recovering={recovering} range={range} setRange={setRange} />}{activeView === "transactions" && <TransactionsView transactions={filteredTransactions} onSelect={setSelected} onRecover={recover} onExport={exportCurrentRows} recovering={recovering} search={search} setSearch={setSearch} riskFilter={riskFilter} setRiskFilter={setRiskFilter} methodFilter={methodFilter} setMethodFilter={setMethodFilter} />}{activeView === "recovery" && <RecoveryView transactions={filteredTransactions} onSelect={setSelected} onRecover={recover} recovering={recovering} />}{activeView === "intelligence" && <IntelligenceView transactions={filteredTransactions} onSelect={setSelected} />}{activeView === "customers" && <CustomersView transactions={filteredTransactions} onSelect={setSelected} />}{activeView === "analytics" && <AnalyticsView transactions={filteredTransactions} onDownload={exportAnalyticsReport} />}{activeView === "audit" && <AuditView events={events} transactions={filteredTransactions} onSelect={setSelected} />}{activeView === "settings" && <SettingsView onToggleDemo={() => { setDemoMode((value) => !value); toast.info(demoMode ? "Demo mode paused" : "Demo mode enabled"); }} demoMode={demoMode} />}</div>{activeView === "overview" && <CinematicFooter />}</main></div>{selected && <TransactionDrawer transaction={selected} onClose={() => setSelected(null)} onRecover={() => recover(selected)} onApprove={() => approve(selected)} onEvidence={() => setEvidence(selected)} recovering={recovering === selected.transaction_id} />}{evidence && <EvidenceModal transaction={evidence} events={events} onClose={() => setEvidence(null)} />}</div>;
}
