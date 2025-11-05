import Concrete from '../../../utils/elements/concrete/Concrete.js'
import Steel from '../../../utils/elements/Steel.js'
import AbstractSection from '../../../utils/sections/AbstractSection.js'
import { Adimensional, Moment, Distance } from 'types/index.js'
import { A } from 'types/sectionsType.js'
import Flexural from './RhoMin.js'

/**
* Baseado na NBR 6118/2014
*/
class LongitudinalSteelRectangularSection {

    params: {
        mu: Adimensional,
        xi: Adimensional,
        rhomin: Flexural['rhomin'],
        Md: Moment
    }

    steel: {
        Asmin: A,
        Asc: A,
        Ase: A
    }

    constructor({ concrete, steel, Mk, section, d }: { concrete: Concrete, steel: Steel, Mk: Moment, section: AbstractSection, d: Distance }) {
        const gamma_f = 1.4
        const Md = { ...Mk, value: Mk.value * gamma_f }
        const mu = this.calculate_mu({ Md, section, concrete, d })
        const rhomin = new Flexural({ fck: concrete.fck, steel: steel }).rhomin
        const xi = this.calculate_xi(mu, concrete.lambda)
        const Asmin = this.calculate_Asmin({ section, rhomin })
        const Asc = this.calculate_Asc({ concrete, steel, lambda: concrete.lambda, xi, b: section.inputs.base, d })
        const Ase = this.calculate_Ase({Asc, Asmin})

        this.params = {
            mu,
            xi,
            rhomin,
            Md
        }

        this.steel = {
            Asmin,
            Asc,
            Ase
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
    calculate_Asmin({ section, rhomin }: { section: AbstractSection, rhomin: Flexural['rhomin'] }): A {

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