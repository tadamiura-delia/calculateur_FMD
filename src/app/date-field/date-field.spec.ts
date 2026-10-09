import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateField, frenchToIso, isoToFrench } from './date-field';

describe('DateField date conversion', () => {
  it('should convert a French date to ISO', () => {
    expect(frenchToIso('28/09/2026')).toBe('2026-09-28');
  });

  it('should convert an ISO date to French', () => {
    expect(isoToFrench('2026-09-28')).toBe('28/09/2026');
  });

  it('should make a round trip without losing anything', () => {
    expect(isoToFrench(frenchToIso('01/02/2026'))).toBe('01/02/2026');
  });

  it('should return an empty string for a malformed value', () => {
    expect(frenchToIso('')).toBe('');
    expect(frenchToIso('28/09')).toBe('');
    expect(isoToFrench('')).toBe('');
    expect(isoToFrench('28/09/2026')).toBe('');
  });
});

describe('DateField', () => {
  let fixture: ComponentFixture<DateField>;
  let host: HTMLElement;

  beforeEach(async () => {
    // jsdom n'implémente pas `showPicker` : sans ce complément, le composant
    // considère à juste titre que le navigateur ne sait pas ouvrir de
    // calendrier et masque le bouton.
    HTMLInputElement.prototype.showPicker ??= function showPicker() {};

    await TestBed.configureTestingModule({ imports: [DateField] }).compileComponents();
    fixture = TestBed.createComponent(DateField);
    fixture.componentRef.setInput('value', '');
    fixture.componentRef.setInput('label', 'Date de début');
    fixture.componentRef.setInput('inputId', 'from');
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  /** Le champ visible : celui que l'utilisateur voit et remplit. */
  const visible = () => host.querySelector('input.fr-input') as HTMLInputElement;
  /** Le champ date masqué, qui n'héberge que le calendrier natif. */
  const masque = () => host.querySelector('.date-field__picker') as HTMLInputElement;

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show a text field tied to its label', () => {
    const label = host.querySelector('label')!;
    expect(visible().getAttribute('type')).toBe('text');
    expect(visible().id).toBe('from');
    expect(label.getAttribute('for')).toBe('from');
  });

  it('should display the ISO model as dd/mm/yyyy', async () => {
    fixture.componentRef.setInput('value', '2026-09-28');
    await fixture.whenStable();
    expect(visible().value).toBe('28/09/2026');
  });

  it('should read a typed French date back as ISO', async () => {
    const el = visible();
    el.value = '29/09/2026';
    el.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('2026-09-29');
  });

  it('should keep every keystroke, without reformatting mid-typing', async () => {
    const el = visible();
    for (const typed of ['0', '05', '05/', '05/0', '05/03', '05/03/', '05/03/2', '05/03/2026']) {
      el.value = typed;
      el.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(visible().value).toBe(typed);
    }
    expect(fixture.componentInstance.value()).toBe('2026-03-05');
  });

  it('should keep a complete date on screen while a later edit is incomplete', async () => {
    const el = visible();
    el.value = '28/09/2026';
    el.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('2026-09-28');

    el.value = '28/09/202';
    el.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(visible().value).toBe('28/09/202');
  });

  it('should offer a calendar button that opens the native picker', () => {
    const bouton = host.querySelector('button')!;
    expect(bouton).toBeTruthy();
    expect(bouton.getAttribute('aria-label')).toContain('Date de début');

    let ouvert = false;
    masque().showPicker = () => {
      ouvert = true;
    };
    bouton.click();
    expect(ouvert).toBe(true);
  });

  it('should hand the hidden picker the current date in ISO', async () => {
    fixture.componentRef.setInput('value', '2026-09-28');
    await fixture.whenStable();
    expect(masque().getAttribute('type')).toBe('date');
    expect(masque().value).toBe('2026-09-28');
  });

  it('should take a date chosen in the calendar', async () => {
    const picker = masque();
    picker.value = '2026-10-15';
    picker.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe('2026-10-15');
    expect(visible().value).toBe('15/10/2026');
  });

  it('should keep the hidden picker out of the tab order', () => {
    expect(masque().getAttribute('tabindex')).toBe('-1');
    expect(masque().getAttribute('aria-hidden')).toBe('true');
  });

  it('should show an error only once the field is touched', async () => {
    fixture.componentRef.setInput('errors', [{ kind: 'required', message: 'Date obligatoire.' }]);
    await fixture.whenStable();
    expect(host.textContent).not.toContain('Date obligatoire.');

    fixture.componentRef.setInput('touched', true);
    await fixture.whenStable();
    expect(host.querySelector('.fr-message--error')).toBeTruthy();
  });

  it('should hide the calendar button when the browser cannot open one', async () => {
    const vrai = HTMLInputElement.prototype.showPicker;
    delete (HTMLInputElement.prototype as Partial<HTMLInputElement>).showPicker;
    try {
      const sansCalendrier = TestBed.createComponent(DateField);
      sansCalendrier.componentRef.setInput('value', '');
      sansCalendrier.componentRef.setInput('label', 'Date de début');
      sansCalendrier.componentRef.setInput('inputId', 'from2');
      await sansCalendrier.whenStable();

      const h = sansCalendrier.nativeElement as HTMLElement;
      expect(h.querySelector('button')).toBeNull();
      expect(h.querySelector('input.fr-input')).toBeTruthy();
    } finally {
      HTMLInputElement.prototype.showPicker = vrai;
    }
  });

  it('should emit touch when focus leaves', async () => {
    let touched = false;
    fixture.componentInstance.touch.subscribe(() => (touched = true));
    visible().dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await fixture.whenStable();
    expect(touched).toBe(true);
  });
});
