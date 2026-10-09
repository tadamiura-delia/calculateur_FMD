import { Component, computed, inject, signal } from '@angular/core';
import { form, pattern, required, FormField, FormRoot } from '@angular/forms/signals';
import {
  DsfrButtonComponent,
  DsfrFormInputComponent,
  DsfrTableComponent,
  type DsfrColumn,
} from '@edugouvfr/ngx-dsfr';
import { SelectField } from '../select-field/select-field';
import { TextField } from '../text-field/text-field';
import { LIEU_TRAVAIL_OPTIONS } from '../shared/travail-options';
import { ConfigurationStore } from '../shared/configuration-store';

/** Nombre positif avec au plus une décimale, la virgule ou le point en séparateur. */
const DISTANCE_PATTERN = /^\d+([.,]\d)?$/;

/** Distance saisie convertie en nombre, `undefined` si elle ne respecte pas le format. */
function parseDistance(saisie: string): number | undefined {
  const valeur = saisie.trim();
  return DISTANCE_PATTERN.test(valeur) ? Number(valeur.replace(',', '.')) : undefined;
}

/** Distance de trajet de chaque lieu de travail : la saisie et le récapitulatif. */
@Component({
  selector: 'app-workplace-distances',
  imports: [
    SelectField,
    TextField,
    DsfrFormInputComponent,
    DsfrButtonComponent,
    DsfrTableComponent,
    FormField,
    FormRoot,
  ],
  templateUrl: './workplace-distances.html',
})
export class WorkplaceDistances {
  private readonly store = inject(ConfigurationStore);

  /** Partagées avec le calendrier de la page d'accueil. */
  protected readonly lieuTravailOptions = LIEU_TRAVAIL_OPTIONS;

  /** Toutes les distances enregistrées, 0 pour les lieux jamais configurés. */
  protected readonly lieux = this.store.lieux;

  protected readonly colonnes: DsfrColumn[] = [
    { field: 'label', label: 'Lieu de travail' },
    { field: 'distance', label: 'Distance (km)' },
    { field: 'allerRetour', label: 'Aller-retour (km)' },
  ];

  /**
   * `distance` est une chaîne : `dsfr-form-input` est un contrôle `string`.
   * Le champ est en `type="text"` car `dsfr-form-input` n'expose pas `step` :
   * en `type="number"`, le pas par défaut de 1 rendrait « 12.5 » invalide.
   */
  private readonly model = signal({ lieuTravail: '', distance: '' });

  protected readonly lieuForm = form(this.model, (path) => {
    required(path.lieuTravail, { message: 'Sélectionnez un lieu de travail.' });
    required(path.distance, { message: 'Indiquez la distance.' });
    pattern(path.distance, DISTANCE_PATTERN, {
      message: 'Indiquez une distance avec au plus une décimale, par exemple 12,5.',
    });
  });

  /** Valeur calculée, pas un champ du formulaire : l'utilisateur ne la saisit jamais. */
  protected readonly allerRetourKm = computed(() => {
    const distance = parseDistance(this.lieuForm.distance().value());
    return distance === undefined ? '' : String(distance * 2).replace('.', ',');
  });

  protected onSubmit(): void {
    this.lieuForm().markAsTouched();

    if (this.lieuForm().valid()) {
      const { lieuTravail, distance } = this.model();
      this.store.enregistrer(lieuTravail, parseDistance(distance) ?? 0);
    }
  }
}
