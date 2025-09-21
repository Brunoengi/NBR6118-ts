import ImmediatePrestress from "../../../../src/structuralDesign/PrestressingSteel/LimitStates/ImmediatePrestress.js";
import { CableGeometry } from "../../../../src/structuralDesign/PrestressingSteel/CableGeometry.js";
import { ValueUnit, ValuesUnit } from "../../../../src/types/index.js";

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

            // --- Manual Calculation for Verification at specific points ---
            // Formula: σ1 = 1.1 * P0 * (1/Ac + ep/W1) - (Mg*100)/W1
            
            // At x = 0 (start)
            const P0_0 = p0_full[0]; // -2156.12 kN
            const ep_0 = ep_values_cm[0]; // 0 cm
            const Mg_0 = mg_full[0]; // 0 kN*m
            const expected_sigma1_0 = 1.1 * P0_0 * (1 / Ac.value + ep_0 / W1.value) - (Mg_0 * 100) / W1.value;
            // = 1.1 * -2156.12 * (1/7200 + 0) - 0 = -0.3294 kN/cm²
            
            expect(sigma1.values[0]).toBeCloseTo(expected_sigma1_0, 4);

            // At x = 7.5m (mid-span, index 5)
            const P0_mid = p0_full[5]; // -2241.92 kN
            const ep_mid = ep_values_cm[5]; // -48 cm
            const Mg_mid = mg_full[5]; // 506.25 kN*m
            const expected_sigma1_mid = 1.1 * P0_mid * (1 / Ac.value + ep_mid / W1.value) - (Mg_mid * 100) / W1.value;
            // = 1.1 * -2241.92 * (1/7200 + -48/-144000) - (506.25*100)/-144000
            // = -2466.112 * (0.00013888 + 0.00033333) + 0.35156
            // = -2466.112 * 0.00047221 + 0.35156 = -1.1645 + 0.35156 = -0.8130 kN/cm²
            
            expect(sigma1.values[5]).toBeCloseTo(expected_sigma1_mid, 4);
            expect(sigma1.unit).toBe('kN/cm²');
        });
    });
});


describe('ImmediatePrestress - Case 2', () => {
    let immediatePrestress: ImmediatePrestress;

    // --- Input Data based on user request ---
    const p0_half = [-1455.443, -1466.437, -1475.147, -1483.507, -1492.972, -1504.479];
    const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];

    const mg_half = [0, 80.051, 142.313, 186.785, 213.469, 222.364];
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

            // --- Manual Calculation for Verification at specific points ---
            // Formula: σ1 = 1.1 * P0 * (1/Ac + ep/W1) - (Mg*100)/W1
            
            // At x = 0 (start)
            const P0_0 = p0_full[0]; // -1455.443 kN
            const ep_0 = ep_values_cm[0]; // 0 cm
            const Mg_0 = mg_full[0]; // 0 kN*m
            const expected_sigma1_0 = 1.1 * P0_0 * (1 / Ac.value + ep_0 / W1.value) - (Mg_0 * 100) / W1.value;
            // = 1.1 * -1455.443 * (1/3162.50 + 0) - 0 = -0.5062 kN/cm²
            
            expect(sigma1.values[0]).toBeCloseTo(expected_sigma1_0, 4);

            // At x = 7.5m (mid-span, index 5)
            const P0_mid = p0_full[5]; // -1504.479 kN
            const ep_mid = ep_values_cm[5]; // -45.02 cm
            const Mg_mid = mg_full[5]; // 222.364 kN*m
            const expected_sigma1_mid = 1.1 * P0_mid * (1 / Ac.value + ep_mid / W1.value) - (Mg_mid * 100) / W1.value;
            // = 1.1 * -1504.479 * (1/3162.5 + -45.02/-65566.50) - (222.364*100)/-65566.50
            // = -1654.9269 * (0.0003162 + 0.0006867) + 0.3391
            // = -1.6597 + 0.3391 = -1.3206 kN/cm²
            
            expect(sigma1.values[5]).toBeCloseTo(expected_sigma1_mid, 4);
            expect(sigma1.unit).toBe('kN/cm²');
        });
    });
});
