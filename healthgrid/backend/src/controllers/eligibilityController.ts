import type { Request, Response } from 'express';
import { MockEligibilityAdapter } from '../services/mockAdapter';

export function getMemberEligibility(req: Request, res: Response): void {
  const member = MockEligibilityAdapter.lookupMember(req.params.id);
  if (!member) {
    res.status(404).json({ error: 'Member not found in synthetic database.' });
    return;
  }

  res.status(200).json(member);
}
