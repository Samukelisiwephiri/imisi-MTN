import type { NewAuthorisationRequest } from '@healthgrid/shared';

const URGENCIES = ['Routine', 'Urgent', 'Emergency'] as const;

export function validateAuthorisationInput(
  body: unknown
): { valid: true; value: NewAuthorisationRequest } | { valid: false; errors: string[] } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { valid: false, errors: ['Request body must be a JSON object.'] };
  }

  const input = body as Record<string, unknown>;
  const errors: string[] = [];
  const requiredFields = ['member_id', 'provider_id', 'service_category', 'requested_date', 'reason'] as const;
  for (const field of requiredFields) {
    if (typeof input[field] !== 'string' || input[field].trim().length === 0) {
      errors.push(`${field} is required.`);
    }
  }

  if (typeof input.urgency !== 'string' || !URGENCIES.includes(input.urgency as typeof URGENCIES[number])) {
    errors.push('urgency must be Routine, Urgent, or Emergency.');
  }

  if (input.supporting_documents !== undefined &&
      (!Array.isArray(input.supporting_documents) ||
        !input.supporting_documents.every((document) => typeof document === 'string'))) {
    errors.push('supporting_documents must be an array of strings.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      member_id: (input.member_id as string).trim(),
      provider_id: (input.provider_id as string).trim(),
      service_category: (input.service_category as string).trim(),
      requested_date: (input.requested_date as string).trim(),
      reason: (input.reason as string).trim(),
      urgency: input.urgency as NewAuthorisationRequest['urgency'],
      supporting_documents: input.supporting_documents as string[] | undefined
    }
  };
}
