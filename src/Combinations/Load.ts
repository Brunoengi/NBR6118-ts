import { ValuesUnit, ValueUnit } from "../types/index.js"
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
    readonly moment: ValueUnit;

    constructor({mg1, mg2, mq, qsi2}: IQuasiPermanent){
        this.moment = this.calculateMoment({mg1, mg2, mq, qsi2})
    }

   private calculateMoment({mg1, mg2, mq, qsi2}: IQuasiPermanent): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value * qsi2.value,
            unit: unit
        }
   }
}

class Frequent {
    readonly moment: ValueUnit;

    constructor({mg1, mg2, mq, qsi1}: IFrequent){
        this.moment = this.calculateMoment({mg1, mg2, mq, qsi1})
    }

   private calculateMoment({mg1, mg2, mq, qsi1}: IFrequent): ValueUnit {
        const unit = mg1.unit; // Assume all units are the same
        return {
            value: mg1.value + mg2.value + mq.value * qsi1.value,
            unit: unit
        }
   }
}

class Rare {
    readonly moment: ValueUnit;

    constructor({mg1, mg2, mq}: IRare){
        this.moment = this.calculateMoment({mg1, mg2, mq})
    }

   private calculateMoment({mg1, mg2, mq}: IRare): ValueUnit {
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
    public readonly mg1: ValueUnit;
    public readonly mg2: ValueUnit;
    public readonly mq: ValueUnit;


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

        this.mg1 = inputs.mg1
        this.mg2 = inputs.mg2
        this.mq = inputs.mq
    }

    calculateMoments({moment, x, width}:{moment: ValueUnit, x: ValuesUnit, width: ValueUnit}): ValuesUnit {
            const momentValue = moment.value;
            const xValues = x.values;
            const widthValue = width.value;

            const moments = xValues.map((x_i, i) => {
                return (momentValue * widthValue * x_i / 2) - (momentValue * x_i**2 / 2)
            })
            
        return {
            values: moments,
            unit: `${moment.unit.split('/')[0]}*${width.unit}`
        }
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
