import { describe, it, expect, beforeAll } from '@jest/globals';
import {
    ReinforcingSteelLower,
    Concrete,
    PrestressingSteel,
    PrestressingDesign,
    Combinations,
    Qsi1,
    Qsi2,
    CableGeometry,
    Steel,
    Distance,
    ValueUnit
} from "../../../src/index.js";
import Rectangular from "../../../src/sections/Rectangular.js";

describe('ReinforcingSteelLower', () => {
    let reinforcingSteel: ReinforcingSteelLower;
    let h: Distance;
    let dl: Distance;
    let dpl: Distance;

    beforeAll(() => {
        // --- 1. Basic Inputs ---
        const fck: ValueUnit = { value: 3.5, unit: 'kN/cm²' };
        const base: Distance = { value: 60, unit: 'cm' };
        h = { value: 120, unit: 'cm' };
        dl = { value: 5, unit: 'cm' };
        dpl = { value: 12, unit: 'cm' };
        const steel = new Steel('CA 50');

        // --- 2. Instantiate dependencies ---
        const concrete = new Concrete({
            fck,
            section: { type: 'rectangular' }
        });

        const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 12.7' });
        const section = new Rectangular({ base, height: h });

        const combinations = new Combinations({
            g1: { value: 0.18, unit: 'kN/cm' },
            g2: { value: 0.20, unit: 'kN/cm' },
            q: { value: 0.15, unit: 'kN/cm' },
            width: { value: 1500, unit: 'cm' },
            qsi1: new Qsi1(0.60),
            qsi2: new Qsi2(0.40),
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4
        });

        const cableGeometry = new CableGeometry({
            width: { value: 1500, unit: 'cm' },
            epmax: { value: -48, unit: 'cm' },
            numPoints: 11
        });

        const prestressingDesign = new PrestressingDesign({
            prestressingSteel,
            geometricProperties: {
                Ac: section.props.A,
                W1: section.props.W1
            },
            lossFactor: 0.25,
            epmax: cableGeometry.epmax,
            combinations,
            concrete,
            type: 'Limited',
            ncable: 3
        });

        // --- 3. Instantiate the class to be tested ---
        reinforcingSteel = new ReinforcingSteelLower({
            cableGeometry,
            combinations,
            section,
            concrete,
            prestressingSteel,
            prestressingDesign,
            dl,
            h,
            dpl,
            steel
        });
    });

    it('should calculate ds1 correctly', () => {
        // ds1 = h - dl = 120 - 5 = 115 cm
        const ds1 = reinforcingSteel.calculate_ds1({ h, dl });
        expect(ds1.value).toBe(115);
        expect(ds1.unit).toBe('cm');
    });

    it('should calculate dp correctly', () => {
        // dp = h - dpl = 120 - 12 = 108 cm
        const dp = reinforcingSteel.calculate_dp({ h, dpl });
        expect(dp.value).toBe(108);
        expect(dp.unit).toBe('cm');
    });

    it('should calculate c (moment term) correctly', () => {
        // fpyd = (0.9 * 1900) / 1.15 = 1486.95 MPa = 148.69565 kN/cm²
        // Ap_proj = 17.82 cm² (from PrestressingSteelEstimated.test.ts)
        // ds1 = 115 cm, dp = 108 cm
        // Md_max = 208687.5 kN*cm
        // c = -fpyd * Ap * (ds1 - dp) - Md = -148.69565 * 17.82 * 7 - 208687.5
        // c = -18548.30 - 208687.5 = -227235.8
        const c = reinforcingSteel.calculate_c();
        expect(c.value).toBeCloseTo(-227235.8, 1);
        expect(c.unit).toBe('kN*cm');
    });

    it('should calculate the neutral line (LN) using the solver', () => {
        const ln = reinforcingSteel.calculate_LN();
        // The exact value depends on the complex interaction of the section properties.
        // A plausible value for this setup would be around 20-40 cm.
        // This test mainly ensures the solver runs and produces a sensible number.
        expect(ln.value).toBeGreaterThan(0);
        expect(ln.value).toBeLessThan(h.value);
        expect(ln.unit).toBe('cm');
        expect(ln.value).toBeCloseTo(20.89, 2);
    });

    it('should calculate xlim correctly for fck <= 50 MPa', () => {
        // For fck = 3.5 kN/cm² (35 MPa), xlim should be 0.45
        const xlim = reinforcingSteel.calculate_xlim();
        expect(xlim).toBe(0.45);
    });

    it('should verify the neutral line (LN) position correctly', () => {
        // xlim = 0.45, ds1 = 115 cm
        // limit = 0.45 * 115 = 51.75 cm
        // LN = 20.89 cm
        // Since 20.89 < 51.75, it should pass.
        const verification = reinforcingSteel.verification_LN();
        expect(verification.passed).toBe(true);
        expect(verification.limit.value).toBeCloseTo(51.75);
        expect(verification.value.value).toBeCloseTo(reinforcingSteel.LN.value);
    });

    it('should calculate concrete compression resultants correctly', () => {
        // Using the calculated LN = 20.89 cm
        const resultants = reinforcingSteel.calculateConcreteCompressionResultants({ x: reinforcingSteel.LN });

        // lambda = 0.8, lambdax = 0.8 * 20.89 = 16.712 cm
        // yLine = 120 - 16.712 = 103.288 cm
        // Area of compressed rectangle = 60 * 16.712 = 1002.72 cm²
        // Yg = 120 - 16.712 / 2 = 111.644 cm
        // maxStress = 0.85 * 1 * (3.5 / 1.4) = 2.125 kN/cm²
        // Rcd = 1002.72 * 2.125 = 2130.79 kN
        // distanceRcdToAs = 111.644 - 5 = 106.644 cm

        expect(resultants.Rcd.value).toBeCloseTo(2130.79, 1);
        expect(resultants.distanceRcdToAs.value).toBeCloseTo(106.644, 2);
    });

    it('should calculate the estimated steel area (As_estimated) correctly', () => {
        // Rcd = 2130.79 kN
        // fpyd = 148.696 kN/cm²
        // Ap_proj = 17.82 cm²
        // fyd = 50 / 1.15 = 43.478 kN/cm²
        // As_est = (2130.79 - 148.696 * 17.82) / 43.478 = (2130.79 - 2649.76) / 43.478 = -11.936 cm²
        // A negative value means no tensile reinforcement is needed.
        const asEstimated = reinforcingSteel.calculate_Asestimated();
        expect(asEstimated.value).toBeCloseTo(-11.936, 2);
        expect(asEstimated.unit).toBe('cm²');
    });

    describe('Minimum Steel Calculations', () => {
        const bf: Distance = { value: 60, unit: 'cm' };

        it('should calculate Mdmin correctly', () => {
            // W1 = -144000 cm³, fctk_sup = 0.4173 kN/cm²
            // Mdmin = |0.8 * -144000 * 0.4173| = 48072.96 kN*cm
            const mdmin = reinforcingSteel.calculate_Mdmin();
            expect(mdmin.value).toBeCloseTo(48072.96, -1);
            expect(mdmin.unit).toBe('kN*cm');
        });

        it('should calculate mi (dimensionless coefficient) correctly', () => {
            // Mdmin = 48072.96 kN*cm, bf = 60 cm, ds1 = 115 cm, sigmacd = 2.125 kN/cm²
            // mi = 48072.96 / (60 * 115² * 2.125) = 48072.96 / 1686187.5 = 0.0285095
            const mi = reinforcingSteel.calculate_mi({ bf });
            expect(mi).toBeCloseTo(0.0285095, 5);
        });

        it('should calculate Asmin from bending (Asmin_estimated) correctly', () => {
            // mi = 0.0285095, lambda = 0.8, bf = 60, ds1 = 115
            // sigmacd = 2.125 kN/cm², fyd = 43.478 kN/cm²
            // qsi = 1.25 * (1 - sqrt(1 - 2 * 0.0285095)) = 0.0362
            // Asmin_est = 0.8 * 0.0362 * 60 * 115 * (2.125 / 43.478) = 9.76 cm²
            const asmin_est = reinforcingSteel.calculate_Asmin_from_bending({ bf });
            expect(asmin_est.value).toBeCloseTo(9.76, 2);
            expect(asmin_est.unit).toBe('cm²');
        });
    });

    it('should calculate the minimum steel area correctly', () => {
        // Asmin_est = 9.76 cm²
        // Asmin_constructive = Ac * 0.15/100 = 7200 * 0.0015 = 10.8 cm²
        // The final result should be the max of the two.
        const asMin = reinforcingSteel.minimumSteel({ bf: { value: 60, unit: 'cm' }});
        expect(asMin.value).toBeGreaterThan(0);
        expect(asMin.unit).toBe('cm²');
        expect(asMin.value).toBeCloseTo(10.8, 1);
    });
});
