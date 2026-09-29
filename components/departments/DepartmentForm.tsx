"use client";

import React, { useState, useEffect } from "react";
import type { DepartmentResponse, DepartmentCreate } from "@/lib/api/departmentApi";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/lib/api/departmentApi";

interface DepartmentFormProps {
  initialData?: DepartmentResponse | null;
  onSuccess?: (dept: DepartmentResponse) => void;
  onCancel?: () => void;
}

export default function DepartmentForm({
  initialData,
  onSuccess,
  onCancel,
}: DepartmentFormProps) {
  const isEditing = Boolean(initialData);

  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const isSubmitting = isCreating || isUpdating;

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(initialData?.name || "");
    setDescription(initialData?.description || "");
    setErrorMsg(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg("Department name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setErrorMsg("Department name cannot exceed 100 characters.");
      return;
    }

    const payload: DepartmentCreate = {
      name: trimmedName,
      description: description.trim() ? description.trim() : null,
    };

    try {
      let result: DepartmentResponse;
      if (isEditing && initialData) {
        result = await updateDepartment({
          id: initialData.id,
          body: payload,
        }).unwrap();
      } else {
        result = await createDepartment(payload).unwrap();
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const errorData = (err as { data: { detail?: string } }).data;
        setErrorMsg(errorData?.detail || "Failed to save department.");
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
          <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-semibold block">Error</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Department Name */}
      <div>
        <label htmlFor="dept-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Department Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="dept-name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Engineering, Marketing, Human Resources"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
          <span>Between 1 and 100 characters. Must be unique.</span>
          <span>{name.length}/100</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="dept-description" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Description <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="dept-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the department's role and responsibilities..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          id="save-department-btn"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{isEditing ? "Updating..." : "Creating..."}</span>
            </>
          ) : (
            <span>{isEditing ? "Save Changes" : "Create Department"}</span>
          )}
        </button>
      </div>
    </form>
  );
}
