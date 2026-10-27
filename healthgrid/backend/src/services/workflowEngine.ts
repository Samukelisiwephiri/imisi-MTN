import { randomUUID } from 'node:crypto';
import type {
  AllowedAction,
  AuditEvent,
  AuthorisationRequest,
  NewAuthorisationRequest,
  WorkflowState
} from '@healthgrid/shared';
import { ACTION_FOR_TRANSITION, ALLOWED_STATE_TRANSITIONS } from '@healthgrid/shared/types/constraints';
import { getAuditLogs, logAuditEvent } from '../utils/auditLogger';

export class WorkflowError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'WorkflowError';
  }
}

const requestsStore = new Map<string, AuthorisationRequest>();

export class WorkflowEngine {
  static createRequest(data: NewAuthorisationRequest): AuthorisationRequest {
    const now = new Date().toISOString();
    const request: AuthorisationRequest = {
      ...data,
      request_id: `REQ-${randomUUID()}`,
      status: 'Submitted',
      submitted_at: now,
      last_updated_at: now,
      comments: []
    };

    requestsStore.set(request.request_id, request);
    logAuditEvent({
      audit_id: `AUD-${randomUUID()}`,
      request_id: request.request_id,
      actor_id: data.provider_id,
      actor_role: 'PROVIDER',
      action: 'SUBMIT',
      from_state: 'Draft',
      to_state: 'Submitted',
      timestamp: now
    });

    return request;
  }

  static transitionState(
    requestId: string,
    action: AllowedAction,
    targetState: WorkflowState,
    actorId: string,
    actorRole: string,
    comment?: string
  ): AuthorisationRequest {
    const request = requestsStore.get(requestId);
    if (!request) {
      throw new WorkflowError(`Request ${requestId} not found.`, 404);
    }

    const transitionKey = `${request.status}->${targetState}`;
    if (
      !ALLOWED_STATE_TRANSITIONS[request.status].includes(targetState) ||
      ACTION_FOR_TRANSITION[transitionKey] !== action
    ) {
      throw new WorkflowError(`Invalid action or state transition from ${request.status} to ${targetState}.`, 400);
    }

    const timestamp = new Date().toISOString();
    const fromState = request.status;
    const updatedRequest: AuthorisationRequest = {
      ...request,
      status: targetState,
      last_updated_at: timestamp,
      comments: comment
        ? [...(request.comments ?? []), `[${timestamp}] (${actorRole}): ${comment}`]
        : request.comments
    };

    requestsStore.set(requestId, updatedRequest);
    const auditEvent: AuditEvent = {
      audit_id: `AUD-${randomUUID()}`,
      request_id: requestId,
      actor_id: actorId,
      actor_role: actorRole,
      action,
      from_state: fromState,
      to_state: targetState,
      timestamp,
      reason: comment
    };
    logAuditEvent(auditEvent);

    return updatedRequest;
  }

  static getRequest(requestId: string): AuthorisationRequest | undefined {
    return requestsStore.get(requestId);
  }

  static listRequests(): AuthorisationRequest[] {
    return Array.from(requestsStore.values());
  }

  static listAuditEvents(): AuditEvent[] {
    return getAuditLogs();
  }
}
