import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Homepage } from './homepage';

/**
 * Rendre un trimestre complet (environ 90 lignes, deux listes DSFR chacune)
 * prend environ 5 s sous jsdom : plus que le délai par défaut de Vitest.
 */
const CALENDRIER_TIMEOUT = 20_000;

describe('Homepage', () => {
  let component: Homepage;
  let fixture: ComponentFixture<Homepage>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Homepage] }).compileComponents();
    fixture = TestBed.createComponent(Homepage);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the period form, and no calendar yet', () => {
    expect(host.querySelector('app-period-form')).toBeTruthy();
    expect(host.querySelector('dsfr-datatable')).toBeNull();
  });

  /** Remplit les deux champs visibles en JJ/MM/AAAA, puis soumet. */
  async function validerPeriode(from: string, to: string) {
    const debut = host.querySelector('#from') as HTMLInputElement;
    const fin = host.querySelector('#to') as HTMLInputElement;
    debut.value = from;
    debut.dispatchEvent(new Event('input'));
    fin.value = to;
    fin.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    host.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('should hand the validated period over to the calendar', { timeout: CALENDRIER_TIMEOUT }, async () => {
    await validerPeriode('01/01/2026', '31/03/2026');

    expect(host.querySelectorAll('tbody tr').length).toBe(31 + 28 + 31);
    expect(host.querySelector('.fr-callout')!.textContent).toContain('Total : 0 km');
  });

  it('should clear the calendar when a later period is invalid', { timeout: CALENDRIER_TIMEOUT }, async () => {
    await validerPeriode('01/01/2026', '31/03/2026');
    expect(host.querySelectorAll('tbody tr').length).toBe(31 + 28 + 31);

    await validerPeriode('15/01/2026', '31/03/2026');
    expect(host.querySelector('dsfr-datatable')).toBeNull();
  });
});
