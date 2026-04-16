import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CrudService } from '../../core/types/crud-service';
import { Employee } from './employee.model';
import { EmployeeSearchFilters } from './employee.filter';
import { MockSeedService } from '../mock-seed.service';

@Injectable({ providedIn: 'root' })
export class EmployeeService implements CrudService<Employee, EmployeeSearchFilters> {
  private records: Employee[] = [...inject(MockSeedService).employees];

  getAll(): Observable<Employee[]> {
    return of([...this.records]);
  }

  search(filters: EmployeeSearchFilters): Observable<Employee[]> {
    const { id, firstName, salaryMin, salaryMax, isActive } = filters;
    const result = this.records.filter((e) => {
      if (id !== null && id !== undefined && e.id !== id) return false;
      if (firstName && !e.firstName?.toLowerCase().includes(firstName.toLowerCase())) return false;
      if (salaryMin !== null && salaryMin !== undefined && (e.salary === null || e.salary < salaryMin)) return false;
      if (salaryMax !== null && salaryMax !== undefined && (e.salary === null || e.salary > salaryMax)) return false;
      if (isActive !== null && isActive !== undefined && e.isActive !== isActive) return false;
      return true;
    });
    return of(result);
  }

  getById(id: number): Observable<Employee | null> {
    return of(this.records.find((e) => e.id === id) ?? null);
  }

  save(data: Employee): Observable<Employee> {
    if (data.id == null) {
      const maxId = this.records.reduce((m, r) => Math.max(m, r.id ?? 0), 0);
      data = { ...data, id: maxId + 1 };
    }
    const index = this.records.findIndex((e) => e.id === data.id);
    if (index >= 0) {
      this.records[index] = { ...data };
    } else {
      this.records = [...this.records, { ...data }];
    }
    return of({ ...data });
  }

  delete(id: number): Observable<void> {
    this.records = this.records.filter((e) => e.id !== id);
    return of(undefined);
  }

  deleteMany(ids: number[]): Observable<void> {
    const idsSet = new Set(ids);
    this.records = this.records.filter((e) => !idsSet.has(e.id!));
    return of(undefined);
  }

  count(): Observable<number> {
    return of(this.records.length);
  }
}
