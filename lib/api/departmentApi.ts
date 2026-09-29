import { apiSlice } from "./apiSlice";

export interface DepartmentResponse {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface DepartmentCreate {
  name: string;
  description?: string | null;
}

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<DepartmentResponse[], void>({
      query: () => "/departments",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Departments" as const, id })),
              { type: "Departments", id: "LIST" },
            ]
          : [{ type: "Departments", id: "LIST" }],
    }),

    getDepartment: builder.query<DepartmentResponse, number>({
      query: (id) => `/departments/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Departments", id }],
    }),

    createDepartment: builder.mutation<DepartmentResponse, DepartmentCreate>({
      query: (body) => ({
        url: "/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Departments", id: "LIST" }],
    }),

    updateDepartment: builder.mutation<
      DepartmentResponse,
      { id: number; body: DepartmentCreate }
    >({
      query: ({ id, body }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Departments", id },
        { type: "Departments", id: "LIST" },
      ],
    }),

    deleteDepartment: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Departments", id },
        { type: "Departments", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
