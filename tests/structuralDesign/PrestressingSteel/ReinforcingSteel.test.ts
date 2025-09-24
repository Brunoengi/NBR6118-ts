import ReinforcingSteel from "../../../src/structuralDesign/PrestressingSteel/ReinforcingSteel.js";
import ELU from "../../../src/structuralDesign/PrestressingSteel/LimitStates/ELU.js";
import Concrete from "../../../src/buildingElements/Concrete.js";
import { CableGeometry } from "../../../src/structuralDesign/PrestressingSteel/CableGeometry.js";
import { ValueUnit } from "../../../src/types/index.js";
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('ReinforcingSteel', () => {

    describe('Based on ELU - Case 1', () => {
        let reinforcingSteel: ReinforcingSteel;
        let elu: ELU;
        const b: ValueUnit = { value: 60, unit: 'cm' };
        const h: ValueUnit = { value: 120, unit: 'cm' };

        beforeAll(() => {
            // --- Setup based on ELU.test.ts Case 1 ---
            const p0_half = [-2156.12, -2174.28, -2190.57, -2206.55, -2223.40, -2241.92];
            const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];
            const mg_half = [0, 182.25, 324, 425.25, 486, 506.25];
            const mg_full = [...mg_half, ...mg_half.slice(0, -1).reverse()];
            const width: ValueUnit = { value: 1500, unit: 'cm' };
            const cableGeo = new CableGeometry({ width, epmax: { value: -48, unit: 'cm' } });
            const x_values_cm = cableGeo.subdivideSpan(width, 10).values;
            const ep_values_cm = x_values_cm.map(x => cableGeo.cableY(x));

            elu = new ELU({
                P0: { values: p0_full, unit: 'kN' },
                ep: { values: ep_values_cm, unit: 'cm' },
                Ac: { value: 7200, unit: 'cm²' },
                W1: { value: -144000, unit: 'cm³' },
                W2: { value: 144000, unit: 'cm³' },
                Mg: { values: mg_full, unit: 'kN*m' },
                concrete: new Concrete({ fck: 35, aggregate: 'granite' })
            });

            reinforcingSteel = new ReinforcingSteel({
                sigma: {
                    sigma1P0: elu.sigma1P0_ELU,
                    sigma2P0: elu.sigma2P0_ELU
                },
                h,
                b
            });
        });

        it('should calculate the neutral line correctly', () => {
            // max_sigma2 = 0.128
            // min_sigma1 = -0.8130
            // x = 120 * 0.128 / (0.128 - (-0.8130)) = 120 * 0.128 / 0.941 = 16.319 cm
            expect(reinforcingSteel.neutralLine.value).toBeCloseTo(16.319, 2);
            expect(reinforcingSteel.neutralLine.unit).toBe('cm');
        });

        it('should calculate the tensile force (Rct) correctly', () => {
            // Rct = neutralLine * max_sigma2 * b / 2 = 16.323 * 0.128 * 60 / 2 = 62.68 kN
            expect(reinforcingSteel.Rct.value).toBeCloseTo(62.644, 2);
            expect(reinforcingSteel.Rct.unit).toBe('kN');
        });

        it('should calculate the required steel area (Asl) correctly', () => {
            // Asl = Rct / 25 = 62.68 / 25 = 2.507 cm²
            expect(reinforcingSteel.Asl.value).toBeCloseTo(2.506, 2);
            expect(reinforcingSteel.Asl.unit).toBe('cm²');
        });
    });

    describe('Based on ELU - Case 2', () => {
        let reinforcingSteel: ReinforcingSteel;
        let elu: ELU;
        const b: ValueUnit = { value: 70, unit: 'cm' };
        const h: ValueUnit = { value: 100, unit: 'cm' };

        beforeAll(() => {
            // --- Setup based on ELU.test.ts Case 2 ---
            const p0_half = [-1455.443, -1466.437, -1475.147, -1483.507, -1492.972, -1504.479];
            const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];
            const mg_half = [0, 80.051, 142.313, 186.785, 213.469, 222.363];
            const mg_full = [...mg_half, ...mg_half.slice(0, -1).reverse()];
            const width: ValueUnit = { value: 1500, unit: 'cm' };
            const cableGeo = new CableGeometry({ width, epmax: { value: -45.02, unit: 'cm' } });
            const x_values_cm = cableGeo.subdivideSpan(width, 10).values;
            const ep_values_cm = x_values_cm.map(x => cableGeo.cableY(x));

            elu = new ELU({
                P0: { values: p0_full, unit: 'kN' },
                ep: { values: ep_values_cm, unit: 'cm' },
                Ac: { value: 3162.50, unit: 'cm²' },
                W1: { value: -65455.50, unit: 'cm³' },
                W2: { value: 86845.93, unit: 'cm³' },
                Mg: { values: mg_full, unit: 'kN*m' },
                concrete: new Concrete({ fck: 35, aggregate: 'granite' })
            });

            reinforcingSteel = new ReinforcingSteel({
                sigma: {
                    sigma1P0: elu.sigma1P0_ELU,
                    sigma2P0: elu.sigma2P0_ELU
                },
                h,
                b
            });
        });

        it('should calculate the neutral line correctly', () => {
            // max_sigma2 = 0.0786
            // min_sigma1 = -1.3218
            // x = 100 * 0.0786 / (0.0786 - (-1.3218)) = 100 * 0.0786 / 1.4004 = 5.61 cm
            expect(reinforcingSteel.neutralLine.value).toBeCloseTo(5.612, 2);
            expect(reinforcingSteel.neutralLine.unit).toBe('cm');
        });

        it('should calculate the tensile force (Rct) correctly', () => {
            // Rct = neutralLine * max_sigma2 * b / 2 = 5.61 * 0.0786 * 70 / 2 = 15.44 kN
            expect(reinforcingSteel.Rct.value).toBeCloseTo(15.438, 1);
            expect(reinforcingSteel.Rct.unit).toBe('kN');
        });

        it('should calculate the required steel area (Asl) correctly', () => {
            // Asl = Rct / 25 = 15.44 / 25 = 0.617 cm²
            expect(reinforcingSteel.Asl.value).toBeCloseTo(0.617, 1);
            expect(reinforcingSteel.Asl.unit).toBe('cm²');
        });
    });
});