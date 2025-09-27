import AggregateConcrete from "../structuralElements/Aggregate.js";
import { ValueUnit, Stress } from "../types/index.js";
import { ConcreteSectionType } from "../types/elementsType.js";
import { ConcreteOptions } from "types/concreteType.js";

class Concrete {
  public readonly fck: Stress;
  public readonly fcm: Stress;
  public readonly Ec: Stress;
  public readonly Ecs: Stress;
  public readonly e0: ValueUnit;
  public readonly eu: ValueUnit;
  public readonly fctm: Stress;
  public readonly fctk_inf: Stress;
  public readonly fctk_sup: Stress;
  public readonly aggregate?: AggregateConcrete;
  public readonly section?: ConcreteSection;
  public readonly fctf: Stress;
  public readonly fcd: Stress;
  public readonly nc: number;
  public readonly alphac: number;
  public readonly lambda: number;
  public readonly maxStress_rectangularDiagram: Stress;

  constructor(options: ConcreteOptions) {
    this.fck = options.fck;
    this.fcm = this.calculate_fcm(options.fck.value);
    this.e0 = this.calculate_e0(options.fck.value);
    this.eu = this.calculate_eu(options.fck.value);
    this.fctm = this.calculate_fctm(options.fck.value);
    this.fctk_inf = this.calculate_fctk_inf(options.fck.value);
    this.fctk_sup = this.calculate_fctk_sup(options.fck.value);
    this.fcd = this.calculate_fcd(options.fck.value);
    this.nc = this.calculate_nc(options.fck.value);
    this.alphac = this.calculate_alphac(options.fck.value);
    this.lambda = this.calculate_lambda(options.fck.value);
    this.maxStress_rectangularDiagram = this.calculate_maxStress_rectangularDiagram(options.is_section_reduced ?? false);

    if (options.aggregate) {
      this.aggregate = new AggregateConcrete(options.aggregate);
      this.Ec = this.calculate_Ec(options.fck.value, this.aggregate.alpha_e);
      this.Ecs = this.calculate_Ecs(options.fck.value);
    } else {
      this.Ec = { value: undefined, unit: "kN/cm²" };
      this.Ecs = { value: undefined, unit: "kN/cm²" };
    }

    if (options.section) {
      this.section = new ConcreteSection(options.section.type);
      this.fctf = this.section.calculate_fctf(this.fctk_inf);
    } else {
      this.section = undefined;
      this.fctf = { value: undefined, unit: "kN/cm²" }
    }
  }

  calculate_maxStress_rectangularDiagram(is_section_reduced: boolean = false): Stress {
    return {
      value: is_section_reduced ? 0.9 * this.alphac * this.nc * this.fcd.value : this.alphac * this.nc * this.fcd.value,
      unit: this.fcd.unit
    } 
  }

  private calculate_lambda(fck_kNCm2: number): number {
    const fck_MPa = fck_kNCm2 * 10;
    return fck_MPa <= 50 ? 0.8 : 0.8 - ((fck_MPa - 50)/400)
  }

  private calculate_nc(fck_kNCm2: number): number {
    const fck_MPa = fck_kNCm2 * 10;
    return fck_MPa <=40 ? 1 : (40 / fck_MPa) ** (1 / 3)
  }

  private calculate_alphac(fck_kNCm2: number): number {
    const fck_MPa = fck_kNCm2 * 10;
    return fck_MPa <= 50 ? 0.85 : 0.85 * (1 - ((fck_MPa - 50)/200))
  }

  private calculate_fcm(fck_kNCm2: number): Stress {
    const fck_MPa = fck_kNCm2 * 10;
    return { value: (fck_MPa + 12.5) / 10, unit: "kN/cm²" };
  }

  private calculate_fcd(fck_kNCm2: number) : Stress {
    const fck_MPa = fck_kNCm2 * 10;
    return {
      value: (fck_MPa / 1.4) / 10,
      unit: "kN/cm²"
    }
  }

  calculate_fckj(j: number): Stress {
    const fck = this.fck.value * 10; // Convert back to MPa for calculation
    const fckj = fck * (Math.E ** ((0.2) * (1 - Math.sqrt(28 / j))))
    
    return { value: fckj / 10, unit: "kN/cm²" }
  }

  calculate_fctj(j: number): Stress {
    const fckj_kNCm2 = this.calculate_fckj(j).value;
    const fckj_MPa = fckj_kNCm2 * 10;
    const fctmj_MPa = 0.3 * (fckj_MPa)**(2/3);
    
    return {value: fctmj_MPa / 10, unit: "kN/cm²"};
  }

  private calculate_Ec(fck_kNCm2: number, alpha_e: number): Stress {
    const fck_MPa = fck_kNCm2 * 10;
    let Ec: number;
    if (fck_MPa <= 50) {
      Ec = alpha_e * 5600 * Math.sqrt(fck_MPa);
    } else {
      Ec = alpha_e * 21500 * Math.pow((fck_MPa + 12.5) / 10, 1 / 3);
    }
    return { value: Ec / 10, unit: "kN/cm²" };
  }

  private calculate_Ecs(fck_kNCm2: number): Stress {
    const fck_MPa = fck_kNCm2 * 10;
    const Ec_MPa = this.calculate_Ec(fck_kNCm2, this.aggregate!.alpha_e).value * 10;
    let alpha_i = 0.8 + 0.2 * fck_MPa / 80;
    alpha_i = alpha_i > 1 ? 1 : alpha_i;
    return { value: (alpha_i * Ec_MPa) / 10, unit: "kN/cm²" };
  }

  private calculate_e0(fck_kNCm2: number): ValueUnit {
    const fck_MPa = fck_kNCm2 * 10;
    let e0: number;
    if (fck_MPa <= 50) {
      e0 = 2;
    } else {
      e0 = 2 + 0.085 * Math.pow(fck_MPa - 50, 0.53);
    }
    return { value: e0, unit: "‰" };
  }

  private calculate_eu(fck_kNCm2: number): ValueUnit {
    const fck_MPa = fck_kNCm2 * 10;
    let eu: number;
    if (fck_MPa <= 50) {
      eu = 3.5;
    } else {
      eu = 2.6 + 35 * Math.pow((90 - fck_MPa) / 100, 4);
    }
    return { value: eu, unit: "‰" };
  }

  private calculate_fctm(fck_kNCm2: number): Stress {
    const fck_MPa = fck_kNCm2 * 10;
    let fctm: number;
    if (fck_MPa <= 50) {
      fctm = 0.3 * Math.pow(fck_MPa, 2 / 3);
    } else {
      fctm = 2.12 * Math.log(1 + 0.1 * (fck_MPa + 8));
    }
    return { value: fctm / 10, unit: "kN/cm²" };
  }

  private calculate_fctk_inf(fck_kNCm2: number): Stress {
    const fctm_MPa = this.calculate_fctm(fck_kNCm2).value * 10;
    return { value: (0.7 * fctm_MPa) / 10, unit: "kN/cm²" };
  }

  private calculate_fctk_sup(fck_kNCm2: number): Stress {
    const fctm_MPa = this.calculate_fctm(fck_kNCm2).value * 10;
    return { value: (1.3 * fctm_MPa) / 10, unit: "kN/cm²" };
  }
}

class ConcreteSection {
  public type: ConcreteSectionType;

  constructor(type: ConcreteSectionType) {
    this.type = type;
  }

  calculate_fctf(fctkinf: ValueUnit): Stress {
    switch (this.type) {
      case 'T':
        return { value: 1.2 * fctkinf.value, unit: "kN/cm²" };
      case 'doubleT':
        return { value: 1.2 * fctkinf.value, unit: "kN/cm²" };
      case 'I':
        return { value: 1.3 * fctkinf.value, unit: "kN/cm²" }; 
      case 'invertedT':
        return { value: 1.3 * fctkinf.value, unit: "kN/cm²" };
      case 'rectangular':
        return { value: 1.5 * fctkinf.value, unit: "kN/cm²" };
      default:
        throw new Error("Invalid concrete section type");
    }
  }
}

export default Concrete;