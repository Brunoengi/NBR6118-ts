import { describe, it, expect, beforeAll } from '@jest/globals';
import ShearSteel from '../../../../src/design/beam/reinforcedConcrete/ShearSteel.js';
import Concrete from '../../../../src/utils/elements/concrete/Concrete.js';
import Steel from '../../../../src/utils/elements/steel/Steel.js';
import Rectangular from '../../../../src/utils/sections/Rectangular.js';
import { Force, Distance } from '../../../../src/types/index.js';

/**
 * Exemplos baseados em conceitos do livro Curso de Concreto Armado - Volume 2: José Milton de Araújo
 */
describe('ShearSteel for Rectangular Section', () => {
    let concrete: Concrete;
    let steel: Steel;
    let section: Rectangular;
    let d: Distance;

    beforeAll(() => {
        concrete = new Concrete({
            fck: { value: 2.5, unit: 'kN/cm²' }, // C25
            aggregate: 'granite',
        });

        steel = new Steel('CA-50');

        section = new Rectangular({
            base: { value: 12, unit: 'cm' },
            height: { value: 40, unit: 'cm' }
        });

        d = { value: 36, unit: 'cm' };
    });

    describe('Case 1: Low Shear (Vk = 30kN, fck = 2kN/cm², CA-60)', () => {
        let shearSteel: ShearSteel;
        let localConcrete: Concrete;
        let localSteel: Steel;

        beforeAll(() => {
            localConcrete = new Concrete({
                fck: { value: 2.0, unit: 'kN/cm²' }, // C20
                aggregate: 'granite',
            });

            localSteel = new Steel('CA-60');

            shearSteel = new ShearSteel({
                Vk: { value: 30, unit: 'kN' },
                concrete: localConcrete,
                steel: localSteel,
                section,
                d
            });
        });

        it('should calculate design shear force (Vd)', () => {
            // Vd = 1.4 * 30 = 42 kN
            expect(shearSteel.calculate_Vd({ gamma_f: { value: 1.4, unit: 'adimensional' }, Vk: { value: 30, unit: 'kN' } }).value).toBeCloseTo(42);
        });

        it('should calculate design shear stress (tau_wd)', () => {
            // tau_wd = 42 / (12 * 36) = 0.0972 kN/cm²
            expect(shearSteel.calculate_tau_wd({ Vd: { value: 42, unit: 'kN' }, bw: section.inputs.base, d }).value).toBeCloseTo(0.0972, 4);
        });

        it('should calculate concrete shear contribution (tau_c)', () => {
            // tau_c for C20 = 0.0663 kN/cm²
            expect(shearSteel.calculate_tau_c({ concrete: localConcrete }).value).toBeCloseTo(0.0663, 4);
        });

        it('should use minimum shear reinforcement because Aswc < Asw_min', () => {
            // Aswc = 0.94 cm²/m, Asw_min = 1.08 cm²/m (para C20)
            expect(shearSteel.steel.Aswc.value).toBeCloseTo(0.94, 1);
            expect(shearSteel.steel.Asw_min.value).toBeCloseTo(1.08, 1);
            expect(shearSteel.steel.Asw.value).toBe(shearSteel.steel.Asw_min.value);
        });
    });

    describe('Case 2: Parametric tests', () => {
        const steel = new Steel('CA-50');
        const section = new Rectangular({
            base: { value: 12, unit: 'cm' },
            height: { value: 40, unit: 'cm' }
        });
       

        const testCases = [
            // fck = 2.0 kN/cm² (C20)
            { Vk_val: 30, fck_val: 2.0, expectedAsw: 1.08 },
            { Vk_val: 40, fck_val: 2.0, expectedAsw: 1.94 },
            { Vk_val: 50, fck_val: 2.0, expectedAsw: 2.93 },
            { Vk_val: 60, fck_val: 2.0, expectedAsw: 3.92 },
            { Vk_val: 70, fck_val: 2.0, expectedAsw: 4.92 },
            { Vk_val: 80, fck_val: 2.0, expectedAsw: 5.91 },
            { Vk_val: 90, fck_val: 2.0, expectedAsw: 6.90 },
            { Vk_val: 100, fck_val: 2.0, expectedAsw: 7.89 },

        //     // fck = 3.0 kN/cm² (C30)
            { Vk_val: 40, fck_val: 3.0, expectedAsw: 1.44 },
            { Vk_val: 40, fck_val: 3.0, expectedAsw: 1.44 },
            { Vk_val: 50, fck_val: 3.0, expectedAsw: 2.30 },
            { Vk_val: 60, fck_val: 3.0, expectedAsw: 3.29 },
            { Vk_val: 70, fck_val: 3.0, expectedAsw: 4.29 },
            { Vk_val: 80, fck_val: 3.0, expectedAsw: 5.28 },
            { Vk_val: 90, fck_val: 3.0, expectedAsw: 6.27 },
            { Vk_val: 100, fck_val: 3.0, expectedAsw: 7.26 },

        //     // fck = 4.0 kN/cm² (C40)
            { Vk_val: 30, fck_val: 4.0, expectedAsw: 1.68 },
            { Vk_val: 40, fck_val: 4.0, expectedAsw: 1.68 },
            { Vk_val: 50, fck_val: 4.0, expectedAsw: 1.74 },
            { Vk_val: 60, fck_val: 4.0, expectedAsw: 2.73 },
            { Vk_val: 70, fck_val: 4.0, expectedAsw: 3.72 },
            { Vk_val: 80, fck_val: 4.0, expectedAsw: 4.72 },
            { Vk_val: 90, fck_val: 4.0, expectedAsw: 5.71 },
            { Vk_val: 100, fck_val: 4.0, expectedAsw: 6.70 },
        ];

        test.each(testCases)(
            'should calculate Asw correctly for Vk=$Vk_val kN, fck=$fck_val kN/cm²',
            ({ Vk_val, fck_val, expectedAsw }) => {
                // Arrange
                const concrete = new Concrete({
                    fck: { value: fck_val, unit: 'kN/cm²' },
                    aggregate: 'granite',
                });
                const Vk: Force = { value: Vk_val, unit: 'kN' };

                // Act
                const shearSteel = new ShearSteel({ Vk, concrete, steel, section, d });

                // Assert
                expect(shearSteel.steel.Asw.value).toBeCloseTo(expectedAsw, 1);
            }
        );
    });

    describe('Case 3: Parametric tests', () => {
        const steel = new Steel('CA-60');
        const section = new Rectangular({
            base: { value: 12, unit: 'cm' },
            height: { value: 40, unit: 'cm' }
        });
       

        const testCases = [
            // fck = 2.0 kN/cm² (C20)
            { Vk_val: 30, fck_val: 2.0, expectedAsw: 1.08 },
            { Vk_val: 40, fck_val: 2.0, expectedAsw: 1.94 },
            { Vk_val: 50, fck_val: 2.0, expectedAsw: 2.93 },
            { Vk_val: 60, fck_val: 2.0, expectedAsw: 3.92 },
            { Vk_val: 70, fck_val: 2.0, expectedAsw: 4.92 },
            { Vk_val: 80, fck_val: 2.0, expectedAsw: 5.91 },
            { Vk_val: 90, fck_val: 2.0, expectedAsw: 6.90 },
            { Vk_val: 100, fck_val: 2.0, expectedAsw: 7.89 },

        //     // fck = 3.0 kN/cm² (C30)
            { Vk_val: 40, fck_val: 3.0, expectedAsw: 1.44 },
            { Vk_val: 40, fck_val: 3.0, expectedAsw: 1.44 },
            { Vk_val: 50, fck_val: 3.0, expectedAsw: 2.30 },
            { Vk_val: 60, fck_val: 3.0, expectedAsw: 3.29 },
            { Vk_val: 70, fck_val: 3.0, expectedAsw: 4.29 },
            { Vk_val: 80, fck_val: 3.0, expectedAsw: 5.28 },
            { Vk_val: 90, fck_val: 3.0, expectedAsw: 6.27 },
            { Vk_val: 100, fck_val: 3.0, expectedAsw: 7.26 },

        //     // fck = 4.0 kN/cm² (C40)
            { Vk_val: 30, fck_val: 4.0, expectedAsw: 1.68 },
            { Vk_val: 40, fck_val: 4.0, expectedAsw: 1.68 },
            { Vk_val: 50, fck_val: 4.0, expectedAsw: 1.74 },
            { Vk_val: 60, fck_val: 4.0, expectedAsw: 2.73 },
            { Vk_val: 70, fck_val: 4.0, expectedAsw: 3.72 },
            { Vk_val: 80, fck_val: 4.0, expectedAsw: 4.72 },
            { Vk_val: 90, fck_val: 4.0, expectedAsw: 5.71 },
            { Vk_val: 100, fck_val: 4.0, expectedAsw: 6.70 },
        ];

        test.each(testCases)(
            'should calculate Asw correctly for Vk=$Vk_val kN, fck=$fck_val kN/cm²',
            ({ Vk_val, fck_val, expectedAsw }) => {
                // Arrange
                const concrete = new Concrete({
                    fck: { value: fck_val, unit: 'kN/cm²' },
                    aggregate: 'granite',
                });
                const Vk: Force = { value: Vk_val, unit: 'kN' };

                // Act
                const shearSteel = new ShearSteel({ Vk, concrete, steel, section, d });

                // Assert
                expect(shearSteel.steel.Asw.value).toBeCloseTo(expectedAsw, 1);
            }
        );
    });


});