import {
  datesDeLaPeriode,
  enDateFrancaise,
  estPremierDuMois,
  estWeekend,
  finDePeriode,
  nomDuJour,
  debutDeTrimestre,
  TRIMESTRES,
} from './dates';

describe('dates', () => {
  it('should list every date of the period, bounds included', () => {
    expect(datesDeLaPeriode('2026-09-28', '2026-10-01')).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
    ]);
  });

  it('should span a year boundary', () => {
    expect(datesDeLaPeriode('2026-12-31', '2027-01-01')).toEqual(['2026-12-31', '2027-01-01']);
  });

  it('should include 29 February on a leap year', () => {
    expect(datesDeLaPeriode('2024-02-28', '2024-03-01')).toEqual([
      '2024-02-28',
      '2024-02-29',
      '2024-03-01',
    ]);
  });

  it('should return a single date when both bounds match', () => {
    expect(datesDeLaPeriode('2026-09-28', '2026-09-28')).toEqual(['2026-09-28']);
  });

  it('should name the weekday in French', () => {
    expect(nomDuJour('2026-09-28')).toBe('lundi');
    expect(nomDuJour('2026-10-03')).toBe('samedi');
    expect(nomDuJour('2026-10-04')).toBe('dimanche');
  });

  it('should flag Saturdays and Sundays only', () => {
    expect(estWeekend('2026-10-02')).toBe(false);
    expect(estWeekend('2026-10-03')).toBe(true);
    expect(estWeekend('2026-10-04')).toBe(true);
    expect(estWeekend('2026-10-05')).toBe(false);
  });

  it('should format a date the French way', () => {
    expect(enDateFrancaise('2026-09-28')).toBe('28/09/2026');
  });
});

describe('période de trois mois', () => {
  it('should recognise the first day of a month', () => {
    expect(estPremierDuMois('2026-01-01')).toBe(true);
    expect(estPremierDuMois('2026-02-01')).toBe(true);
    expect(estPremierDuMois('2026-01-02')).toBe(false);
    expect(estPremierDuMois('2026-01-31')).toBe(false);
    expect(estPremierDuMois('')).toBe(false);
  });

  it('should end on the last day of the third month', () => {
    expect(finDePeriode('2026-01-01')).toBe('2026-03-31');
    expect(finDePeriode('2026-04-01')).toBe('2026-06-30');
  });

  it('should cross the year boundary', () => {
    expect(finDePeriode('2026-11-01')).toBe('2027-01-31');
    expect(finDePeriode('2026-12-01')).toBe('2027-02-28');
  });

  it('should land on 29 February in a leap year', () => {
    expect(finDePeriode('2023-12-01')).toBe('2024-02-29');
  });

  it('should cover exactly three months of days', () => {
    const debut = '2026-01-01';
    const dates = datesDeLaPeriode(debut, finDePeriode(debut));
    expect(dates.length).toBe(31 + 28 + 31);
    expect(dates.at(-1)).toBe('2026-03-31');
  });
});

describe('trimestres', () => {
  it('should open each quarter on the first day of its first month', () => {
    expect(debutDeTrimestre(1, 2026)).toBe('2026-01-01');
    expect(debutDeTrimestre(2, 2026)).toBe('2026-04-01');
    expect(debutDeTrimestre(3, 2026)).toBe('2026-07-01');
    expect(debutDeTrimestre(4, 2026)).toBe('2026-10-01');
  });

  it('should close each quarter through the shared three-month rule', () => {
    expect(finDePeriode(debutDeTrimestre(4, 2026))).toBe('2026-12-31');
    expect(finDePeriode(debutDeTrimestre(1, 2026))).toBe('2026-03-31');
    expect(finDePeriode(debutDeTrimestre(1, 2024))).toBe('2024-03-31');
  });

  it('should always start a quarter on the first of a month', () => {
    for (const trimestre of TRIMESTRES) {
      expect(estPremierDuMois(debutDeTrimestre(trimestre, 2026))).toBe(true);
    }
  });
});
