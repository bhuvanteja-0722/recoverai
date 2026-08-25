// Night Operations style note: keep data authoritative, explainable, and easy to derive into operational views.

export type PaymentMethod = "UPI" | "Cards" | "Netbanking" | "Wallet" | "EMI" | "International cards";
export type PaymentStatus = "captured" | "failed" | "pending" | "authorized" | "refunded" | "partially_refunded" | "abandoned" | "retrying" | "recovered" | "escalated";
export type RecoveryStatus = "open" | "in_progress" | "recovered" | "failed" | "escalated" | "dismissed";
export type RiskLevel = "Critical" | "High" | "Medium" | "Low";
export type RecommendedAction = "Smart Retry" | "Payment Reminder" | "Generate Payment Link" | "Alternative Method" | "Finance Review" | "Hold for Review";

export interface Transaction {
  transaction_id: string;
  payment_id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  merchant: string;
  amount: number;
  currency: "INR";
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  failure_reason: string;
  failure_code: string;
  timestamp: string;
  retry_count: number;
  last_retry_at: string;
  customer_segment: "Enterprise" | "Growth" | "Scale" | "SMB";
  risk_score: number;
  recovery_score: number;
  revenue_at_risk: number;
  recommended_action: RecommendedAction;
  AI_confidence: number;
  recovery_status: RecoveryStatus;
  recovery_probability: number;
  next_action: string;
  escalation_required: boolean;
  created_at: string;
  updated_at: string;
  time_at_risk_hours: number;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: "AI" | "SYSTEM" | "MERCHANT" | "FINANCE ADMIN";
  action: string;
  reason: string;
  result: string;
  confidence: number;
  policy: string;
  transaction_id: string;
  tone: "info" | "success" | "warning" | "danger";
}

const NOW = new Date("2026-08-25T11:00:00+05:30");
const names = [
  "Ananya Mehta", "Rohan Shah", "Ishita Iyer", "Kabir Malhotra", "Nisha Kapoor", "Arjun Nair", "Mira Bhatia", "Dev Patel", "Sara Thomas", "Vihaan Rao", "Aarav Sethi", "Zoya Khan", "Neel Joshi", "Tara Menon", "Aditya Bose", "Rhea Fernandes", "Kunal Verma", "Meera Pillai", "Yash Arora", "Aditi Sen"
];
const merchants = ["Northstar Labs", "Aster Commerce", "Cedar & Co.", "Orbit Health", "Fieldnote Studio"];
const methods: PaymentMethod[] = ["UPI", "Cards", "Netbanking", "Wallet", "EMI", "International cards"];
const amounts = [249, 499, 799, 1299, 2499, 4999, 7499, 9999, 12499, 24999, 49999, 99999];
const segments: Transaction["customer_segment"][] = ["Enterprise", "Growth", "Scale", "SMB"];
const reasons = [
  { label: "Issuer decline", code: "ISSUER_DECLINED", action: "Smart Retry" as RecommendedAction },
  { label: "Insufficient funds", code: "FUNDS_LOW", action: "Payment Reminder" as RecommendedAction },
  { label: "Authentication failed", code: "AUTH_FAILED", action: "Alternative Method" as RecommendedAction },
  { label: "Network timeout", code: "NETWORK_TIMEOUT", action: "Smart Retry" as RecommendedAction },
  { label: "Expired card", code: "CARD_EXPIRED", action: "Generate Payment Link" as RecommendedAction },
  { label: "Customer abandoned", code: "CUSTOMER_ABANDONED", action: "Payment Reminder" as RecommendedAction },
  { label: "Risk check failed", code: "RISK_BLOCKED", action: "Finance Review" as RecommendedAction },
  { label: "Recurring payment failure", code: "RECURRING_FAILED", action: "Hold for Review" as RecommendedAction }
];

function seeded(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function isoHoursAgo(hours: number) {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function choose<T>(items: T[], seed: number) {
  return items[Math.floor(seeded(seed) * items.length)];
}

function deriveRisk(riskScore: number): RiskLevel {
  if (riskScore >= 84) return "Critical";
  if (riskScore >= 65) return "High";
  if (riskScore >= 38) return "Medium";
  return "Low";
}

export function getRiskLevel(transaction: Transaction): RiskLevel {
  return deriveRisk(transaction.risk_score);
}

export function generateTransactions(count = 180): Transaction[] {
  const generated: Transaction[] = [];
  for (let i = 0; i < count; i += 1) {
    const seed = i + 11;
    const amount = choose(amounts, seed * 1.31);
    const statusRoll = seeded(seed * 2.71);
    const payment_status: PaymentStatus = statusRoll < 0.45 ? "failed" : statusRoll < 0.63 ? "retrying" : statusRoll < 0.75 ? "pending" : statusRoll < 0.82 ? "abandoned" : statusRoll < 0.88 ? "recovered" : statusRoll < 0.94 ? "captured" : "escalated";
    const reason = choose(reasons, seed * 2.07);
    const risk_score = Math.round(28 + seeded(seed * 3.17) * 69);
    const recovery_probability = Math.round(42 + seeded(seed * 4.11) * 53);
    const AI_confidence = Math.round(72 + seeded(seed * 5.02) * 27);
    const recovery_score = Math.min(99, Math.round((amount / 99999) * 18 + recovery_probability * 0.48 + AI_confidence * 0.28 + (100 - risk_score) * 0.12));
    const failureRisk = payment_status === "recovered" || payment_status === "captured" ? 0 : payment_status === "escalated" ? 0.92 : 0.78;
    const riskLevel = deriveRisk(risk_score);
    const escalation_required = riskLevel === "Critical" || AI_confidence < 80 || reason.code === "RISK_BLOCKED" || (payment_status === "escalated");
    const hoursAgo = Math.round(1 + seeded(seed * 6.32) * 168);
    const timestamp = isoHoursAgo(hoursAgo);
    const recovery_status: RecoveryStatus = payment_status === "recovered" || payment_status === "captured" ? "recovered" : payment_status === "escalated" ? "escalated" : "open";
    generated.push({
      transaction_id: `TXN_${847300 + i}`,
      payment_id: `pay_${String(100000 + i * 37).padStart(8, "0")}`,
      order_id: `ord_${String(440000 + i * 19).padStart(7, "0")}`,
      customer_id: `cus_${String(82000 + (i % 67)).padStart(6, "0")}`,
      customer_name: choose(names, seed * 7.37),
      customer_email: `${choose(names, seed * 7.37).toLowerCase().replaceAll(" ", ".")}@demo-merchant.test`,
      merchant: choose(merchants, seed * 8.11),
      amount,
      currency: "INR",
      payment_method: choose(methods, seed * 9.13),
      payment_status,
      failure_reason: payment_status === "captured" || payment_status === "recovered" ? "—" : reason.label,
      failure_code: payment_status === "captured" || payment_status === "recovered" ? "—" : reason.code,
      timestamp,
      retry_count: Math.floor(seeded(seed * 10.31) * 4),
      last_retry_at: isoHoursAgo(Math.max(0.5, hoursAgo - 2)),
      customer_segment: choose(segments, seed * 11.07),
      risk_score,
      recovery_score,
      revenue_at_risk: Math.round(amount * failureRisk),
      recommended_action: reason.action,
      AI_confidence,
      recovery_status,
      recovery_probability,
      next_action: escalation_required ? "Finance approval required" : reason.action === "Smart Retry" ? "Retry after issuer cool-down" : "Send contextual payment prompt",
      escalation_required,
      created_at: timestamp,
      updated_at: isoHoursAgo(Math.max(0.25, hoursAgo - 0.4)),
      time_at_risk_hours: hoursAgo,
    });
  }

  const featured: Transaction = {
    transaction_id: "TXN_847291",
    payment_id: "pay_Q7X4A91B2",
    order_id: "ord_9081726",
    customer_id: "cus_847201",
    customer_name: "Ananya Mehta",
    customer_email: "ananya.mehta@demo-merchant.test",
    merchant: "Northstar Labs",
    amount: 12499,
    currency: "INR",
    payment_method: "Cards",
    payment_status: "failed",
    failure_reason: "Issuer decline",
    failure_code: "ISSUER_DECLINED",
    timestamp: isoHoursAgo(1.3),
    retry_count: 1,
    last_retry_at: isoHoursAgo(0.9),
    customer_segment: "Growth",
    risk_score: 88,
    recovery_score: 91,
    revenue_at_risk: 12499,
    recommended_action: "Smart Retry",
    AI_confidence: 93,
    recovery_status: "open",
    recovery_probability: 87,
    next_action: "Retry after issuer cool-down",
    escalation_required: false,
    created_at: isoHoursAgo(1.3),
    updated_at: isoHoursAgo(0.8),
    time_at_risk_hours: 1.3,
  };
  generated[0] = featured;
  return generated;
}

export function calculateMetrics(transactions: Transaction[]) {
  const atRisk = transactions.filter((t) => t.recovery_status === "open" || t.recovery_status === "in_progress" || t.recovery_status === "escalated");
  const recovered = transactions.filter((t) => t.recovery_status === "recovered");
  const revenueAtRisk = atRisk.reduce((sum, t) => sum + t.revenue_at_risk, 0);
  const recoveredRevenue = recovered.reduce((sum, t) => sum + t.amount, 0);
  const recoverableRevenue = atRisk.reduce((sum, t) => sum + Math.round(t.revenue_at_risk * t.recovery_probability / 100), 0);
  const attempted = transactions.filter((t) => t.recovery_status === "recovered" || t.recovery_status === "failed").length;
  const exceptions = transactions.filter((t) => t.escalation_required || t.recovery_status === "failed").length;
  return {
    analyzed: transactions.length,
    totalValue: transactions.reduce((sum, t) => sum + t.amount, 0),
    atRiskCount: atRisk.length,
    revenueAtRisk,
    recoveredRevenue,
    recoverableRevenue,
    recoveryRate: attempted ? Math.round((recovered.length / attempted) * 1000) / 10 : 0,
    automationRate: transactions.length ? Math.round(((transactions.length - exceptions) / transactions.length) * 1000) / 10 : 0,
    exceptions,
    failedRate: transactions.length ? Math.round((transactions.filter((t) => t.payment_status === "failed").length / transactions.length) * 1000) / 10 : 0,
    retrySuccessRate: transactions.length ? Math.round((recovered.filter((t) => t.retry_count > 0).length / Math.max(1, recovered.length)) * 1000) / 10 : 0,
    averageRecoveryTime: recovered.length ? Math.round(recovered.reduce((sum, t) => sum + t.time_at_risk_hours, 0) / recovered.length * 10) / 10 : 0,
    lowConfidence: transactions.filter((t) => t.AI_confidence < 80).length,
  };
}

export function getExceptions(transactions: Transaction[]) {
  return transactions.filter((t) => t.escalation_required || t.recovery_status === "failed").sort((a, b) => b.risk_score - a.risk_score).slice(0, 7);
}

export function getAuditEvents(featuredId = "TXN_847291"): AuditEvent[] {
  return [
    { id: "evt-1", timestamp: "10:41:02", actor: "SYSTEM", action: "Transaction detected as revenue-at-risk", reason: "Payment failed during capture", result: "Queued for diagnosis", confidence: 99, policy: "Monitor all failed captures", transaction_id: featuredId, tone: "info" },
    { id: "evt-2", timestamp: "10:41:03", actor: "AI", action: "AI diagnosed issuer decline", reason: "Issuer response code ISSUER_DECLINED", result: "Temporary failure likely", confidence: 93, policy: "Explainable diagnosis required", transaction_id: featuredId, tone: "info" },
    { id: "evt-3", timestamp: "10:41:04", actor: "AI", action: "Recovery probability calculated: 87%", reason: "4 of 5 prior payments succeeded", result: "High recovery likelihood", confidence: 87, policy: "Show confidence before action", transaction_id: featuredId, tone: "info" },
    { id: "evt-4", timestamp: "10:41:05", actor: "AI", action: "Smart Retry recommended", reason: "Customer history + temporary issuer pattern", result: "Expected recovery ₹12,499", confidence: 93, policy: "Automatic retry permitted", transaction_id: featuredId, tone: "warning" },
    { id: "evt-5", timestamp: "10:41:06", actor: "SYSTEM", action: "Policy check passed", reason: "Under retry threshold; no approval needed", result: "Action bounded to one attempt", confidence: 100, policy: "Retry max: 2 per 24h", transaction_id: featuredId, tone: "success" },
  ];
}

export function getFailureBreakdown(transactions: Transaction[]) {
  const counts = new Map<string, number>();
  transactions.forEach((t) => {
    if (t.failure_reason !== "—") counts.set(t.failure_reason, (counts.get(t.failure_reason) || 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
}

export function getMethodBreakdown(transactions: Transaction[]) {
  return methods.map((method) => {
    const rows = transactions.filter((t) => t.payment_method === method);
    const recovered = rows.filter((t) => t.recovery_status === "recovered").length;
    return { name: method === "International cards" ? "Intl. cards" : method, total: rows.length, recovered: rows.length ? Math.round((recovered / rows.length) * 100) : 0 };
  });
}

export function formatINR(value: number) {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)))}`;
}

export function formatCompactINR(value: number) {
  const absolute = Math.abs(value);
  if (absolute >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (absolute >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (absolute >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return formatINR(value);
}

export function riskLabel(t: Transaction) {
  return getRiskLevel(t);
}
