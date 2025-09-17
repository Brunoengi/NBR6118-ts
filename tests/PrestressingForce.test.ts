import PrestressingDesign from "../src/structuralDesign/PrestressingSteel.js";
import Concrete from "../src/buildingElements/Concrete.js";
import PrestressingSteel from "../src/buildingElements/PrestressingSteel.js";
import { Combinations, Qsi1, Qsi2 } from "../src/combinations/Load.js";

describe('Prestressing Steel Design', () => {

    it('CA - 35, Section rectangular', () => {

        const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 9.5' });

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
            type: prestressingType
        })

        expect(prestressingDesign.ELSD().value).toBeCloseTo(-1819.852, 1)
        expect(prestressingDesign.ELSF().value).toBeCloseTo(-1230.189, 1)
        expect(prestressingDesign.P_inf_calc.value).toBeCloseTo(-1819.852, 1)
        expect(prestressingDesign.P_initial_calc.value).toBeCloseTo(-1819.852/(1 - lossFactor), 1)
        
    })

    it('CA - 35, Section T', () => {

        const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 9.5' });

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
            type: prestressingType
        })

        expect(combinations.quasiPermanent.mqp.value).toBeCloseTo(756.738, 1)
        expect(combinations.frequent.mf.value).toBeCloseTo(812.988,1)
        expect(combinations.rare.mr.value).toBeCloseTo(925.488,1)

        expect(prestressingDesign.ELSD().value).toBeCloseTo(-1151.489, 1)
        expect(prestressingDesign.ELSF().value).toBeCloseTo(-968.511, 1)
        expect(prestressingDesign.P_inf_calc.value).toBeCloseTo(-1151.489, 1)
        expect(prestressingDesign.P_initial_calc.value).toBeCloseTo(-1151.489/(1 - lossFactor), 1)
    })
})