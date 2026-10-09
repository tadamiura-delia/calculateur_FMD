import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { applyEach, disabled, form, FormField } from '@angular/forms/signals';
import { DsfrTableComponent, type DsfrColumn } from '@edugouvfr/ngx-dsfr';
import { SelectField } from '../select-field/select-field';
import { ConfigurationStore, type SemaineType } from '../shared/configuration-store';
import {
  LIEU_CONGES_FERIE,
  LIEU_TRAVAIL_OPTIONS,
  TRANSPORT_OPTIONS,
} from '../shared/travail-options';
import {
  datesDeLaPeriode,
  enDateFrancaise,
  estWeekend,
  indexDuJour,
  nomDuJour,
  type Periode,
} from '../shared/dates';

/** Une journée de la période, éditable dans le tableau. */
export interface Journee {
  /** Date ISO « AAAA-MM-JJ ». Clé de la ligne, jamais modifiée par l'utilisateur. */
  date: string;
  lieu: string;
  transport: string;
}

/** Prime versée par kilomètre parcouru, en euros. */
const PRIME_PAR_KM = 0.2;

/**
 * Une ligne neuve. Le week-end est imposé ; les autres jours reprennent la
 * semaine type si elle a été enregistrée, et restent vides sinon.
 */
function enJournee(date: string, semaine: SemaineType | undefined): Journee {
  if (estWeekend(date)) {
    return { date, lieu: LIEU_CONGES_FERIE, transport: '' };
  }
  const habitude = semaine?.[indexDuJour(date)];
  return { date, lieu: habitude?.lieu ?? '', transport: habitude?.transport ?? '' };
}

/** Calendrier éditable de la période, et son récapitulatif kilomètres / prime. */
@Component({
  selector: 'app-calendar-table',
  imports: [SelectField, DsfrTableComponent, FormField],
  templateUrl: './calendar-table.html',
})
export class CalendarTable {
  /** Période à détailler. `undefined` tant qu'aucune n'est validée. */
  readonly periode = input<Periode | undefined>(undefined);

  private readonly store = inject(ConfigurationStore);

  protected readonly lieuTravailOptions = LIEU_TRAVAIL_OPTIONS;
  protected readonly transportOptions = TRANSPORT_OPTIONS;

  protected readonly colonnes: DsfrColumn[] = [
    { field: 'jour', label: 'Jour' },
    { field: 'date', label: 'Date' },
    { field: 'lieu', label: 'Lieu' },
    { field: 'transport', label: 'Moyen de transport' },
    { field: 'distance', label: 'Distance aller-retour (km)' },
  ];

  /**
   * Une entrée par jour de la période.
   *
   * `linkedSignal` plutôt que `computed` : les lignes dérivent de la période,
   * mais le formulaire doit pouvoir y écrire les saisies. Changer de période
   * repart donc d'un tableau neuf.
   */
  private readonly journees = linkedSignal<Journee[]>(() => {
    const periode = this.periode();
    if (!periode) {
      return [];
    }
    const semaine = this.store.semaineType();
    return datesDeLaPeriode(periode.from, periode.to).map((date) => enJournee(date, semaine));
  });

  protected readonly journeesForm = form(this.journees, (path) => {
    applyEach(path, (journee) => {
      // Samedi et dimanche : lieu figé sur « Congés / Férié », transport vide.
      disabled(journee.lieu, ({ valueOf }) => estWeekend(valueOf(journee.date)));
      disabled(journee.transport, ({ valueOf }) => estWeekend(valueOf(journee.date)));
    });
  });

  /**
   * Colonnes non éditables du tableau. La distance suit le lieu choisi : elle
   * est relue dans le store à chaque changement, jamais saisie à la main.
   */
  protected readonly lignes = computed(() =>
    this.journees().map((journee, index) => ({
      index,
      jour: nomDuJour(journee.date),
      date: enDateFrancaise(journee.date),
      // Le week-end ne compte jamais, même si « Congés / Férié » a reçu une
      // distance sur la page de configuration.
      distance: estWeekend(journee.date) ? 0 : this.store.allerRetour(journee.lieu),
    })),
  );

  /** Total des aller-retours de la période, en km. */
  protected readonly totalKm = computed(() =>
    this.lignes().reduce((total, ligne) => total + ligne.distance, 0),
  );

  /** Prime correspondante, en euros et à deux décimales. */
  protected readonly primeEuros = computed(() => (this.totalKm() * PRIME_PAR_KM).toFixed(2));
}
