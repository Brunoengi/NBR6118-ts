import Concrete from '../../../utils/elements/concrete/Concrete.js'
import Steel from '../../../utils/elements/Steel.js'
import AbstractSection from '../../../utils/sections/AbstractSection.js'
import { Adimensional, Moment, Distance, Deformation, Stress } from 'types/index.js'
import { A } from 'types/sectionsType.js'
import { FlexuralRhoMin } from './RhoMin.js'
import ReducedLimitingMoment from './MuLimit.js'
import RelativeNeutralLineLimit from './XiLimit.js'

/**
* Baseado na NBR 6118/2014
*/
class LongitudinalSteelRectangularSection {

    params: {
        mu: Adimensional,
        rhomin: FlexuralRhoMin['rho_min'],
        Md: Moment,
        mu_limit: Adimensional,
        xi?: Adimensional
    }

    steel: {
        Asmin: A,
        Asc: A,
        Ase: A,
        Aslc: A
    }

    constructor({ concrete, steel, Mk, section, d }: { concrete: Concrete, steel: Steel, Mk: Moment, section: AbstractSection, d: Distance }) {
        const gamma_f = 1.4
        const Md = { ...Mk, value: Mk.value * gamma_f }

        const mu = this.calculate_mu({ Md, section, concrete, d })
        const mu_limit = new ReducedLimitingMoment({concrete}).mu_limit
        const rhomin = new FlexuralRhoMin({ fck: concrete.fck, steel: steel }).rho_min
        const dl = this.calculate_dl({h: section.inputs.height, d})
        const Asmin = this.calculate_Asmin({ section, rhomin })


        let Asc:A, Ase:A, Aslc: A, xi: Adimensional

        if(mu.value <= mu_limit.value) {
            /*Armadura Simples */
            xi = this.calculate_xi(mu, concrete.lambda)
            Asc = this.calculate_Asc({ concrete, steel, lambda: concrete.lambda, xi, b: section.inputs.base, d })
            Ase = this.calculate_Ase({Asc, Asmin})
            Aslc = {
                value: 0,
                unit: 'cm²'
            }

        
        } else if (mu.value > mu_limit.value) {
            /*Armadura Dupla */
            const xi_limit = new RelativeNeutralLineLimit({fck: concrete.fck}).xi_limit
            const delta = this.calculate_delta({dl, d})
            const epsilon_ls = this.calculate_epsilon_ls({eu: concrete.eu, delta, xi_limit, section})
            const sigma_lsd = this.calculate_sigma_lsd({steel, epsilon_ls})
            Asc = this.calculate_Asc_double_steel({concrete, section, delta, steel, mu, mu_limit, xi_limit, d})
            Ase = this.calculate_Ase({Asc, Asmin})
            Aslc = this.calculate_Aslc_double_steel({mu, mu_limit, section, concrete, delta, sigma_lsd, d})
        }

        this.params = {
            mu,
            mu_limit,
            rhomin,
            Md,
            xi,

        }

        this.steel = {
            Asmin,
            Asc,
            Ase,
            Aslc
        }
    }

    calculate_Asc_double_steel({concrete, section, delta, steel, mu, mu_limit, xi_limit, d}: {concrete: Concrete, section: AbstractSection, delta: Adimensional, steel: Steel, mu: Adimensional, mu_limit: Adimensional, xi_limit: Adimensional, d: Distance}) : A{
        return {
            value: (concrete.lambda.value * xi_limit.value + ((mu.value - mu_limit.value)/(1 - delta.value))) * (section.inputs.base.value * d.value * concrete.sigmacd.value / steel.fyd.value),
            unit: 'cm²'
        }
    }

    calculate_Aslc_double_steel({mu, mu_limit, section, concrete, delta, sigma_lsd, d}: {mu: Adimensional, mu_limit: Adimensional, section: AbstractSection, concrete: Concrete, delta: Adimensional, sigma_lsd: Stress, d: Distance}) : A{
        return {
            value: (mu.value - mu_limit.value) * section.inputs.base.value * d.value * concrete.sigmacd.value / ((1 - delta.value) * sigma_lsd.value),
            unit: 'cm²'
        }
    }

    calculate_dl({h, d}: {h:Distance, d: Distance}): Distance {
        return {
            value: h.value - d.value,
            unit: 'cm'
        }
    }

    calculate_delta( {dl, d}: {dl: Distance, d: Distance} ): Adimensional {
        return {
            value: dl.value / d.value,
            unit: 'adimensional'
        }
    }
    /**
     * Calcula a deformação na armadura de compressão
     * @returns {Deformation}
     */
    calculate_epsilon_ls({eu, delta, xi_limit}: {eu: Deformation, delta: Adimensional, section: AbstractSection, xi_limit: Adimensional}): Deformation {
        
        return {
            value: eu.value * ((xi_limit.value - delta.value) / xi_limit.value),
            unit: '‰'
        }
    }

    /**
     * Calcula a tensão no aço disposto na seção superior da viga, limitado a fyd
     * @returns {Stress}
    */
    calculate_sigma_lsd({steel, epsilon_ls}: {steel: Steel, epsilon_ls: Deformation}): Stress {
        return {
            
            value: steel.E.value * epsilon_ls.value/1000 >= steel.fyd.value ? steel.fyd.value : steel.E.value * epsilon_ls.value,
            unit: 'kN/cm²' 
        }
    }

    /**
     * Calcula o momento fletor reduzido (μ). O momento fletor reduzido é um coeficiente adimensional usado para o dimensionamento à flexão de seções de concreto armado. Ele relaciona o momento fletor de cálculo com a capacidade da seção.
     * @returns {adimensional} O valor do momento fletor reduzido (μ) com unidade adimensional.
     */
    calculate_mu({ Md, section, concrete, d }: { Md: Moment, section: AbstractSection, concrete: Concrete, d: Distance }): Adimensional {
        const b = section.inputs.base

        return {
            value: Md.value / (b.value * d.value ** 2 * concrete.sigmacd.value),
            unit: 'adimensional'
        }
    }

    /**
     * Calcula a área mínima de aço no concreto baseado na taxa mínima de armadura, segundo a NBR 6118/2024
     * @returns {A} A área de armadura em cm².
     */
    calculate_Asmin({ section, rhomin }: { section: AbstractSection, rhomin: FlexuralRhoMin['rho_min'] }): A {

        return {
            value: rhomin.value * section.props.A.value,
            unit: 'cm²'
        }
    }

    /**
     * Cálculo da posição relativa da linha netura definida como x/d
     * @returns {Adimensional}
     */
    calculate_xi(mu: Adimensional, lambda: Adimensional): Adimensional {
        return {
            value: (1 - Math.sqrt(1 - 2 * mu.value)) / lambda.value,
            unit: 'adimensional'
        }
    }

    /**
     * Armadura de cálculo da seção inferior quando a armadura é dimensionada como armadura simples para momentos positos.
     * @returns {A}  A área de armadura em cm².
     */
    calculate_Asc({ concrete, steel, lambda, xi, b, d }: { concrete: Concrete, steel: Steel, lambda: Adimensional, xi: Adimensional, b: Distance, d: Distance }): A {
        return {
            value: lambda.value * xi.value * b.value * d.value * concrete.sigmacd.value / steel.fyd.value,
            unit: 'cm²'
        }
    }

    /**
     * Determinação da armadura efetiva, utiliza-se o valor máximo entre a armadura calculada e a armadura mínima
     * @returns {A}  A área de armadura em cm².
     */
    calculate_Ase({Asc, Asmin}: {Asc: A, Asmin: A}): A {
        return {
            value: Math.max(Asc.value, Asmin.value),
            unit: 'cm²'
        }
    }
}

export default LongitudinalSteelRectangularSection