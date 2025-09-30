import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import ShearSteel from "../../../src/structuralDesign/PrestressingSteel/ShearSteel.js";
import CompressionStruts from "../../../src/structuralDesign/PrestressingSteel/CompressionStruts.js";
import PrestressingSteelForce from "../../../src/structuralDesign/PrestressingSteel/PrestressingSteelForce.js";
import { CableGeometry } from "../../../src/structuralDesign/prestressingSteel/CableGeometry.js";
import { Combinations, Qsi1, Qsi2 } from "../../../src/combinationLoads/Load.js";
import Concrete from "../../../src/structuralElements/Concrete.js";
import Steel from "../../../src/structuralElements/Steel.js";
import { ValueUnit, ValuesUnit, Distance } from "../../../src/types/index.js";

describe('ShearSteel', () => {
    let shearSteel: ShearSteel;
    let compressionStruts: CompressionStruts;
    let cableGeometry: CableGeometry;
    let prestressSteelForce: PrestressingSteelForce;
    let combinations: Combinations;
    let concrete: Concrete;
    let steel: Steel;
    let Md: ValuesUnit;

    // --- Input Data based on other tests ---
    const width: Distance = { value: 1500, unit: 'cm' }; // 15m
    const h: ValueUnit = { value: 120, unit: 'cm' };
    const bw: ValueUnit = { value: 60, unit: 'cm' };
    const dl: ValueUnit = { value: 5, unit: 'cm' };
    const epmax: ValueUnit = { value: -48, unit: 'cm' };
    const Ac: ValueUnit = { value: 7200, unit: 'cm²' };
    const W1: ValueUnit = { value: -144000, unit: 'cm³' };
    const numPoints = 11;

    beforeAll(() => {
        // 1. Setup dependencies from bottom up
        cableGeometry = new CableGeometry({ width, epmax, numPoints });
        concrete = new Concrete({ fck: { value: 3.5, unit: 'kN/cm²' }, aggregate: 'granite', section: { type: 'rectangular' } });
        steel = new Steel('CA 50');

        combinations = new Combinations({
            g1: { value: 18, unit: 'kN/m' },
            g2: { value: 20, unit: 'kN/m' },
            q: { value: 15, unit: 'kN/m' },
            width: width,
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4,
            qsi1: new Qsi1(0.6),
            qsi2: new Qsi2(0.4)
        });

        const p_inf_half = [-1874.373, -1890.018, -1904.15, -1917.54, -1931.068, -1945.573];
        const p_inf_values = [...p_inf_half, ...p_inf_half.slice(0, -1).reverse()];
        const P_inf: ValuesUnit = { values: p_inf_values, unit: 'kN' };
        prestressSteelForce = new PrestressingSteelForce({ P_inf, cableGeometry });

        // 2. Setup CompressionStruts (Stirrups)
        compressionStruts = new CompressionStruts({
            combinations,
            cableGeometry,
            prestressSteelForce,
            sum_phi_b: { value: 4, unit: 'cm' },
            bw,
            concrete,
            h,
            dl
        });

        // 3. Calculate Design Moment (Md) for ShearSteel
        const L_m = width.value / 100;
        const Md_max = combinations.gamma.gamma_g1 * (18 * L_m ** 2 / 8) +
            combinations.gamma.gamma_g2 * (20 * L_m ** 2 / 8) +
            combinations.gamma.gamma_q * (15 * L_m ** 2 / 8);

        const md_values = cableGeometry.x.values.map((x_cm: number) => {
            const x_m = x_cm / 100;
            return (4 * Md_max / (L_m ** 2)) * (L_m * x_m - x_m ** 2);
        });
        Md = { values: md_values, unit: 'kN*m' };

        // 4. Instantiate ShearSteel
        shearSteel = new ShearSteel({
            prestressingSteelForce: prestressSteelForce,
            concrete,
            cableGeometry,
            combinations,
            compressionStruts,
            Ac,
            W1,
            Md,
            steel,
            bw
        });
    });

    it('should be instantiated correctly', () => {
        expect(shearSteel).toBeInstanceOf(ShearSteel);
    });

    it('should calculate M0 correctly', () => {
        // NP1 = P_inf[0] * cos(angle[0]) = -1874.373 * cos(atan(0.128)) = -1859.15 kN
        // y_x1 = 0
        expect(shearSteel.M0.value).toBeCloseTo(33465.7,1); //kN*cm 
        expect(shearSteel.M0.unit).toBe('kN*cm');
    });

    it('should calculate psi3 correctly', () => {
        // M0 = 33465.67 //kN*cm 
        // Md_max = 2086.875 kN*m = 208687.5 kN*cm
        // psi3 = 0.09 * (1 + 33465.7 / 208687.5) = 0.104
        const psi3 = shearSteel.calculate_psi3();
        expect(psi3).toBeCloseTo(0.104,1);
    });

    it('should calculate tau_c correctly', () => {
        // psi3 = 0.09
        // fck = 35
        // tau_c = 0.104 * (35^(2/3)) / 10 = 0.104 * 10.73 / 10 = 0.1117
        const tau_c = shearSteel.calculate_tau_c();
        expect(tau_c.value).toBeCloseTo(0.1117,2);
        expect(tau_c.unit).toBe('kN/cm²');
    });

    it('should calculate tau_d correctly', () => {
        // tau_wd_max (from CompressionStruts) ≈ 0.0513 kN/cm²
        // tau_c ≈ 0.09657 kN/cm²
        // tau_wd - tau_c is negative, so tau_d should be 0
        const tau_d = shearSteel.calculate_tau_d();
        expect(tau_d.value).toBe(0);
        expect(tau_d.unit).toBe('kN/cm²');
    });

    it('should calculate rho_w (minimum reinforcement ratio) correctly', () => {
        // tau_d = 0, so the first part of Math.max is 0
        // fctm C35 = (0.3 * 35^(2/3)) = 3.21 MPa
        // fyd for CA50 = 50 / 1.15 = 43.478 kN/cm²
        // rho_w_min = 0.2 * (fctm / 10) / fyd = 0.2 * (3.21 / 10) / 43.478 = 0.00147658
        const rho_w = shearSteel.calculate_rho_w();
        expect(rho_w.value).toBeCloseTo(0.00147658);
        expect(rho_w.unit).toBe('adimensional');
    });

    it('should calculate Asw (shear reinforcement area) correctly', () => {
        // Asw = rho_w * bw = 0.00147658 * 60 = 0.0886 cm²/cm = 8.86 cm²/m
        const Asw = shearSteel.calculate_Asw();
        expect(Asw.value).toBeCloseTo(8.86, 1);
        expect(Asw.unit).toBe('cm²/m');
    });
});
