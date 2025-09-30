import ELSDEF from "../../../src/structuralDesign/prestressingSteel/limitStates/ELSDEF.js";
import { CreepConcrete } from "../../../src/structuralDesign/concrete/Creep.js";
import { beforeAll, describe, expect, it, jest } from "@jest/globals";

describe('ELSDEF', () => {
    let elsdef: ELSDEF;
 
    // Mock data for the constructor
    const mockCombinations = {
        quasiPermanent: {
            distributedLoad: { value: 0.26906, unit: 'kN/cm' }
        }
    };

    const mockGeometricProps = { 
        Ixg: { value: 3732429.66, unit: 'cm⁴' }
    };

    const mockConcrete = {
        Ecs: { value: 2940.3, unit: 'kN/cm²' } 
    };

    const mockCableGeometry = {
        width: { value: 1500, unit: 'cm' },
        epmax: { value: -45.02, unit: 'cm' }
    };

    const mockP_inf = {
        values: [-1198.875, -1207.883, -1215.155, -1228.894, -1237.178],
        unit: 'kN'
    };

    // Mock CreepConcrete by instantiating it with known values
    const mockCreepConcrete = new CreepConcrete({
        concreteClass: 'C20_C45',
        t0: 60, 
        humidity: 55,
        thickness: 20
    }); // This will have creep.value = 2.5

    beforeAll(() => {
        elsdef = new ELSDEF({
            combinations: mockCombinations as any,
            geometricProps: mockGeometricProps as any,
            concrete: mockConcrete as any,
            cableGeometry: mockCableGeometry as any,
            P_inf: mockP_inf,
            creepConcrete: mockCreepConcrete,
            L: { value: 1500, unit: 'cm' },
            epmax: { value: -45.02, unit: 'cm' }
        });
    });

    it('should be instantiated correctly', () => {
        expect(elsdef).toBeInstanceOf(ELSDEF);
    });

    it('should calculate deflection due to quasi-permanent loads (Wc)', () => {
        const L = 1500; // cm
        const q_kNcm = mockCombinations.quasiPermanent.distributedLoad.value; // 0.01616 kN/cm
        const Ecs = mockConcrete.Ecs.value; // 2940.3 kN/cm²
        const Ic = mockGeometricProps.Ixg.value; // 3732429.66 cm⁴
        // Wc = (5/384) * (q * L^4) / (Ecs * Ic)
        const expected_Wc = (5 / 384) * (q_kNcm * L ** 4) / (Ecs * Ic); // ~1.616 cm
        expect(elsdef.Wc.value).toBeCloseTo(expected_Wc, 2);
        expect(elsdef.Wc.unit).toBe('cm');
    });

    it('should calculate equivalent prestressing load (wp)', () => {
        const P_inf_min = Math.min(...mockP_inf.values); // -1237.178 kN
        const epmax = mockCableGeometry.epmax.value; // -45.02 cm
        const L = mockCableGeometry.width.value; // 1500 cm
        // wp = 8 * P_inf_min * epmax / L^2
        const expected_wp = 8 * P_inf_min * epmax / (L ** 2); // ~0.198 kN/cm
        expect(elsdef.wp.value).toBeCloseTo(expected_wp, 2);
        expect(elsdef.wp.unit).toBe('kN/cm');
    });

    it('should calculate deflection due to prestressing (Wp)', () => {
        const wp = elsdef.wp.value; // ~0.198 kN/cm
        const L = mockCableGeometry.width.value; // 1500 cm
        const Ecs = mockConcrete.Ecs.value; // 2940.3 kN/cm²
        const Ic = mockGeometricProps.Ixg.value; // 3732429.66 cm⁴
        // Wp = (5/384) * wp * L^4 / (Ecs * Ic)
        const expected_Wp = (5 / 384) * wp * (L ** 4) / (Ecs * Ic); // ~1.19 cm
        expect(elsdef.Wp.value).toBeCloseTo(expected_Wp, 2);
        expect(elsdef.Wp.unit).toBe('cm');
    });

    it('should calculate initial deflection (W0)', () => {
        const Wc = elsdef.Wc.value; // ~1.616 cm
        const Wp = elsdef.Wp.value; // ~1.19 cm
        // W0 = Wc - Wp
        const expected_W0 = Wc - Wp; // ~ 0.426 cm
        expect(elsdef.W0.value).toBeCloseTo(expected_W0, 2);
    });

    it('should calculate final deflection including creep (W_inf)', () => {
        const W0 = elsdef.W0.value; // ~ 0.426 cm
        const phi_inf = mockCreepConcrete.value; // 2.5
        // W_inf = (1 + phi_inf) * W0
        const expected_W_inf = (1 + phi_inf!) * W0; // ~ 1.49 cm
        expect(elsdef.W_inf.value).toBeCloseTo(expected_W_inf, 2);
    });

    it('should calculate admissible deflection (W_adm)', () => {
        const L = mockCableGeometry.width.value; // 1500 cm
        const expected_W_adm = L / 250; // 6 cm
        expect(elsdef.W_adm.value).toBe(expected_W_adm);
    });

    it('should verify if final deflection is within the admissible limit', () => {
        // W_inf = 1.49 cm, W_adm = 6 cm. |W_inf| <= W_adm, so it should pass.
        const result = elsdef.verification;
        expect(result.passed).toBe(true);
        expect(result.limit.value).toBe(6);
        expect(result.value.value).toBeCloseTo(1.49, 2);
    });
});
