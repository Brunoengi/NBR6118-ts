import { describe, it, expect, beforeAll } from '@jest/globals';
import ReinforcingSteel from "../../../src/structuralDesign/prestressingSteel/ReinforcingSteelLower.js";
import Concrete from "../../../src/structuralElements/Concrete.js";
import PrestressingSteel from "../../../src/structuralElements/PrestressingSteel.js";
import PrestressingDesign from "../../../src/structuralDesign/prestressingSteel/PrestressingSteelEstimated.js";
import { Combinations, Qsi1, Qsi2 } from "../../../src/combinationLoads/Load.js";
import { CableGeometry } from "../../../src/structuralDesign/prestressingSteel/CableGeometry.js";
import Rectangular from "../../../src/sections/Rectangular.js";
import { Distance, ValueUnit, ValuesUnit } from '../../../src/types/index.js';

describe('ReinforcingSteel (Lower)', () => {
    let reinforcingSteel: ReinforcingSteel;
    let h: Distance;
    let dl: Distance;
    let dpl: Distance;

    beforeAll(() => {
        // --- 1. Basic Inputs ---
        const fck: ValueUnit = { value: 3.5, unit: 'kN/cm²' };
        const base: Distance = { value: 60, unit: 'cm' };
        h = { value: 120, unit: 'cm' };
        dl = { value: 5, unit: 'cm' };
        dpl = { value: 12, unit: 'cm' };

        // --- 2. Instantiate dependencies ---
        const concrete = new Concrete({
            fck,
            section: { type: 'rectangular' }
        });

        const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 12.7' });
        const section = new Rectangular({ base, height: h });

        const combinations = new Combinations({
            mg1: { value: 506.25, unit: 'kN*m' },
            mg2: { value: 562.50, unit: 'kN*m' },
            mq: { value: 421.875, unit: 'kN*m' },
            qsi1: new Qsi1(0.60),
            qsi2: new Qsi2(0.40),
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4
        });

        const cableGeometry = new CableGeometry({
            width: { value: 1500, unit: 'cm' },
            epmax: { value: -48, unit: 'cm' },
            numPoints: 11
        });

        const prestressingDesign = new PrestressingDesign({
            prestressingSteel,
            geometricProperties: {
                Ac: section.props.A,
                W1: section.props.W1
            },
            lossFactor: 0.25,
            epmax: cableGeometry.epmax,
            combinations,
            concrete,
            type: 'Limited',
            ncable: 3
        });

        // --- 3. Instantiate the class to be tested ---
        reinforcingSteel = new ReinforcingSteel({
            cableGeometry,
            combinations,
            section,
            concrete,
            prestressingSteel,
            prestressingDesign,
            dl,
            h,
            dpl,
        });
    });

    it('should calculate ds1 correctly', () => {
        // ds1 = h - dl = 120 - 5 = 115 cm
        const ds1 = reinforcingSteel.calculate_ds1({ h, dl });
        expect(ds1.value).toBe(115);
        expect(ds1.unit).toBe('cm');
    });

    it('should calculate dp correctly', () => {
        // dp = h - dpl = 120 - 12 = 108 cm
        const dp = reinforcingSteel.calculate_dp({ h, dpl });
        expect(dp.value).toBe(108);
        expect(dp.unit).toBe('cm');
    });

    it('should calculate c (moment term) correctly', () => {
        // fpyd = (0.9 * 1900) / 1.15 = 1486.95 MPa = 148.69565 kN/cm²
        // Ap_proj = 17.82 cm² (from PrestressingSteelEstimated.test.ts)
        // ds1 = 115 cm, dp = 108 cm
        // Md_max = 1.4 * (506.25 + 562.50 + 421.875) = 2086.875 kN*m = 208687.5 kN*cm
        // c = -fpyd * Ap * (ds1 - dp) - Md = -148.69565 * 17.82 * (115 - 108) - 208687.5
        // c = -18554.91 - 208687.5 = -227242.41
        const c = reinforcingSteel.calculate_c();
        expect(c.value).toBeCloseTo(-227242.41, -2);
        expect(c.unit).toBe('kN*cm');
    });

    it('should calculate the neutral line (LN) using the solver', () => {
        const ln = reinforcingSteel.calculate_LN();
        // The exact value depends on the complex interaction of the section properties.
        // A plausible value for this setup would be around 20-40 cm.
        // This test mainly ensures the solver runs and produces a sensible number.
        expect(ln.value).toBeGreaterThan(0);
        expect(ln.value).toBeLessThan(h.value);
        expect(ln.unit).toBe('cm');
        // For a more precise test, a known result from a benchmark would be needed.
        expect(ln.value).toBeCloseTo(20.89, 2);
    });
});
