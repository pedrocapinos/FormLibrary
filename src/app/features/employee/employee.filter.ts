export interface EmployeeSearchFilters {
  id?: number | null;
  firstName?: string | null;
  salaryMin?: number | null; // salary >= salaryMin
  salaryMax?: number | null; // salary <= salaryMax
  isActive?: boolean | null;
}
