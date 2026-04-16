import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { Department } from './department/department.model';
import { Employee, EmployeePhone } from './employee/employee.model';

const DEPARTMENT_COUNT = 15;
const DEPARTMENT_ID_START = 1;
const DEPARTMENT_SEED = 99;

const EMPLOYEE_COUNT = 50;
const EMPLOYEE_ID_START = 5;
const EMPLOYEE_SEED = 42;

@Injectable({ providedIn: 'root' })
export class MockSeedService {
  readonly departments: Department[];
  readonly employees: Employee[];

  constructor() {
    this.departments = this.seedDepartments();
    this.employees = this.seedEmployees(this.departments);
  }

  private seedDepartments(): Department[] {
    faker.seed(DEPARTMENT_SEED);
    return Array.from({ length: DEPARTMENT_COUNT }, (_, i) => ({
      id: DEPARTMENT_ID_START + i,
      name: faker.commerce.department(),
    }));
  }

  private seedEmployees(departments: Department[]): Employee[] {
    faker.seed(EMPLOYEE_SEED);
    return Array.from({ length: EMPLOYEE_COUNT }, (_, i) => {
      const dept = faker.datatype.boolean(0.7)
        ? faker.helpers.arrayElement(departments)
        : null;
      return {
        id: EMPLOYEE_ID_START + i,
        firstName: faker.person.firstName(),
        cpf: String(faker.number.int({ min: 10000000000, max: 99999999999 })),
        salary: faker.datatype.boolean(0.8) ? faker.number.int({ min: 1000, max: 15000 }) : null,
        isActive: faker.datatype.boolean(0.7),
        departmentId: dept?.id ?? null,
        departmentName: dept?.name ?? null,
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.string.numeric(5),
        isPrimary: faker.datatype.boolean(0.5),
        phones: this.seedPhones(),
      };
    });
  }

  private seedPhones(): EmployeePhone[] {
    const count = faker.number.int({ min: 1, max: 3 });
    return Array.from({ length: count }, () => ({
      label: faker.helpers.arrayElement(['Home', 'Mobile', 'Work']),
      number: faker.string.numeric(3) + faker.string.numeric(5) + faker.string.numeric(4),
    }));
  }
}
