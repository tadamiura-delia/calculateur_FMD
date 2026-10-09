import { Component, inject, linkedSignal } from '@angular/core';
import { applyEach, disabled, form, FormField } from '@angular/forms/signals';
import { DsfrButtonComponent, DsfrTableComponent, type DsfrColumn } from '@edugouvfr/ngx-dsfr';
import { SelectField } from '../select-field/select-field';
import { ConfigurationStore, type SemaineType } from '../shared/configuration-store';
import {
  LIEU_CONGES_FERIE,
  LIEU_TRAVAIL_OPTIONS,
  TRANSPORT_OPTIONS,
} from '../shared/travail-options';
import { isIndexWeekend, JOURS_DE_LA_SEMAINE } from '../shared/dates';

/** Une ligne de la semaine type. `index` suit la convention `Date.getDay()`. */
interface JourSemaine {
  index: number;
  nom: string;
  lieu: string;
  transport: string;
}

/** Les sept lignes, pré-remplies par la semaine type déjà enregistrée s'il y en a une. */
function createJoursPreRemplis(semaine: SemaineType | undefined): JourSemaine[] {
  return JOURS_DE_LA_SEMAINE.map(({ index, nom }) => {
    if (isIndexWeekend(index)) {
      return { index, nom, lieu: LIEU_CONGES_FERIE, transport: '' };
    }
    const jour = semaine?.[index];
    return { index, nom, lieu: jour?.lieu ?? '', transport: jour?.transport ?? '' };
  });
}

/** Semaine type : les habitudes de chaque jour, appliquées ensuite à une période. */
@Component({
  selector: 'app-week-template',
  imports: [SelectField, DsfrTableComponent, DsfrButtonComponent, FormField],
  templateUrl: './week-template.html',
})
export class WeekTemplate {
  private readonly store = inject(ConfigurationStore);

  protected readonly lieuTravailOptions = LIEU_TRAVAIL_OPTIONS;
  protected readonly transportOptions = TRANSPORT_OPTIONS;

  protected readonly colonnes: DsfrColumn[] = [
    { field: 'nom', label: 'Jour' },
    { field: 'lieu', label: 'Lieu de travail' },
    { field: 'transport', label: 'Moyen de transport' },
  ];

  /**
   * `linkedSignal` : les lignes repartent de la semaine enregistrée, tout en
   * restant modifiables par le formulaire.
   */
  private readonly jours = linkedSignal<JourSemaine[]>(() =>
    createJoursPreRemplis(this.store.semaineType()),
  );

  protected readonly semaineForm = form(this.jours, (path) => {
    applyEach(path, (jour) => {
      // Samedi et dimanche ne se configurent pas : toute la ligne est figée.
      disabled(jour.lieu, { when: ({ valueOf }) => isIndexWeekend(valueOf(jour.index)) });
      disabled(jour.transport, { when: ({ valueOf }) => isIndexWeekend(valueOf(jour.index)) });
    });
  });

  /** Enregistre la semaine type, rangée par indice de jour. */
  protected apply(): void {
    const semaine: { lieu: string; transport: string }[] = Array.from({ length: 7 }, () => ({
      lieu: '',
      transport: '',
    }));
    for (const jour of this.jours()) {
      semaine[jour.index] = { lieu: jour.lieu, transport: jour.transport };
    }
    this.store.saveSemaineType(semaine);
  }
}
