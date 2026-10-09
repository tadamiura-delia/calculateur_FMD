import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import {
  DsfrFormInputComponent,
  type DsfrInputMode,
  type DsfrInputType,
} from '@edugouvfr/ngx-dsfr';

/**
 * Champ de saisie DSFR branché sur les Signal Forms, frère de `DateField` et
 * `SelectField`.
 *
 * La valeur est une chaîne même pour un nombre : `dsfr-form-input` est un
 * `ControlValueAccessor` qui expose `value: string`, y compris en
 * `type="number"`. C'est aussi ce qui impose cet adaptateur — les propriétés
 * héritées du composant DSFR (`pattern: string`…) empêchent `[formField]` de
 * s'y brancher directement.
 */
@Component({
  selector: 'app-text-field',
  imports: [DsfrFormInputComponent, FormsModule],
  template: `
    <dsfr-form-input
      [type]="type()"
      [label]="label()"
      [hint]="hint()"
      [placeholder]="placeholder()"
      [inputMode]="inputMode()"
      [maxLength]="maxLength()"
      [name]="inputId()"
      [inputId]="inputId()"
      [required]="required()"
      [disabled]="disabled()"
      [message]="message()"
      [messageSeverity]="message() ? 'error' : undefined"
      [ngModel]="value()"
      [ngModelOptions]="{ standalone: true }"
      (ngModelChange)="value.set($event ?? '')"
      (focusout)="touch.emit()"
    />
  `,
})
export class TextField implements FormValueControl<string> {
  readonly value = model.required<string>();

  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly type = input<DsfrInputType>('text');
  readonly hint = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly inputMode = input<DsfrInputMode | undefined>(undefined);

  // Entrées et sorties alimentées automatiquement par la directive `[formField]`.
  // `maxLength` en fait partie : il vient du validateur `maxLength()` du
  // schéma, Angular interdisant de le lier à la main sur un `[formField]`.
  readonly maxLength = input<number | undefined>(undefined);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();

  protected readonly message = computed(() =>
    this.touched() ? this.errors()[0]?.message : undefined,
  );
}
