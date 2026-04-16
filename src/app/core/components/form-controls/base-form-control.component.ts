import { Input, Injector, OnInit, Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import type { ErrorMessageConfig } from '../../services/error-message.service';
import { DebugService } from '../../services/debug.service';
@Directive()
export abstract class BaseFormControlComponent implements OnInit {
  @Input() fieldId?: string;
  @Input() label!: string;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() groupInvalid: boolean = false;
  @Input() customMessages?: Partial<ErrorMessageConfig>;

  private readonly debugService = inject(DebugService);
  get debugMode(): boolean {
    return this.debugService.enabled;
  }

  readonly generatedId = `control-${Math.random().toString(36).slice(2)}`;
  public outerControl: NgControl | null = null;
  protected readonly injector = inject(Injector);

  ngOnInit(): void {
    this.outerControl = this.injector.get(NgControl, null, { self: true });
  }

  get componentId(): string {
    return this.fieldId ? this.fieldId + '-input' : this.generatedId;
  }

  get errorId(): string {
    return this.componentId + '-error';
  }

  get isInvalid(): boolean {
    const outerInvalid = !!(
      this.outerControl?.invalid &&
      (this.outerControl.touched || this.outerControl.dirty)
    );
    return outerInvalid || this.groupInvalid;
  }
}
