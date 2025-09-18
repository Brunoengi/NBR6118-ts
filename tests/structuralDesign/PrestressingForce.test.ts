import PrestressingDesign from "../../src/structuralDesign/PrestressingSteel/PrestressingSteel.js";
import Concrete from "../../src/buildingElements/Concrete.js";
import PrestressingSteel from "../../src/buildingElements/PrestressingSteel.js";
import { Combinations, Qsi1, Qsi2 } from "../../src/combinations/Load.js";

describe('Prestressing Steel Design', () => {

    it('CA - 35, Section rectangular', () => {

        const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 12.7' });

        const geometricProperties = {
            Ac: {
                value: 7200,
                unit: 'cm²'
            },
            W1: {
                value: -144000,
                unit: 'cm³'
            }
        }
        
        const lossFactor = 0.25

        const epmax = {
            value: -48,
            unit: 'cm'
        }

        // Inputs to generate the combination values
        const combinations = new Combinations({
            mg1: { value: 506.25, unit: 'kN * m' },
            mg2: { value: 562.50, unit: 'kN * m' },
            mq: { value: 421.875, unit: 'kN * m' },
            qsi1: new Qsi1(0.60),
            qsi2: new Qsi2(0.40)
        });

        const concrete = new Concrete({
            fck: 35,
            section: {
                type: 'rectangular'
            }
        });

        const prestressingType = 'Limited'


        const prestressingDesign = new PrestressingDesign({
            prestressingSteel,
            geometricProperties,
            lossFactor,
            epmax,
            combinations,
            concrete,
            type: prestressingType,
            ncable: 3
        })

        expect(prestressingDesign.ELSD().value).toBeCloseTo(-1819.852, 1)
        expect(prestressingDesign.ELSF().value).toBeCloseTo(-1230.189, 1)
        expect(prestressingDesign.P_inf_calc.value).toBeCloseTo(-1819.852, 1)
        expect(prestressingDesign.P_initial_calc.value).toBeCloseTo(-1819.852/(1 - lossFactor), 1)
        expect(prestressingDesign.Apestimated.value).toBeCloseTo(17.305, 2)
        expect(prestressingDesign.ncordestimated).toBeCloseTo(17.48, 2)
        expect(prestressingDesign.ncordagecable).toBe(6) // Math.ceil(17.48 / 3) = 6
        expect(prestressingDesign.Ap_proj.value).toBeCloseTo(17.82, 2) // 3 * 6 * 0.99 = 17.82
        expect(prestressingDesign.P_initial_proj.value).toBeCloseTo(-2498.72, 2) // -17.82 * 1402.2 / 10 = -2498.72
        expect(prestressingDesign.P_inf_proj.value).toBeCloseTo(-1874.04, 2) // -2498.72 * (1 - 0.25) = -1874.04
        
    })

    it('CA - 35, Section T', () => {

        const prestressingSteel = new PrestressingSteel({ label: 'CP 210 RB 9.5' });

        const geometricProperties = {
            Ac: {
                value: 3162.5,
                unit: 'cm²'
            },
            W1: {
                value: -65455.50172327481,
                unit: 'cm³'
            }
        }
        
        const lossFactor = 0.25

        const epmax = {
            value: -45.02,
            unit: 'cm'
        }

        // Inputs to generate the combination values
        const combinations = new Combinations({
            mg1: { value: 3162.5 * 25 / 10000, unit: 'kN * m' },
            mg2: { value: 644.238 - (3162.5 * 25 / 10000), unit: 'kN * m' },
            mq: { value: 925.488 - (3162.5 * 25 / 10000) - (644.238 - (3162.5 * 25 / 10000)), unit: 'kN * m' },
            qsi1: new Qsi1(0.60),
            qsi2: new Qsi2(0.40)
        });

        const concrete = new Concrete({
            fck: 35,
            section: {
                type: 'T'
            }
        });

        const prestressingType = 'Limited'

        const prestressingDesign = new PrestressingDesign({
            prestressingSteel,
            geometricProperties,
            lossFactor,
            epmax,
            combinations,
            concrete,
            type: prestressingType,
            ncable: 4
        })

        expect(combinations.quasiPermanent.mqp.value).toBeCloseTo(756.738, 1)
        expect(combinations.frequent.mf.value).toBeCloseTo(812.988,1)
        expect(combinations.rare.mr.value).toBeCloseTo(925.488,1)
        expect(prestressingDesign.ELSD().value).toBeCloseTo(-1151.489, 1)
        expect(prestressingDesign.ELSF().value).toBeCloseTo(-968.511, 1)
        expect(prestressingDesign.P_inf_calc.value).toBeCloseTo(-1151.489, 1)
        expect(prestressingDesign.P_initial_calc.value).toBeCloseTo(-1151.489/(1 - lossFactor), 1)
        expect(prestressingDesign.prestressingSteel.sigma_pi.value).toBeCloseTo(1549.8, 1)
        expect(prestressingDesign.Apestimated.value).toBeCloseTo(9.907, 2)
        expect(prestressingDesign.ncordestimated).toBeCloseTo(18.012, 2)
        expect(prestressingDesign.ncordagecable).toBe(5) // Math.ceil(18.012 / 4) = 5
        expect(prestressingDesign.Ap_proj.value).toBeCloseTo(11.0, 2) // 4 * 5 * 0.55 = 11.0
        expect(prestressingDesign.P_initial_proj.value).toBeCloseTo(-1704.78, 2) // -11.0 * 1549.8 / 10 = -1704.78
        expect(prestressingDesign.P_inf_proj.value).toBeCloseTo(-1278.585, 2) // -1704.78 * (1 - 0.25) = -1278.585
    })
})