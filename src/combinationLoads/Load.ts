import { ValuesUnit, ValueUnit, Distance } from "../types/index.js"
import { IQsi1, IQsi2, IQuasiPermanent, IFrequent, ILast, ICombinations, IRare } from "../types/combinationsType.js"

class Qsi1 implements IQsi1 {

    readonly value: number;

    constructor(value: number){
        if(value >= 1 || value <= 0){
            throw new Error(
                `Invalid Qsi1 value: ${value}. Must be in the range (0, 1).`
            );
        }
        this.value = value;
    }
}

class Qsi2 implements IQsi2 {

    readonly value: number;

    constructor(value: number){
        if(value >= 1 || value <= 0){
            throw new Error(
                `Invalid qsi2 value: ${value}. Must be in the range (0, 1).`
            );
        }
        this.value = value;
    }
}


class QuasiPermanent {
    readonly moment: ValueUnit;
    readonly mg1: ValueUnit;
    readonly mg2: ValueUnit;
    readonly mq: ValueUnit;
    readonly distributedLoad: ValueUnit;

    constructor({g1, g2, q, qsi2, width}: IQuasiPermanent){
        this.mg1 = { value: (g1.value * width.value**2) / 8, unit: 'kN*cm' };
        this.mg2 = { value: (g2.value * width.value**2) / 8, unit: 'kN*cm' };
        this.mq = { value: (q.value * width.value**2) / 8, unit: 'kN*cm' };

        this.moment = this.calculateMoment({
            mg1: this.mg1,
            mg2: this.mg2,
            mq: this.mq,
            qsi2
        });

        this.distributedLoad = {
            value: g1.value + g2.value + q.value * qsi2.value,
            unit: g1.unit
        };
    }

   private calculateMoment({mg1, mg2, mq, qsi2}: {mg1: ValueUnit, mg2: ValueUnit, mq: ValueUnit, qsi2: Qsi2}): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value * qsi2.value,
            unit: 'kN*cm'
        }
   }
}

class Frequent {
    readonly moment: ValueUnit;

    readonly mg1: ValueUnit;
    readonly mg2: ValueUnit;
    readonly mq: ValueUnit;
    readonly distributedLoad: ValueUnit;

    constructor({g1, g2, q, qsi1, width}: IFrequent){
        this.mg1 = { value: (g1.value * width.value**2) / 8, unit: 'kN*cm' };
        this.mg2 = { value: (g2.value * width.value**2) / 8, unit: 'kN*cm' };
        this.mq = { value: (q.value * width.value**2) / 8, unit: 'kN*cm' };

        this.moment = this.calculateMoment({
            mg1: this.mg1,
            mg2: this.mg2,
            mq: this.mq,
            qsi1
        });

        this.distributedLoad = {
            value: g1.value + g2.value + q.value * qsi1.value,
            unit: g1.unit
        };
    }

   private calculateMoment({mg1, mg2, mq, qsi1}: {mg1: ValueUnit, mg2: ValueUnit, mq: ValueUnit, qsi1: Qsi1}): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value * qsi1.value,
            unit: 'kN*cm'
        }
   }
}

class Rare {
    readonly moment: ValueUnit;

    readonly mg1: ValueUnit;
    readonly mg2: ValueUnit;
    readonly mq: ValueUnit;
    readonly distributedLoad: ValueUnit;

    constructor({g1, g2, q, width}: IRare){
        this.mg1 = { value: (g1.value * width.value**2) / 8, unit: 'kN*cm' };
        this.mg2 = { value: (g2.value * width.value**2) / 8, unit: 'kN*cm' };
        this.mq = { value: (q.value * width.value**2) / 8, unit: 'kN*cm' };

        this.moment = this.calculateMoment({
            mg1: this.mg1,
            mg2: this.mg2,
            mq: this.mq
        });

        this.distributedLoad = {
            value: g1.value + g2.value + q.value,
            unit: g1.unit
        };
    }

   private calculateMoment({mg1, mg2, mq}: {mg1: ValueUnit, mg2: ValueUnit, mq: ValueUnit}): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value,
            unit: 'kN*cm'
        }
   }
}

class Last {
    readonly moment: ValueUnit;
    readonly mg1: ValueUnit;
    readonly mg2: ValueUnit;
    readonly mq: ValueUnit;
    readonly distributedLoad: ValueUnit;

    constructor({g1, g2, q, gamma_g1, gamma_g2, gamma_q, width}: ILast) {
        this.mg1 = { value: (g1.value * width.value**2) / 8, unit: 'kN*cm' };
        this.mg2 = { value: (g2.value * width.value**2) / 8, unit: 'kN*cm' };
        this.mq = { value: (q.value * width.value**2) / 8, unit: 'kN*cm' };

        this.moment = this.calculateMoment({
            mg1: this.mg1,
            mg2: this.mg2,
            mq: this.mq,
            gamma_g1, gamma_g2, gamma_q
        });

        this.distributedLoad = {
            value: g1.value * gamma_g1 + g2.value * gamma_g2 + q.value * gamma_q,
            unit: g1.unit
        };
    }

    calculateMoment({mg1, mg2, mq, gamma_g1, gamma_g2, gamma_q}: {mg1: ValueUnit, mg2: ValueUnit, mq: ValueUnit, gamma_g1: number, gamma_g2: number, gamma_q: number}): ValueUnit {
        return {
            value: mg1.value * gamma_g1 + mg2.value * gamma_g2 + mq.value * gamma_q,
            unit: 'kN*cm'
        }
    }
}

class Combinations {
    public readonly quasiPermanent: QuasiPermanent;
    public readonly frequent: Frequent;
    public readonly rare: Rare;
    public readonly last: Last;
    public readonly g1: ValueUnit;
    public readonly g2: ValueUnit;
    public readonly q: ValueUnit;
    public readonly qsi: {
        qsi1: Qsi1;
        qsi2: Qsi2;
    }
    public readonly gamma: {
        gamma_g1: number;
        gamma_g2: number;
        gamma_q: number;
    }
    public readonly width: Distance;


    constructor(inputs: ICombinations) {
        this.quasiPermanent = new QuasiPermanent({
            g1: inputs.g1,
            g2: inputs.g2,
            q: inputs.q,
            qsi2: inputs.qsi2,
            width: inputs.width
        });

        this.frequent = new Frequent({
            g1: inputs.g1,
            g2: inputs.g2,
            q: inputs.q,
            qsi1: inputs.qsi1,
            width: inputs.width
        });

        this.rare = new Rare({
            g1: inputs.g1,
            g2: inputs.g2,
            q: inputs.q,
            width: inputs.width
        });

        this.last = new Last({
            g1: inputs.g1,
            g2: inputs.g2,
            q: inputs.q,
            gamma_g1: inputs.gamma_g1,
            gamma_g2: inputs.gamma_g2,
            gamma_q: inputs.gamma_q,
            width: inputs.width
        });


        this.g1 = inputs.g1
        this.g2 = inputs.g2
        this.q = inputs.q

        this.qsi = {
            qsi1: inputs.qsi1,
            qsi2: inputs.qsi2
        }

        this.gamma = {
            gamma_g1: inputs.gamma_g1,
            gamma_g2: inputs.gamma_g2,
            gamma_q: inputs.gamma_q
        }
        
        this.width = inputs.width
    }
        
    
    calculateMoments({moment, x, width}:{moment: ValueUnit, x: ValuesUnit, width: ValueUnit}): ValuesUnit {
            const momentValue = moment.value;

            // Formula for parabolic distribution of a maximum moment M_max: M(x) = (4*M_max/L²)*(L*x - x²)
            const moments = x.values.map((x_cm) => {
                return (4 * momentValue / (width.value ** 2)) * (width.value * x_cm - x_cm ** 2);
            })
            
        return {
            values: moments,
            unit: 'kN*cm'
        }
    }
    
}


export {
    Combinations,
    QuasiPermanent,
    Frequent,
    Rare,
    Last,
    Qsi1,
    Qsi2
}
