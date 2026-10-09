/** Une période, bornes comprises, au format ISO « AAAA-MM-JJ ». */
export interface Periode {
  from: string;
  to: string;
}

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** Indice du jour de la semaine (0 = dimanche), calculé en UTC pour rester stable. */
export function indexDuJour(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** « lundi », « mardi »… */
export function nomDuJour(isoDate: string): string {
  return JOURS[indexDuJour(isoDate)];
}

/** Les sept jours, dans l'ordre d'affichage, avec leur indice `getDay()`. */
export const JOURS_DE_LA_SEMAINE: readonly { index: number; nom: string }[] = [
  { index: 1, nom: 'lundi' },
  { index: 2, nom: 'mardi' },
  { index: 3, nom: 'mercredi' },
  { index: 4, nom: 'jeudi' },
  { index: 5, nom: 'vendredi' },
  { index: 6, nom: 'samedi' },
  { index: 0, nom: 'dimanche' },
];

/** Vrai pour les indices du samedi et du dimanche. */
export function estIndexWeekend(index: number): boolean {
  return index === 0 || index === 6;
}

/** Vrai les samedis et dimanches. */
export function estWeekend(isoDate: string): boolean {
  const jour = indexDuJour(isoDate);
  return jour === 0 || jour === 6;
}

/** « AAAA-MM-JJ » → « JJ/MM/AAAA ». */
export function enDateFrancaise(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Toutes les dates ISO de la période, bornes comprises.
 *
 * L'itération avance de 24 h en UTC : le passage à l'heure d'été, qui ferait
 * sauter ou répéter un jour en heure locale, n'a pas d'effet ici.
 */
export function datesDeLaPeriode(fromIso: string, toIso: string): string[] {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  const fin = Date.UTC(ty, tm - 1, td);
  const dates: string[] = [];

  for (let jour = Date.UTC(fy, fm - 1, fd); jour <= fin; jour += 86_400_000) {
    const date = new Date(jour);
    const mois = String(date.getUTCMonth() + 1).padStart(2, '0');
    const numero = String(date.getUTCDate()).padStart(2, '0');
    dates.push(`${date.getUTCFullYear()}-${mois}-${numero}`);
  }
  return dates;
}

/** Nombre de mois que doit couvrir une période. */
export const MOIS_PAR_PERIODE = 3;

/** Vrai si la date ISO tombe le premier jour d'un mois. */
export function estPremierDuMois(isoDate: string): boolean {
  return /^\d{4}-\d{2}-01$/.test(isoDate);
}

/**
 * Dernier jour de la période de trois mois ouverte par `isoDebut`.
 *
 * Le jour 0 d'un mois désigne le dernier jour du mois précédent : viser le
 * mois qui suit le troisième donne donc sa fin, et le calcul franchit tout
 * seul les changements d'année comme les février bissextiles.
 */
export function finDePeriode(isoDebut: string): string {
  const [year, month] = isoDebut.split('-').map(Number);
  const fin = new Date(Date.UTC(year, month - 1 + MOIS_PAR_PERIODE, 0));
  const mois = String(fin.getUTCMonth() + 1).padStart(2, '0');
  const jour = String(fin.getUTCDate()).padStart(2, '0');
  return `${fin.getUTCFullYear()}-${mois}-${jour}`;
}

/** Numéros de trimestre valides. */
export const TRIMESTRES = [1, 2, 3, 4] as const;

/**
 * Premier jour du trimestre, au format ISO.
 *
 * Un trimestre n'est rien d'autre qu'une période de trois mois ouverte un
 * premier du mois : sa fin s'obtient donc avec `finDePeriode`, sans calcul
 * supplémentaire.
 */
export function debutDeTrimestre(trimestre: number, annee: number): string {
  const mois = String((trimestre - 1) * MOIS_PAR_PERIODE + 1).padStart(2, '0');
  return `${annee}-${mois}-01`;
}
