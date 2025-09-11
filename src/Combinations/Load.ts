interface IMg1 {
    value: number
    unit: string
}

interface IMg2 {
    value: number
    unit: string
}

interface IMq {
    value: number
    unit: string
}

interface Iqsi1 {
    value: number
    
}

interface Iqsi2 {
    value: number
}

class qsi1 implements Iqsi1 {

    value: number;

    constructor(value: number){
        if(value >= 1 || value <= 0){
            throw new Error(
                `Invalid qsi1 value: ${value}. Must be in the range (0, 1).`
            );
        }
        this.value = value;
    }
}

class qsi2 implements Iqsi2 {

    value: number;

    constructor(value: number){
        if(value >= 1 || value <= 0){
            throw new Error(
                `Invalid qsi2 value: ${value}. Must be in the range (0, 1).`
            );
        }
        this.value = value;
    }
}

interface IQuasiPermanent {
    mg1: IMg1;
    mg2: IMg2;
    mq: IMq
    qsi2: Iqsi2;
}

interface IFrequent {
    mg1: IMg1;
    mg2: IMg2;
    mq: IMq
    qsi1: Iqsi1;
}

interface Irare {
    mg1: IMg1;
    mg2: IMg2;
    mq: IMq
}


class QuasiPermanent {
    mqp: {
        value: number;
        unit: string;
    }

    constructor({mg1, mg2, mq, qsi2}: IQuasiPermanent){
        this.mqp = this.calculate_mqp({mg1, mg2, mq, qsi2})
    }

   calculate_mqp({mg1, mg2, mq, qsi2}: IQuasiPermanent){
    return {
        value: mg1.value + mg2.value + mq.value * qsi2.value,
        unit: 'kN * m'
    }
   }
}

class Frequent {
    mf: {
        value: number;
        unit: string;
    }

    constructor({mg1, mg2, mq, qsi1}: IFrequent){
        this.mf = this.calculate_mqp({mg1, mg2, mq, qsi1})
    }

   calculate_mqp({mg1, mg2, mq, qsi1}: IFrequent){
    return {
        value: mg1.value + mg2.value + mq.value * qsi1.value,
        unit: 'kN * m'
    }
   }
}

class Rare {
    mr: {
        value: number;
        unit: string;
    }

    constructor({mg1, mg2, mq}: Irare){
        this.mr = this.calculate_mr({mg1, mg2, mq})
    }

   calculate_mr({mg1, mg2, mq}: Irare){
    return {
        value: mg1.value + mg2.value + mq.value,
        unit: 'kN * m'
    }
   }

}

export {
    QuasiPermanent,
    Frequent,
    Rare
}

