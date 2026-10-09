import { Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { transformedValue, type FormValueControl, type ValidationError } from '@angular/forms/signals';
import { DsfrFormInputComponent } from '@edugouvfr/ngx-dsfr';

/** Date au format français « JJ/MM/AAAA ». */
const FRENCH_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
/** Date au format ISO « AAAA-MM-JJ », celui du modèle et du champ date natif. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** « 28/09/2026 » → « 2026-09-28 ». Chaîne vide si la date est mal formée. */
export function frenchToIso(value: string): string {
  const match = FRENCH_DATE.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

/** « 2026-09-28 » → « 28/09/2026 ». Chaîne vide si la date est mal formée. */
export function isoToFrench(value: string): string {
  const match = ISO_DATE.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

/**
 * Champ de date DSFR affiché en « JJ/MM/AAAA », avec accès au calendrier natif.
 *
 * Un `<input type="date">` visible ne convenait pas : c'est un éditeur segmenté
 * dont le navigateur impose *à la fois* le format affiché (celui de sa propre
 * langue, d'où le « mm/jj/aaaa ») et le saut automatique d'un segment à
 * l'autre. Ni l'un ni l'autre n'est modifiable depuis la page.
 *
 * Le champ visible est donc un champ texte, que nous formatons nous-mêmes — le
 * format est ainsi identique quel que soit le navigateur, et la frappe reste
 * libre. Le calendrier natif n'est pas perdu pour autant : il est ouvert à la
 * demande sur un champ date masqué, via `showPicker()`.
 *
 * Le modèle reste en ISO « AAAA-MM-JJ », format d'échange du reste de
 * l'application ; `transformedValue` fait la traduction dans les deux sens.
 */
@Component({
  selector: 'app-date-field',
  imports: [DsfrFormInputComponent, FormsModule],
  templateUrl: './date-field.html',
  styleUrl: './date-field.css',
})
export class DateField implements FormValueControl<string> {
  /** Date au format ISO « AAAA-MM-JJ », ou chaîne vide. */
  readonly value = model.required<string>();

  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly hint = input('Format attendu : JJ/MM/AAAA');

  // Entrées et sorties alimentées automatiquement par la directive `[formField]`.
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly touched = input(false);
  readonly touch = output<void>();

  /**
   * Vrai si le navigateur sait ouvrir un calendrier à la demande. Évalué à la
   * construction — et non au chargement du module — pour rester observable.
   * Sans ce support, le bouton disparaît et la saisie au clavier suffit.
   */
  protected readonly calendrierDisponible =
    typeof HTMLInputElement !== 'undefined' && 'showPicker' in HTMLInputElement.prototype;

  private readonly calendrier = viewChild<ElementRef<HTMLInputElement>>('calendrier');

  /**
   * Texte affiché, « JJ/MM/AAAA ». Écrit librement pendant la frappe : le
   * modèle ne reçoit une valeur que lorsque la date est complète.
   */
  protected readonly texte = transformedValue(this.value, {
    parse: (saisie: string) => ({ value: frenchToIso(saisie) }),
    format: (iso) => isoToFrench(iso),
  });

  protected readonly message = computed(() =>
    this.touched() ? this.errors()[0]?.message : undefined,
  );

  /** Ouvre le calendrier du navigateur sur le champ date masqué. */
  protected openCalendrier(): void {
    this.calendrier()?.nativeElement.showPicker();
  }

  /** Une date choisie au calendrier est déjà en ISO : elle va droit au modèle. */
  protected surChoixCalendrier(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
    this.touch.emit();
  }
}
