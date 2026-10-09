import { Component, input } from '@angular/core';
import {
  DsfrHeaderComponent,
  DsfrLink,
  DsfrLogo,
  DsfrUserMenuComponent,
} from '@edugouvfr/ngx-dsfr';

@Component({
  imports: [DsfrHeaderComponent, DsfrUserMenuComponent],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  readonly title = 'Calculateur de déclaration Forfait Mobilité Durable';

  protected readonly logo: DsfrLogo = {
    navigation: { routerLink: '/' },
  };

  /** Le menu déroulant de l'en-tête connectée est une liste plate : `DsfrLink` n'a pas de sous-niveaux. */
  protected readonly userMenuLinks: DsfrLink[] = [
    {
      label: 'Configuration',
      routerLink: 'configuration',
      routerLinkActiveOptions: { exact: true },
    },
  ];
}
