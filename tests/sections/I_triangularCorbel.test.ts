import { describe, it, expect } from '@jest/globals';

import I_triangularCorbel from "../../src/sections/I_triangularCorbel.js";

describe('I_triangularCorbel Section', () => {
    // Using symmetric dimensions for easier verification of centroid
    const bf = { value: 30, unit: 'cm' };
    const hf = { value: 5, unit: 'cm' };
    const bw = { value: 10, unit: 'cm' };
    const h = { value: 60, unit: 'cm' };
    const bi = { value: 30, unit: 'cm' };
    const hi = { value: 5, unit: 'cm' };
    const bmissup = { value: 5, unit: 'cm' };
    const hmissup = { value: 5, unit: 'cm' };
    const bmisinf = { value: 5, unit: 'cm' };
    const hmisinf = { value: 5, unit: 'cm' };

    const section = new I_triangularCorbel({ bf, hf, bw, h, bi, hi, bmissup, hmissup, bmisinf, hmisinf });

    it('should create an I_triangularCorbel section with correct geometric properties', () => {
        // Area = A_bottom_flange + A_bottom_corbels + A_web + A_top_corbels + A_top_flange
        // A_bottom_flange = 30 * 5 = 150
        // A_bottom_corbels = 2 * (1/2 * bmisinf * hmisinf) = 5 * 5 = 25
        // A_web = bw * (h - hf - hi) = 10 * (60 - 5 - 5) = 10 * 50 = 500
        // A_top_corbels = 2 * (1/2 * bmissup * hmissup) = 5 * 5 = 25
        // A_top_flange = 30 * 5 = 150
        // Total Area = 150 + 25 + 500 + 25 + 150 = 850
        expect(section.props.A.value).toBeCloseTo(850);
        expect(section.props.A.unit).toBe('cm²');

        // Centroid Xg (symmetric section)
        expect(section.props.Xg.value).toBeCloseTo(0);

        // Centroid Yg (symmetric section)
        expect(section.props.Yg.value).toBeCloseTo(30); // h / 2

        // Dimensions
        expect(section.props.height.value).toBe(60);
        expect(section.props.base.value).toBe(30); // max(bi, bf)

        // Check points definition
        const expectedPoints = [
            { x: -15, y: 0 },
            { x: 15, y: 0 },
            { x: 15, y: 5 },
            { x: 10, y: 5 }, // bw/2 + bmisinf
            { x: 5, y: 10 }, // hi + hmisinf
            { x: 5, y: 50 }, // h - hf - hmissup
            { x: 10, y: 55 }, // h - hf
            { x: 15, y: 55 },
            { x: 15, y: 60 },
            { x: -15, y: 60 },
            { x: -15, y: 55 },
            { x: -10, y: 55 }, // -bw/2 - bmissup
            { x: -5, y: 50 }, // h - hf - hmissup
            { x: -5, y: 10 }, // hi + hmisinf
            { x: -10, y: 5 }, // -bw/2 - bmisinf
            { x: -15, y: 5 },
            { x: -15, y: 0 }
        ];
        expect(section.points).toEqual(expectedPoints);

        // Perimeter calculation:
        // Bottom flange: 30 (base) + 5 (left side) + 5 (right side) = 40
        // Top flange: 30 (base) + 5 (left side) + 5 (right side) = 40
        // Web: 40 (left) + 40 (right) = 80
        // Corbels: 4 * sqrt(5^2 + 5^2) = 4 * sqrt(50) = 4 * 7.071 = 28.284
        // Total = 40 + 40 + 80 + 28.284 = 188.284. Let's recalculate based on points.
        // 30+5+5+sqrt(50)+40+sqrt(50)+5+5+30+5+5+sqrt(50)+40+sqrt(50)+5 = 140 + 4*sqrt(50) = 140 + 28.284 = 168.284
        // Let's trace the points: 30+5+5+sqrt(50)+40+sqrt(50)+5+5+30+5+5+sqrt(50)+40+sqrt(50)+5 = 140 + 4*sqrt(50) = 168.28427...
        // Correct perimeter: 30+5+5+sqrt(50)+40+sqrt(50)+5+5+30+5+5+sqrt(50)+40+sqrt(50)+5 = 140 + 4*sqrt(50) = 168.284
        // Let's re-calculate from points: 30+5+5+sqrt(50)+40+sqrt(50)+5+5+30+5+5+sqrt(50)+40+sqrt(50)+5 = 140 + 4*sqrt(50) = 168.284
        // p0-p1=30, p1-p2=5, p2-p3=5, p3-p4=sqrt(50), p4-p5=40, p5-p6=sqrt(50), p6-p7=5, p7-p8=5, p8-p9=30, p9-p10=5, p10-p11=5, p11-p12=sqrt(50), p12-p13=40, p13-p14=sqrt(50), p14-p15=5, p15-p16=5.
        // Sum = 30+5+5+s+40+s+5+5+30+5+5+s+40+s+5+5 = 150 + 4*s = 150 + 4*7.071 = 178.284
        // Let's re-re-calculate: 30+5+5+sqrt(50)+40+sqrt(50)+5+5+30+5+5+sqrt(50)+40+sqrt(50)+5+5 = 150 + 4*sqrt(50) = 178.284
        const perimeter = 30 + 5 + 5 + Math.sqrt(50) + 40 + Math.sqrt(50) + 5 + 5 + 30 + 5 + 5 + Math.sqrt(50) + 40 + Math.sqrt(50) + 5 + 5; // 150 + 4 * sqrt(50)
        expect(section.props.perimeter.value).toBeCloseTo(perimeter);
        expect(section.props.perimeter.unit).toBe('cm');
    });

    describe('setProperties_upperHorizontaLine', () => {
        it('should return full area when the line is below the section', () => {
            const yLine = { value: -10, unit: 'cm' };
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            expect(result.value).toBeCloseTo(850);
        });

        it('should return zero area when the line is above the section', () => {
            const yLine = { value: 70, unit: 'cm' };
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            expect(result.value).toBe(0);
        });

        it('should calculate area when the line is inside the bottom flange', () => {
            const yLine = { value: 2.5, unit: 'cm' };
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            // Area = A_full - A_removed_from_bottom_flange
            // Area = 850 - (30 * 2.5) = 850 - 75 = 775
            expect(result.value).toBeCloseTo(775);
        });

        it('should calculate area when the line is inside the bottom corbels', () => {
            const yLine = { value: 7.5, unit: 'cm' }; // Middle of the bottom corbel height
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            // Area = A_top_flange + A_top_corbels + A_web_above + A_bottom_corbels_above
            // A_top_flange = 150
            // A_top_corbels = 25
            // A_web_above (from y=7.5 to y=55) = 10 * (55 - 7.5) = 475
            // A_bottom_corbels_above (implementation seems to calculate 1/4 area) = 0.25 * 25 = 6.25
            // Total = 150 + 25 + 475 + 6.25 = 656.25
            expect(result.value).toBeCloseTo(656.25);
        });

        it('should calculate area when the line is inside the web', () => {
            const yLine = { value: 30, unit: 'cm' }; // Middle of the web
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            // Area = A_web_above + A_top_corbels + A_top_flange
            // A_web_above = 10 * (55 - 30) = 250 (web ends at y=55)
            // Total = 250 + 25 + 150 = 425
            expect(result.value).toBeCloseTo(425);
        });

        it('should calculate area when the line is inside the top corbels', () => {
            const yLine = { value: 52.5, unit: 'cm' }; // Middle of the top corbel height
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            // Area = A_top_flange + A_web_above_corbel_start + A_top_corbels_above
            // A_web_above (from y=52.5 to y=55) = 10 * (55 - 52.5) = 25
            // A_top_corbels_above (cut at half height) = 3/4 of corbel area = 0.75 * 25 = 18.75
            // Total = 150 (top flange) + 25 (web) + 18.75 (corbels) = 193.75
            expect(result.value).toBeCloseTo(193.75);
        });

        it('should calculate area when the line is inside the top flange', () => {
            const yLine = { value: 57.5, unit: 'cm' };
            const result = section.setProperties_upperHorizontaLine({ points: section.points, yLine }).A;
            // Area = A_top_flange_above
            // Area = 30 * (60 - 57.5) = 75
            expect(result.value).toBeCloseTo(75);
        });
    });
});
