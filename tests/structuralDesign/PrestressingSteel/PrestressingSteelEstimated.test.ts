import { PrestressingDesign, Concrete, PrestressingSteel, Combinations, Qsi1, Qsi2 } from "../../../src/index.js";

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
            g1: { value: 0.18, unit: 'kN/cm' },
            g2: { value: 0.20, unit: 'kN/cm' },
            q: { value: 0.15, unit: 'kN/cm' },
            width: { value: 1500, unit: 'cm' },
            qsi1: new Qsi1(0.60),
            qsi2: new Qsi2(0.40),
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4
        });

        const concrete = new Concrete({
            fck: {
                value: 3.5, // Changed from 35 to 3.5 to represent 35 MPa in kN/cm²
                unit: 'kN/cm²'
            },
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
        expect(concrete.fctf.value).toBeCloseTo(0.337, 2); 
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
            // The original moments were: Mg1=79.0625, Mg2=565.1755, Mq=281.25
            // To get these moments from a 15m span, the distributed loads must be:
            // g = M * 8 / L^2
            g1: { value: 7906.25 * 8 / (1500**2), unit: 'kN/cm' },   // 0.028111...
            g2: { value: 56517.55 * 8 / (1500**2), unit: 'kN/cm' },  // 0.20096...
            q: { value: 28125 * 8 / (1500**2), unit: 'kN/cm' },     // 0.10
            width: { value: 1500, unit: 'cm' },
            qsi1: new Qsi1(0.60),
            qsi2: new Qsi2(0.40),
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4
        });

        const concrete = new Concrete({
            fck:{
                value: 3.5, // Changed from 35 to 3.5 to represent 35 MPa in kN/cm²
                unit: 'kN/cm²'
            },
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

        expect(combinations.quasiPermanent.moment.value).toBeCloseTo(75673.8, 0)
        expect(combinations.frequent.moment.value).toBeCloseTo(81298.8,0)
        expect(combinations.rare.moment.value).toBeCloseTo(92548.8,0)
        expect(prestressingDesign.ELSD().value).toBeCloseTo(-1151.489, 1)
        expect(prestressingDesign.ELSF().value).toBeCloseTo(-968.511, 1)
        expect(prestressingDesign.P_inf_calc.value).toBeCloseTo(-1151.489, 1)
        expect(prestressingDesign.P_initial_calc.value).toBeCloseTo(-1151.489/(1 - lossFactor), 1)
        expect(prestressingDesign.prestressingSteel.sigma_pi.value).toBeCloseTo(1549.8, 1)
        expect(prestressingDesign.Apestimated.value).toBeCloseTo(9.907, 2)
        expect(prestressingDesign.ncordestimated).toBeCloseTo(18.012, 2)
        expect(concrete.fctf.value).toBeCloseTo(0.2696, 2); 
        expect(prestressingDesign.ncordagecable).toBe(5) // Math.ceil(18.012 / 4) = 5
        expect(prestressingDesign.Ap_proj.value).toBeCloseTo(11.0, 2) // 4 * 5 * 0.55 = 11.0
        expect(prestressingDesign.P_initial_proj.value).toBeCloseTo(-1704.78, 2) // -11.0 * 1549.8 / 10 = -1704.78
        expect(prestressingDesign.P_inf_proj.value).toBeCloseTo(-1278.585, 2) // -1704.78 * (1 - 0.25) = -1278.585
    })
})