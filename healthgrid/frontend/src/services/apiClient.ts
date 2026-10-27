import type {
  AuthorisationRequest,
  CompletenessResult,
  Member,
  NewAuthorisationRequest,
  OperationsMetrics
} from '@healthgrid/shared';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string; errors?: string[] } | null;
    throw new Error(payload?.error ?? payload?.errors?.join(' ') ?? `Request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export function lookupMember(memberId: string): Promise<Member> {
  return request<Member>(`/members/${encodeURIComponent(memberId)}`);
}

export function createAuthorisationRequest(
  payload: NewAuthorisationRequest
): Promise<AuthorisationRequest> {
  return request<AuthorisationRequest>('/authorisations', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getAuthorisations(): Promise<AuthorisationRequest[]> {
  return request<AuthorisationRequest[]>('/authorisations');
}

export function submitReviewAction(
  id: string,
  action: string,
  targetState: string,
  comment?: string
): Promise<AuthorisationRequest> {
  return request<AuthorisationRequest>(`/authorisations/${encodeURIComponent(id)}/actions`, {
    method: 'POST',
    body: JSON.stringify({ action, targetState, comment })
  });
}

export function getMetrics(): Promise<OperationsMetrics> {
  return request<OperationsMetrics>('/metrics/operations');
}

export function checkCompleteness(payload: Record<string, unknown>): Promise<CompletenessResult> {
  return request<CompletenessResult>('/authorisations/check-completeness', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
