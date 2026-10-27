export type WorkflowState =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'More Information Required'
  | 'Approved'
  | 'Declined'
  | 'Cancelled'
  | 'Closed';

export type AllowedAction =
  | 'SUBMIT'
  | 'REVIEW'
  | 'APPROVE'
  | 'DECLINE'
  | 'REQUEST_INFO'
  | 'CANCEL'
  | 'CLOSE';

export interface Member {
  member_id: string;
  payer_member_ref: string;
  plan_id: string;
  plan_name: string;
  full_name: string;
  gender: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  effective_start: string;
  effective_end: string;
  hmo_name: string;
}

export interface AuthorisationRequest {
  request_id: string;
  member_id: string;
  provider_id: string;
  service_category: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  requested_date: string;
  reason: string;
  status: WorkflowState;
  submitted_at: string;
  last_updated_at: string;
  supporting_documents?: string[];
  comments?: string[];
}

export interface AuditEvent {
  audit_id: string;
  request_id: string;
  actor_id: string;
  actor_role: string;
  action: AllowedAction;
  from_state: WorkflowState;
  to_state: WorkflowState;
  timestamp: string;
  reason?: string;
}

export type NewAuthorisationRequest = Pick<
  AuthorisationRequest,
  | 'member_id'
  | 'provider_id'
  | 'service_category'
  | 'urgency'
  | 'requested_date'
  | 'reason'
  | 'supporting_documents'
>;

export interface OperationsMetrics {
  total_requests: number;
  pending_queue: number;
  approved_count: number;
  declined_count: number;
  median_turnaround_hours: number;
  manual_touch_reduction: string;
}

export interface CompletenessResult {
  extractedFields: Record<string, unknown>;
  completenessFlag: boolean;
  missingFields: string[];
  summary: string;
}
