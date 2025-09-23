import ELS from "../../../src/structuralDesign/PrestressingSteel/LimitStates/ELS.js";
import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { Combinations, Qsi1, Qsi2 } from "../../../src/combinations/Load.js";
import { CableGeometry } from "../../../src/structuralDesign/PrestressingSteel/CableGeometry.js";
import { ValueUnit, ValuesUnit } from "../../../src/types/index.js";
import timeDependentLoss from "../../../src/structuralDesign/PrestressingSteel/Losses/TimeDependentLoss.js";

describe('ELS - Limited Prestressing', () => {
    let els: ELS;
    let p_inf_full: number[];
    let frequent_moments: ValuesUnit;
    let qp_moments: ValuesUnit;
    let ep_values_cm: number[];

    // --- Input Data based on other tests ---
    const Ac: ValueUnit = { value: 7200, unit: 'cm²' };
    const W1: ValueUnit = { value: -144000, unit: 'cm³' };
    const W2: ValueUnit = { value: 144000, unit: 'cm³' };
    const width: ValueUnit = { value: 1500, unit: 'cm' };
    const numSections = 10;
    const epmax: ValueUnit = { value: -48, unit: 'cm' };

    beforeAll(() => {
        // 1. Generate cable geometry and section points
        const cableGeo = new CableGeometry({ width, epmax });
        const x_values_cm = cableGeo.subdivideSpan(width, numSections).values;
        ep_values_cm = x_values_cm.map(x => cableGeo.cableY(x));

        // 2. Calculate P_inf (force after all losses) using TimeDependentLoss
        const p0_half = [-2156.11, -2174.28, -2190.57, -2206.55, -2223.40, -2241.92];
        const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];
        const alphap = 6.632;

        const timeLoss = new timeDependentLoss({
            phi: 2.5,
            g1: { value: 18, unit: 'kN/m' },
            g2: { value: 20, unit: 'kN/m' },
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
            mg1: { value: 506.25, unit: 'kN*m' },
            mg2: { value: 562.50, unit: 'kN*m' },
            mq: { value: 421.875, unit: 'kN*m' },
            qsi1: new Qsi1(0.6),
            qsi2: new Qsi2(0.4)
        });

        // Mocking calculateMoments as its implementation is not provided
        jest.spyOn(combinations, 'calculateMoments').mockImplementation(({ moment }) => {
            const M_max = moment.value;
            const L_m = width.value / 100;
            const moments_values = x_values_cm.map(x_cm => {
                const x_m = x_cm / 100;
                return (4 * M_max / (L_m ** 2)) * (L_m * x_m - x_m ** 2);
            });
            return { values: moments_values, unit: 'kN*m' };
        });

        frequent_moments = combinations.calculateMoments({ moment: combinations.frequent.moment, x: { values: x_values_cm, unit: 'cm' }, width });
        qp_moments = combinations.calculateMoments({ moment: combinations.quasiPermanent.moment, x: { values: x_values_cm, unit: 'cm' }, width });

        // 4. Instantiate ELS
        els = new ELS({
            type: 'Limited',
            Ac,
            ep: { values: ep_values_cm, unit: 'cm' },
            W1,
            W2,
            P_inf: { values: p_inf_full, unit: 'kN' },
            combinations,
            x: { values: x_values_cm, unit: 'cm' },
            width
        });
    });

    it('should be instantiated correctly', () => {
        expect(els).toBeInstanceOf(ELS);
        expect(els.type).toBe('Limited');
    });

    describe('Stress Calculations for ELS-F (Frequent Combination)', () => {
        it('should calculate sigma1P_infinity_ELSF (top fiber) correctly', () => {
            const sigma1_elsf = els.sigma1P_infinity_ELSF;
            // Manual check at mid-span (index 5)
            const P_inf_mid = p_inf_full[5]; // ~ -1945.58
            const ep_mid = ep_values_cm[5]; // -48
            const Mf_mid = frequent_moments.values[5]; // 1321.88
            
            const expected_sigma1_mid = P_inf_mid * (1 / Ac.value + ep_mid / W1.value) - (Mf_mid * 100) / W1.value; // ~ -0.00077394

            expect(sigma1_elsf.values[5]).toBeCloseTo(expected_sigma1_mid, 3);
            expect(sigma1_elsf.unit).toBe('kN/cm²');
        });

        it('should calculate sigma2P_infinity_ELSF (bottom fiber) correctly', () => {
            const sigma2_elsf = els.sigma2P_infinity_ELSF;
            // Manual check at mid-span (index 5)
            const P_inf_mid = p_inf_full[5];
            const ep_mid = ep_values_cm[5];
            const Mf_mid = frequent_moments.values[5];
            const expected_sigma2_mid = P_inf_mid * (1 / Ac.value + ep_mid / W2.value) - (Mf_mid * 100) / W2.value; // ~ -0.53966

            expect(sigma2_elsf.values[5]).toBeCloseTo(expected_sigma2_mid, 2);
            expect(sigma2_elsf.unit).toBe('kN/cm²');
        });
    });

    describe('Stress Calculations for ELS-D (QP Combination)', () => {
        it('should calculate sigma1P_infinity_ELSD (top fiber) correctly', () => {
            const sigma1_elsd = els.sigma1P_infinity_ELSD;
            const P_inf_mid = p_inf_full[5];
            const ep_mid = ep_values_cm[5];
            const Mqp_mid = qp_moments.values[5]; // 1237.50
            console.log(Mqp_mid)
            const expected_sigma1_mid = P_inf_mid * (1 / Ac.value + ep_mid / W1.value) - (Mqp_mid * 100) / W1.value; // ~ -0.0594
            console.log(expected_sigma1_mid)
            expect(sigma1_elsd.values[5]).toBeCloseTo(expected_sigma1_mid, 3);
        });

         it('should calculate sigma2P_infinity_ELSD (bottom fiber) correctly', () => {
            const sigma2_elsd = els.sigma2P_infinity_ELSD;
            // Manual check at mid-span (index 5)
            const P_inf_mid = p_inf_full[5];
            const ep_mid = ep_values_cm[5];
            const Mqp_mid = qp_moments.values[5]; // 1237.5
            const expected_sigma2_mid = P_inf_mid * (1 / Ac.value + ep_mid / W2.value) - (Mqp_mid * 100) / W2.value; // ~ -0.481

            expect(sigma2_elsd.values[5]).toBeCloseTo(expected_sigma2_mid, 3);
            expect(sigma2_elsd.unit).toBe('kN/cm²');
        });
    });
});
