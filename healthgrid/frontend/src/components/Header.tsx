'use client';

export type PortalRole = 'provider' | 'insurer' | 'dashboard';

interface HeaderProps {
  role: PortalRole;
  setRole: (role: PortalRole) => void;
}

const ROLE_LABELS: Record<PortalRole, string> = {
  provider: 'Provider Console',
  insurer: 'Insurer Work Queue',
  dashboard: 'Operations Dashboard'
};

export default function Header({ role, setRole }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Transaction infrastructure</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">IMISI HealthGrid</h1>
          <p className="text-sm text-slate-500">AI-assisted payer-provider interoperability</p>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          Current view
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as PortalRole)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm"
          >
            {(Object.keys(ROLE_LABELS) as PortalRole[]).map((roleOption) => (
              <option key={roleOption} value={roleOption}>{ROLE_LABELS[roleOption]}</option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
