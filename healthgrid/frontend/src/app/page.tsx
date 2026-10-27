'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  AuthorisationRequest,
  CompletenessResult,
  Member,
  NewAuthorisationRequest,
  OperationsMetrics
} from '@healthgrid/shared';
import Header, { type PortalRole } from '../components/Header';
import {
  checkCompleteness,
  createAuthorisationRequest,
  getAuthorisations,
  getMetrics,
  lookupMember,
  submitReviewAction
} from '../services/apiClient';

const initialForm: NewAuthorisationRequest = {
  member_id: '',
  provider_id: 'PROVIDER-001',
  service_category: '',
  urgency: 'Routine',
  requested_date: new Date().toISOString().slice(0, 10),
  reason: ''
};

const actionOptions: Record<string, Array<{ action: string; target: string; label: string }>> = {
  Submitted: [
    { action: 'REVIEW', target: 'Under Review', label: 'Start review' },
    { action: 'REQUEST_INFO', target: 'More Information Required', label: 'Request information' },
    { action: 'CANCEL', target: 'Cancelled', label: 'Cancel' }
  ],
  'Under Review': [
    { action: 'APPROVE', target: 'Approved', label: 'Approve' },
    { action: 'DECLINE', target: 'Declined', label: 'Decline' },
    { action: 'REQUEST_INFO', target: 'More Information Required', label: 'Request information' },
    { action: 'CANCEL', target: 'Cancelled', label: 'Cancel' }
  ],
  'More Information Required': [
    { action: 'SUBMIT', target: 'Submitted', label: 'Resubmit' },
    { action: 'CANCEL', target: 'Cancelled', label: 'Cancel' }
  ],
  Approved: [{ action: 'CLOSE', target: 'Closed', label: 'Close' }],
  Declined: [{ action: 'CLOSE', target: 'Closed', label: 'Close' }],
  Cancelled: [{ action: 'CLOSE', target: 'Closed', label: 'Close' }]
};

function ErrorMessage({ message }: { message: string }) {
  return <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>;
}

function ProviderView({
  onRequestCreated
}: {
  onRequestCreated: () => void;
}) {
  const [memberId, setMemberId] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [completeness, setCompleteness] = useState<CompletenessResult | null>(null);

  async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setMember(null);
    try {
      const result = await lookupMember(memberId);
      setMember(result);
      setForm((current) => ({ ...current, member_id: result.member_id }));
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Eligibility lookup failed.');
    }
  }

  async function handleCompletenessCheck() {
    setError('');
    setNotice('');
    try {
      setCompleteness(await checkCompleteness(form));
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : 'Completeness check failed.');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await createAuthorisationRequest(form);
      setNotice('Authorisation request submitted.');
      setForm({ ...initialForm, requested_date: new Date().toISOString().slice(0, 10) });
      setMember(null);
      setMemberId('');
      setCompleteness(null);
      onRequestCreated();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit the request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="panel">
        <h2 className="section-title">Member eligibility</h2>
        <p className="section-copy">Look up a synthetic member before requesting care authorisation.</p>
        <form onSubmit={handleLookup} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            placeholder="e.g. MEM-992812"
            aria-label="Member ID"
            required
            className="field flex-1"
          />
          <button className="button-primary" type="submit">Check eligibility</button>
        </form>
        {member && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-bold text-emerald-900">{member.full_name} · {member.status}</p>
            <p className="mt-1 text-emerald-800">{member.plan_name} · {member.hmo_name}</p>
            <p className="mt-1 text-emerald-800">Coverage: {member.effective_start} to {member.effective_end}</p>
          </div>
        )}
        {error && <ErrorMessage message={error} />}
        <p className="mt-5 text-xs text-slate-500">
          Demo members: MEM-992812 and MEM-883104. Use synthetic data only.
        </p>
      </article>

      <article className="panel">
        <h2 className="section-title">New care authorisation</h2>
        <p className="section-copy">Enter request details and submit them to the insurer work queue.</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">Member ID
              <input className="field mt-1" required value={form.member_id} onChange={(event) => setForm({ ...form, member_id: event.target.value })} />
            </label>
            <label className="field-label">Provider ID
              <input className="field mt-1" required value={form.provider_id} onChange={(event) => setForm({ ...form, provider_id: event.target.value })} />
            </label>
            <label className="field-label">Service category
              <input className="field mt-1" required placeholder="e.g. Specialist consultation" value={form.service_category} onChange={(event) => setForm({ ...form, service_category: event.target.value })} />
            </label>
            <label className="field-label">Urgency
              <select className="field mt-1" value={form.urgency} onChange={(event) => setForm({ ...form, urgency: event.target.value as NewAuthorisationRequest['urgency'] })}>
                <option>Routine</option>
                <option>Urgent</option>
                <option>Emergency</option>
              </select>
            </label>
            <label className="field-label sm:col-span-2">Requested date
              <input type="date" className="field mt-1" required value={form.requested_date} onChange={(event) => setForm({ ...form, requested_date: event.target.value })} />
            </label>
          </div>
          <label className="field-label block">Reason
            <textarea className="field mt-1 min-h-24" required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="button-secondary" onClick={handleCompletenessCheck}>Check completeness</button>
            <button type="submit" className="button-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button>
          </div>
        </form>
        {completeness && (
          <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${completeness.completenessFlag ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
            {completeness.summary}
          </p>
        )}
        {notice && <p role="status" className="mt-3 text-sm font-semibold text-emerald-700">{notice}</p>}
        {error && <ErrorMessage message={error} />}
      </article>
    </section>
  );
}

function InsurerView({ refreshToken }: { refreshToken: number }) {
  const [requests, setRequests] = useState<AuthorisationRequest[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      setRequests(await getAuthorisations());
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load requests.');
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests, refreshToken]);

  async function handleAction(request: AuthorisationRequest, action: string, target: string) {
    setBusyId(request.request_id);
    setError('');
    try {
      await submitReviewAction(request.request_id, action, target);
      await loadRequests();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not update request.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <section className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="section-title">Insurer / HMO work queue</h2>
          <p className="section-copy">Review incoming authorisation requests and record workflow changes.</p>
        </div>
        <button className="button-secondary" onClick={() => void loadRequests()}>Refresh</button>
      </div>
      {error && <ErrorMessage message={error} />}
      {requests.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">No requests yet. Submit one from the provider console.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {requests.map((request) => (
            <article key={request.request_id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{request.service_category}</p>
                  <p className="mt-1 text-xs text-slate-500">{request.request_id} · Member {request.member_id} · {request.urgency}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{request.status}</span>
              </div>
              <p className="mt-3 text-sm text-slate-700">{request.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(actionOptions[request.status] ?? []).map((option) => (
                  <button
                    key={option.action + option.target}
                    className="button-secondary text-xs"
                    disabled={busyId === request.request_id}
                    onClick={() => void handleAction(request, option.action, option.target)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DashboardView({ refreshToken }: { refreshToken: number }) {
  const [metrics, setMetrics] = useState<OperationsMetrics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMetrics().then(setMetrics).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : 'Could not load operations metrics.');
    });
  }, [refreshToken]);

  const cards = metrics ? [
    ['Total requests', metrics.total_requests],
    ['Pending queue', metrics.pending_queue],
    ['Approved', metrics.approved_count],
    ['Declined', metrics.declined_count]
  ] as const : [];

  return (
    <section className="panel">
      <h2 className="section-title">Operations dashboard</h2>
      <p className="section-copy">Current aggregate metrics from the in-memory workflow store.</p>
      {error && <ErrorMessage message={error} />}
      {metrics && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([label, value]) => (
              <article key={label} className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-sm text-slate-600">
            Median turnaround: {metrics.median_turnaround_hours} hours · Manual touch reduction: {metrics.manual_touch_reduction}
          </p>
        </>
      )}
    </section>
  );
}

export default function Page() {
  const [role, setRole] = useState<PortalRole>('provider');
  const [refreshToken, setRefreshToken] = useState(0);
  const refresh = () => setRefreshToken((current) => current + 1);

  return (
    <div className="min-h-screen">
      <div className="bg-slate-900 px-4 py-2 text-center text-xs font-semibold tracking-wide text-amber-200">
        DEMO MODE · Synthetic data only · Not for clinical use
      </div>
      <Header role={role} setRole={setRole} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {role === 'provider' && <ProviderView onRequestCreated={refresh} />}
        {role === 'insurer' && <InsurerView refreshToken={refreshToken} />}
        {role === 'dashboard' && <DashboardView refreshToken={refreshToken} />}
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6">
        Local proof of concept. Requests and audit events are cleared when the backend restarts.
      </footer>
    </div>
  );
}
