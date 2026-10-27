import type { Member } from '@healthgrid/shared';
import { SYNTHETIC_MEMBERS } from '../models/seedData';

export class MockEligibilityAdapter {
  static lookupMember(memberId: string): Member | null {
    return SYNTHETIC_MEMBERS.find(
      (member) => member.member_id.toLowerCase() === memberId.trim().toLowerCase()
    ) ?? null;
  }
}
