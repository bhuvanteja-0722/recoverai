export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  services: {
    database: string;
    nim: string;
    razorpay: string;
  };
  timestamp: string;
}

export interface VerificationStatus {
  status: string;
  message: string;
  version: string;
}

export interface AuditEvent {
  id: string;
  action_type: string;
  actor: string;
  resource_id: string;
  details?: Record<string, unknown>;
  hash: string;
  timestamp: string;
}

export interface AuditStats {
  total_events: number;
  by_action_type: Record<string, number>;
  recent_events: AuditEvent[];
}

export interface EvaluationMetrics {
  total_evaluated: number;
  recovery_rate: number;
  avg_recovery_time_ms: number;
  success_by_action: Record<string, number>;
}

export interface RecoveryTool {
  name: string;
  description: string;
  parameters: string[];
  risk_level: 'low' | 'medium' | 'high';
}

export interface DiagnosisResult {
  transaction_id: string;
  failure_category: string;
  recoverable: boolean;
  recovery_likelihood: number;
  primary_cause: string;
  recommendation: {
    action: string;
    confidence: number;
    reasoning: string;
    estimated_recovery_likelihood: number;
    policy_approved: boolean;
  };
}

export type ApiState<T> =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'empty' }
  | { state: 'success'; data: T };
