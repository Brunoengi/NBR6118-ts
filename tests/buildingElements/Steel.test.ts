import { describe, it, expect } from '@jest/globals';
import Steel from '../../src/utils/elements/Steel.js';

describe('Steel', () => {
    it('should create an instance for CA 50 steel correctly', () => {
        const steel = new Steel('CA 50');

        expect(steel).toBeInstanceOf(Steel);
        expect(steel.label).toBe('CA 50');
        
        expect(steel.fyk.value).toBe(50);
        expect(steel.fyk.unit).toBe('kN/cm²');

        expect(steel.fyd.value).toBeCloseTo(50 / 1.15);
        expect(steel.fyd.unit).toBe('kN/cm²');
    });

    it('should create an instance for CA 60 steel correctly', () => {
        const steel = new Steel('CA 60');

        expect(steel).toBeInstanceOf(Steel);
        expect(steel.label).toBe('CA 60');

        expect(steel.fyk.value).toBe(60);
        expect(steel.fyk.unit).toBe('kN/cm²');

        expect(steel.fyd.value).toBeCloseTo(60 / 1.15);
        expect(steel.fyd.unit).toBe('kN/cm²');
    });
});
