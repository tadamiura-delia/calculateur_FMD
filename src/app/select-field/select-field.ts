import { Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { FormValueControl, ValidationError } from '@angular/forms/signals';
import { DsfrFormSelectComponent, type DsfrSelectOption } from '@edugouvfr/ngx-dsfr';

/**
 * Adaptateur entre `<dsfr-form-select>` et les Signal Forms, jumeau de
 * `DateField`.
 *
 * Comme les champs de saisie, le sélecteur DSFR est un `ControlValueAccessor`
 * hérité dont les propriétés (`required: boolean`…) ne correspondent pas au
 * contrat `FormUiControl` : `[formField]` ne peut pas s'y brancher directement.
 */
@Component({
  selector: 'app-select-field',
  imports: [DsfrFormSelectComponent, FormsModule],
  template: `
    <dsfr-form-select
      [label]="label()"
      [hint]="hint()"
      [labelSrOnly]="labelSrOnly()"
      [options]="options()"
      [inputId]="inputId()"
      [name]="inputId()"
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
export class SelectField implements FormValueControl<string> {
  readonly value = model.required<string>();

  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly options = input.required<DsfrSelectOption[]>();
  readonly hint = input<string | undefined>(undefined);
  /** Dans un tableau, l'en-tête de colonne porte déjà l'intitulé visible. */
  readonly labelSrOnly = input(false);

  // Entrées et sorties alimentées automatiquement par la directive `[formField]`.
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();

  protected readonly message = computed(() =>
    this.touched() ? this.errors()[0]?.message : undefined,
  );
}
