import Concrete, {ConcreteSectionType, ValueUnit } from "Concrete.js";


interface ESSFParams {
    fctk_inf: ValueUnit
    ConcreteSectionType: ConcreteSectionType
}

class ELSF {

    public fctf: ValueUnit

    constructor({fctk_inf, ConcreteSectionType}: ESSFParams){
        this.fctf = this.calculate_fctf({fctk_inf, ConcreteSectionType})
    }

    calculate_fctf({fctk_inf, ConcreteSectionType}: ESSFParams){
        switch (ConcreteSectionType) {
      case 'T':
        return { value: 1.2 * fctk_inf.value, unit: "MPa" };
      case 'doubleT':
        return { value: 1.2 * fctk_inf.value, unit: "MPa" };
      case 'I':
        return { value: 1.3 * fctk_inf.value, unit: "MPa" }; 
      case 'invertedT':
        return { value: 1.3 * fctk_inf.value, unit: "MPa" };
      case 'rectangular':
        return { value: 1.5 * fctk_inf.value, unit: "MPa" };
      default:
        throw new Error("Invalid concrete section type");
    }
  }
}

export default ELSF;