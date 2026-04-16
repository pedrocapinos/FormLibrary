import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CrudService } from '../../core/types/crud-service';
import { Department } from './department.model';
import { DepartmentSearchFilters } from './department.filter';
import { MockSeedService } from '../mock-seed.service';

@Injectable({ providedIn: 'root' })
export class DepartmentService implements CrudService<Department, DepartmentSearchFilters> {
  private records: Department[] = [...inject(MockSeedService).departments];

  getAll(): Observable<Department[]> {
    return of([...this.records]);
  }

  search(filters: DepartmentSearchFilters): Observable<Department[]> {
    const { id, name } = filters;
    const result = this.records.filter((d) => {
      if (id !== null && id !== undefined && d.id !== id) return false;
      if (name && !d.name?.toLowerCase().includes(name.toLowerCase())) return false;
      return true;
    });
    return of(result);
  }

  getById(id: number): Observable<Department | null> {
    return of(this.records.find((d) => d.id === id) ?? null);
  }

  save(data: Department): Observable<Department> {
    if (data.id == null) {
      const maxId = this.records.reduce((m, r) => Math.max(m, r.id ?? 0), 0);
      data = { ...data, id: maxId + 1 };
    }
    const index = this.records.findIndex((d) => d.id === data.id);
    if (index >= 0) {
      this.records[index] = { ...data };
    } else {
      this.records = [...this.records, { ...data }];
    }
    return of({ ...data });
  }

  delete(id: number): Observable<void> {
    this.records = this.records.filter((d) => d.id !== id);
    return of(undefined);
  }

  deleteMany(ids: number[]): Observable<void> {
    const idsSet = new Set(ids);
    this.records = this.records.filter((d) => !idsSet.has(d.id!));
    return of(undefined);
  }

  count(): Observable<number> {
    return of(this.records.length);
  }
}
