import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarTable } from './calendar-table';
import { ConfigurationStore } from '../shared/configuration-store';

describe('CalendarTable', () => {
  let fixture: ComponentFixture<CalendarTable>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CalendarTable] }).compileComponents();
    fixture = TestBed.createComponent(CalendarTable);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  async function periode(from: string, to: string) {
    fixture.componentRef.setInput('periode', { from, to });
    await fixture.whenStable();
  }

  const store = () => TestBed.inject(ConfigurationStore);
  const journeesForm = () => (fixture.componentInstance as unknown as { journeesForm: any }).journeesForm;
  const lignes = () => Array.from(host.querySelectorAll('tbody tr'));
  const cellules = (tr: Element) =>
    Array.from(tr.querySelectorAll('td')).map((td) => td.textContent!.trim());
  const distanceDe = (i: number) => cellules(lignes()[i])[4];
  const selecteurs = (tr: Element) => Array.from(tr.querySelectorAll('select')) as HTMLSelectElement[];
  const resume = () => host.querySelector('.fr-callout')!.textContent!.replace(/\s+/g, ' ').trim();

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render nothing without a period', () => {
    expect(host.querySelector('dsfr-datatable')).toBeNull();
  });

  it('should create one row per day, bounds included', async () => {
    await periode('2026-09-28', '2026-10-04');
    expect(lignes().length).toBe(7);
  });

  it('should label each row with its weekday and French date', async () => {
    await periode('2026-09-28', '2026-10-04');
    expect(cellules(lignes()[0]).slice(0, 2)).toEqual(['lundi', '28/09/2026']);
    expect(cellules(lignes()[5]).slice(0, 2)).toEqual(['samedi', '03/10/2026']);
    expect(cellules(lignes()[6]).slice(0, 2)).toEqual(['dimanche', '04/10/2026']);
  });

  it('should span month and year boundaries', async () => {
    await periode('2026-12-30', '2027-01-02');
    expect(lignes().map((r) => cellules(r)[1])).toEqual([
      '30/12/2026', '31/12/2026', '01/01/2027', '02/01/2027',
    ]);
  });

  it('should disable both selects on weekends only', async () => {
    await periode('2026-09-28', '2026-10-04');
    for (const i of [0, 1, 2, 3, 4]) {
      expect(selecteurs(lignes()[i]).map((s) => s.disabled)).toEqual([false, false]);
    }
    for (const i of [5, 6]) {
      expect(selecteurs(lignes()[i]).map((s) => s.disabled)).toEqual([true, true]);
    }
  });

  it('should preset weekends to congés/férié with no transport', async () => {
    await periode('2026-10-03', '2026-10-04');
    expect(journeesForm()[0].lieu().value()).toBe('conges-ferie');
    expect(journeesForm()[0].transport().value()).toBe('');
  });

  it('should leave weekdays empty and editable', async () => {
    await periode('2026-09-28', '2026-09-29');
    expect(journeesForm()[0].lieu().value()).toBe('');

    journeesForm()[0].lieu().value.set('agence-rennes');
    journeesForm()[0].transport().value.set('velo');
    await fixture.whenStable();
    expect(journeesForm()[0].lieu().value()).toBe('agence-rennes');
    expect(journeesForm()[0].transport().value()).toBe('velo');
  });

  it('should rebuild its rows when the period changes', async () => {
    await periode('2026-09-28', '2026-09-30');
    journeesForm()[0].lieu().value.set('agence-rennes');
    await fixture.whenStable();
    expect(lignes().length).toBe(3);

    await periode('2026-10-05', '2026-10-06');
    expect(lignes().length).toBe(2);
    expect(journeesForm()[0].lieu().value()).toBe('');
  });

  it('should show 0 km for a place that was never configured', async () => {
    await periode('2026-09-28', '2026-09-29');
    journeesForm()[0].lieu().value.set('agence-rennes');
    await fixture.whenStable();
    expect(distanceDe(0)).toBe('0');
  });

  it('should apply the round trip of the chosen place, and follow a change', async () => {
    store().save('agence-rennes', 12);
    store().save('agence-nantes', 40);
    await periode('2026-09-28', '2026-09-29');

    journeesForm()[0].lieu().value.set('agence-rennes');
    await fixture.whenStable();
    expect(distanceDe(0)).toBe('24');
    expect(distanceDe(1)).toBe('0');

    journeesForm()[0].lieu().value.set('agence-nantes');
    await fixture.whenStable();
    expect(distanceDe(0)).toBe('80');
    expect(journeesForm()[0].lieu().value()).toBe('agence-nantes');
  });

  it('should keep weekends at 0 even when congés/férié has a distance', async () => {
    store().save('conges-ferie', 30);
    await periode('2026-10-03', '2026-10-04');
    expect(distanceDe(0)).toBe('0');
    expect(distanceDe(1)).toBe('0');
  });

  it('should total the period and derive the premium at 0.2 €/km', async () => {
    store().save('agence-rennes', 12); // 24 km aller-retour
    await periode('2026-09-28', '2026-09-30');

    journeesForm()[0].lieu().value.set('agence-rennes');
    journeesForm()[1].lieu().value.set('agence-rennes');
    await fixture.whenStable();
    expect(resume()).toContain('Total : 48 km');
    expect(resume()).toContain('Prime correspondante : 9.60 €');
  });

  it('should always render the premium with two decimals, above the table', async () => {
    store().save('agence-rennes', 5); // 10 km aller-retour
    await periode('2026-09-28', '2026-09-29');
    journeesForm()[0].lieu().value.set('agence-rennes');
    await fixture.whenStable();
    expect(resume()).toContain('Prime correspondante : 2.00 €');

    const callout = host.querySelector('.fr-callout')!;
    const table = host.querySelector('dsfr-datatable')!;
    expect(callout.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  /** Semaine type : télétravail le lundi, Nantes à vélo le mardi. */
  function semaineType() {
    store().saveSemaineType([
      { lieu: 'conges-ferie', transport: '' }, // dimanche
      { lieu: 'teletravail', transport: '' }, // lundi
      { lieu: 'agence-nantes', transport: 'velo' }, // mardi
      { lieu: '', transport: '' },
      { lieu: '', transport: '' },
      { lieu: '', transport: '' },
      { lieu: 'conges-ferie', transport: '' }, // samedi
    ]);
  }

  it('should leave rows empty when no week template was stored', async () => {
    await periode('2026-09-28', '2026-09-29');
    expect(journeesForm()[0].lieu().value()).toBe('');
    expect(journeesForm()[0].transport().value()).toBe('');
  });

  it('should prefill each day from the stored week template', async () => {
    semaineType();
    await periode('2026-09-28', '2026-09-30'); // lundi, mardi, mercredi

    expect(journeesForm()[0].lieu().value()).toBe('teletravail');
    expect(journeesForm()[1].lieu().value()).toBe('agence-nantes');
    expect(journeesForm()[1].transport().value()).toBe('velo');
    // Mercredi n'est pas renseigné dans la semaine type.
    expect(journeesForm()[2].lieu().value()).toBe('');
  });

  it('should repeat the week template across several weeks', async () => {
    semaineType();
    await periode('2026-09-28', '2026-10-06'); // deux lundis, deux mardis

    expect(journeesForm()[0].lieu().value()).toBe('teletravail'); // lundi 28/09
    expect(journeesForm()[7].lieu().value()).toBe('teletravail'); // lundi 05/10
    expect(journeesForm()[8].lieu().value()).toBe('agence-nantes'); // mardi 06/10
  });

  it('should keep weekends on congés/férié whatever the week template says', async () => {
    store().saveSemaineType(
      Array.from({ length: 7 }, () => ({ lieu: 'agence-rennes', transport: 'velo' })),
    );
    await periode('2026-10-03', '2026-10-04'); // samedi + dimanche

    for (const i of [0, 1]) {
      expect(journeesForm()[i].lieu().value()).toBe('conges-ferie');
      expect(journeesForm()[i].transport().value()).toBe('');
      expect(selecteurs(lignes()[i]).map((s) => s.disabled)).toEqual([true, true]);
    }
  });

  it('should carry the template distance straight into the summary', async () => {
    store().save('agence-nantes', 40); // 80 km aller-retour
    semaineType();
    await periode('2026-09-28', '2026-09-30'); // mardi seul est à Nantes

    expect(distanceDe(1)).toBe('80');
    expect(resume()).toContain('Total : 80 km');
    expect(resume()).toContain('Prime correspondante : 16.00 €');
  });
});
