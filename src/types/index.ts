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