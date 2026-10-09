import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeriodForm } from './period-form';
import type { Periode } from '../shared/dates';

describe('PeriodForm', () => {
  let component: PeriodForm;
  let fixture: ComponentFixture<PeriodForm>;
  let host: HTMLElement;
  let emis: (Periode | undefined)[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PeriodForm] }).compileComponents();
    fixture = TestBed.createComponent(PeriodForm);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    emis = [];
    component.valider.subscribe((p) => emis.push(p));
    await fixture.whenStable();
  });

  const champ = () => (component as unknown as { periodeForm: any }).periodeForm;

  async function fillAndValidate(from: string, to: string) {
    champ().from().value.set(from);
    champ().to().value.set(to);
    await fixture.whenStable();
    (component as unknown as { onSubmit: () => void }).onSubmit();
    await fixture.whenStable();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /** Les deux champs date visibles, ciblés par leur identifiant. */
  const champDate = (id: 'from' | 'to') => host.querySelector(`#${id}`) as HTMLInputElement;

  it('should render two dd/mm/yyyy fields and a submit button', () => {
    for (const id of ['from', 'to'] as const) {
      expect(champDate(id).type).toBe('text');
      expect(champDate(id).placeholder).toBe('JJ/MM/AAAA');
    }
    expect(host.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should emit the period once it is valid', async () => {
    await fillAndValidate('2026-01-01', '2026-03-31');
    expect(emis).toEqual([{ from: '2026-01-01', to: '2026-03-31' }]);
  });

  it('should reject a start that is not the first day of a month', async () => {
    await fillAndValidate('2026-09-28', '2026-12-31');
    expect(emis).toEqual([undefined]);
    expect(host.textContent).toContain('premier jour');
  });

  it('should reject a period that does not span three months', async () => {
    champ().from().value.set('2026-01-01');
    await fixture.whenStable();
    champ().to().value.set('2026-02-28');
    await fixture.whenStable();
    (component as unknown as { onSubmit: () => void }).onSubmit();
    await fixture.whenStable();

    expect(emis).toEqual([undefined]);
    expect(host.textContent).toContain('31/03/2026');
  });

  it('should fill the end date as soon as the start is a first of month', async () => {
    champ().from().value.set('2026-01-01');
    await fixture.whenStable();
    expect(champ().to().value()).toBe('2026-03-31');

    champ().from().value.set('2026-11-01');
    await fixture.whenStable();
    expect(champ().to().value()).toBe('2027-01-31');
  });

  it('should leave the end date alone while the start is unusable', async () => {
    champ().from().value.set('2026-01-1');
    await fixture.whenStable();
    expect(champ().to().value()).toBe('');

    champ().from().value.set('2026-01-15');
    await fixture.whenStable();
    expect(champ().to().value()).toBe('');
  });

  it('should show the filled end date as dd/mm/yyyy', async () => {
    champ().from().value.set('2026-01-01');
    await fixture.whenStable();
    expect(champDate('to').value).toBe('31/03/2026');
  });

  it('should emit undefined when nothing was filled in', async () => {
    (component as unknown as { onSubmit: () => void }).onSubmit();
    await fixture.whenStable();
    expect(emis).toEqual([undefined]);
    expect(host.textContent).toContain('Sélectionnez une date de début.');
  });

  it('should offer the four quarters', () => {
    const trimestre = host.querySelector('#trimestre') as HTMLSelectElement;
    const libelles = Array.from(trimestre.options).map((o) => o.textContent!.trim());
    for (const attendu of ['T1', 'T2', 'T3', 'T4']) {
      expect(libelles).toContain(attendu);
    }
  });

  it('should fill both dates from a quarter and a year', async () => {
    champ().trimestre().value.set('4');
    champ().annee().value.set('2026');
    await fixture.whenStable();

    expect(champ().from().value()).toBe('2026-10-01');
    expect(champ().to().value()).toBe('2026-12-31');
  });

  it('should show the filled dates as dd/mm/yyyy', async () => {
    champ().trimestre().value.set('1');
    champ().annee().value.set('2026');
    await fixture.whenStable();

    expect(champDate('from').value).toBe('01/01/2026');
    expect(champDate('to').value).toBe('31/03/2026');
  });

  it('should wait until both shortcuts are filled', async () => {
    champ().trimestre().value.set('2');
    await fixture.whenStable();
    expect(champ().from().value()).toBe('');

    champ().annee().value.set('202');
    await fixture.whenStable();
    expect(champ().from().value()).toBe('');

    champ().annee().value.set('2026');
    await fixture.whenStable();
    expect(champ().from().value()).toBe('2026-04-01');
  });

  it('should follow a later change of quarter or year', async () => {
    champ().trimestre().value.set('1');
    champ().annee().value.set('2026');
    await fixture.whenStable();
    expect(champ().to().value()).toBe('2026-03-31');

    champ().trimestre().value.set('4');
    await fixture.whenStable();
    expect(champ().from().value()).toBe('2026-10-01');
    expect(champ().to().value()).toBe('2026-12-31');

    champ().annee().value.set('2027');
    await fixture.whenStable();
    expect(champ().from().value()).toBe('2027-10-01');
  });

  it('should reject a year that is not four digits', async () => {
    champ().trimestre().value.set('1');
    champ().annee().value.set('26');
    await fixture.whenStable();
    (component as unknown as { onSubmit: () => void }).onSubmit();
    await fixture.whenStable();

    expect(emis).toEqual([undefined]);
    expect(host.textContent).toContain('quatre chiffres');
  });

  it('should emit a quarter-driven period, without the shortcuts', async () => {
    champ().trimestre().value.set('4');
    champ().annee().value.set('2026');
    await fixture.whenStable();
    (component as unknown as { onSubmit: () => void }).onSubmit();
    await fixture.whenStable();

    expect(emis).toEqual([{ from: '2026-10-01', to: '2026-12-31' }]);
  });

  it('should still accept dates typed without the shortcuts', async () => {
    await fillAndValidate('2026-01-01', '2026-03-31');
    expect(emis).toEqual([{ from: '2026-01-01', to: '2026-03-31' }]);
  });

  it('should align every row on its bottom edge, with no custom offset', () => {
    const rangees = Array.from(host.querySelectorAll('.fr-grid-row'));
    expect(rangees.length).toBe(2);
    for (const rangee of rangees) {
      expect(rangee.classList.contains('fr-grid-row--bottom')).toBe(true);
      expect(rangee.classList.contains('fr-grid-row--top')).toBe(false);
    }
    // Plus aucune classe maison : l'alignement vient entièrement du DSFR.
    expect(host.querySelector('.period-form__submit')).toBeNull();
  });
});
