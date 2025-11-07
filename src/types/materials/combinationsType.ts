import { ValueUnit, Moment, Distance, DistributedLoad } from "../index.js"

export interface IMoments {
    Mg1: Moment
    Mg2: Moment
    Mq: Moment
}

export interface IQsi {
    Qsi1: IQsi1
    Qsi2: IQsi2
}

export interface IGeometricProperties {
    Ac: ValueUnit
    W1: ValueUnit
}

export interface IQsi1 {
    value: number
}

export interface IQsi2 {
    value: number

}

export interface ICombinationLoads {
    g1: DistributedLoad;
    g2: DistributedLoad;
    q: DistributedLoad;
    width: Distance;
}

export interface ILast extends ICombinationLoads {
    gamma_g1: number;
    gamma_g2: number;
    gamma_q: number;
}

export interface IQuasiPermanent extends ICombinationLoads {
    qsi2: IQsi2;
}

export interface IFrequent extends ICombinationLoads {
    qsi1: IQsi1;
}

export interface IRare extends ICombinationLoads {}


export interface ICombinations extends ICombinationLoads, ILast {
    qsi1: IQsi1;
    qsi2: IQsi2;
}