import { describe, it, expect, beforeAll } from '@jest/globals';
import LongitudinalSteelRectangularSection from '../../../../src/design/beam/reinforcedConcrete/longitudinalSteel.js';
import Concrete from '../../../../src/utils/elements/concrete/Concrete.js';
import Steel from '../../../../src/utils/elements/steel/Steel.js';
import Rectangular from '../../../../src/utils/sections/Rectangular.js';
import { Moment, Distance, Adimensional } from '../../../../src/types/index.js';

/**
 * Exemplos baseados no livro Curso de Concreto Armado - Volume 1: José Milton de Araújo
*/

describe('Longitudinal Steel Rectangular Section - C20', () => {
    let longitudinalSteel: LongitudinalSteelRectangularSection;
    let concrete: Concrete;
    let steel: Steel;
    let section: Rectangular;
    let d: Distance;
    let Mk: Moment;

    beforeAll(() => {
        concrete = new Concrete({
            fck: { value: 2.0, unit: 'kN/cm²' }, // C20
            aggregate: 'granite',
            section: { type: 'rectangular' }
        });

        steel = new Steel('CA-50');

        section = new Rectangular({
            base: { value: 15, unit: 'cm' },
            height: { value: 40, unit: 'cm' }
        });

        d = { value: 36, unit: 'cm' };
        Mk = { value: 3000, unit: 'kN*cm' };

        longitudinalSteel = new LongitudinalSteelRectangularSection({
            concrete,
            steel,
            Mk,
            section,
            d
        });
    });

    it('should calculate design moment (Md) correctly', () => {
        // Md = Mk * gamma_f = 3000 * 1.4 = 4200 kN*cm
        expect(longitudinalSteel.params.Md.value).toBe(4200);
        expect(longitudinalSteel.params.Md.unit).toBe('kN*cm');
    });

    it('should calculate reduced bending moment (mu) correctly', () => {
        // fcd = 2.0 / 1.4 = 1.4286 kN/cm²; nc = 1 (para C20)
        // sigmacd = 0.85 * fcd * nc = 0.85 * 1.4286 * 1 = 1.2143 kN/cm²
        // mu = Md / (b * d^2 * sigmacd) = 4200 / (15 * 36^2 * 1.2143) = 0.1779
        const mu = longitudinalSteel.params.mu;
        expect(mu.value).toBeCloseTo(0.1779, 4);
        expect(mu.unit).toBe('adimensional');
    });

    it('should calculate relative neutral line position (epsilon) correctly', () => {
        // lambda = 0.8 for fck <= 50 MPa
        // mu = 0.1777...
        // epsilon = (1 - sqrt(1 - 2 * mu)) / lambda = (1 - sqrt(1 - 2 * 0.1777...)) / 0.8 = 0.2468
        const xi = longitudinalSteel.params.xi;
        expect(xi.value).toBeCloseTo(0.2468, 4);
        expect(xi.unit).toBe('adimensional');
    });

    it('should get the minimal reinforcement ratio (rhomin) correctly', () => {
        // For C20 concrete and CA-50 steel, rhomin is 0.15%
        const rhomin = longitudinalSteel.params.rhomin;
        expect(rhomin.value).toBe(0.15 / 100);
        expect(rhomin.unit).toBe('adimensional');
    });

    it('should calculate minimum steel area (Asmin) correctly', () => {
        // Ac = 15 * 40 = 600 cm²
        // rhomin = 0.0015
        // Asmin = rhomin * Ac = 0.0015 * 600 = 0.9 cm²
        const Asmin = longitudinalSteel.steel.Asmin;
        expect(Asmin.value).toBeCloseTo(0.9, 2);
        expect(Asmin.unit).toBe('cm²');
    });

    it('should calculate calculated steel area (Asc) correctly', () => {
        // lambda = 0.8, epsilon = 0.2468, b = 15, d = 36
        // sigmacd = 0.85 * (2.0 / 1.4) = 1.21428... kN/cm²
        // fyd = 50 / 1.15 = 43.478 kN/cm²
        // Asc = lambda * epsilon * b * d * sigmacd / fyd
        // Asc = 0.8 * 0.2468 * 15 * 36 * 1.21428 / 43.478 = 2.98 cm²
        const Asc = longitudinalSteel.steel.Asc;
        expect(Asc.value).toBeCloseTo(2.98, 2);
        expect(Asc.unit).toBe('cm²');
    });

    it('should calculate effective steel area (Ase) correctly', () => {
        // Asc = 2.98 cm², Asmin = 0.9 cm²
        // Ase = max(Asc, Asmin) = 2.98 cm²
        const Ase = longitudinalSteel.steel.Ase;
        expect(Ase.value).toBeCloseTo(2.98, 2);
        expect(Ase.unit).toBe('cm²');
    });

});

describe('Longitudinal Steel Rectangular Section - C40', () => {
    let longitudinalSteel: LongitudinalSteelRectangularSection;
    let concrete: Concrete;
    let steel: Steel;
    let section: Rectangular;
    let d: Distance;
    let Mk: Moment;

    beforeAll(() => {
        concrete = new Concrete({
            fck: { value: 4.0, unit: 'kN/cm²' }, // C40
            aggregate: 'granite',
            section: { type: 'rectangular' }
        });

        steel = new Steel('CA-50');

        section = new Rectangular({
            base: { value: 15, unit: 'cm' },
            height: { value: 40, unit: 'cm' }
        });

        d = { value: 36, unit: 'cm' };
        Mk = { value: 7000, unit: 'kN*cm' };

        longitudinalSteel = new LongitudinalSteelRectangularSection({
            concrete,
            steel,
            Mk,
            section,
            d
        });
    });

    it('should calculate design moment (Md) correctly', () => {
        // Md = Mk * gamma_f = 7000 * 1.4 = 9800 kN*cm
        expect(longitudinalSteel.params.Md.value).toBe(9800);
    });

    it('should calculate reduced bending moment (mu) correctly', () => {
        // sigmacd = 0.85 * (4.0 / 1.4) = 2.42857 kN/cm²
        // mu = 9800 / (15 * 36^2 * 2.42857) = 0.2076
        const mu = longitudinalSteel.params.mu;
        expect(mu.value).toBeCloseTo(0.2076, 4);
    });

    it('should calculate relative neutral line position (epsilon) correctly', () => {
        // epsilon = (1 - sqrt(1 - 2 * 0.2076)) / 0.8 = 0.2941
        const xi = longitudinalSteel.params.xi;
        expect(xi.value).toBeCloseTo(0.2941, 4);
    });

    it('should get the minimal reinforcement ratio (rhomin) correctly for C40', () => {
        // For C40 concrete and CA-50 steel, rhomin is 0.21%
        const rhomin = longitudinalSteel.params.rhomin;
        expect(rhomin.value).toBe(0.21 / 100);
    });

    it('should calculate minimum steel area (Asmin) correctly', () => {
        // Asmin = (0.21 / 100) * (15 * 40) = 1.26 cm²
        const Asmin = longitudinalSteel.steel.Asmin;
        expect(Asmin.value).toBeCloseTo(1.26, 2);
    });

    it('should calculate effective steel area (Ase) correctly', () => {
        // Asc = 0.8 * 0.2941 * 15 * 36 * (2.42857 / 43.478) = 7.10 cm²
        // Ase = max(7.10, 1.26) = 7.10 cm²
        const Ase = longitudinalSteel.steel.Ase;
        expect(Ase.value).toBeCloseTo(7.10, 2);
    });
});

describe('Longitudinal Steel Rectangular Section - C20 (Example 2)', () => {
    let longitudinalSteel: LongitudinalSteelRectangularSection;
    let concrete: Concrete;
    let steel: Steel;
    let section: Rectangular;
    let d: Distance;
    let Mk: Moment;

    beforeAll(() => {
        concrete = new Concrete({
            fck: { value: 2.0, unit: 'kN/cm²' }, // C60
            aggregate: 'granite',
            section: { type: 'rectangular' }
        });
 
        steel = new Steel('CA-50');

        section = new Rectangular({
            base: { value: 15, unit: 'cm' },
            height: { value: 40, unit: 'cm' }
        });

        d = { value: 36, unit: 'cm' };
        Mk = { value: 7000, unit: 'kN*cm' };
 
        longitudinalSteel = new LongitudinalSteelRectangularSection({
            concrete,
            steel,
            Mk,
            section,
            d
        });
    });

    it('should calculate design moment (Md) correctly', () => {
        // Md = 7000 * 1.4 = 9800 kN*cm
        expect(longitudinalSteel.params.Md.value).toBe(9800);
    });

    it('should calculate a reduced bending moment (mu) that is greater than mu_limit', () => {
        // Para C20, sigmacd = 0.85 * (2.0 / 1.4) = 1.2143 kN/cm²
        // mu = 9800 / (15 * 36^2 * 1.21428...) = 0.4152
        const mu = longitudinalSteel.params.mu;
        expect(mu.value).toBeCloseTo(0.4152, 4);

        // Para C20, mu_limit = 0.2952
        const mu_limit = 0.2952;
        expect(longitudinalSteel.params.mu_limit.value).toBeCloseTo(mu_limit, 4);
        expect(mu.value).toBeGreaterThan(longitudinalSteel.params.mu_limit.value);
    });

    it('should calculate double reinforcement steel areas (Asc and Aslc) correctly', () => {
        // Como mu > mu_limit, o cálculo é de armadura dupla.
        const { Ase, Asc, Aslc } = longitudinalSteel.steel;

        expect(Asc.value).toBeCloseTo(7.47, 1);
        expect(Aslc.value).toBeCloseTo(2.11, 0);
        expect(Ase.value).toBeCloseTo(7.47, 1);
    });
});

describe('Longitudinal Steel - Varying fck, d, and Mk', () => {
    const section = new Rectangular({
        base: { value: 15, unit: 'cm' },
        height: { value: 40, unit: 'cm' }
    });
    const steel = new Steel('CA-50');

    // Combined test cases for both low and high moments
    const testCases = [
        // Low Moment (Mk = 3000 kN*cm) -> Single Reinforcement (Aslc = 0)
        { Mk_val: 3000, fck: 2.0, d: 36,   expectedAsc: 3.00, expectedAslc: 0 },
        { Mk_val: 3000, fck: 2.5, d: 35.5, expectedAsc: 2.96, expectedAslc: 0 },
        { Mk_val: 3000, fck: 3.0, d: 34.5, expectedAsc: 3.01, expectedAslc: 0 },
        { Mk_val: 3000, fck: 4.0, d: 33.5, expectedAsc: 3.05, expectedAslc: 0 },

        // High Moment (Mk = 7000 kN*cm)
        { Mk_val: 7000, fck: 2.0, d: 36,   expectedAsc: 7.52, expectedAslc: 2.11 },
        { Mk_val: 7000, fck: 2.5, d: 35.5, expectedAsc: 7.68, expectedAslc: 0.99 },
        { Mk_val: 7000, fck: 3.0, d: 34.5, expectedAsc: 7.96, expectedAslc: 0.16 },
        { Mk_val: 7000, fck: 4.0, d: 33.5, expectedAsc: 7.82, expectedAslc: 0 }, // single reinforcement
    ];

    test.each(testCases)(
        'should calculate steel area correctly for Mk=$Mk_val, fck=$fck, d=$d',
        ({ Mk_val, fck, d, expectedAsc, expectedAslc }) => {
            // Arrange
            const concrete = new Concrete({
                fck: { value: fck, unit: 'kN/cm²' },
                aggregate: 'granite',
                section: { type: 'rectangular' }
            });

            const Mk: Moment = { value: Mk_val, unit: 'kN*cm' };
            const d_distance: Distance = { value: d, unit: 'cm' };

            // Act
            const longitudinalSteel = new LongitudinalSteelRectangularSection({
                concrete,
                steel,
                Mk,
                section,
                d: d_distance
            });

            const { mu, mu_limit } = longitudinalSteel.params;
            const { Ase, Asc, Aslc } = longitudinalSteel.steel;

            // Assert
            expect(longitudinalSteel.params.Md.value).toBe(Mk_val * 1.4);

            if (expectedAslc > 0) {
                // Double Reinforcement Case
                expect(mu.value).toBeGreaterThan(mu_limit.value);
                expect(Aslc).toBeDefined();
                expect(Aslc.value).toBeCloseTo(expectedAslc, 0);
                expect(Asc.value).toBeCloseTo(expectedAsc, 0);
            } else {
                // Single Reinforcement Case
                expect(mu.value).toBeLessThanOrEqual(mu_limit.value);
                expect(Aslc.value).toBe(0);
                expect(Ase.value).toBeCloseTo(expectedAsc, 0);
            }
        }
    );
});