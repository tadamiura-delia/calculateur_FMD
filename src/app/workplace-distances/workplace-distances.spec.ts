import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkplaceDistances } from './workplace-distances';
import { ConfigurationStore } from '../shared/configuration-store';

describe('WorkplaceDistances', () => {
  let component: WorkplaceDistances;
  let fixture: ComponentFixture<WorkplaceDistances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkplaceDistances],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkplaceDistances);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render every option of the model', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = Array.from(compiled.querySelectorAll<HTMLOptionElement>('form .fr-select option'))
      .filter((option) => !option.disabled)
      .map((option) => option.textContent?.trim());
    expect(labels).toEqual(component['lieuTravailOptions'].map((option) => option.label));
  });

  it('should show an error when submitting without a choice', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(compiled.querySelector('.fr-message')?.textContent).toContain('Sélectionnez un lieu de travail.');
  });

  it('should write the selected option into the form model', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector<HTMLSelectElement>('.fr-select')!;
    select.selectedIndex = 2; // l'option 0 est le placeholder ajouté par le DSFR
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(component['lieuForm'].lieuTravail().value()).toBe(component['lieuTravailOptions'][1].value);
  });

  it('should compute the round trip as twice the distance, in a read-only field', async () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const select = compiled.querySelector<HTMLSelectElement>('.fr-select')!;
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const distance = compiled.querySelector<HTMLInputElement>('input.fr-input')!;
    distance.value = '12';
    distance.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const inputs = compiled.querySelectorAll<HTMLInputElement>('input.fr-input');
    expect(inputs.length).toBe(2);
    expect(inputs[1].value).toBe('24');
    expect(inputs[1].readOnly).toBe(true);
  });

  /** Lignes du tableau des distances, cellule par cellule. */
  function lignesDistances(): string[][] {
    const compiled = fixture.nativeElement as HTMLElement;
    return Array.from(compiled.querySelectorAll('#distances tbody tr')).map((row) =>
      Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent!.trim()),
    );
  }

  async function fillAndSubmit(lieu: string, distance: string) {
    component['lieuForm'].lieuTravail().value.set(lieu);
    component['lieuForm'].distance().value.set(distance);
    await fixture.whenStable();
    component['onSubmit']();
    await fixture.whenStable();
  }

  it('should list every place at 0 before anything is configured', () => {
    const lignes = lignesDistances();
    expect(lignes.length).toBe(component['lieuTravailOptions'].length);
    expect(lignes[0]).toEqual(['Télétravail', '0', '0']);
    expect(lignes.every((ligne) => ligne[1] === '0')).toBe(true);
  });

  it('should show a saved distance and its round trip', async () => {
    await fillAndSubmit('agence-rennes', '12');

    const rennes = lignesDistances().find((ligne) => ligne[0].startsWith('Delia Rennes'))!;
    expect(rennes.slice(1)).toEqual(['12', '24']);
    expect(TestBed.inject(ConfigurationStore).distance('agence-rennes')).toBe(12);
  });

  it('should accept a distance with one decimal, comma or dot', async () => {
    await fillAndSubmit('agence-rennes', '12,5');
    expect(TestBed.inject(ConfigurationStore).distance('agence-rennes')).toBe(12.5);
    expect(component['allerRetourKm']()).toBe('25');

    await fillAndSubmit('agence-rennes', '7.3');
    expect(TestBed.inject(ConfigurationStore).distance('agence-rennes')).toBe(7.3);
    expect(component['allerRetourKm']()).toBe('14,6');
  });

  it('should reject a distance with more than one decimal', async () => {
    await fillAndSubmit('agence-rennes', '12,55');
    expect(TestBed.inject(ConfigurationStore).distance('agence-rennes')).toBe(0);
  });

  it('should keep a single distance per place', async () => {
    await fillAndSubmit('agence-rennes', '12');
    await fillAndSubmit('agence-rennes', '30');

    const rennes = lignesDistances().filter((ligne) => ligne[0].startsWith('Delia Rennes'));
    expect(rennes.length).toBe(1);
    expect(rennes[0].slice(1)).toEqual(['30', '60']);
  });

  it('should leave other places untouched', async () => {
    await fillAndSubmit('agence-rennes', '12');

    const nantes = lignesDistances().find((ligne) => ligne[0].startsWith('Delia Nantes'))!;
    expect(nantes.slice(1)).toEqual(['0', '0']);
  });

  it('should not save when the form is invalid', async () => {
    component['lieuForm'].lieuTravail().value.set('agence-nantes');
    await fixture.whenStable();
    component['onSubmit']();
    await fixture.whenStable();

    expect(TestBed.inject(ConfigurationStore).distance('agence-nantes')).toBe(0);
  });
});
