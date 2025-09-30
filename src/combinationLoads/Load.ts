import { ValuesUnit, ValueUnit, Distance } from "../types/index.js"
import { IQsi1, IQsi2 } from "../types/combinationsType.js"

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

interface ICombinationLoads {
    g1: ValueUnit;
    g2: ValueUnit;
    q: ValueUnit;
    width: Distance;
}

interface ILast extends ICombinationLoads {
    gamma_g1: number;
    gamma_g2: number;
    gamma_q: number;
}

interface IQuasiPermanent extends ICombinationLoads {
    qsi2: Qsi2;
}

interface IFrequent extends ICombinationLoads {
    qsi1: Qsi1;
}

interface IRare extends ICombinationLoads {}


interface ICombinations extends ICombinationLoads, ILast {
    qsi1: Qsi1;
    qsi2: Qsi2;
}


class QuasiPermanent {
    readonly moment: ValueUnit;
    readonly mg1: ValueUnit;
    readonly mg2: ValueUnit;
    readonly mq: ValueUnit;

    constructor({g1, g2, q, qsi2, width}: IQuasiPermanent){
        const width_m = width.value / 100; // cm to m
        this.mg1 = { value: (g1.value * width_m**2) / 8, unit: 'kN*m' };
        this.mg2 = { value: (g2.value * width_m**2) / 8, unit: 'kN*m' };
        this.mq = { value: (q.value * width_m**2) / 8, unit: 'kN*m' };

        this.moment = this.calculateMoment({
            mg1: this.mg1,
            mg2: this.mg2,
            mq: this.mq,
            qsi2
        });
    }

   private calculateMoment({mg1, mg2, mq, qsi2}: {mg1: ValueUnit, mg2: ValueUnit, mq: ValueUnit, qsi2: Qsi2}): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value * qsi2.value,
            unit: 'kN*m'
        }
   }
}

class Frequent {
    readonly moment: ValueUnit;

    readonly mg1: ValueUnit;
    readonly mg2: ValueUnit;
    readonly mq: ValueUnit;

    constructor({g1, g2, q, qsi1, width}: IFrequent){
        const width_m = width.value / 100; // cm to m
        this.mg1 = { value: (g1.value * width_m**2) / 8, unit: 'kN*m' };
        this.mg2 = { value: (g2.value * width_m**2) / 8, unit: 'kN*m' };
        this.mq = { value: (q.value * width_m**2) / 8, unit: 'kN*m' };

        this.moment = this.calculateMoment({
            mg1: this.mg1,
            mg2: this.mg2,
            mq: this.mq,
            qsi1
        });
    }

   private calculateMoment({mg1, mg2, mq, qsi1}: {mg1: ValueUnit, mg2: ValueUnit, mq: ValueUnit, qsi1: Qsi1}): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value * qsi1.value,
            unit: 'kN*m'
        }
   }
}

class Rare {
    readonly moment: ValueUnit;

    readonly mg1: ValueUnit;
    readonly mg2: ValueUnit;
    readonly mq: ValueUnit;

    constructor({g1, g2, q, width}: IRare){
        const width_m = width.value / 100; // cm to m
        this.mg1 = { value: (g1.value * width_m**2) / 8, unit: 'kN*m' };
        this.mg2 = { value: (g2.value * width_m**2) / 8, unit: 'kN*m' };
        this.mq = { value: (q.value * width_m**2) / 8, unit: 'kN*m' };

        this.moment = this.calculateMoment({
            mg1: this.mg1,
            mg2: this.mg2,
            mq: this.mq
        });
    }

   private calculateMoment({mg1, mg2, mq}: {mg1: ValueUnit, mg2: ValueUnit, mq: ValueUnit}): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value,
            unit: 'kN*m'
        }
   }
}

class Last {
    readonly moment: ValueUnit;
    readonly mg1: ValueUnit;
    readonly mg2: ValueUnit;
    readonly mq: ValueUnit;

    constructor({g1, g2, q, gamma_g1, gamma_g2, gamma_q, width}: ILast) {
        const width_m = width.value / 100; // cm to m
        this.mg1 = { value: (g1.value * width_m**2) / 8, unit: 'kN*m' };
        this.mg2 = { value: (g2.value * width_m**2) / 8, unit: 'kN*m' };
        this.mq = { value: (q.value * width_m**2) / 8, unit: 'kN*m' };

        this.moment = this.calculateMoment({
            mg1: this.mg1,
            mg2: this.mg2,
            mq: this.mq,
            gamma_g1, gamma_g2, gamma_q
        });
    }

    calculateMoment({mg1, mg2, mq, gamma_g1, gamma_g2, gamma_q}: {mg1: ValueUnit, mg2: ValueUnit, mq: ValueUnit, gamma_g1: number, gamma_g2: number, gamma_q: number}): ValueUnit {
        return {
            value: mg1.value * gamma_g1 + mg2.value * gamma_g2 + mq.value * gamma_q,
            unit: 'kN*m'
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
    }
        
        

    calculateMoments({moment, x, width}:{moment: ValueUnit, x: ValuesUnit, width: ValueUnit}): ValuesUnit {
            const momentValue = moment.value;

            // Convert all length units to meters
            const L_m = width.value / 100;
            const xValues_m = x.values.map(x_cm => x_cm / 100);

            // Formula for parabolic distribution of a maximum moment M_max: M(x) = (4*M_max/L²)*(L*x - x²)
            const moments = xValues_m.map((x_m) => {
                return (4 * momentValue / (L_m ** 2)) * (L_m * x_m - x_m ** 2);
            })
            
        return {
            values: moments,
            unit: 'kN*m'
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
