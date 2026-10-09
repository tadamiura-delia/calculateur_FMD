import { Component, effect, output, signal, untracked } from '@angular/core';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { DsfrButtonComponent, type DsfrSelectOption } from '@edugouvfr/ngx-dsfr';
import { DateField } from '../date-field/date-field';
import { SelectField } from '../select-field/select-field';
import { TextField } from '../text-field/text-field';
import {
  debutDeTrimestre,
  enDateFrancaise,
  isPremierDuMois,
  finDePeriode,
  MOIS_PAR_PERIODE,
  TRIMESTRES,
  type Periode,
} from '../shared/dates';

/** Format produit par un champ de date DSFR : « AAAA-MM-JJ ». */
const ISO_DATE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

/** Une année sur quatre chiffres. */
const ANNEE = /^\d{4}$/;

/** « T1 » … « T4 », proposés dans la liste déroulante. */
const TRIMESTRE_OPTIONS: DsfrSelectOption[] = TRIMESTRES.map((numero) => ({
  label: `T${numero}`,
  value: String(numero),
}));

/** Choix d'une période : deux dates et leur validation croisée. */
@Component({
  selector: 'app-period-form',
  imports: [DateField, SelectField, TextField, DsfrButtonComponent, FormRoot, FormField],
  templateUrl: './period-form.html',
})
export class PeriodForm {
  /** La période à chaque validation, ou `undefined` si la saisie est invalide. */
  readonly valider = output<Periode | undefined>();

  protected readonly trimestreOptions = TRIMESTRE_OPTIONS;

  /**
   * Trimestre et année ne sont que des raccourcis de saisie : ils ne font pas
   * partie de la période émise et restent donc facultatifs.
   */
  private readonly model = signal({ trimestre: '', annee: '', from: '', to: '' });

  protected readonly periodeForm = form(this.model, (path) => {
    // Facultatif, mais s'il est renseigné il doit tenir sur quatre chiffres.
    // `maxLength` pose aussi l'attribut sur le champ : c'est la seule façon de
    // le faire, Angular interdisant de l'écrire sur un porteur de `[formField]`.
    maxLength(path.annee, 4);
    pattern(path.annee, ANNEE, { message: 'Saisissez une année sur quatre chiffres.' });

    // `pattern` ignore la valeur vide : `required` s'en charge déjà.
    required(path.from, { message: 'Sélectionnez une date de début.' });
    pattern(path.from, ISO_DATE, { message: 'Saisissez une date de début valide.' });

    validate(path.from, ({ value }) => {
      const from = value();
      // Le format est déjà contrôlé plus haut : on ne se prononce pas tant
      // qu'il n'est pas bon.
      if (!ISO_DATE.test(from) || isPremierDuMois(from)) {
        return undefined;
      }
      return {
        kind: 'debutDeMois',
        message: "La période doit commencer le premier jour d'un mois.",
      };
    });

    required(path.to, { message: 'Sélectionnez une date de fin.' });
    pattern(path.to, ISO_DATE, { message: 'Saisissez une date de fin valide.' });

    validate(path.to, ({ value, valueOf }) => {
      const from = valueOf(path.from);
      const to = value();
      // Sans début exploitable, la fin attendue est incalculable : c'est le
      // champ « from » qui porte alors le message.
      if (!isPremierDuMois(from) || !ISO_DATE.test(to)) {
        return undefined;
      }
      const attendue = finDePeriode(from);
      return to === attendue
        ? undefined
        : {
            kind: 'dureePeriode',
            message:
              `La période doit couvrir ${MOIS_PAR_PERIODE} mois : ` +
              `la date de fin attendue est le ${enDateFrancaise(attendue)}.`,
          };
    });
  });

  // Trimestre et année renseignés : la date de début en découle. La date de
  // fin suit ensuite d'elle-même, par l'effet ci-dessous.
  private readonly _effectTrimestre = effect(() => {
    const trimestre = Number(this.periodeForm.trimestre().value());
    const annee = this.periodeForm.annee().value();
    if (!trimestre || !ANNEE.test(annee)) {
      return;
    }
    const debut = debutDeTrimestre(trimestre, Number(annee));
    const from = this.periodeForm.from();
    if (untracked(from.value) !== debut) {
      from.value.set(debut);
    }
  });

  // Dès que le début est exploitable, la fin en découle : on la propose
  // sans attendre. Le champ reste modifiable, la règle ci-dessus signalant
  // alors l'écart.
  private readonly _effectFrom = effect(() => {
    const from = this.periodeForm.from().value();
    if (!isPremierDuMois(from)) {
      return;
    }
    const attendue = finDePeriode(from);
    const to = this.periodeForm.to();
    if (untracked(to.value) !== attendue) {
      to.value.set(attendue);
    }
  });

  protected onSubmit(): void {
    this.periodeForm().markAsTouched();

    if (!this.periodeForm().valid()) {
      this.valider.emit(undefined);
      return;
    }

    const { from, to } = this.model();
    this.valider.emit({ from, to });
  }
}
