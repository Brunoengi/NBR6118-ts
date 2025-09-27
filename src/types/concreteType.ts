import { ConcreteSectionType } from "./elementsType.js";
import { Stress } from "./index.js";
import { AggregateType } from "./elementsType.js"; 

export interface ConcreteSectionOptions {
  type: ConcreteSectionType;
}

export interface ConcreteOptions {
  fck: Stress; 
  aggregate?: AggregateType;
  section?: ConcreteSectionOptions;
  is_section_reduced?: boolean;
}