import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectField } from './select-field';

describe('SelectField', () => {
  let fixture: ComponentFixture<SelectField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectField] }).compileComponents();
    fixture = TestBed.createComponent(SelectField);
    fixture.componentRef.setInput('value', '');
    fixture.componentRef.setInput('label', 'Lieu');
    fixture.componentRef.setInput('inputId', 'lieu-0');
    fixture.componentRef.setInput('options', [
      { label: 'Télétravail', value: 'teletravail' },
      { label: 'Vélo', value: 'velo' },
    ]);
    await fixture.whenStable();
  });

  const select = () => (fixture.nativeElement as HTMLElement).querySelector('select')!;

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render its options', () => {
    const labels = Array.from(select().options).map((o) => o.textContent!.trim());
    expect(labels).toContain('Télétravail');
    expect(labels).toContain('Vélo');
  });

  it('should write the value down to the select', async () => {
    fixture.componentRef.setInput('value', 'velo');
    await fixture.whenStable();
    expect(select().value).toContain('velo');
  });

  it('should be disabled when asked', async () => {
    expect(select().disabled).toBe(false);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    expect(select().disabled).toBe(true);
  });

  it('should show an error only once touched', async () => {
    fixture.componentRef.setInput('errors', [{ kind: 'required', message: 'Lieu obligatoire.' }]);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Lieu obligatoire.');

    fixture.componentRef.setInput('touched', true);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Lieu obligatoire.');
  });
});
