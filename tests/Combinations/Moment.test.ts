import { QuasiPermanent, Frequent, Rare, Last, Qsi1, Qsi2, Combinations } from '../../src/combinationLoads/Load.js'
import { Distance } from '../../src/types/index.js';


describe('test combinations loads', () => {
    // To test the moment calculation, we provide distributed loads and a span
    // that result in the original moment values (100, 200, 300).
    // Using L=10m (1000cm), M = g*L²/8 => g = M*8/L²
    const g1 = { value: 100 * 8 / (10**2), unit: 'kN/m' }; // 8 kN/m
    const g2 = { value: 200 * 8 / (10**2), unit: 'kN/m' }; // 16 kN/m
    const q = { value: 300 * 8 / (10**2), unit: 'kN/m' };  // 24 kN/m
    const width: Distance = { value: 1000, unit: 'cm' };

    it('Quasi-Permanent Combination', () => {
        const QP = new QuasiPermanent({
            g1, g2, q, width,
            qsi2: new Qsi2(0.6)   
        })

        // The class calculates mg1=100, mg2=200, mq=300 internally.
        expect(QP.moment.value).toBeCloseTo((100 + 200 + 300 * 0.6) * 100)
        expect(QP.moment.unit).toBe('kN*cm')
    })

    it('Frequent Combination', () => {
        const Freq = new Frequent({
            g1, g2, q, width,
            qsi1: new Qsi1(0.7)
        })

        expect(Freq.moment.value).toBeCloseTo((100 + 200 + 300 * 0.7) * 100)
        expect(Freq.moment.unit).toBe('kN*cm')
    })

    it('Rare Combination', () => {
        const Raree = new Rare({
            g1, g2, q, width
        })

        expect(Raree.moment.value).toBeCloseTo((100 + 200 + 300) * 100)
        expect(Raree.moment.unit).toBe('kN*cm')
    })

    it('Last Combination (ELU)', () => {
        const lastCombination = new Last({
            g1, g2, q, width,
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4
        });

        const expectedValue = (100 * 1.4 + 200 * 1.4 + 300 * 1.4) * 100;
        expect(lastCombination.moment.value).toBeCloseTo(expectedValue);
        expect(lastCombination.moment.unit).toBe('kN*cm');
    });

})

describe('Combinations.calculateMoments', () => {
    // The Combinations instance is needed to call the method,
    // but its constructor values do not affect the result of calculateMoments.
    const dummyCombinations = new Combinations({
        g1: { value: 0, unit: 'kN/m' },
        g2: { value: 0, unit: 'kN/m' },
        q: { value: 0, unit: 'kN/m' },
        width: { value: 1000, unit: 'cm' },
        qsi1: new Qsi1(0.5),
        qsi2: new Qsi2(0.5),
        gamma_g1: 1.4,
        gamma_g2: 1.4,
        gamma_q: 1.4
    });

    it('should calculate bending moments for a simply supported beam', () => {
        const maxMoment = { value: 1000, unit: 'kN*cm' }; // 10 kN*m
        const beamWidth = { value: 1000, unit: 'cm' }; // 10m
        const xPoints = { values: [0, 250, 500, 750, 1000], unit: 'cm' };

        const result = dummyCombinations.calculateMoments({
            moment: maxMoment,
            width: beamWidth,
            x: xPoints
        });

        // Expected values for M(x) = (M_max * 4 / L²) * (L*x - x²)
        // M_max = 1000, L = 10
        // M(0) = 0
        // M(2.5) = 750
        // M(5) = 1000
        // M(7.5) = 750
        // M(10) = 0
        const expectedMoments = [0, 750, 1000, 750, 0];

        expect(result.values.length).toBe(expectedMoments.length);
        result.values.forEach((value, index) => {
            expect(value).toBeCloseTo(expectedMoments[index]);
        });

        // Verifica se a unidade do momento foi calculada corretamente
        expect(result.unit).toBe('kN*cm');
    });
});