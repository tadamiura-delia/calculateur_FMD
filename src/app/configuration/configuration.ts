import { Component } from '@angular/core';
import { WorkplaceDistances } from '../workplace-distances/workplace-distances';
import { WeekTemplate } from '../week-template/week-template';

@Component({
  imports: [WorkplaceDistances, WeekTemplate],
  selector: 'app-configuration',
  templateUrl: './configuration.html',
})
export class Configuration {}
