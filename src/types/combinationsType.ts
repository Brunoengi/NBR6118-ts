import { ValueUnit } from "./index.js"

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