import { AggregateType } from 'types/aggregateType.js'

export interface IAgregateConcrete {
  type: AggregateType;
  alpha_e: number;
}

class AggregateConcrete implements IAgregateConcrete {
  public type: AggregateType;
  public alpha_e: number;

  constructor(type: AggregateType) {
    this.type = type;
    this.alpha_e = this.calculate_alpha_e(type);
  }

  private calculate_alpha_e(type: AggregateType): number {
    switch (type) {
      case "basalt":
      case "diabase":
        return 1.2;
      case "granite":
      case "gneiss":
        return 1;
      case "limestone":
        return 0.9;
      case "sandstone":
        return 0.7;
      default:
        throw new Error(`Invalid aggregate type: ${type}`);
    }
  }
}

export default AggregateConcrete;