import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Configuration } from './configuration';

describe('Configuration', () => {
  let component: Configuration;
  let fixture: ComponentFixture<Configuration>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Configuration] }).compileComponents();
    fixture = TestBed.createComponent(Configuration);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should gather both configuration blocks, distances first', () => {
    const lieux = host.querySelector('app-workplace-distances')!;
    const semaine = host.querySelector('app-week-template')!;
    expect(lieux).toBeTruthy();
    expect(semaine).toBeTruthy();
    expect(lieux.compareDocumentPosition(semaine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('should show one table per block', () => {
    expect(host.querySelector('#distances')).toBeTruthy();
    expect(host.querySelector('#semaine-type')).toBeTruthy();
  });
});
