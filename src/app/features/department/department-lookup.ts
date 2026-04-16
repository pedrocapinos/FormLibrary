import { createLookupDialogOpener } from '../../core/services/lookup-dialog.factory';
import { DepartmentListComponent } from './department-list.component';
import { Department } from './department.model';

export const openDepartmentLookup = createLookupDialogOpener<Department>({
  component: DepartmentListComponent,
  title: 'Lookup',
});
