import { QuasiPermanent, Frequent, Rare } from '../../src/Combinations/Load.js'


describe('test combinations loads', () => {
    it('Quasi-Permanent Combination', () => {
        const QP = new QuasiPermanent({
            mg1: {value: 100, unit: 'kN * m'},
            mg2: {value: 200, unit: 'kN * m'},
            mq: {value: 300, unit: 'kN * m'},
            qsi2: {value: 0.6}
            
    })

    expect(QP.mqp.value).toBe(100 + 200 + 300 * 0.6)
    expect(QP.mqp.unit).toBe('kN * m')
})

    it('Frequent Combination', () => {
        const Freq = new Frequent({
            mg1: {value: 100, unit: 'kN * m'},
            mg2: {value: 200, unit: 'kN * m'},
            mq: {value: 300, unit: 'kN * m'},
            qsi1: {value: 0.7}
            
    })

    expect(Freq.mf.value).toBe(100 + 200 + 300 * 0.7)
    expect(Freq.mf.unit).toBe('kN * m')
})

    it('Rare Combination', () => {
        const Raree = new Rare({
            mg1: {value: 100, unit: 'kN * m'},
            mg2: {value: 200, unit: 'kN * m'},
            mq: {value: 300, unit: 'kN * m'}
    })

    expect(Raree.mr.value).toBe(100 + 200 + 300)
    expect(Raree.mr.unit).toBe('kN * m')
})

})