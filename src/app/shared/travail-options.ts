import type { DsfrSelectOption } from '@edugouvfr/ngx-dsfr';

/** Valeur du lieu imposée aux samedis et dimanches. */
export const LIEU_CONGES_FERIE = 'conges-ferie';

/** Lieux de travail, partagés par la configuration et le calendrier. */
export const LIEU_TRAVAIL_OPTIONS: DsfrSelectOption[] = [
  { label: 'Télétravail', value: 'teletravail' },
  { label: 'Congés / Férié', value: LIEU_CONGES_FERIE },
  { label: 'Delia Rennes (61, Rue Jean Guéhenno)', value: 'agence-rennes' },
  { label: 'Delia Nantes (11 Imp Juton)', value: 'agence-nantes' },
  { label: 'Mission 1', value: 'mission-1' },
  { label: 'Mission 2', value: 'mission-2' },
];

/** Moyens de transport. L'option vide permet de ne rien déclarer. */
export const TRANSPORT_OPTIONS: DsfrSelectOption[] = [
  { label: '', value: '' },
  { label: 'Vélo', value: 'velo' },
  { label: 'Covoiturage', value: 'covoiturage' },
];
