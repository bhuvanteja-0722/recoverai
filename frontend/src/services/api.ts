import type {
  HealthStatus,
  VerificationStatus,
  AuditStats,
  EvaluationMetrics,
  RecoveryTool,
  DiagnosisResult,
} from '../types';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(public code: string, message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        body.code || 'API_ERROR',
        body.message || `Request failed with status ${res.status}`,
        res.status
      );
    }

    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof TypeError) {
      throw new ApiError('NETWORK_ERROR', 'Unable to establish connection with RecoverAI.');
    }
    throw new ApiError('UNKNOWN_ERROR', 'An unexpected error occurred.');
  }
}

export const api = {
  health: {
    get: () => request<HealthStatus>('/health'),
  },
  verification: {
    status: () => request<VerificationStatus>('/verification/'),
  },
  audit: {
    stats: () => request<AuditStats>('/audit/stats'),
  },
  evaluate: {
    metrics: () => request<EvaluationMetrics>('/evaluate/metrics'),
  },
  tools: {
    list: () => request<RecoveryTool[]>('/tools/list'),
  },
  agent: {
    diagnose: (data: {
      transaction_id: string;
      merchant_id: string;
      amount: number;
      failure_reason: string;
      payment_method?: string;
    }) =>
      request<DiagnosisResult>('/agent/diagnose', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
