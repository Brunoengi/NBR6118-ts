export type AgregateType = "basalt" | "diabase" | "granite" | "gneiss" | "limestone" | "sandstone"

export interface IAgregateConcrete {
    type: AgregateType
    alpha_e: number
}

class AgregateConcrete implements IAgregateConcrete {
    public type: AgregateType
    public alpha_e: number

    constructor(type: AgregateType) {
        this.type = type
        this.alpha_e = this.calculate_alpha_e(type)
    }

    private calculate_alpha_e(type: AgregateType): number {
        switch (type) {
            case "basalt":
                return 1.2
            case "diabase":
                return 1.2
            case "granite":
                return 1
            case "gneiss":
                return 1
            case "limestone":
                return 0.9
            case "sandstone":
                return 0.7
            default:
                throw new Error("Invalid aggregate type")
        }
    }
}

export default AgregateConcrete