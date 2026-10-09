import { Component, signal } from '@angular/core';
import { PeriodForm } from '../period-form/period-form';
import { CalendarTable } from '../calendar-table/calendar-table';
import type { Periode } from '../shared/dates';

@Component({
  imports: [PeriodForm, CalendarTable],
  selector: 'app-homepage',
  templateUrl: './homepage.html',
})
export class Homepage {
  /** Dernière période validée. `undefined` tant qu'aucune ne l'est. */
  protected readonly periode = signal<Periode | undefined>(undefined);
}
