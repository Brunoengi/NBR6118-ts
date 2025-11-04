import { describe, it, expect } from '@jest/globals';

import T_triangularCorbel from "../../src/utils/sections/T_triangularCorbel.js";

describe('T_triangularCorbel Section', () => {
    const bf = { value: 40, unit: 'cm' };
    const hf = { value: 10, unit: 'cm' };
    const bw = { value: 20, unit: 'cm' };
    const h = { value: 50, unit: 'cm' };
    const bmis = { value: 5, unit: 'cm' };
    const hmis = { value: 5, unit: 'cm' };

    const section = new T_triangularCorbel({ bf, hf, bw, h, bmis, hmis });

    it('should create a T_triangularCorbel section with correct geometric properties', () => {
        // Area = Area_T_section + Area_corbels
        // Area_T_section = bw * (h - hf) + bf * hf = 20 * 40 + 40 * 10 = 1200
        // Area_corbels = 2 * (1/2 * bmis * hmis) = 5 * 5 = 25
        // Total Area = 1200 + 25 = 1225
        expect(section.props.A.value).toBeCloseTo(1225);
        expect(section.props.A.unit).toBe('cm²');

        // Centroid Xg (symmetric section)
        expect(section.props.Xg.value).toBeCloseTo(0);

        // Centroid Yg = (Σ Ai * yi) / Σ Ai
        // Yg_T_section = 28.333... (from T.test.ts)
        // y_corbels = (h - hf) - hmis / 3 = 40 - 5/3 = 38.333...
        // Yg = (1200 * 28.333... + 25 * 38.333...) / 1225
        // Yg = (34000 + 958.333...) / 1225 = 34958.333... / 1225 = 28.5374...
        expect(section.props.Yg.value).toBeCloseTo(28.5374);

        // Dimensions
        expect(section.props.height.value).toBe(50);
        expect(section.props.base.value).toBe(40);

        // Check points definition
        // The points were adjusted to represent a triangular corbel correctly.
        const expectedPoints = [
            { 'x': -10, 'y': 0 },
            { 'x': 10, 'y': 0 },
            { 'x': 10, 'y': 35 },
            { 'x': 15, 'y': 40 },
            { 'x': 20, 'y': 40 },
            { 'x': 20, 'y': 50 },
            { 'x': -20, 'y': 50 },
            { 'x': -20, 'y': 40 },
            { 'x': -15, 'y': 40 },
            { 'x': -10, 'y': 35 },
            { 'x': -10, 'y': 0 }
        ];
        expect(section.points).toEqual(expectedPoints);

        // Perimeter calculation based on points:
        // 20 (base) + 35 (web side) + sqrt(50) (corbel) + 5 (corbel top) + 10 (flange side) + 40 (flange top) + 10 (flange side) + 5 (corbel top) + sqrt(50) (corbel) + 35 (web side)
        // = 20 + 35 + 7.071 + 5 + 10 + 40 + 10 + 5 + 7.071 + 35 = 174.142...
        expect(section.props.perimeter.value).toBeCloseTo(174.142);
        expect(section.props.perimeter.unit).toBe('cm');
    });

    describe('setProperties_upperHorizontaLine', () => {
        it('should return full area when the line is below the section', () => {
            const yLine = { value: -10, unit: 'cm' };
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            expect(result.value).toBeCloseTo(1225);
        });

        it('should return zero area when the line is above the section', () => {
            const yLine = { value: 60, unit: 'cm' };
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            expect(result.value).toBeCloseTo(0);
        });

        it('should calculate area when the line is inside the web', () => {
            const yLine = { value: 20, unit: 'cm' };
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            // Area = Area_web_above + Area_flange + Area_corbels
            // Area_web_above = bw * ((h-hf) - yLine) = 20 * (40 - 20) = 400
            // Area_flange = 400, Area_corbels = 25
            // Total = 400 + 400 + 25 = 825
            expect(result.value).toBeCloseTo(825);
        });

        it('should calculate area when the line is inside the corbel', () => {
            const yLine = { value: 37.5, unit: 'cm' }; // Line in the middle of the corbel height
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            // Area = Area_flange + Area_web_above + Area_corbels_above
            // Area_flange = 400
            // Area_web_above (from 37.5 to 40) = 20 * 2.5 = 50
            // Area_corbels_above (3/4 of total) = 0.75 * 25 = 18.75
            // Total Area = 400 + 50 + 18.75 = 468.75
            expect(result.value).toBeCloseTo(468.75);
        });

        it('should calculate area when the line is inside the flange', () => {
            const yLine = { value: 45, unit: 'cm' };
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            // Area = bf * (h - yLine) = 40 * (50 - 45) = 200
            expect(result.value).toBeCloseTo(200);
        });
    });
});
