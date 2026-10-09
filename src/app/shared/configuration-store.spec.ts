import { TestBed } from '@angular/core/testing';
import { ConfigurationStore } from './configuration-store';
import { LIEU_TRAVAIL_OPTIONS } from './travail-options';

describe('ConfigurationStore', () => {
  let store: ConfigurationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ConfigurationStore);
  });

  it('should default an unconfigured place to 0', () => {
    expect(store.distance('agence-rennes')).toBe(0);
    expect(store.allerRetour('agence-rennes')).toBe(0);
    expect(store.distance('lieu-inconnu')).toBe(0);
  });

  it('should list every known place, configured or not', () => {
    expect(store.lieux().length).toBe(LIEU_TRAVAIL_OPTIONS.length);
    expect(store.lieux().every((l) => l.distance === 0)).toBe(true);
    expect(store.lieux()[0].label).toBe('Télétravail');
  });

  it('should record a distance and derive the round trip', () => {
    store.enregistrer('agence-rennes', 12);
    expect(store.distance('agence-rennes')).toBe(12);
    expect(store.allerRetour('agence-rennes')).toBe(24);

    const rennes = store.lieux().find((l) => l.value === 'agence-rennes')!;
    expect(rennes.distance).toBe(12);
    expect(rennes.allerRetour).toBe(24);
  });

  it('should keep a single distance per place, replacing the previous one', () => {
    store.enregistrer('agence-rennes', 12);
    store.enregistrer('agence-rennes', 30);
    expect(store.distance('agence-rennes')).toBe(30);
    expect(store.lieux().filter((l) => l.value === 'agence-rennes').length).toBe(1);
  });

  it('should keep places independent from one another', () => {
    store.enregistrer('agence-rennes', 12);
    store.enregistrer('agence-nantes', 40);
    expect(store.distance('agence-rennes')).toBe(12);
    expect(store.distance('agence-nantes')).toBe(40);
    expect(store.distance('teletravail')).toBe(0);
  });

  it('should be a singleton shared across injections', () => {
    store.enregistrer('mission-1', 7);
    expect(TestBed.inject(ConfigurationStore).distance('mission-1')).toBe(7);
  });
});
