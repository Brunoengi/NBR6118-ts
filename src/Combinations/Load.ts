import { ValueUnit } from "../types/index.js"
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
    mg1: ValueUnit;
    mg2: ValueUnit;
    mq: ValueUnit;
}

interface IQuasiPermanent extends ICombinationLoads {
    qsi2: Qsi2;
}

interface IFrequent extends ICombinationLoads {
    qsi1: Qsi1;
}

interface IRare extends ICombinationLoads {}


interface ICombinations extends ICombinationLoads {
    qsi1: Qsi1;
    qsi2: Qsi2;
}


class QuasiPermanent {
    readonly mqp: ValueUnit;

    constructor({mg1, mg2, mq, qsi2}: IQuasiPermanent){
        this.mqp = this.calculateMqp({mg1, mg2, mq, qsi2})
    }

   private calculateMqp({mg1, mg2, mq, qsi2}: IQuasiPermanent): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value * qsi2.value,
            unit: unit
        }
   }
}

class Frequent {
    readonly mf: ValueUnit;

    constructor({mg1, mg2, mq, qsi1}: IFrequent){
        this.mf = this.calculateMf({mg1, mg2, mq, qsi1})
    }

   private calculateMf({mg1, mg2, mq, qsi1}: IFrequent): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value * qsi1.value,
            unit: unit
        }
   }
}

class Rare {
    readonly mr: ValueUnit;

    constructor({mg1, mg2, mq}: IRare){
        this.mr = this.calculateMr({mg1, mg2, mq})
    }

   private calculateMr({mg1, mg2, mq}: IRare): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value,
            unit: unit
        }
   }

}

class Combinations {
    public readonly quasiPermanent: QuasiPermanent;
    public readonly frequent: Frequent;
    public readonly rare: Rare;

    constructor(inputs: ICombinations) {
        this.quasiPermanent = new QuasiPermanent({
            mg1: inputs.mg1,
            mg2: inputs.mg2,
            mq: inputs.mq,
            qsi2: inputs.qsi2
        });

        this.frequent = new Frequent({
            mg1: inputs.mg1,
            mg2: inputs.mg2,
            mq: inputs.mq,
            qsi1: inputs.qsi1
        });

        this.rare = new Rare({
            mg1: inputs.mg1,
            mg2: inputs.mg2,
            mq: inputs.mq
        });
    }
}

export {
    Combinations,
    QuasiPermanent,
    Frequent,
    Rare,
    Qsi1,
    Qsi2
}
