import { CableGeometry } from "../../../src/structuralDesign/PrestressingSteel/CableGeometry.js";
import { ValueUnit } from "../../../src/types/index.js";

describe('CableGeometry', () => {
    let cableGeo: CableGeometry;
    const width: ValueUnit = { value: 2500, unit: 'cm' }; // 25m
    const epmax: ValueUnit = { value: -48, unit: 'cm' };

    beforeAll(() => {
        cableGeo = new CableGeometry({ width, epmax });
    });

    it('should be instantiated correctly', () => {
        expect(cableGeo).toBeInstanceOf(CableGeometry);
        expect(cableGeo.width).toEqual(width);
        expect(cableGeo.epmax).toEqual(epmax);
    });

    describe('subdivideSpan', () => {
        it('should subdivide the span into the correct number of points', () => {
            const spanWidth: ValueUnit = { value: 20, unit: 'm' };
            const result = cableGeo.subdivideSpan(spanWidth, 4);
            expect(result.values).toEqual([0, 5, 10, 15, 20]);
            expect(result.unit).toBe('m');
        });

        it('should handle floating point steps', () => {
            const spanWidth: ValueUnit = { value: 10, unit: 'm' };
            const result = cableGeo.subdivideSpan(spanWidth, 3);
            expect(result.values.length).toBe(4);
            expect(result.values[0]).toBeCloseTo(0);
            expect(result.values[1]).toBeCloseTo(3.333333);
            expect(result.values[2]).toBeCloseTo(6.666667);
            expect(result.values[3]).toBeCloseTo(10);
        });

        it('should throw an error for zero or negative sections', () => {
            const spanWidth: ValueUnit = { value: 10, unit: 'm' };
            expect(() => cableGeo.subdivideSpan(spanWidth, 0)).toThrow("The number of sections must be greater than zero.");
            expect(() => cableGeo.subdivideSpan(spanWidth, -1)).toThrow("The number of sections must be greater than zero.");
        });
    });

    describe('Geometric Calculations', () => {
        // Using L = 2500 cm, e = -48 cm
        it('should calculate cable path y(x) correctly', () => {
            expect(cableGeo.cableY(0)).toBeCloseTo(0);
            // y(1250) = -(4 * -48 / 2500^2) * 1250^2 + (4 * -48 / 2500) * 1250 = 48 - 96 = -48
            expect(cableGeo.cableY(1250)).toBeCloseTo(-48);
            // y(2500) = -(4 * -48 / 2500^2) * 2500^2 + (4 * -48 / 2500) * 2500 = 192 - 192 = 0
            expect(cableGeo.cableY(2500)).toBeCloseTo(0);
        });

        it('should calculate cable slope y\'(x) correctly', () => {
            // y'(x) = -(8 * e / L^2) * x + (4 * e / L)
            // y'(0) = 4 * -48 / 2500 = -0.0768
            expect(cableGeo.cableSlope(0)).toBeCloseTo(-0.0768);
            // y'(1250) = -(8 * -48 / 2500^2) * 1250 + (4 * -48 / 2500) = 0.0768 - 0.0768 = 0
            expect(cableGeo.cableSlope(1250)).toBeCloseTo(0);
            // y'(2500) = -(8 * -48 / 2500^2) * 2500 + (4 * -48 / 2500) = 0.1536 - 0.0768 = 0.0768
            expect(cableGeo.cableSlope(2500)).toBeCloseTo(0.0768);
        });

        it('should calculate cable angle α(x) correctly', () => {
            // α(x) = -atan(y'(x))
            // α(0) = -atan(-0.0768)
            expect(cableGeo.cableAngle(0)).toBeCloseTo(0.07666);
            // α(1250) = -atan(0)
            expect(cableGeo.cableAngle(1250)).toBeCloseTo(0);
            // α(2500) = -atan(0.0768)
            expect(cableGeo.cableAngle(2500)).toBeCloseTo(-0.07666);
        });

        it('should calculate angle deviation Σα correctly', () => {
            const alpha1 = 0.5;
            const alphaI = 0.2;
            expect(cableGeo.angleDeviation(alpha1, alphaI)).toBe(0.3);
        });
    });
});
