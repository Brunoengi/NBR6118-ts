import {
    ELSD,
    Combinations,
    Qsi1,
    Qsi2,
    Concrete,
    CableGeometry,
    ValueUnit,
    ValuesUnit,
    TimeDependentLoss
} from "../../../src/index.js";
import { describe, it, expect, beforeAll, jest } from '@jest/globals';

describe('ELSD - Limited Prestressing', () => {
    let elsd: ELSD;
    let p_inf_full: number[];
    let qp_moments: ValuesUnit;
    let ep_values_cm: number[];
    let concrete: Concrete;

    // --- Input Data based on other tests ---
    const Ac: ValueUnit = { value: 7200, unit: 'cm²' };
    const W1: ValueUnit = { value: -144000, unit: 'cm³' };
    const W2: ValueUnit = { value: 144000, unit: 'cm³' };
    const width: ValueUnit = { value: 1500, unit: 'cm' };
    const epmax: ValueUnit = { value: -48, unit: 'cm' };

    beforeAll(() => {
        // 1. Generate cable geometry and section points
        const cableGeo = new CableGeometry({ width, epmax,numPoints:11 });
        const x_values_cm = cableGeo.subdivideSpan().values;
        ep_values_cm = x_values_cm.map((x: number) => cableGeo.cableY(x));

        // 2. Calculate P_inf (force after all losses) using TimeDependentLoss
        const p0_half = [-2156.11, -2174.28, -2190.57, -2206.55, -2223.40, -2241.92];
        const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];
        const alphap = 6.632;

        const timeLoss = new TimeDependentLoss({
            phi: 2.5,
            g1: { value: 0.18, unit: 'kN/cm' },
            g2: { value: 0.20, unit: 'kN/cm' },
            Ac,
            Ic: { value: 8640000, unit: 'cm⁴' },
            width,
            x: { values: x_values_cm, unit: 'cm' },
            ep: { values: ep_values_cm, unit: 'cm' },
            P0: { values: p0_full, unit: 'kN' },
            alphap,
        } as any);
        p_inf_full = timeLoss.finalPrestressingForce().values;

        // 3. Define load combinations
        const combinations = new Combinations({
            g1: { value: 0.18, unit: 'kN/cm' },
            g2: { value: 0.20, unit: 'kN/cm' },
            q: { value: 0.15, unit: 'kN/cm' },
            width: { value: 1500, unit: 'cm' },
            qsi1: new Qsi1(0.6),
            qsi2: new Qsi2(0.4),
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4
        });

        concrete = new Concrete({
            fck: { value: 3.5, unit: 'kN/cm²'},
            aggregate: 'granite',
            section: {
                type: 'rectangular'
            }
        });

        // Mocking calculateMoments to ensure parabolic distribution
        jest.spyOn(combinations, 'calculateMomentsBasedOnMaxMoment').mockImplementation(({ moment }) => {
            const M_max = moment.value;
            const L_cm = width.value;
            const moments_values = x_values_cm.map((x_cm: number) => {
                return (4 * M_max / (L_cm ** 2)) * (L_cm * x_cm - x_cm ** 2);
            });
            return { values: moments_values, unit: 'kN*cm' };
        });

        qp_moments = combinations.calculateMomentsBasedOnMaxMoment({ moment: combinations.quasiPermanent.moment, x: { values: x_values_cm, unit: 'cm' }, width });

        // 4. Instantiate ELSD
        elsd = new ELSD({
            type: 'Limited',
            Ac,
            concrete,
            ep: { values: ep_values_cm, unit: 'cm' },
            W1,
            W2,
            P_inf: { values: p_inf_full, unit: 'kN' },
            moment: qp_moments
        });
    });

    it('should be instantiated correctly', () => {
        expect(elsd).toBeInstanceOf(ELSD);
        expect(elsd.type).toBe('Limited');
    });

    describe('Stress Calculations and Verifications for ELS-D (QP Combination)', () => {
        it('should calculate sigma1 (top fiber) correctly', () => {
            const P_inf_mid = p_inf_full[5];
            const ep_mid = ep_values_cm[5];
            const Mqp_mid = qp_moments.values[5]; // 123750 kN*cm
            const expected_sigma1_mid = P_inf_mid * (1 / Ac.value + ep_mid / W1.value) - Mqp_mid / W1.value; // ~ -0.0594
            expect(elsd.sigma1.values[5]).toBeCloseTo(expected_sigma1_mid, 3);
        });

        it('should verify decompression (sigma1) correctly', () => {
            const result = elsd.verification_sigma1;
            // console.log('elsd.verification_sigma1',result)
            expect(result.passed).toBe(true);
            expect(result.limit.value).toBe(0);
        });

        it('should verify excessive compression (sigma2) correctly', () => {
            const result = elsd.verification_sigma2;
            // console.log('elsd.verification_sigma2', result)
            const expectedLimit = -0.45 * concrete.fck.value; // -1.575 kN/cm²
            expect(result.passed).toBe(true);
            expect(result.limit.value).toBeCloseTo(expectedLimit);
        });
    });
});