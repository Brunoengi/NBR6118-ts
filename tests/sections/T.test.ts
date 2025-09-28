import { describe, it, expect } from '@jest/globals';

import T from "../../src/sections/T.js";

describe('T Section', () => {
    const bf = { value: 40, unit: 'cm' }
    const hf = { value: 10, unit: 'cm' }
    const bw = { value: 20, unit: 'cm' }
    const h = { value: 50, unit: 'cm' }
    const tSection = new T({ bf, hf, bw, h })

    it('should create a T section with correct geometric properties', () => {
        // Area = bw * (h - hf) + bf * hf = 20 * 40 + 40 * 10 = 800 + 400 = 1200
        expect(tSection.props.A.value).toBe(1200)
        expect(tSection.props.A.unit).toBe('cm²')

        // Centroid Xg (symmetric section)
        expect(tSection.props.Xg.value).toBe(0)

        // Centroid Yg
        // Yg = (A_web * Yg_web + A_flange * Yg_flange) / A_total
        // Yg_web = (h - hf) / 2 = 40 / 2 = 20
        // Yg_flange = (h - hf) + hf / 2 = 40 + 5 = 45
        // Yg = (800 * 20 + 400 * 45) / 1200 = (16000 + 18000) / 1200 = 34000 / 1200 = 28.333...
        expect(tSection.props.Yg.value).toBeCloseTo(28.333333)

        // Dimensions
        expect(tSection.props.height.value).toBe(50)
        expect(tSection.props.base.value).toBe(40)

        // Check points definition
        const expectedPoints = [
            { 'x': -10, 'y': 0 },
            { 'x': 10, 'y': 0 },
            { 'x': 10, 'y': 40 },
            { 'x': 20, 'y': 40 },
            { 'x': 20, 'y': 50 },
            { 'x': -20, 'y': 50 },
            { 'x': -20, 'y': 40 },
            { 'x': -10, 'y': 40 },
            { 'x': -10, 'y': 0 }
        ]
        expect(tSection.points).toEqual(expectedPoints)
    })

    describe('setProperties_upperHorizontaLine', () => {
        it('should return full area when the line is at the bottom', () => {
            const yLine = { value: 0, unit: 'cm' }
            const result = tSection.setProperties_upperHorizontaLine({ points: tSection.points, yLine }).A
            expect(result.value).toBeCloseTo(1200)
            expect(result.unit).toBe('cm²')
        })

        it('should return zero area when the line is at the top', () => {
            const yLine = { value: 50, unit: 'cm' }
            const result = tSection.setProperties_upperHorizontaLine({ points: tSection.points, yLine }).A
            expect(result.value).toBe(0)
        })

        it('should calculate area when the line is inside the web', () => {
            const yLine = { value: 20, unit: 'cm' } // Line in the middle of the web
            const result = tSection.setProperties_upperHorizontaLine({ points: tSection.points, yLine }).A
            // Expected area = (Area of web above line) + (Area of flange)
            // Area = bw * ((h - hf) - yLine) + bf * hf
            // Area = 20 * (40 - 20) + 40 * 10 = 20 * 20 + 400 = 400 + 400 = 800
            expect(result.value).toBeCloseTo(800)
        })

        it('should calculate area when the line is at the web-flange interface', () => {
            const yLine = { value: 40, unit: 'cm' } // Line at h - hf
            const result = tSection.setProperties_upperHorizontaLine({ points: tSection.points, yLine }).A
            // Expected area = Area of flange = bf * hf = 40 * 10 = 400
            expect(result.value).toBeCloseTo(400)
        })

        it('should calculate area when the line is inside the flange', () => {
            const yLine = { value: 45, unit: 'cm' } // Line in the middle of the flange
            const result = tSection.setProperties_upperHorizontaLine({ points: tSection.points, yLine }).A
            // Expected area = Area of flange above line
            // Area = bf * (h - yLine) = 40 * (50 - 45) = 40 * 5 = 200
            expect(result.value).toBeCloseTo(200)
        })

        it('should return zero area when the line is above the section', () => {
            const yLine = { value: 60, unit: 'cm' }
            const result = tSection.setProperties_upperHorizontaLine({ points: tSection.points, yLine }).A
            expect(result.value).toBe(0)
        })

        it('should return full area when the line is below the section', () => {
            const yLine = { value: -10, unit: 'cm' }
            const result = tSection.setProperties_upperHorizontaLine({ points: tSection.points, yLine }).A
            expect(result.value).toBeCloseTo(1200)
        })
    })
})