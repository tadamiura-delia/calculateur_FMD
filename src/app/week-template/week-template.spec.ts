import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeekTemplate } from './week-template';
import { ConfigurationStore } from '../shared/configuration-store';

describe('WeekTemplate', () => {
  let fixture: ComponentFixture<WeekTemplate>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WeekTemplate] }).compileComponents();
    fixture = TestBed.createComponent(WeekTemplate);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  const store = () => TestBed.inject(ConfigurationStore);
  const semaineForm = () => (fixture.componentInstance as unknown as { semaineForm: any }).semaineForm;
  const lignes = () => Array.from(host.querySelectorAll('tbody tr'));
  const selecteurs = (tr: Element) => Array.from(tr.querySelectorAll('select')) as HTMLSelectElement[];
  const appliquer = () => (fixture.componentInstance as unknown as { appliquer: () => void }).appliquer();

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should list the seven days, Monday first', () => {
    expect(lignes().map((r) => r.querySelector('td')!.textContent!.trim())).toEqual([
      'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    ]);
  });

  it('should disable the whole row on Saturday and Sunday', () => {
    for (const i of [0, 1, 2, 3, 4]) {
      expect(selecteurs(lignes()[i]).map((s) => s.disabled)).toEqual([false, false]);
    }
    for (const i of [5, 6]) {
      expect(selecteurs(lignes()[i]).map((s) => s.disabled)).toEqual([true, true]);
    }
  });

  it('should offer a button that stores the week, indexed by weekday', () => {
    semaineForm()[0].lieu().value.set('agence-rennes'); // lundi
    semaineForm()[0].transport().value.set('velo');
    semaineForm()[4].lieu().value.set('teletravail'); // vendredi

    const bouton = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent!.includes('Appliquer la semaine type'),
    )!;
    expect(bouton).toBeTruthy();
    bouton.click();

    // `Date.getDay()` : lundi vaut 1, vendredi 5.
    expect(store().jourType(1)).toEqual({ lieu: 'agence-rennes', transport: 'velo' });
    expect(store().jourType(5)).toEqual({ lieu: 'teletravail', transport: '' });
  });

  it('should store weekends as congés/férié without transport', () => {
    appliquer();
    expect(store().jourType(6)).toEqual({ lieu: 'conges-ferie', transport: '' });
    expect(store().jourType(0)).toEqual({ lieu: 'conges-ferie', transport: '' });
  });

  it('should replace a previously stored week', () => {
    semaineForm()[0].lieu().value.set('agence-rennes');
    appliquer();
    expect(store().jourType(1)!.lieu).toBe('agence-rennes');

    semaineForm()[0].lieu().value.set('agence-nantes');
    appliquer();
    expect(store().jourType(1)!.lieu).toBe('agence-nantes');
  });

  it('should not leak later edits into the stored week', () => {
    semaineForm()[0].lieu().value.set('agence-rennes');
    appliquer();
    semaineForm()[0].lieu().value.set('mission-1');
    expect(store().jourType(1)!.lieu).toBe('agence-rennes');
  });

  it('should start empty when nothing was ever stored', () => {
    expect(semaineForm()[0].lieu().value()).toBe('');
    expect(store().semaineType()).toBeUndefined();
  });

  it('should reopen on the stored week', async () => {
    store().enregistrerSemaineType([
      { lieu: 'conges-ferie', transport: '' }, // dimanche
      { lieu: 'teletravail', transport: '' }, // lundi
      { lieu: 'agence-nantes', transport: 'covoiturage' }, // mardi
      { lieu: '', transport: '' },
      { lieu: '', transport: '' },
      { lieu: '', transport: '' },
      { lieu: 'conges-ferie', transport: '' }, // samedi
    ]);
    const rouvert = TestBed.createComponent(WeekTemplate);
    await rouvert.whenStable();
    const form = (rouvert.componentInstance as unknown as { semaineForm: any }).semaineForm;
    expect(form[0].lieu().value()).toBe('teletravail');
    expect(form[1].lieu().value()).toBe('agence-nantes');
    expect(form[1].transport().value()).toBe('covoiturage');
  });
});
