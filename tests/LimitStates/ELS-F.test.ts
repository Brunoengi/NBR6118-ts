import ELSF from "../../src/LimitStates/ELS-F.js";
import Concrete from "../../src/Concrete.js";

describe('ELS-F cases', () => {
    
    it('CA - 35, Section rectangular', () => {
        // SANTOS, Bruno. Software para dimensionamento de vigas de concreto protendido pós-tracionada. 2023. Trabalho de Conclusão de Curso (Graduação em Engenharia Civil) – Universidade Federal do Rio Grande, Escola de Engenharia, Rio Grande, 2023.
        const fctk_inf = new Concrete({fck: 35}).fctk_inf
        const section = 'rectangular'

        const ELSFCase = new ELSF({fctk_inf, ConcreteSectionType: section})
        expect(ELSFCase.fctf.value).toBeCloseTo(3.37, 2)
    })
        
    it('CA - 35, Section T', () => {

        // SANTOS, Bruno. Software para dimensionamento de vigas de concreto protendido pós-tracionada. 2023. Trabalho de Conclusão de Curso (Graduação em Engenharia Civil) – Universidade Federal do Rio Grande, Escola de Engenharia, Rio Grande, 2023. (Embora no TCC está escrito viga I no exemplo 2, foi sugerido utilizar fctk como se fosse viga T)

        const MELSFCase = 812.988 * 1000 //N * m
        const W1 = -65455.50 / (10 ** 6) //m³
        const epmax = -(57.02 - 12) * (10 ** -2) //m
        const Ac = 3162.50 / (10 ** 4) //m²

        const denominator = (1/Ac) + (epmax/W1)
        const fct = (denominator * -968511 - (MELSFCase / W1)) / 1000000 

        const fctk_inf = new Concrete({fck: 35}).fctk_inf
        const section = 'T'

        const ELSFCase = new ELSF({fctk_inf, ConcreteSectionType: section})
        expect(ELSFCase.fctf.value).toBeCloseTo(fct, 2)
    })

        

});