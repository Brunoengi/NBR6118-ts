import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import { PrestressingSteelForce, CableGeometry, ValueUnit, ValuesUnit } from "../../../../../src/index.js";

describe('PrestressingSteelForce', () => {
    let prestressForce: PrestressingSteelForce;
    let cableGeometry: CableGeometry;
    let P_inf: ValuesUnit;

    // --- Input Data ---
    const width: ValueUnit = { value: 1500, unit: 'cm' }; // 15m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const numPoints = 11;
    const constantForceValue = -2000; // kN

    beforeAll(() => {
        // 1. Setup CableGeometry
        cableGeometry = new CableGeometry({ width, epmax, numPoints });

        // 2. Setup a constant prestressing force for simplicity
        const p_inf_values = Array(numPoints).fill(constantForceValue);
        P_inf = { values: p_inf_values, unit: 'kN' };

        // 3. Instantiate PrestressingSteelForce
        prestressForce = new PrestressingSteelForce({ P_inf, cableGeometry });
    });

    it('should be instantiated correctly', () => {
        expect(prestressForce).toBeInstanceOf(PrestressingSteelForce);
        expect(prestressForce.P_inf).toEqual(P_inf);
        expect(prestressForce.cableGeometry).toBe(cableGeometry);
    });

    describe('normal()', () => {
        it('should calculate the normal force component correctly', () => {
            const normalForce = prestressForce.normal();

            // At mid-span (index 5), angle is 0, so cos(0) = 1. Normal force should be P_inf.
            expect(normalForce.values[5]).toBeCloseTo(constantForceValue);

            // At the start (index 0), angle is not 0, so |normal force| < |P_inf|.
            // cos(angle) is always positive, and P_inf is negative, so the result is negative.
            expect(normalForce.values[0]).toBeLessThan(0);
            expect(normalForce.values[0]).toBeGreaterThan(constantForceValue); // e.g., -1983 > -2000

            // Check the unit
            expect(normalForce.unit).toBe('kN');
        });
    });

    describe('shear()', () => {
        it('should calculate the shear force component correctly', () => {
            const shearForce = prestressForce.shear();

            // At mid-span (index 5), angle is 0, so sin(0) = 0. Shear force should be 0.
            expect(shearForce.values[5]).toBeCloseTo(0);

            // --- Manual check at the start (index 0) ---
            // From CableGeometry.test.ts, slope at start is -0.128
            // Angle = -atan(slope) = -atan(-0.128) ≈ 0.1272 radians
            const startAngle = cableGeometry.angles.values[0];
            expect(startAngle).toBeCloseTo(0.1272);

            // Vp = P_inf * sin(angle) = -2000 * sin(0.1272) ≈ -2000 * 0.1268 ≈ -253.6 kN
            const expectedShearStart = constantForceValue * Math.sin(startAngle);
            expect(shearForce.values[0]).toBeCloseTo(expectedShearStart);

            // At the end (index 10), the angle is opposite, so shear force should be symmetric and opposite.
            expect(shearForce.values[10]).toBeCloseTo(-expectedShearStart);

            // Check the unit
            expect(shearForce.unit).toBe('kN');
        });
    });
});
