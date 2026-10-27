import type { Member } from '@healthgrid/shared';

export const SYNTHETIC_MEMBERS: Member[] = [
  {
    member_id: 'MEM-992812',
    payer_member_ref: 'HMO-NG-4481',
    plan_id: 'PLAN-GOLD-01',
    plan_name: 'Comprehensive Health Gold',
    full_name: 'Amina O. Suleiman',
    gender: 'Female',
    status: 'Active',
    effective_start: '2026-01-01',
    effective_end: '2026-12-31',
    hmo_name: 'Reliance HMO'
  },
  {
    member_id: 'MEM-883104',
    payer_member_ref: 'HMO-NG-1129',
    plan_id: 'PLAN-SILVER-02',
    plan_name: 'Standard Care Silver',
    full_name: 'Chidi K. Nwachukwu',
    gender: 'Male',
    status: 'Active',
    effective_start: '2026-03-15',
    effective_end: '2026-12-31',
    hmo_name: 'Hygeia HMO'
  }
];
