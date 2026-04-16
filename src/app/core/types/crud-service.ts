import { Observable } from 'rxjs';

export interface CrudService<TEntity, TFilters = any, TKey = number> {
  getAll(): Observable<TEntity[]>;
  search(filters: TFilters): Observable<TEntity[]>;
  getById(key: TKey): Observable<TEntity | null>;
  save(data: TEntity): Observable<TEntity>;
  delete(key: TKey): Observable<void>;
  deleteMany?(keys: TKey[]): Observable<void>;
  count?(): Observable<number>;
}
