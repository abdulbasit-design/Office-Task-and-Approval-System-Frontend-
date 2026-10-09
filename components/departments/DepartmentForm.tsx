"use client";

import React, { useState } from "react";
import { CircleNotch, WarningCircle } from "@phosphor-icons/react";
import type { DepartmentResponse, DepartmentCreate } from "@/lib/api/departmentApi";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/lib/api/departmentApi";

interface DepartmentFormProps {
  /** Fields initialize from this once; remount (change `key`) to edit another department. */
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-serial/50 bg-serial-tint p-3 text-[14px]">
          <WarningCircle size={20} className="mt-0.5 shrink-0 text-serial" />
          <div>
            <p className="font-semibold text-ink">The department was not saved</p>
            <p className="mt-0.5 text-ink-2">{errorMsg}</p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="dept-name" className="field-label">
          Department name<span className="text-serial" aria-hidden="true"> *</span>
        </label>
        <input
          id="dept-name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Engineering, Marketing, Human Resources"
          aria-describedby="dept-name-hint"
          className="input"
        />
        <p id="dept-name-hint" className="field-hint flex justify-between gap-4">
          <span>Between 1 and 100 characters. Must be unique.</span>
          <span className="tabular">{name.length}/100</span>
        </p>
      </div>

      <div>
        <label htmlFor="dept-description" className="field-label">
          Description <span className="font-normal text-ink-3">(optional)</span>
        </label>
        <textarea
          id="dept-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this department is responsible for"
          className="input resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn btn-ghost">
            Cancel
          </button>
        )}

        <button type="submit" id="save-department-btn" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? (
            <>
              <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save changes"
          ) : (
            "Create department"
          )}
        </button>
      </div>
    </form>
  );
}
