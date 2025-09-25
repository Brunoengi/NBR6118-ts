import AggregateConcrete from "../buildingElements/Aggregate.js";
import { ValueUnit } from "../types/index.js";
import { AggregateType } from "../types/elementsType.js";
import { ConcreteSectionType } from "../types/elementsType.js";


interface ConcreteSectionOptions {
  type: ConcreteSectionType;
}

interface ConcreteOptions {
  fck: number;
  aggregate?: AggregateType;
  section?: ConcreteSectionOptions;
}

class Concrete {
  public readonly fck: ValueUnit;
  public readonly fcm: ValueUnit;
  public readonly Ec: ValueUnit;
  public readonly Ecs: ValueUnit;
  public readonly e0: ValueUnit;
  public readonly eu: ValueUnit;
  public readonly fctm: ValueUnit;
  public readonly fctk_inf: ValueUnit;
  public readonly fctk_sup: ValueUnit;
  public readonly aggregate?: AggregateConcrete;
  public readonly section?: ConcreteSection;
  public readonly fctf: ValueUnit;
  public readonly fcd: ValueUnit

  constructor(options: ConcreteOptions) {
    this.fck = { value: options.fck, unit: "MPa" };
    this.fcm = this.calculate_fcm(options.fck);
    this.e0 = this.calculate_e0(options.fck);
    this.eu = this.calculate_eu(options.fck);
    this.fctm = this.calculate_fctm(options.fck);
    this.fctk_inf = this.calculate_fctk_inf(this.fctm.value);
    this.fctk_sup = this.calculate_fctk_sup(this.fctm.value);
    this.fcd = this.calculate_fcd()



    if (options.aggregate) {
      this.aggregate = new AggregateConcrete(options.aggregate);
      this.Ec = this.calculate_Ec(options.fck, this.aggregate.alpha_e);
      this.Ecs = this.calculate_Ecs(options.fck, this.Ec.value);
    } else {
      this.Ec = { value: undefined, unit: "MPa" };
      this.Ecs = { value: undefined, unit: "MPa" };
    }

    if (options.section) {
      this.section = new ConcreteSection(options.section.type);
      this.fctf = this.section.calculate_fctf(this.fctk_inf);
    } else {
      this.section = undefined;
      this.fctf = { value: undefined, unit: "MPa" }
    }
  }

  private calculate_fcm(fck: number): ValueUnit {
    return { value: fck + 12.5, unit: "MPa" };
  }

  private calculate_fcd() : ValueUnit {
    return {
      value: this.fck.value / 1.4,
      unit: "MPa"
    }
  }

  calculate_fckj(j: number): ValueUnit {
    const fck = this.fck.value;
    const fckj = fck * (Math.E ** ((0.2) * (1 - Math.sqrt(28 / j))))
    
    return { value: fckj, unit: "MPa" }
  }

  calculate_fctj(j: number): ValueUnit {
    const fckj = this.calculate_fckj(j).value
    const fctmj = 0.3 * (fckj)**(2/3)
    
    return {value: fctmj, unit: "MPa"}
  }

  private calculate_Ec(fck: number, alpha_e: number): ValueUnit {
    let Ec: number;
    if (fck <= 50) {
      Ec = alpha_e * 5600 * Math.sqrt(fck);
    } else {
      const fcm = fck + 12.5;
      Ec = alpha_e * 21500 * Math.pow(fcm / 10, 1 / 3);
    }
    return { value: Ec, unit: "MPa" };
  }

  private calculate_Ecs(fck: number, Ec: number): ValueUnit {
    let alpha_i = 0.8 + 0.2 * fck / 80;
    alpha_i = alpha_i > 1 ? 1 : alpha_i;
    return { value: alpha_i * Ec, unit: "MPa" };
  }

  private calculate_e0(fck: number): ValueUnit {
    let e0: number;
    if (fck <= 50) {
      e0 = 2;
    } else {
      e0 = 2 + 0.085 * Math.pow(fck - 50, 0.53);
    }
    return { value: e0, unit: "‰" };
  }

  private calculate_eu(fck: number): ValueUnit {
    let eu: number;
    if (fck <= 50) {
      eu = 3.5;
    } else {
      eu = 2.6 + 35 * Math.pow((90 - fck) / 100, 4);
    }
    return { value: eu, unit: "‰" };
  }

  private calculate_fctm(fck: number): ValueUnit {
    let fctm: number;
    if (fck <= 50) {
      fctm = 0.3 * Math.pow(fck, 2 / 3);
    } else {
      fctm = 2.12 * Math.log(1 + 0.1 * (fck + 8));
    }
    return { value: fctm, unit: "MPa" };
  }

  private calculate_fctk_inf(fctm: number): ValueUnit {
    return { value: 0.7 * fctm, unit: "MPa" };
  }

  private calculate_fctk_sup(fctm: number): ValueUnit {
    return { value: 1.3 * fctm, unit: "MPa" };
  }
}

class ConcreteSection {
  public type: ConcreteSectionType;

  constructor(type: ConcreteSectionType) {
    this.type = type;
  }

  calculate_fctf(fctkinf: ValueUnit): ValueUnit {
    switch (this.type) {
      case 'T':
        return { value: 1.2 * fctkinf.value, unit: "MPa" };
      case 'doubleT':
        return { value: 1.2 * fctkinf.value, unit: "MPa" };
      case 'I':
        return { value: 1.3 * fctkinf.value, unit: "MPa" }; 
      case 'invertedT':
        return { value: 1.3 * fctkinf.value, unit: "MPa" };
      case 'rectangular':
        return { value: 1.5 * fctkinf.value, unit: "MPa" };
      default:
        throw new Error("Invalid concrete section type");
    }
  }
}

export default Concrete;