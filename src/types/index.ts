export interface ValueUnit {
  value: number;
  unit: string;
}

export interface ValuesUnit {
    values: number[]
    unit: string
}

export interface VerificationResult {
  passed: boolean;
  limit: ValueUnit;
  values: ValuesUnit;
}

export interface Distances {
  values: number[]
  unit: 'cm'
}

export interface Distance {
  value: number
  unit: 'cm'
}

export interface DistributedLoad {
  value: number
  unit: 'kN/cm'
}

export interface DistrubutedLoads {
  values: number[]
  unit: 'kN/cm'
}

export interface Angles {
  values: number[]
  unit: 'radians'
}

export interface Angle {
  value: number
  unit: 'radians'
}

export interface Verification {
  passed: boolean
  limit: ValueUnit
  values: ValuesUnit
}

export interface VerificationOneValue {
  passed: boolean
  limit: ValueUnit
  value: ValueUnit
}

export interface fck {
  value: 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5 | 5.5 | 6 | 6.5 | 7 | 7.5 | 8 | 8.5 | 9 
  unit: 'kN/cm²'
}

export interface steel {
  name: 'CA-50' | 'CA-60'
}

export interface rhomin {
  value: number
  unit: 'adimensional'
}

export interface Stress {
  value: number
  unit: 'kN/cm²'
}

export interface Stresses {
  values: number[]
  unit: 'kN/cm²'
}


export interface Moment {
  value: number
  unit: 'kN*cm'
}

export interface Moments {
  values: number[]
  unit: 'kN*cm'
}

export type ModulusOfElasticity = Stress;

export interface Forces {
  values: number[]
  unit: 'kN'
}

export interface Force {
  value: number
  unit: 'kN'
}
