import { CableGeometry } from "../../../src/structuralDesign/PrestressingSteel/CableGeometry.js";
import { ValueUnit, Distance } from "../../../src/types/index.js";
import { describe, it, expect } from '@jest/globals';

describe('CableGeometry', () => {
    const width: Distance = { value: 1500, unit: 'cm' };
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const numPoints = 11; // Corresponds to 10 sections

    const cableGeo = new CableGeometry({ width, epmax, numPoints });

    it('should be instantiated correctly', () => {
        expect(cableGeo.width).toEqual(width);
        expect(cableGeo.epmax).toEqual(epmax);
        expect(cableGeo.numPoints).toEqual(numPoints);
        expect(cableGeo.c).toBe(0); // Default value
        expect(cableGeo.x).toBeDefined();
        expect(cableGeo.y).toBeDefined();
        expect(cableGeo.slopes).toBeDefined();
        expect(cableGeo.angles).toBeDefined();
        expect(cableGeo.angleDeviations).toBeDefined();
    });

    it('should handle a custom "c" value in the constructor', () => {
        const customC = 10;
        const cableGeoWithC = new CableGeometry({ width, epmax, numPoints, c: customC });
        expect(cableGeoWithC.c).toBe(customC);
        // At x=0, y should be c
        expect(cableGeoWithC.y.values[0]).toBe(customC);
    });

    describe('subdivideSpan', () => {
        it('should subdivide the span based on the number of points', () => {
            expect(cableGeo.x.values.length).toBe(11);
            expect(cableGeo.x.values).toEqual([0, 150, 300, 450, 600, 750, 900, 1050, 1200, 1350, 1500]);
            expect(cableGeo.x.unit).toBe('cm');
        });

        it('should create 3 points correctly (0, L/2, L)', () => {
            const cableGeo3Points = new CableGeometry({ width, epmax, numPoints: 3 });
            expect(cableGeo3Points.x.values).toEqual([0, 750, 1500]);
        });

        it('should throw an error for less than 2 points', () => {
            expect(() => new CableGeometry({ width, epmax, numPoints: 1 })).toThrow("Number of points must be at least 2.");
            expect(() => new CableGeometry({ width, epmax, numPoints: 0 })).toThrow("Number of points must be at least 2.");
        });
    });

    describe('Parabolic Cable Properties Calculation', () => {
        it('should have correct y (vertical position) values', () => {
            // At start (x=0), y should be c (which is 0)
            expect(cableGeo.y.values[0]).toBe(0);

            // At mid-span (x=L/2), y should be epmax
            // Let's test the mid-point calculation directly as it's the peak of the parabola
            expect(cableGeo.cableY(750)).toBeCloseTo(epmax.value);

            // At end (x=L), y should be c (which is 0)
            const lastIndex = cableGeo.y.values.length - 1;
            expect(cableGeo.y.values[lastIndex]).toBeCloseTo(0);

            // Check a point in the array: x = 150
            // y(150) = (-4*-48/1500^2)*150^2 + (4*-48/1500)*150 = 1.92 - 19.2 = -17.28
            expect(cableGeo.y.values[1]).toBeCloseTo(-17.28);
        });

        it('should have correct slope values', () => {
            // At mid-span (x=L/2), slope should be 0
            expect(cableGeo.cableSlope(750)).toBeCloseTo(0);

            // At start (x=0), slope should be 4*(e-c)/L
            // 4 * (-48) / 1500 = -0.128
            expect(cableGeo.slopes.values[0]).toBeCloseTo(-0.128);

            // At end (x=L), slope should be -4*(e-c)/L
            // -4 * (-48) / 1500 = 0.128
            const lastIndex = cableGeo.slopes.values.length - 1;
            expect(cableGeo.slopes.values[lastIndex]).toBeCloseTo(0.128);
            expect(cableGeo.slopes.unit).toBe('adimensional');
        });

        it('should have correct angle values in radians', () => {
            // At mid-span (x=L/2), angle should be 0
            expect(cableGeo.cableAngle(750)).toBeCloseTo(0);

            // At start (x=0), angle should be -atan(slope) = -atan(-0.16)
            expect(cableGeo.angles.values[0]).toBeCloseTo(-Math.atan(-0.128));
            expect(cableGeo.angles.unit).toBe('radians');
        });

        it('should have correct angleDeviation values', () => {
            const angles = cableGeo.angles.values;
            const deviations = cableGeo.angleDeviations.values;

            // Deviation at start is always 0
            expect(deviations[0]).toBe(0);

            // Deviation at end should be alpha_start - alpha_end
            const lastIndex = deviations.length - 1;
            expect(deviations[lastIndex]).toBeCloseTo(angles[0] - angles[lastIndex]);
            expect(cableGeo.angleDeviations.unit).toBe('radians');
        });
    });
});
