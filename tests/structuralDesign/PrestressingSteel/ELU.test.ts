import ELU from "../../../src/structuralDesign/PrestressingSteel/LimitStates/ELU.js";
import Concrete from "../../../src/structuralElements/Concrete.js";
import { CableGeometry } from "../../../src/structuralDesign/PrestressingSteel/CableGeometry.js";
import { ValueUnit, ValuesUnit } from "../../../src/types/index.js";

describe('ELU - Case 1', () => {
    let elu: ELU;

    // --- Input Data based on user request ---
    const p0_half = [-2156.12, -2174.28, -2190.57, -2206.55, -2223.40, -2241.92];
    const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];

    const mg_half = [0, 182.25, 324, 425.25, 486, 506.25];
    const mg_full = [...mg_half, ...mg_half.slice(0, -1).reverse()];

    const Ac: ValueUnit = { value: 7200, unit: 'cm²' };
    const W1: ValueUnit = { value: -144000, unit: 'cm³' };
    const W2: ValueUnit = { value: 144000, unit: 'cm³' };

    // Generate parabolic eccentricity ep(x) using CableGeometry
    const width: ValueUnit = { value: 1500, unit: 'cm' };
    const numSections = 11;
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    
    const cableGeo = new CableGeometry({ width, epmax, numPoints: numSections });
    const x_values_cm = cableGeo.subdivideSpan().values;
    const ep_values_cm = x_values_cm.map((x:number) => cableGeo.cableY(x));

    beforeAll(() => {
        elu = new ELU({
            P0: { values: p0_full, unit: 'kN' },
            ep: { values: ep_values_cm, unit: 'cm' },
            Ac: Ac,
            W1: W1,
            W2: W2,
            Mg: { values: mg_full, unit: 'kN*m' },
            concrete: new Concrete({fck: {value: 3.5, unit: 'kN/cm²'}, aggregate: 'granite'})
        });
    });

    it('should be instantiated correctly', () => {
        expect(elu).toBeInstanceOf(ELU);
        expect(elu.P0.values).toEqual(p0_full);
        expect(elu.Mg.values).toEqual(mg_full);
        expect(elu.Ac).toEqual(Ac);
        expect(elu.W1).toEqual(W1);
        expect(elu.W2).toEqual(W2);
    });

    describe('calculateSigma1P0_ELU', () => {
        it('should calculate the stress in the top fiber correctly', () => {
            const sigma1 = elu.sigma1P0_ELU;

            // --- Verification for multiple points using a data-driven approach ---
            const testCases = [
                { index: 0, description: 'At x = 0 (start)', expected: -0.3294 },
                { index: 1, description: 'At x = 1.5m', expected: -0.4926 },
                { index: 2, description: 'At x = 3.0m', expected: -0.6237 },
                { index: 3, description: 'At x = 4.5m', expected: -0.7214 },
                { index: 4, description: 'At x = 6.0m', expected: -0.7848 },
                { index: 5, description: 'At x = 7.5m (mid-span)', expected: -0.8130 },
            ];

            testCases.forEach(testCase => {
                // Formula: σ1 = 1.1 * P0 * (1/Ac + ep/W1) - (Mg*100)/W1
                const P0_i = p0_full[testCase.index];
                const ep_i = ep_values_cm[testCase.index];
                const Mg_i = mg_full[testCase.index];

                const expected_sigma = 1.1 * P0_i * (1 / Ac.value + ep_i / W1.value) - (Mg_i * 100) / W1.value;

                // Check if my manual calculation matches the test case expected value
                expect(expected_sigma).toBeCloseTo(testCase.expected, 4);

                // Check if the class calculation matches the expected value
                expect(sigma1.values[testCase.index]).toBeCloseTo(testCase.expected, 4);
            });

            expect(sigma1.unit).toBe('kN/cm²');
        });
    });

    describe('calculateSigma2P0_ELU', () => {
        it('should calculate the stress in the bottom fiber correctly', () => {
            const sigma2 = elu.calculateSigma2P0();

            // --- Verification for multiple points using a data-driven approach ---
            const testCases = [
                { index: 0, description: 'At x = 0 (start)', expected: -0.3294 },
                { index: 1, description: 'At x = 1.5m', expected: -0.1717 },
                { index: 2, description: 'At x = 3.0m', expected: -0.0456 },
                { index: 3, description: 'At x = 4.5m', expected: 0.0472 },
                { index: 4, description: 'At x = 6.0m', expected: 0.1055 },
                { index: 5, description: 'At x = 7.5m (mid-span)', expected: 0.128 },
            ];

            testCases.forEach(testCase => {
                // Formula: σ2 = 1.1 * P0 * (1/Ac + ep/W2) - (Mg*100)/W2
                const P0_i = p0_full[testCase.index];
                const ep_i = ep_values_cm[testCase.index];
                const Mg_i = mg_full[testCase.index];

                const expected_sigma = 1.1 * P0_i * (1 / Ac.value + ep_i / W2.value) - (Mg_i * 100) / W2.value;

                expect(sigma2.values[testCase.index]).toBeCloseTo(testCase.expected, 4);
                expect(expected_sigma).toBeCloseTo(testCase.expected, 4);
            });

            expect(sigma2.unit).toBe('kN/cm²');
        });
    });

    describe('Verifications with j=5', () => {
        const j = 5;

        it('should pass verification for sigma1 (compression limit)', () => {
            const result = elu.verification_sigma1P0({ j });

            // console.log('Sigma1 Verification (Pass):', {
            //     limit: result.limit,
            //     values: result.values.values.map((v: number) => v.toFixed(4))
            // });

            expect(result.passed).toBe(true);
            result.values.values.forEach((stress: number) => {
                // e.g., -0.81 (stress) >= -2.14 (limit) -> true
                expect(stress).toBeGreaterThanOrEqual(result.limit.value);
            });
        });

        it('should pass verification for sigma2 (tension limit)', () => {
            const result = elu.verification_sigma2P0({ j });

            // console.log('Sigma2 Verification (Pass):', {
            //     limit: result.limit,
            //     values: result.values.values.map((v: number) => v.toFixed(4))
            // });

            expect(result.passed).toBe(true);
            result.values.values.forEach((stress: number) => {
                // e.g., 0.128 (stress) <= 0.211 (limit) -> true
                expect(stress).toBeLessThanOrEqual(result.limit.value);
            });
        });
    });
});

describe('ELU - Case 2', () => {
    let elu: ELU;

    // --- Input Data based on user request ---
    const p0_half = [-1455.443, -1466.437, -1475.147, -1483.507, -1492.972, -1504.479];
    const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];

    const mg_half = [0, 80.051, 142.313, 186.785, 213.469, 222.363];
    const mg_full = [...mg_half, ...mg_half.slice(0, -1).reverse()];

    const Ac: ValueUnit = { value: 3162.50, unit: 'cm²' };
    const W1: ValueUnit = { value: -65455.50, unit: 'cm³' };
    const W2: ValueUnit = { value: 86845.93, unit: 'cm³' };

    // Generate parabolic eccentricity ep(x) using CableGeometry
    const width: ValueUnit = { value: 1500, unit: 'cm' };
    const numSections = 11;
    const epmax: ValueUnit = { value: -45.02, unit: 'cm' };
    
    const cableGeo = new CableGeometry({ width, epmax, numPoints: numSections });
    const x_values_cm = cableGeo.subdivideSpan().values;
    const ep_values_cm = x_values_cm.map((x:number) => cableGeo.cableY(x));

    beforeAll(() => {
        elu = new ELU({
            P0: { values: p0_full, unit: 'kN' },
            ep: { values: ep_values_cm, unit: 'cm' },
            Ac: Ac,
            W1: W1,
            W2: W2,
            Mg: { values: mg_full, unit: 'kN*m' },
            concrete: new Concrete({fck: {value: 3.5, unit: 'kN/cm²'},aggregate: 'granite'})
        });
    });

    it('should be instantiated correctly', () => {
        expect(elu).toBeInstanceOf(ELU);
        expect(elu.P0.values).toEqual(p0_full);
        expect(elu.Mg.values).toEqual(mg_full);
        expect(elu.Ac).toEqual(Ac);
        expect(elu.W1).toEqual(W1);
        expect(elu.W2).toEqual(W2);
    });

    describe('calculateSigma1P0_ELU', () => {
        it('should calculate the stress in the top fiber correctly', () => {
            const sigma1 = elu.sigma1P0_ELU;

            // --- Verification for multiple points using a data-driven approach ---
            const testCases = [
                { index: 0, description: 'At x = 0 (start)', expected: -0.5062 },
                { index: 1, description: 'At x = 1.5m', expected: -0.7872 },
                { index: 2, description: 'At x = 3.0m', expected: -1.0099 },
                { index: 3, description: 'At x = 4.5m', expected: -1.1734 },
                { index: 4, description: 'At x = 6.0m', expected: -1.2775 },
                { index: 5, description: 'At x = 7.5m (mid-span)', expected: -1.3218},
            ];

            testCases.forEach(testCase => {
                // Formula: σ1 = 1.1 * P0 * (1/Ac + ep/W1) - (Mg*100)/W1
                const P0_i = p0_full[testCase.index];
                const ep_i = ep_values_cm[testCase.index];
                const Mg_i = mg_full[testCase.index];

                const expected_sigma = 1.1 * P0_i * (1 / Ac.value + ep_i / W1.value) - (Mg_i * 100) / W1.value;

                // Check if my manual calculation matches the test case expected value
                expect(expected_sigma).toBeCloseTo(testCase.expected, 3);
                expect(sigma1.values[testCase.index]).toBeCloseTo(testCase.expected, 3);

            });

            expect(sigma1.unit).toBe('kN/cm²');
        });
    });

    describe('calculateSigma2P0_ELU', () => {
        it('should calculate the stress in the bottom fiber correctly', () => {
            const sigma2 = elu.calculateSigma2P0();

            // --- Verification for multiple points using a data-driven approach ---
            const testCases = [
                { index: 0, description: 'At x = 0 (start)', expected: -0.5062 },
                { index: 1, description: 'At x = 1.5m', expected: -0.3012 },
                { index: 2, description: 'At x = 3.0m', expected: -0.1386 },
                { index: 3, description: 'At x = 4.5m', expected: -0.0205 },
                { index: 4, description: 'At x = 6.0m', expected: 0.0522 },
                { index: 5, description: 'At x = 7.5m (mid-span)', expected: 0.0786},
            ];

            testCases.forEach(testCase => {
                // Formula: σ2 = 1.1 * P0 * (1/Ac + ep/W2) - (Mg*100)/W2
                const P0_i = p0_full[testCase.index];
                const ep_i = ep_values_cm[testCase.index];
                const Mg_i = mg_full[testCase.index];

                const expected_sigma = 1.1 * P0_i * (1 / Ac.value + ep_i / W2.value) - (Mg_i * 100) / W2.value;

                expect(sigma2.values[testCase.index]).toBeCloseTo(testCase.expected, 4);
                expect(expected_sigma).toBeCloseTo(testCase.expected, 4);
            });

            expect(sigma2.unit).toBe('kN/cm²');
        });
    });
});

describe('ELU - Verification Failure Cases', () => {
    let eluWithLowFck: ELU;
    const j = 5;

    beforeAll(() => {
        // Re-using data from 'Case 1' but with a very low fck to force verification failure.
        const p0_half = [-2156.12, -2174.28, -2190.57, -2206.55, -2223.40, -2241.92];
        const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];
        const mg_half = [0, 182.25, 324, 425.25, 486, 506.25];
        const mg_full = [...mg_half, ...mg_half.slice(0, -1).reverse()];
        const width: ValueUnit = { value: 1500, unit: 'cm' };
        const cableGeo = new CableGeometry({ width, epmax: { value: -48, unit: 'cm' }, numPoints: 11 });
        const x_values_cm = cableGeo.subdivideSpan().values;
        const ep_values_cm = x_values_cm.map((x:number) => cableGeo.cableY(x));

        eluWithLowFck = new ELU({
            P0: { values: p0_full, unit: 'kN' },
            ep: { values: ep_values_cm, unit: 'cm' },
            Ac: { value: 7200, unit: 'cm²' },
            W1: { value: -144000, unit: 'cm³' },
            W2: { value: 144000, unit: 'cm³' },
            Mg: { values: mg_full, unit: 'kN*m' },
            // Using a very low fck to make the limits smaller and cause the check to fail.
            concrete: new Concrete({ fck: { value: 1, unit: 'kN/cm²' }, aggregate: 'granite' })
        });
    });

    it('should fail verification for sigma1 when compression stress is too high for the given fck', () => {
        const result = eluWithLowFck.verification_sigma1P0({ j });

        // console.log('Sigma1 Verification (Fail):', {
        //     limit: result.limit,
        //     values: result.values.values.map((v: number) => v.toFixed(4))
        // });

        // With fck=1, the compression limit will be very small (e.g., -0.06 kN/cm²).
        // The calculated stresses (e.g., -0.81 kN/cm²) will be "less than" this limit, failing the check.
        expect(result.passed).toBe(false);
        expect(result.values.values.some((stress: number) => stress < result.limit.value)).toBe(true);
    });

    it('should fail verification for sigma2 when tension stress exceeds the limit', () => {
        const result = eluWithLowFck.verification_sigma2P0({ j });

        // console.log('Sigma2 Verification (Fail):', {
        //     limit: result.limit,
        //     values: result.values.values.map((v: number) => v.toFixed(4))
        // });

        // With fck=1, the tensile strength limit will be very low (e.g., 0.008 kN/cm²).
        // The calculated sigma2 values (e.g., 0.128 kN/cm²) will exceed this low limit.
        expect(result.passed).toBe(false);
        expect(result.values.values.some((stress: number) => stress > result.limit.value)).toBe(true);
    });
});
 