import type { Request, Response } from 'express';
import type { AllowedAction, WorkflowState } from '@healthgrid/shared';
import { AIService } from '../services/aiService';
import { WorkflowEngine, WorkflowError } from '../services/workflowEngine';
import { validateAuthorisationInput } from '../utils/validator';

const ACTIONS: AllowedAction[] = [
  'SUBMIT',
  'REVIEW',
  'APPROVE',
  'DECLINE',
  'REQUEST_INFO',
  'CANCEL',
  'CLOSE'
];
const STATES: WorkflowState[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'More Information Required',
  'Approved',
  'Declined',
  'Cancelled',
  'Closed'
];

export function createAuthorisation(req: Request, res: Response): void {
  const validation = validateAuthorisationInput(req.body);
  if (!validation.valid) {
    res.status(400).json({ errors: validation.errors });
    return;
  }

  res.status(201).json(WorkflowEngine.createRequest(validation.value));
}

export function listAuthorisations(_req: Request, res: Response): void {
  res.status(200).json(WorkflowEngine.listRequests());
}

export function getAuthorisationById(req: Request, res: Response): void {
  const request = WorkflowEngine.getRequest(req.params.id);
  if (!request) {
    res.status(404).json({ error: 'Authorisation request not found.' });
    return;
  }

  res.status(200).json(request);
}

export function processReviewAction(req: Request, res: Response): void {
  if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
    res.status(400).json({ error: 'Request body must be a JSON object.' });
    return;
  }

  const { action, targetState, reviewer_id, comment } = req.body as Record<string, unknown>;
  if (!ACTIONS.includes(action as AllowedAction) || !STATES.includes(targetState as WorkflowState)) {
    res.status(400).json({ error: 'A valid action and targetState are required.' });
    return;
  }
  if (reviewer_id !== undefined && (typeof reviewer_id !== 'string' || reviewer_id.trim().length === 0)) {
    res.status(400).json({ error: 'reviewer_id must be a non-empty string.' });
    return;
  }
  if (comment !== undefined && typeof comment !== 'string') {
    res.status(400).json({ error: 'comment must be a string.' });
    return;
  }

  try {
    const updated = WorkflowEngine.transitionState(
      req.params.id,
      action as AllowedAction,
      targetState as WorkflowState,
      typeof reviewer_id === 'string' ? reviewer_id.trim() : 'HMO-REVIEWER-01',
      'INSURER_REVIEWER',
      typeof comment === 'string' ? comment.trim() : undefined
    );
    res.status(200).json(updated);
  } catch (error) {
    if (!(error instanceof WorkflowError)) {
      throw error;
    }
    res.status(error.statusCode).json({ error: error.message });
  }
}

export function checkCompleteness(req: Request, res: Response): void {
  if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
    res.status(400).json({ error: 'Request body must be a JSON object.' });
    return;
  }

  res.status(200).json(AIService.analyzeCompleteness(req.body as Record<string, unknown>));
}
