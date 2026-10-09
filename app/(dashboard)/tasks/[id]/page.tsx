"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowUUpLeft, CaretLeft, CheckCircle, PaperPlaneTilt, PencilSimple, SealCheck, WarningCircle } from "@phosphor-icons/react";
import {
  useGetTaskQuery,
  useSubmitTaskMutation,
  useApproveTaskMutation,
  useRejectTaskMutation,
  useUpdateTaskMutation,
} from "@/lib/api/taskApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import { useGetUsersQuery } from "@/lib/api/userApi";
import { useGetDepartmentsQuery } from "@/lib/api/departmentApi";
import { StatusBadge, PriorityBadge } from "@/components/tasks/TaskStatusBadge";
import TaskActivity from "@/components/tasks/TaskActivity";
import TaskForm from "@/components/tasks/TaskForm";
import CloseOnEscape from "@/components/ui/CloseOnEscape";
import Seal from "@/components/ui/Seal";
import Serial from "@/components/ui/Serial";
import { dueLabel, formatDate, formatDateTime } from "@/lib/format";
import type { TaskUpdate, TaskSubmit, TaskReject } from "@/lib/api/taskApi";

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

function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-sm border border-serial/50 bg-serial-tint p-3 text-[14px] text-ink">
      <WarningCircle size={18} className="mt-0.5 shrink-0 text-serial" />
      <span>{message}</span>
    </div>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />;
}

// ── Dialog shell ─────────────────────────────────────────────────────────────
function Dialog({ id, title, body, onClose, children }: { id: string; title: string; body: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-labelledby={id}>
      <CloseOnEscape onClose={onClose} />
      <div className="dialog-panel panel w-full max-w-md p-6 shadow-[0_24px_60px_-20px_rgb(var(--shadow-color)/0.5)]">
        <h3 id={id} className="font-display text-[24px] leading-tight text-ink">{title}</h3>
        <p className="mt-1 text-[14px] text-ink-2">{body}</p>
        <div className="mt-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

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
    <Dialog onClose={onClose} id="submit-modal-title" title="Submit for review" body="Your manager is notified and can approve the task or reject it with a reason.">
      {apiError && <ErrorNote message={apiError} />}
      <div>
        <label htmlFor="submit-note" className="field-label">Note for your manager <span className="font-normal text-ink-3">(optional)</span></label>
        <textarea
          id="submit-note"
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What was done, where to find it, anything to check"
          rows={4}
          className="input resize-y"
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end gap-3">
        <button id="submit-cancel" onClick={onClose} disabled={isLoading} className="btn btn-secondary">Cancel</button>
        <button id="submit-confirm" onClick={() => onConfirm(note)} disabled={isLoading} className="btn btn-primary">
          {isLoading ? <Spinner /> : <PaperPlaneTilt size={16} />}
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </Dialog>
  );
}

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
    if (!reason.trim()) {
      setErr("Write the reason so the assignee knows what to change.");
      return;
    }
    if (reason.length > 1000) {
      setErr("Reason must be 1000 characters or fewer.");
      return;
    }
    setErr("");
    onConfirm(reason.trim());
  }

  return (
    <Dialog onClose={onClose} id="reject-modal-title" title="Reject this submission" body="The assignee sees your reason, can revise the work, and submit it again.">
      {apiError && <ErrorNote message={apiError} />}
      <div>
        <label htmlFor="reject-reason" className="field-label">Reason <span className="font-normal text-ink-3">(required)</span></label>
        <textarea
          id="reject-reason"
          autoFocus
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (err) setErr("");
          }}
          rows={4}
          maxLength={1000}
          className="input resize-y"
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? "reject-reason-error" : "reject-reason-count"}
          disabled={isLoading}
        />
        <div className="flex justify-between gap-3">
          {err ? <p id="reject-reason-error" className="field-error">{err}</p> : <span />}
          <p id="reject-reason-count" className="field-hint tabular">{reason.length}/1000</p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button id="reject-cancel" onClick={onClose} disabled={isLoading} className="btn btn-secondary">Cancel</button>
        <button
          id="reject-confirm"
          onClick={handleConfirm}
          disabled={isLoading}
          className="btn border-serial-fill bg-serial-fill text-white hover:opacity-90"
        >
          {isLoading ? <Spinner /> : <ArrowUUpLeft size={16} />}
          {isLoading ? "Rejecting..." : "Reject task"}
        </button>
      </div>
    </Dialog>
  );
}

function Meta({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="caps text-ink-3">{term}</dt>
      <dd className="mt-1 text-[15px] text-ink">{children}</dd>
    </div>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = Number(params.id);

  const { data: task, isLoading, isError, error } = useGetTaskQuery(taskId, { skip: isNaN(taskId) });
  const { data: me } = useGetMeQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: departments = [] } = useGetDepartmentsQuery();

  const usersMap = React.useMemo(() => {
    const map: Record<number, { name: string; department?: string }> = {};
    const deptMap: Record<number, string> = {};
    departments.forEach((d) => {
      deptMap[d.id] = d.name;
    });
    users.forEach((u) => {
      map[u.id] = {
        name: u.full_name,
        department: u.department_name || (u.department_id ? deptMap[u.department_id] : undefined),
      };
    });
    return map;
  }, [users, departments]);

  const [submitTask, { isLoading: isSubmitting }] = useSubmitTaskMutation();
  const [approveTask, { isLoading: isApproving }] = useApproveTaskMutation();
  const [rejectTask, { isLoading: isRejecting }] = useRejectTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);
  // The seal presses only when the approval happens here, not on every visit
  const [justApproved, setJustApproved] = useState(false);

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
      setJustApproved(true);
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
      setTimeout(() => {
        setShowEditForm(false);
        setEditSuccess(false);
      }, 1200);
    } catch (err) {
      setEditError(extractError(err));
    }
  }

  const backLink = (
    <Link href="/tasks" className="inline-flex items-center gap-1 text-[14px] font-semibold text-note-ink hover:underline">
      <CaretLeft size={14} weight="bold" /> Tasks
    </Link>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6" aria-busy="true" aria-label="Loading task">
        <div className="h-5 w-20 animate-pulse bg-paper-sunk" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="frame h-[460px] animate-pulse" />
          <div className="panel h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        {backLink}
        <ErrorNote message={`This task could not be opened. ${extractError(error)}`} />
      </div>
    );
  }

  const isManager = me?.role === "manager";
  const isAssignee = me?.id === task.assigned_to;
  const canSubmit = isAssignee && (task.status === "PENDING" || task.status === "REJECTED");
  const canDecide = isManager && task.status === "SUBMITTED";
  const canEdit = isManager && task.status !== "APPROVED";

  const assigneeName = task.assigned_to_name || usersMap[task.assigned_to]?.name || `User #${task.assigned_to}`;
  const department = task.department_name || usersMap[task.assigned_to]?.department;
  const issuerName = task.created_by_name || usersMap[task.created_by]?.name || `User #${task.created_by}`;
  const approverName = task.approved_by
    ? task.approved_by_name || usersMap[task.approved_by]?.name || `User #${task.approved_by}`
    : null;
  const due = dueLabel(task.deadline);

  return (
    <>
      {showSubmitModal && (
        <SubmitModal
          onConfirm={handleSubmit}
          onClose={() => {
            setShowSubmitModal(false);
            setSubmitError(null);
          }}
          isLoading={isSubmitting}
          apiError={submitError}
        />
      )}
      {showRejectModal && (
        <RejectModal
          onConfirm={handleReject}
          onClose={() => {
            setShowRejectModal(false);
            setRejectError(null);
          }}
          isLoading={isRejecting}
          apiError={rejectError}
        />
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        {backLink}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="min-w-0 space-y-6">
            {/* ── The note ── */}
            <article className="frame px-6 py-7 sm:px-9 sm:py-8" aria-labelledby="task-title">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <Serial id={task.id} />
                <div className="flex items-center gap-4">
                  <span key={task.status} className="stamp-in inline-flex">
                    <StatusBadge status={task.status} />
                  </span>
                  <PriorityBadge priority={task.priority} />
                </div>
              </header>

              <h2 id="task-title" className="mt-4 font-display text-[30px] leading-[1.12] text-ink sm:text-[36px]">
                {task.title}
              </h2>

              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
                <Meta term="Assigned to">
                  {assigneeName}
                  {department && <span className="block text-[13px] text-ink-3">{department}</span>}
                </Meta>
                <Meta term="Issued by">{issuerName}</Meta>
                <Meta term="Deadline">
                  <time dateTime={task.deadline} className="tabular">{formatDate(task.deadline)}</time>
                  {task.status !== "APPROVED" && (
                    <span className={`block text-[13px] ${due.overdue ? "text-serial" : due.soon ? "font-medium text-ink-2" : "text-ink-3"}`}>
                      {due.text}
                    </span>
                  )}
                </Meta>
                <Meta term="Issued">
                  <time dateTime={task.created_at} className="tabular">{formatDate(task.created_at)}</time>
                </Meta>
              </dl>

              <div className="mt-7 border-t border-line pt-6">
                <h3 className="caps text-ink-3">Brief</h3>
                <p className={`mt-2 max-w-[65ch] whitespace-pre-line ${task.description ? "text-ink" : "text-ink-3"}`}>
                  {task.description || "No description provided."}
                </p>
              </div>

              {task.submission_note && (
                <div className="mt-6">
                  <h3 className="caps text-ink-3">Submission note</h3>
                  <blockquote className="mt-2 max-w-[60ch] font-display text-[19px] italic leading-snug text-ink">
                    &ldquo;{task.submission_note}&rdquo;
                  </blockquote>
                  {task.submitted_at && (
                    <p className="mt-1.5 text-[13px] text-ink-3 tabular">
                      {assigneeName}, {formatDateTime(task.submitted_at)}
                    </p>
                  )}
                </div>
              )}

              {task.status === "REJECTED" && task.rejection_reason && (
                <div className="mt-6 rounded-sm border border-serial/50 bg-serial-tint p-4">
                  <h3 className="caps text-serial">Rejected</h3>
                  <p className="mt-1.5 max-w-[60ch] font-display text-[18px] italic leading-snug text-ink">
                    &ldquo;{task.rejection_reason}&rdquo;
                  </p>
                  {isAssignee && <p className="mt-2 text-[14px] text-ink-2">Revise the work, then submit it again.</p>}
                </div>
              )}

              {task.status === "APPROVED" && (
                <div className="mt-7 flex flex-wrap items-center gap-6 border-t border-line pt-6">
                  <Seal
                    seed={task.id}
                    legend="Countersigned"
                    sub={task.approved_at ? formatDate(task.approved_at) : undefined}
                    size={124}
                    press={justApproved}
                  />
                  <div>
                    <p className="font-display text-[22px] leading-tight text-ink">Countersigned</p>
                    <p className="mt-1 text-ink-2">
                      {approverName ? `By ${approverName}` : "Approved"}
                      {task.approved_at && <span className="tabular">, {formatDateTime(task.approved_at)}</span>}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Serial id={task.id} />
              </div>
            </article>

            {showEditForm && (
              <section className="panel px-6 py-6 sm:px-8" aria-labelledby="edit-heading">
                <h3 id="edit-heading" className="font-display text-[22px] leading-tight text-ink">Edit task</h3>
                {editSuccess && (
                  <div role="status" className="mt-4 flex items-center gap-2 rounded-sm border border-ok/40 bg-ok-tint p-3 text-[14px] text-ok">
                    <CheckCircle size={18} weight="fill" className="shrink-0" />
                    <span>Changes saved.</span>
                  </div>
                )}
                <div className="mt-5">
                  <TaskForm
                    initialValues={task}
                    onSubmit={(data) => handleUpdate(data as TaskUpdate)}
                    isLoading={isUpdating || editSuccess}
                    apiError={editError}
                    submitLabel="Save changes"
                    onCancel={() => {
                      setShowEditForm(false);
                      setEditError(null);
                    }}
                  />
                </div>
              </section>
            )}
          </div>

          {/* ── Decision column: straight after the note on small screens, sticky beside note and record on large ── */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {canDecide && (
              <section className="panel p-5" aria-labelledby="decision-heading">
                <h2 id="decision-heading" className="font-display text-[22px] leading-tight text-ink">Your decision</h2>
                <p className="mt-1 text-[14px] text-ink-2">
                  Approving countersigns and closes the task. Rejecting sends it back to {assigneeName} with your reason.
                </p>
                {approveError && <div className="mt-4"><ErrorNote message={approveError} /></div>}
                <button id="action-approve" onClick={handleApprove} disabled={isApproving} className="btn btn-primary mt-5 min-h-11 w-full">
                  {isApproving ? <Spinner /> : <SealCheck size={18} />}
                  {isApproving ? "Countersigning..." : "Approve and countersign"}
                </button>
                {/* Reject sits apart from Approve so neither is hit by accident */}
                <div className="mt-8 border-t border-line pt-4">
                  <button
                    id="action-reject"
                    onClick={() => {
                      setRejectError(null);
                      setShowRejectModal(true);
                    }}
                    className="btn btn-danger w-full"
                  >
                    <ArrowUUpLeft size={16} /> Reject with reason
                  </button>
                </div>
              </section>
            )}

            {canSubmit && (
              <section className="panel p-5" aria-labelledby="submit-heading">
                <h2 id="submit-heading" className="font-display text-[22px] leading-tight text-ink">
                  {task.status === "REJECTED" ? "Ready to resubmit?" : "Ready to submit?"}
                </h2>
                <p className="mt-1 text-[14px] text-ink-2">
                  {task.status === "REJECTED"
                    ? "Address the reason on the left, then send it back for countersignature."
                    : "When the work is done, send it to your manager with a note."}
                </p>
                <button
                  id="action-submit"
                  onClick={() => {
                    setSubmitError(null);
                    setShowSubmitModal(true);
                  }}
                  className="btn btn-primary mt-5 min-h-11 w-full"
                >
                  <PaperPlaneTilt size={18} /> Submit for review
                </button>
              </section>
            )}

            {!canDecide && !canSubmit && task.status !== "APPROVED" && (
              <section className="panel p-5">
                <h2 className="font-display text-[22px] leading-tight text-ink">
                  {task.status === "SUBMITTED" ? "Awaiting countersignature" : `With ${assigneeName}`}
                </h2>
                <p className="mt-1 text-[14px] text-ink-2">
                  {task.status === "SUBMITTED"
                    ? `Submitted ${formatDate(task.submitted_at)}. A manager will approve it or reject it with a reason.`
                    : "It can be approved or rejected once it has been submitted."}
                </p>
              </section>
            )}

            <section className="panel p-5" aria-label="Key dates">
              <dl className="space-y-3 text-[14px]">
                {[
                  ["Issued", task.created_at],
                  ["Deadline", task.deadline],
                  ["Submitted", task.submitted_at],
                  ["Countersigned", task.approved_at],
                ].map(([term, value]) => (
                  <div key={term} className="flex items-baseline gap-3">
                    <dt className="caps text-ink-3">{term}</dt>
                    <span aria-hidden="true" className="h-0 flex-1 border-b border-dotted border-line-strong" />
                    <dd className={`tabular ${value ? "text-ink" : "text-ink-3"}`}>{value ? formatDate(value) : "Not yet"}</dd>
                  </div>
                ))}
              </dl>
              {canEdit && (
                <button
                  id="action-edit"
                  onClick={() => {
                    setShowEditForm((v) => !v);
                    setEditError(null);
                    setEditSuccess(false);
                  }}
                  className="btn btn-secondary mt-5 w-full"
                >
                  <PencilSimple size={16} /> {showEditForm ? "Close editor" : "Edit task"}
                </button>
              )}
            </section>
          </aside>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <TaskActivity
              activityLog={task.activity_log}
              assigneeId={task.assigned_to}
              timestamps={{ created_at: task.created_at, submitted_at: task.submitted_at, approved_at: task.approved_at }}
              notes={{ submission: task.submission_note, rejection: task.rejection_reason }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
