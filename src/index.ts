// Barrel export file

// buildingElements
export { default as Aggregate } from './buildingElements/Aggregate.js';
export { default as Concrete } from './buildingElements/Concrete.js';
export { default as PrestressingSteel } from './buildingElements/PrestressingSteel.js';
export { default as Steel } from './buildingElements/Steel.js';
export type { IPrestressingSteel, PrestressingSteelLabel, RelaxationType } from './buildingElements/PrestressingSteel.js';

// combinations
export { Combinations, Qsi1, Qsi2 } from './combinations/Load.js';

// structuralDesign
export { CableGeometry } from './structuralDesign/prestressingSteel/CableGeometry.js';
export { default as PrestressingDesign } from './structuralDesign/prestressingSteel/PrestressingDesign.js';

// structuralDesign/Losses
export { default as AnchorageLoss } from './structuralDesign/prestressingSteel/losses/AnchorageLoss.js';
export { default as ElasticShorteningLoss } from './structuralDesign/prestressingSteel/losses/ElasticShorteningLoss.js';
export { default as FrictionLoss, type AnchoringType } from './structuralDesign/prestressingSteel/losses/FrictionLoss.js';
export { default as TimeDependentLoss } from './structuralDesign/prestressingSteel/losses/TimeDependentLoss.js';

// types
export type { ValueUnit, ValuesUnit } from './types/index.js';
