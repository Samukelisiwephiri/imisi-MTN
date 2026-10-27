import { Router } from 'express';
import {
  checkCompleteness,
  createAuthorisation,
  getAuthorisationById,
  listAuthorisations,
  processReviewAction
} from '../controllers/authorisationController';
import { getMemberEligibility } from '../controllers/eligibilityController';
import { getOperationsMetrics } from '../controllers/metricsController';
import { WorkflowEngine } from '../services/workflowEngine';

const router = Router();

router.get('/members/:id', getMemberEligibility);
router.post('/authorisations', createAuthorisation);
router.get('/authorisations', listAuthorisations);
router.post('/authorisations/check-completeness', checkCompleteness);
router.get('/authorisations/:id', getAuthorisationById);
router.post('/authorisations/:id/actions', processReviewAction);
router.get('/metrics/operations', getOperationsMetrics);
router.get('/audit-logs', (_req, res) => {
  res.status(200).json(WorkflowEngine.listAuditEvents());
});

export default router;
