export interface EmployeePhone {
  label: string | null;
  number: string | null;
}

export interface Employee {
  id: number | null;
  firstName: string | null;
  cpf: string | null;
  salary: number | null;
  isActive: boolean;
  departmentId: number | null;
  departmentName: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  isPrimary: boolean;
  phones: EmployeePhone[];
}
