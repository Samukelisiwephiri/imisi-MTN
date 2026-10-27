import type { AllowedAction, WorkflowState } from './index';

export const ALLOWED_STATE_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  Draft: ['Submitted', 'Cancelled'],
  Submitted: ['Under Review', 'More Information Required', 'Cancelled'],
  'Under Review': ['Approved', 'Declined', 'More Information Required', 'Cancelled'],
  'More Information Required': ['Submitted', 'Cancelled'],
  Approved: ['Closed'],
  Declined: ['Closed'],
  Cancelled: ['Closed'],
  Closed: []
};

export const ACTION_FOR_TRANSITION: Record<string, AllowedAction> = {
  'Draft->Submitted': 'SUBMIT',
  'Draft->Cancelled': 'CANCEL',
  'Submitted->Under Review': 'REVIEW',
  'Submitted->More Information Required': 'REQUEST_INFO',
  'Submitted->Cancelled': 'CANCEL',
  'Under Review->Approved': 'APPROVE',
  'Under Review->Declined': 'DECLINE',
  'Under Review->More Information Required': 'REQUEST_INFO',
  'Under Review->Cancelled': 'CANCEL',
  'More Information Required->Submitted': 'SUBMIT',
  'More Information Required->Cancelled': 'CANCEL',
  'Approved->Closed': 'CLOSE',
  'Declined->Closed': 'CLOSE',
  'Cancelled->Closed': 'CLOSE'
};
