import { Stress } from "../index.js";
import { AggregateType } from "../materials/aggregateType.js"; 


export type ConcreteSectionType = 'T' | 'doubleT' | 'I' | 'invertedT' | 'rectangular'
  
export interface ConcreteSectionOptions {
  type: ConcreteSectionType;
}

export interface ConcreteOptions {
  fck: Stress; 
  aggregate?: AggregateType;
  section?: ConcreteSectionOptions;
  is_section_reduced?: boolean;
}

