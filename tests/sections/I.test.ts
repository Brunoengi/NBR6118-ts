import { describe, it, expect } from '@jest/globals';

import I from "../../src/sections/I.js";

describe('I Section', () => {
    const bf = { value: 30, unit: 'cm' };
    const hf = { value: 5, unit: 'cm' };
    const bw = { value: 10, unit: 'cm' };
    const h = { value: 50, unit: 'cm' };
    const bi = { value: 20, unit: 'cm' };
    const hi = { value: 5, unit: 'cm' };

    const iSection = new I({ bf, hf, bw, h, bi, hi });

    it('should create an I section with correct geometric properties', () => {
        // Area = Area_bottom_flange + Area_web + Area_top_flange
        // Area_bottom_flange = bi * hi = 20 * 5 = 100
        // Area_web = bw * (h - hf - hi) = 10 * (50 - 5 - 5) = 400
        // Area_top_flange = bf * hf = 30 * 5 = 150
        // Total Area = 100 + 400 + 150 = 650
        expect(iSection.props.A.value).toBeCloseTo(650);
        expect(iSection.props.A.unit).toBe('cm²');

        // Centroid Xg (symmetric section)
        expect(iSection.props.Xg.value).toBeCloseTo(0);

        // Centroid Yg = (Σ Ai * yi) / Σ Ai
        // y_bottom_flange = hi / 2 = 2.5
        // y_web = hi + (h - hf - hi) / 2 = 5 + 20 = 25
        // y_top_flange = h - hf / 2 = 47.5
        // Yg = (100 * 2.5 + 400 * 25 + 150 * 47.5) / 650 = 17375 / 650 = 26.7307...
        expect(iSection.props.Yg.value).toBeCloseTo(26.7307);

        // Dimensions
        expect(iSection.props.height.value).toBe(50);
        expect(iSection.props.base.value).toBe(30); // max(bi, bf)

        // Check points definition
        const expectedPoints = [
            { 'x': -10, 'y': 0 },
            { 'x': 10, 'y': 0 },
            { 'x': 10, 'y': 5 },
            { 'x': 5, 'y': 5 },
            { 'x': 5, 'y': 45 },
            { 'x': 15, 'y': 45 },
            { 'x': 15, 'y': 50 },
            { 'x': -15, 'y': 50 },
            { 'x': -15, 'y': 45 },
            { 'x': -5, 'y': 45 },
            { 'x': -5, 'y': 5 },
            { 'x': -10, 'y': 5 },
            { 'x': -10, 'y': 0 }
        ];
        expect(iSection.points).toEqual(expectedPoints);

        // Perimeter = 20+5+5+40+10+5+30+5+10+40+5+5 = 180
        expect(iSection.props.perimeter.value).toBe(180);
        expect(iSection.props.perimeter.unit).toBe('cm');

    });

    describe('setProperties_upperHorizontaLine', () => {
        it('should return full area when the line is below the section', () => {
            const yLine = { value: -10, unit: 'cm' };
            const result = iSection.setProperties_upperHorizontaLine({ points: iSection.points, yLine }).A;
            expect(result.value).toBeCloseTo(650);
        });

        it('should return zero area when the line is above the section', () => {
            const yLine = { value: 60, unit: 'cm' };
            const result = iSection.setProperties_upperHorizontaLine({ points: iSection.points, yLine }).A;
            expect(result.value).toBeCloseTo(0);
        });

        it('should calculate area when the line is inside the bottom flange', () => {
            const yLine = { value: 2.5, unit: 'cm' };
            const result = iSection.setProperties_upperHorizontaLine({ points: iSection.points, yLine }).A;
            // Area = Area_bottom_flange_above + Area_web + Area_top_flange
            // Area = 20 * (5 - 2.5) + 400 + 150 = 50 + 400 + 150 = 600
            expect(result.value).toBeCloseTo(600);
        });

        it('should calculate area when the line is inside the web', () => {
            const yLine = { value: 25, unit: 'cm' };
            const result = iSection.setProperties_upperHorizontaLine({ points: iSection.points, yLine }).A;
            // Area = Area_web_above + Area_top_flange
            // Area = 10 * (45 - 25) + 150 = 200 + 150 = 350
            expect(result.value).toBeCloseTo(350);
        });

        it('should calculate area when the line is inside the top flange', () => {
            const yLine = { value: 47.5, unit: 'cm' };
            const result = iSection.setProperties_upperHorizontaLine({ points: iSection.points, yLine }).A;
            // Area = Area_top_flange_above
            // Area = 30 * (50 - 47.5) = 75
            expect(result.value).toBeCloseTo(75);
        });
    });
});
