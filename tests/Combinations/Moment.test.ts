import { QuasiPermanent, Frequent, Rare, Last, Qsi1, Qsi2, Combinations } from '../../src/combinations/Load.js'


describe('test combinations loads', () => {
    it('Quasi-Permanent Combination', () => {
        const QP = new QuasiPermanent({
            mg1: { value: 100, unit: 'kN * m' },
            mg2: { value: 200, unit: 'kN * m' },
            mq: { value: 300, unit: 'kN * m' },
            qsi2: new Qsi2(0.6)
            
    })

    expect(QP.moment.value).toBe(100 + 200 + 300 * 0.6)
    expect(QP.moment.unit).toBe('kN * m')
})

    it('Frequent Combination', () => {
        const Freq = new Frequent({
            mg1: { value: 100, unit: 'kN * m' },
            mg2: { value: 200, unit: 'kN * m' },
            mq: { value: 300, unit: 'kN * m' },
            qsi1: new Qsi1(0.7)
            
    })

    expect(Freq.moment.value).toBe(100 + 200 + 300 * 0.7)
    expect(Freq.moment.unit).toBe('kN * m')
})

    it('Rare Combination', () => {
        const Raree = new Rare({
            mg1: {value: 100, unit: 'kN * m'},
            mg2: {value: 200, unit: 'kN * m'},
            mq: {value: 300, unit: 'kN * m'}
    })

    expect(Raree.moment.value).toBe(100 + 200 + 300)
    expect(Raree.moment.unit).toBe('kN * m')
})

    it('Last Combination (ELU)', () => {
        const lastCombination = new Last({
            mg1: { value: 100, unit: 'kN*m' },
            mg2: { value: 200, unit: 'kN*m' },
            mq: { value: 300, unit: 'kN*m' },
            gamma_g1: 1.4,
            gamma_g2: 1.4,
            gamma_q: 1.4
        });

        const expectedValue = 100 * 1.4 + 200 * 1.4 + 300 * 1.4;
        expect(lastCombination.moment.value).toBe(expectedValue);
        expect(lastCombination.moment.unit).toBe('kN*m');
    });

})

describe('Combinations.calculateMoments', () => {
    // A instância de Combinations é necessária para chamar o método,
    // mas seus valores de construtor não afetam o resultado de calculateMoments.
    const dummyCombinations = new Combinations({
        mg1: { value: 0, unit: 'kN*m' },
        mg2: { value: 0, unit: 'kN*m' },
        mq: { value: 0, unit: 'kN*m' },
        qsi1: new Qsi1(0.5),
        qsi2: new Qsi2(0.5)
    });

    it('should calculate bending moments for a simply supported beam', () => {
        const distributedLoad = { value: 10, unit: 'kN/m' };
        const beamWidth = { value: 10, unit: 'm' };
        const xPoints = { values: [0, 2.5, 5, 7.5, 10], unit: 'm' };

        const result = dummyCombinations.calculateMoments({
            moment: distributedLoad,
            width: beamWidth,
            x: xPoints
        });

        // Valores esperados para M(x) = (q*L*x/2) - (q*x^2/2)
        // q = 10, L = 10
        // M(0) = 0
        // M(2.5) = 93.75
        // M(5) = 125
        // M(7.5) = 93.75
        // M(10) = 0
        const expectedMoments = [0, 93.75, 125, 93.75, 0];

        expect(result.values.length).toBe(expectedMoments.length);
        result.values.forEach((value, index) => {
            expect(value).toBeCloseTo(expectedMoments[index]);
        });

        // Verifica se a unidade do momento foi calculada corretamente
        expect(result.unit).toBe('kN*m');
    });
});