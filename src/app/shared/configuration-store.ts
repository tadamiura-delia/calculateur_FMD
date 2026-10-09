import { computed, Service, signal } from '@angular/core';
import { LIEU_TRAVAIL_OPTIONS } from './travail-options';

/** Un lieu de travail et la distance qui lui est associée. */
export interface LieuDistance {
  value: string;
  label: string;
  /** Distance simple, en km. */
  distance: number;
  /** Distance aller-retour, en km. */
  allerRetour: number;
}

/** Lieu et moyen de transport habituels d'un jour de la semaine. */
export interface JourType {
  lieu: string;
  transport: string;
}

/**
 * Semaine type : sept entrées indexées comme `Date.getDay()`, donc
 * 0 pour dimanche et 6 pour samedi.
 */
export type SemaineType = readonly JourType[];

/**
 * Distances de trajet, par lieu de travail.
 *
 * Un lieu ne porte qu'une seule distance : l'enregistrer une seconde fois
 * remplace la précédente. Un lieu jamais configuré vaut 0.
 */
@Service()
export class ConfigurationStore {
  /** Distance simple par lieu. Une clé absente signifie « jamais configuré ». */
  private readonly distances = signal<Record<string, number>>({});

  /** Semaine type, indexée comme `Date.getDay()`. */
  private readonly semaine = signal<SemaineType | undefined>(undefined);

  /** Tous les lieux connus, configurés ou non, dans l'ordre de la liste de référence. */
  readonly lieux = computed<LieuDistance[]>(() => {
    const distances = this.distances();
    return LIEU_TRAVAIL_OPTIONS.map((option) => {
      const value = String(option.value ?? '');
      const distance = distances[value] ?? 0;
      return { value, label: option.label, distance, allerRetour: distance * 2 };
    });
  });

  /** Distance simple d'un lieu, 0 s'il n'a jamais été configuré. */
  distance(lieu: string): number {
    return this.distances()[lieu] ?? 0;
  }

  /** Distance aller-retour d'un lieu, 0 s'il n'a jamais été configuré. */
  allerRetour(lieu: string): number {
    return this.distance(lieu) * 2;
  }

  /** Associe une distance à un lieu, en remplaçant celle déjà enregistrée. */
  save(lieu: string, distance: number): void {
    this.distances.update((actuelles) => ({ ...actuelles, [lieu]: distance }));
  }

  /** Semaine type enregistrée, ou `undefined` si aucune ne l'a jamais été. */
  readonly semaineType = this.semaine.asReadonly();

  /** Habitudes d'un jour de la semaine, `undefined` faute de semaine type. */
  jourType(index: number): JourType | undefined {
    return this.semaine()?.[index];
  }

  /** Remplace la semaine type par celle fournie. */
  saveSemaineType(semaine: SemaineType): void {
    this.semaine.set(semaine.map((jour) => ({ ...jour })));
  }
}
