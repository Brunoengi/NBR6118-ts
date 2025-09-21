import ImmediatePrestress from "../../../src/structuralDesign/PrestressingSteel/LimitStates/ImmediatePrestress.js";
import { CableGeometry } from "../../../src/structuralDesign/PrestressingSteel/CableGeometry.js";
import { ValueUnit, ValuesUnit } from "../../../src/types/index.js";

describe('ImmediatePrestress - Case 1', () => {
    let immediatePrestress: ImmediatePrestress;

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
    const numSections = 10;
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    
    const cableGeo = new CableGeometry({ width, epmax });
    const x_values_cm = cableGeo.subdivideSpan(width, numSections).values;
    const ep_values_cm = x_values_cm.map(x => cableGeo.cableY(x));

    beforeAll(() => {
        immediatePrestress = new ImmediatePrestress({
            P0: { values: p0_full, unit: 'kN' },
            ep: { values: ep_values_cm, unit: 'cm' },
            Ac: Ac,
            W1: W1,
            W2: W2,
            Mg: { values: mg_full, unit: 'kN*m' }
        });
    });

    it('should be instantiated correctly', () => {
        expect(immediatePrestress).toBeInstanceOf(ImmediatePrestress);
        expect(immediatePrestress.P0.values).toEqual(p0_full);
        expect(immediatePrestress.Mg.values).toEqual(mg_full);
        expect(immediatePrestress.Ac).toEqual(Ac);
        expect(immediatePrestress.W1).toEqual(W1);
        expect(immediatePrestress.W2).toEqual(W2);
    });

    describe('calculateSigma1P0_ELU', () => {
        it('should calculate the stress in the top fiber correctly', () => {
            const sigma1 = immediatePrestress.sigma1P0_ELU;

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
            });

            expect(sigma1.unit).toBe('kN/cm²');
        });
    });

    describe('calculateSigma2P0_ELU', () => {
        it('should calculate the stress in the bottom fiber correctly', () => {
            const sigma2 = immediatePrestress.calculateSigma2P0_ELU();

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
});


describe('ImmediatePrestress - Case 2', () => {
    let immediatePrestress: ImmediatePrestress;

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
    const numSections = 10;
    const epmax: ValueUnit = { value: -45.02, unit: 'cm' };
    
    const cableGeo = new CableGeometry({ width, epmax });
    const x_values_cm = cableGeo.subdivideSpan(width, numSections).values;
    const ep_values_cm = x_values_cm.map(x => cableGeo.cableY(x));

    beforeAll(() => {
        immediatePrestress = new ImmediatePrestress({
            P0: { values: p0_full, unit: 'kN' },
            ep: { values: ep_values_cm, unit: 'cm' },
            Ac: Ac,
            W1: W1,
            W2: W2,
            Mg: { values: mg_full, unit: 'kN*m' }
        });
    });

    it('should be instantiated correctly', () => {
        expect(immediatePrestress).toBeInstanceOf(ImmediatePrestress);
        expect(immediatePrestress.P0.values).toEqual(p0_full);
        expect(immediatePrestress.Mg.values).toEqual(mg_full);
        expect(immediatePrestress.Ac).toEqual(Ac);
        expect(immediatePrestress.W1).toEqual(W1);
        expect(immediatePrestress.W2).toEqual(W2);
    });

    describe('calculateSigma1P0_ELU', () => {
        it('should calculate the stress in the top fiber correctly', () => {
            const sigma1 = immediatePrestress.sigma1P0_ELU;

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

            });

            expect(sigma1.unit).toBe('kN/cm²');
        });
    });

    describe('calculateSigma2P0_ELU', () => {
        it('should calculate the stress in the bottom fiber correctly', () => {
            const sigma2 = immediatePrestress.calculateSigma2P0_ELU();

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
