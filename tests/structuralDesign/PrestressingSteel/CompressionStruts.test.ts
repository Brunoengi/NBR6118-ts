import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import Stirrups from "../../../src/structuralDesign/PrestressingSteel/CompressionStruts.js";
import { Combinations, Qsi1, Qsi2 } from "../../../src/combinationLoads/Load.js";
import { CableGeometry } from "../../../src/structuralDesign/prestressingSteel/CableGeometry.js";
import PrestressingSteelForce from "../../../src/structuralDesign/PrestressingSteel/PrestressingSteelForce.js";
import { ValueUnit, ValuesUnit, Distance } from "../../../src/types/index.js";
import Concrete from "../../../src/structuralElements/Concrete.js";


describe('Stirrups', () => {
    let stirrups: Stirrups;
    let cableGeometry: CableGeometry;
    let prestressSteelForce: PrestressingSteelForce;
    let combinations: Combinations;
    let p_inf_values: number[];

    // --- Input Data based on other tests ---
    const width: Distance = { value: 1500, unit: 'cm' }; // 15m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const numPoints = 11;

    beforeAll(() => {
        // 1. Setup CableGeometry
        cableGeometry = new CableGeometry({ width, epmax, numPoints });

        // 2. Setup Combinations with distributed loads (kN/m)
        // Note: Stirrups class expects g1, g2, q as distributed loads, not moments.
        combinations = new Combinations({
            g1: { value: 18, unit: 'kN/m' },
            g2: { value: 20, unit: 'kN/m' },
            q: { value: 15, unit: 'kN/m' },
            width: width,
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4,
            qsi1: new Qsi1(0.6),
            qsi2: new Qsi2(0.4)
        });

        // 3. Setup PrestressingSteelForce
        // Create a sample P_inf array. For shear calculation, only the magnitude matters.
        // Using the provided values and mirroring them for the full span.
        const p_inf_half = [-1874.373, -1890.018, -1904.15, -1917.54, -1931.068, -1945.573];
        p_inf_values = [...p_inf_half, ...p_inf_half.slice(0, -1).reverse()];

        const P_inf: ValuesUnit = { values: p_inf_values, unit: 'kN' };

        prestressSteelForce = new PrestressingSteelForce({ P_inf, cableGeometry });

        // 4. Instantiate Stirrups
        stirrups = new Stirrups({
            combinations,
            cableGeometry,
            prestressSteelForce,
            sum_phi_b: { value: 4, unit: 'cm' },
            bw: { value: 60, unit: 'cm' },
            concrete: new Concrete({ fck: { value: 3.5, unit: 'kN/cm²' }, aggregate: 'granite', section: { type: 'rectangular' } }),
            h: { value: 120, unit: 'cm' }, // Added missing property
            dl: { value: 5, unit: 'cm' }   // Added missing property
        });
    });

    it('should be instantiated correctly', () => {
        expect(stirrups).toBeInstanceOf(Stirrups);
        expect(stirrups.combinations).toBe(combinations);
        expect(stirrups.cableGeometry).toBe(cableGeometry);
        expect(stirrups.prestressSteelForce).toBe(prestressSteelForce);
    });

    describe('calculate_V', () => {
        it('should calculate shear force for a given distributed load', () => {
            const g: ValueUnit = { value: 10, unit: 'kN/m' }; // 10 kN/m load
            const V = stirrups.calculate_V({ g });

            // V(x) = g*L/2 - g*x
            const L = width.value / 100; // 15m

            // At x = 0 (support)
            const expected_V_start = (g.value * L / 2) - g.value * 0; // 10 * 15 / 2 = 75 kN
            expect(V.values[0]).toBeCloseTo(expected_V_start);

            // At x = 7.5m (mid-span)
            const expected_V_mid = (g.value * L / 2) - g.value * (L / 2); // 75 - 10 * 7.5 = 0 kN
            expect(V.values[5]).toBeCloseTo(expected_V_mid);

            // At x = 15m (support)
            const expected_V_end = (g.value * L / 2) - g.value * L; // 75 - 10 * 15 = -75 kN
            expect(V.values[10]).toBeCloseTo(expected_V_end);

            expect(V.unit).toBe('kN');
        });
    });

    describe('calculate_Vsd', () => {
        it('should calculate the design shear force Vsd correctly', () => {
            const Vsd = stirrups.calculate_Vsd();

            // --- Manual check at mid-span (index 5) ---
            // At mid-span, Vg1, Vg2, and Vq should be 0.
            const Vg1_mid = 0;
            const Vg2_mid = 0;
            const Vq_mid = 0;

            // Vp at mid-span (slope is 0, so sin(angle) is 0)
            const Vp_mid = 0; // P_inf_mid * sin(0) = 0

            const expected_Vsd_mid = 1.4 * Vg1_mid + 1.4 * Vg2_mid + 1.4 * Vq_mid + 0.9 * Vp_mid;
            // Expect mid-span shear to be 0
            expect(Vsd.values[5]).toBeCloseTo(expected_Vsd_mid);

            // --- Manual check at start (index 0) ---
            const L = width.value / 100; // 15m
            const Vg1_start = (combinations.g1.value * L / 2); // 18 * 15 / 2 = 135 kN
            const Vg2_start = (combinations.g2.value * L / 2); // 20 * 15 / 2 = 150 kN
            const Vq_start = (combinations.q.value * L / 2); // 15 * 15 / 2 = 112.5 kN

            // Vp at start: P_inf * sin(angle)
            const P_inf_start = p_inf_values[0]; // -1874.373 kN
            const slope_start = -0.128; // From CableGeometry.cableSlope(0)
            const angle_start = Math.atan(Math.abs(slope_start)); // -atan(-0.128) = atan(0.128)
            const Vp_start = P_inf_start * Math.sin(angle_start); // -1874.373 * sin(atan(0.128)) = -237.69... kN

            const expected_Vsd_start =
                combinations.gamma.gamma_g1 * Vg1_start +
                combinations.gamma.gamma_g2 * Vg2_start +
                combinations.gamma.gamma_q * Vq_start +
                0.9 * Vp_start;

            expect(Vsd.values[0]).toBeCloseTo(expected_Vsd_start); // Should be ~342.58 kN
            expect(Vsd.unit).toBe('kN');
        });
    });

    describe('Shear Stress Calculations', () => {
        it('should calculate the corrected web width (bw_corr)', () => {
            // bw = 60 cm, sum_phi_b = 4 cm
            // bw_corr = 60 - 4 / 2 = 58 cm
            const bw_corr = stirrups.calculate_bw_corrected();
            expect(bw_corr.value).toBe(58);
            expect(bw_corr.unit).toBe('cm');
        });

        it('should calculate the design shear stress limit (tau_wu)', () => {
            // fck = 35 MPa, fcd = 35 / 1.4 = 25 MPa
            // tau_wu = (0.27 * (1 - 35 / 250) * 25) / 10 = 0.5805 kN/cm²
            const tau_wu = stirrups.calculate_tau_wu();
            expect(tau_wu.value).toBeCloseTo(0.5805);
            expect(tau_wu.unit).toBe('kN/cm²');
        });

        it('should calculate the design shear stress (tau_wd)', () => {
            const tau_wd = stirrups.calculate_tau_wd();

            // Manual check at start (index 0)
            // Vsd[0] ≈ 342.58 kN
            // bw_corr = 58 cm
            // ds1 = h - dl = 120 - 5 = 115 cm
            // tau_wd[0] = 342.58 / (58 * 115) ≈ 0.0513 kN/cm²
            const expected_tau_wd_start = stirrups.Vsd.values[0] / (58 * 115);
            expect(tau_wd.values[0]).toBeCloseTo(expected_tau_wd_start);
            expect(tau_wd.unit).toBe('kN/cm²');
        });

        it('should verify the concrete crushing limit (verification_crush_concrete)', () => {
            const verification = stirrups.verification_crush_concrete();

            // From previous tests:
            // tau_wd is ~0.0513 kN/cm² at the support.
            // tau_wu (limit) is ~0.5805 kN/cm².
            // Since the maximum shear stress is less than the limit, the verification should pass.
            expect(verification.passed).toBe(true);
            expect(verification.limit.value).toBeCloseTo(0.5805);
            expect(verification.values.values[0]).toBeCloseTo(0.0513, 4);
        });
    });
});
