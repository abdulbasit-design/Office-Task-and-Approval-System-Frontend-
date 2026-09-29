"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useGetTaskQuery,
  useSubmitTaskMutation,
  useApproveTaskMutation,
  useRejectTaskMutation,
  useUpdateTaskMutation,
} from "@/lib/api/taskApi";
import { StatusBadge, PriorityBadge } from "@/components/tasks/TaskStatusBadge";
import TaskActivity from "@/components/tasks/TaskActivity";
import TaskForm from "@/components/tasks/TaskForm";
import type { TaskUpdate, TaskSubmit, TaskReject } from "@/lib/api/taskApi";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function extractError(err: unknown): string {
  if (err && typeof err === "object") {
    if ("data" in err) {
      const d = (err as { data: { detail?: string | Array<{ msg: string }> } }).data;
      if (typeof d?.detail === "string") return d.detail;
      if (Array.isArray(d?.detail)) return d.detail.map((x) => x.msg).join(", ");
    }
    if ("error" in err) return (err as { error: string }).error;
  }
  return "An unexpected error occurred.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Info row inside a detail card */
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-500 sm:w-36 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 flex-1">{value ?? <span className="text-slate-400 italic">—</span>}</span>
    </div>
  );
}

/** Submit task action modal */
function SubmitModal({
  onConfirm,
  onClose,
  isLoading,
  apiError,
}: {
  onConfirm: (note: string) => void;
  onClose: () => void;
  isLoading: boolean;
  apiError: string | null;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="submit-modal-title">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5">
        <div>
          <h3 id="submit-modal-title" className="text-base font-bold text-slate-900">Submit task for review</h3>
          <p className="text-xs text-slate-500 mt-1">Add an optional note to accompany your submission.</p>
        </div>
        {apiError && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <span>{apiError}</span>
          </div>
        )}
        <textarea
          id="submit-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional submission note…"
          rows={3}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 resize-none"
          disabled={isLoading}
        />
        <div className="flex gap-3">
          <button id="submit-confirm" onClick={() => onConfirm(note)} disabled={isLoading}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {isLoading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {isLoading ? "Submitting…" : "Submit"}
          </button>
          <button id="submit-cancel" onClick={onClose} disabled={isLoading}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-60">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/** Reject task action modal */
function RejectModal({
  onConfirm,
  onClose,
  isLoading,
  apiError,
}: {
  onConfirm: (reason: string) => void;
  onClose: () => void;
  isLoading: boolean;
  apiError: string | null;
}) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  function handleConfirm() {
    if (!reason.trim()) { setErr("Rejection reason is required."); return; }
    if (reason.length > 1000) { setErr("Reason must be 1000 characters or fewer."); return; }
    setErr("");
    onConfirm(reason.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5">
        <div>
          <h3 id="reject-modal-title" className="text-base font-bold text-slate-900">Reject task</h3>
          <p className="text-xs text-slate-500 mt-1">Provide a reason — the employee will be notified.</p>
        </div>
        {apiError && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <span>{apiError}</span>
          </div>
        )}
        <div>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => { setReason(e.target.value); if (err) setErr(""); }}
            placeholder="Reason for rejection (required, max 1000 chars)…"
            rows={4}
            maxLength={1000}
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none ${
              err ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200" : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            }`}
            disabled={isLoading}
          />
          {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
          <p className="mt-1 text-[11px] text-slate-400 text-right">{reason.length}/1000</p>
        </div>
        <div className="flex gap-3">
          <button id="reject-confirm" onClick={handleConfirm} disabled={isLoading}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {isLoading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {isLoading ? "Rejecting…" : "Reject Task"}
          </button>
          <button id="reject-cancel" onClick={onClose} disabled={isLoading}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-60">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const { data: task, isLoading, isError, error } = useGetTaskQuery(taskId, {
    skip: isNaN(taskId),
  });

  const [submitTask, { isLoading: isSubmitting }] = useSubmitTaskMutation();
  const [approveTask, { isLoading: isApproving }] = useApproveTaskMutation();
  const [rejectTask, { isLoading: isRejecting }] = useRejectTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // ── Modal & edit state ────────────────────────────────────────────────────
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // ── Action handlers ───────────────────────────────────────────────────────
  async function handleSubmit(note: string) {
    setSubmitError(null);
    try {
      const body: TaskSubmit = { submission_note: note || null };
      await submitTask({ id: taskId, body }).unwrap();
      setShowSubmitModal(false);
    } catch (err) {
      setSubmitError(extractError(err));
    }
  }

  async function handleApprove() {
    setApproveError(null);
    try {
      await approveTask(taskId).unwrap();
    } catch (err) {
      setApproveError(extractError(err));
    }
  }

  async function handleReject(reason: string) {
    setRejectError(null);
    try {
      const body: TaskReject = { rejection_reason: reason };
      await rejectTask({ id: taskId, body }).unwrap();
      setShowRejectModal(false);
    } catch (err) {
      setRejectError(extractError(err));
    }
  }

  async function handleUpdate(data: TaskUpdate) {
    setEditError(null);
    try {
      await updateTask({ id: taskId, body: data }).unwrap();
      setEditSuccess(true);
      setTimeout(() => { setShowEditForm(false); setEditSuccess(false); }, 1200);
    } catch (err) {
      setEditError(extractError(err));
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-40" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-64" />
          <div className="flex gap-3">
            <div className="h-6 bg-slate-200 rounded w-20" />
            <div className="h-6 bg-slate-200 rounded w-16" />
          </div>
          {[1,2,3,4,5].map((i) => <div key={i} className="h-4 bg-slate-100 rounded w-full" />)}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError || !task) {
    const errMsg = extractError(error);
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Back to Tasks
        </Link>
        <div role="alert" className="flex items-start gap-3 p-5 rounded-2xl bg-rose-50 border border-rose-200">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
          <div>
            <p className="font-semibold text-rose-800">Task not found</p>
            <p className="text-xs text-rose-600 mt-0.5">{errMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────
  const canSubmit  = task.status === "PENDING" || task.status === "REJECTED";
  const canApprove = task.status === "SUBMITTED";
  const canReject  = task.status === "SUBMITTED";

  return (
    <>
      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showSubmitModal && (
        <SubmitModal
          onConfirm={handleSubmit}
          onClose={() => { setShowSubmitModal(false); setSubmitError(null); }}
          isLoading={isSubmitting}
          apiError={submitError}
        />
      )}
      {showRejectModal && (
        <RejectModal
          onConfirm={handleReject}
          onClose={() => { setShowRejectModal(false); setRejectError(null); }}
          isLoading={isRejecting}
          apiError={rejectError}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-slate-500">
            <li>
              <Link href="/tasks" className="hover:text-blue-600 transition-colors font-medium">Tasks</Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </li>
            <li className="text-slate-800 font-semibold truncate max-w-xs" aria-current="page">
              {task.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

          {/* ── Left column ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Main detail card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
              {/* Card header */}
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">{task.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">Task #{task.id} · Created {formatDateTime(task.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              </div>

              {/* Action error banners */}
              {approveError && (
                <div role="alert" className="mx-6 mt-4 flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                  <span>{approveError}</span>
                </div>
              )}

              {/* Details */}
              <div className="px-6 py-2">
                <DetailRow label="Description" value={task.description || <span className="text-slate-400 italic">No description provided.</span>} />
                <DetailRow label="Assigned To" value={`User #${task.assigned_to}`} />
                <DetailRow label="Created By" value={`User #${task.created_by}`} />
                <DetailRow label="Deadline" value={formatDateTime(task.deadline)} />
                <DetailRow label="Created At" value={formatDateTime(task.created_at)} />
              </div>

              {/* Action bar */}
              <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {/* Submit — available to employees on PENDING/REJECTED tasks */}
                {canSubmit && (
                  <button
                    id="action-submit"
                    onClick={() => { setSubmitError(null); setShowSubmitModal(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Submit for Review
                  </button>
                )}

                {/* Approve — manager, SUBMITTED tasks */}
                {canApprove && (
                  <button
                    id="action-approve"
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60"
                  >
                    {isApproving ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    )}
                    {isApproving ? "Approving…" : "Approve"}
                  </button>
                )}

                {/* Reject — manager, SUBMITTED tasks */}
                {canReject && (
                  <button
                    id="action-reject"
                    onClick={() => { setRejectError(null); setShowRejectModal(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold text-sm rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    Reject
                  </button>
                )}

                {/* Edit — manager can update task details */}
                <button
                  id="action-edit"
                  onClick={() => { setShowEditForm((v) => !v); setEditError(null); setEditSuccess(false); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  {showEditForm ? "Cancel Edit" : "Edit"}
                </button>

                {/* Back */}
                <button
                  onClick={() => router.push("/tasks")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                  Back
                </button>
              </div>
            </div>

            {/* ── Submission info ────────────────────────────────────────── */}
            {(task.submitted_at || task.submission_note) && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-indigo-900">Submission Details</h3>
                {task.submitted_at && (
                  <p className="text-xs text-indigo-700">
                    <span className="font-semibold">Submitted at:</span> {formatDateTime(task.submitted_at)}
                  </p>
                )}
                {task.submission_note && (
                  <p className="text-xs text-indigo-700">
                    <span className="font-semibold">Note:</span> {task.submission_note}
                  </p>
                )}
              </div>
            )}

            {/* ── Approval info ──────────────────────────────────────────── */}
            {task.status === "APPROVED" && task.approved_at && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-emerald-900">Approval Details</h3>
                <p className="text-xs text-emerald-700">
                  <span className="font-semibold">Approved at:</span> {formatDateTime(task.approved_at)}
                </p>
                {task.approved_by && (
                  <p className="text-xs text-emerald-700">
                    <span className="font-semibold">Approved by:</span> User #{task.approved_by}
                  </p>
                )}
              </div>
            )}

            {/* ── Rejection info ─────────────────────────────────────────── */}
            {task.status === "REJECTED" && task.rejection_reason && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-rose-900">Rejection Details</h3>
                <p className="text-xs text-rose-700">
                  <span className="font-semibold">Reason:</span> {task.rejection_reason}
                </p>
              </div>
            )}

            {/* ── Inline Edit Form ───────────────────────────────────────── */}
            {showEditForm && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Edit Task</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manager-only. Backend validates all fields.</p>
                </div>
                {editSuccess && (
                  <div role="status" className="mx-6 mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    <span>Task updated successfully!</span>
                  </div>
                )}
                <div className="px-6 py-6">
                  <TaskForm
                    initialValues={task}
                    onSubmit={(data) => handleUpdate(data as TaskUpdate)}
                    isLoading={isUpdating || editSuccess}
                    apiError={editError}
                    submitLabel="Save Changes"
                    onCancel={() => { setShowEditForm(false); setEditError(null); }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: Activity log ───────────────────────────────── */}
          <div>
            <TaskActivity
              activityLog={task.activity_log}
              timestamps={{
                created_at: task.created_at,
                submitted_at: task.submitted_at,
                approved_at: task.approved_at,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
