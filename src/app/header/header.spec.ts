import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('title', 'tuto_angular_dsfr');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the user menu items in the header tools', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = Array.from(
      compiled.querySelectorAll<HTMLElement>('.fr-header__tools-links .fr-menu__list a'),
    ).map((link) => link.textContent?.trim());
    expect(labels).toContain('Configuration');
  });

  it('should display the project name as the service title', () => {
    const serviceTitle: HTMLElement = fixture.nativeElement.querySelector(
      '.fr-header__service-title',
    );
    expect(serviceTitle.textContent).toContain('tuto_angular_dsfr');
  });
});
