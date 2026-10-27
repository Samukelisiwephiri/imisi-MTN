import type { CompletenessResult } from '@healthgrid/shared';

const REQUIRED_FIELDS = ['member_id', 'provider_id', 'service_category', 'urgency', 'reason'];

export class AIService {
  static analyzeCompleteness(data: Record<string, unknown>): CompletenessResult {
    const missingFields = REQUIRED_FIELDS.filter((field) => {
      const value = data[field];
      return typeof value !== 'string' || value.trim().length === 0;
    });

    return {
      extractedFields: data,
      completenessFlag: missingFields.length === 0,
      missingFields,
      summary: missingFields.length === 0
        ? 'Completeness check passed: all required fields are populated.'
        : `Completeness check found missing fields: ${missingFields.join(', ')}.`
    };
  }
}
