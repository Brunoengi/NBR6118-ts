import Concrete from "../../../structuralElements/Concrete.js";
import { ValuesUnit, ValueUnit, VerificationResult } from "types/index.js";

/**
 * Common properties for all ELS checks.
 */
export interface IELS {
    Ac: ValueUnit;
    concrete: Concrete;
    ep: ValuesUnit;
    W1: ValueUnit;
    W2: ValueUnit;
    P_inf: ValuesUnit;
    moment: ValuesUnit;
}

/**
 * Abstract base class for Serviceability Limit State (ELS) calculations.
 */
export abstract class AbstractELS {
    public readonly Ac: ValueUnit;
    public readonly ep: ValuesUnit;
    public readonly W1: ValueUnit;
    public readonly W2: ValueUnit;
    public readonly P_inf: ValuesUnit;
    public readonly concrete: Concrete;
    public readonly moment: ValuesUnit;

    public readonly sigma1: ValuesUnit;
    public readonly sigma2: ValuesUnit;

    constructor(inputs: IELS) {
        this.Ac = inputs.Ac;
        this.ep = inputs.ep;
        this.W1 = inputs.W1;
        this.W2 = inputs.W2;
        this.P_inf = inputs.P_inf;
        this.concrete = inputs.concrete;
        this.moment = inputs.moment;

        this.sigma1 = this.calculateSigma1();
        this.sigma2 = this.calculateSigma2();
    }

    private calculateSigma1(): ValuesUnit {
        return {
            values: this.moment.values.map((moment_i, i) => {
                const p_part = this.P_inf.values[i] * ((1 / this.Ac.value) + (this.ep.values[i] / this.W1.value));
                const m_part = -moment_i / this.W1.value;
                return p_part + m_part;
            }),
            unit: 'kN/cm²'
        };
    }

    private calculateSigma2(): ValuesUnit {
        return {
            values: this.moment.values.map((moment_i, i) => {
                const p_part = this.P_inf.values[i] * ((1 / this.Ac.value) + (this.ep.values[i] / this.W2.value));
                const m_part = -moment_i / this.W2.value;
                return p_part + m_part;
            }),
            unit: 'kN/cm²'
        };
    }

    protected verification_sigma({ sigma, limit, operator }: {
        sigma: ValuesUnit,
        limit: ValueUnit,
        operator: (value: number, limit: number) => boolean
    }): VerificationResult {
        const passed = sigma.values.every(value => operator(value, limit.value));

        return {
            passed,
            limit,
            values: sigma
        };
    }
}
