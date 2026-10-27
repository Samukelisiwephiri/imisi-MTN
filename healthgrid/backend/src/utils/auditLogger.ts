import type { AuditEvent } from '@healthgrid/shared';

const auditEvents: AuditEvent[] = [];

export function logAuditEvent(event: AuditEvent): void {
  auditEvents.push(event);
  console.log(
    `[AUDIT] ${event.timestamp} | ${event.request_id} | ${event.from_state} -> ${event.to_state} | ${event.actor_role}`
  );
}

export function getAuditLogs(requestId?: string): AuditEvent[] {
  return requestId
    ? auditEvents.filter((event) => event.request_id === requestId)
    : [...auditEvents];
}
