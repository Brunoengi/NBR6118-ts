import { describe, it, expect } from '@jest/globals';

import Rectangular from "../../src/utils/sections/Rectangular.js"

describe('Rectangular Section', () => {
    const base = { value: 20, unit: 'cm' }
    const height = { value: 50, unit: 'cm' }
    const rectangularSection = new Rectangular({ base, height })

    it('should create a rectangular section with correct geometric properties', () => {
        // Area = base * height
        expect(rectangularSection.props.A.value).toBe(1000)
        expect(rectangularSection.props.A.unit).toBe('cm²')

        // Centroid for a rectangle centered at origin x and starting at y=0
        expect(rectangularSection.props.Xg.value).toBe(0)
        expect(rectangularSection.props.Yg.value).toBe(25)

        // Moment of inertia about centroidal axis x (Ixg = b*h^3/12)
        expect(rectangularSection.props.Ixg.value).toBeCloseTo(20 * (50 ** 3) / 12)
        expect(rectangularSection.props.Ixg.unit).toBe('cm⁴')

        // Dimensions
        expect(rectangularSection.props.height.value).toBe(50)
        expect(rectangularSection.props.base.value).toBe(20)

        // Check points definition
        // The points should define a rectangle from (-b/2, 0) to (b/2, h)
        const expectedPoints = [
            { 'x': 10, 'y': 0 },
            { 'x': 10, 'y': 50 },
            { 'x': -10, 'y': 50 },
            { 'x': -10, 'y': 0 },
            { 'x': 10, 'y': 0 }
        ]
        expect(rectangularSection.points).toEqual(expectedPoints)

        // Perimeter = 2 * base + 2 * height = 2 * 20 + 2 * 50 = 140
        expect(rectangularSection.props.perimeter.value).toBe(140)
        expect(rectangularSection.props.perimeter.unit).toBe('cm')

    })

    describe('calculate_area_upperHorizontaLine', () => {
        it('should calculate the area above a line in the middle of the section', () => {
            const yLine = { value: 25, unit: 'cm' } // Middle of the height
            const result = rectangularSection.setProperties_upperHorizontaLine({ points: rectangularSection.points, yLine }).A
            // Expected area = base * (height - yLine) = 20 * (50 - 25) = 500
            expect(result.value).toBe(500)
            expect(result.unit).toBe('cm²')
        })

        it('should calculate the area above a line in the middle of the section', () => {
            const yLine = { value: 40, unit: 'cm' } // Middle of the height
            const result = rectangularSection.setProperties_upperHorizontaLine({ points: rectangularSection.points, yLine }).A
            // Expected area = base * (height - yLine) = 20 * (50 - 40) = 200
            expect(result.value).toBe(200)
            expect(result.unit).toBe('cm²')
        })

        it('should calculate the full area when the line is at the bottom', () => {
            const yLine = { value: 0, unit: 'cm' } // Bottom of the section
            const result = rectangularSection.setProperties_upperHorizontaLine({ points: rectangularSection.points, yLine }).A
            // Expected area = base * height = 20 * 50 = 1000
            expect(result.value).toBe(1000)
        })

        it('should return zero area when the line is at the top', () => {
            const yLine = { value: 50, unit: 'cm' } // Top of the section
            const result = rectangularSection.setProperties_upperHorizontaLine({ points: rectangularSection.points, yLine }).A
            expect(result.value).toBe(0)
        })
    })
})
