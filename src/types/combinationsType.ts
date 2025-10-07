import { ValueUnit } from "./index.js"
import { Distance } from "./index.js"

export interface IMoments {
    Mg1: ValueUnit
    Mg2: ValueUnit
    Mq: ValueUnit
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
    g1: ValueUnit;
    g2: ValueUnit;
    q: ValueUnit;
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