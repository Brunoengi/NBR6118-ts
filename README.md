# NBR 6118-ts

A TypeScript library for structural engineering calculations based on the Brazilian standard NBR 6118/2023. This project provides classes for modeling and calculating properties of concrete, steel, load combinations, and prestressing design.

## Installation

```bash

# clone the repository:
git clone https://github.com/your-username/nbr6118-ts.git
cd nbr6118-ts
npm install
```

## Getting Started

### Module 1: Materials

Here you can create your material and verify your properties

#### `1.1 Concrete`

```typescript
import { Concrete } from 'nbr6118-ts'

// 1. Define Materials and Geometry
const concrete = new Concrete({
  fck: { value: 3.5, unit: 'kN/cm²' },
  aggregate: 'granite',
  section: { type: 'rectangular' }
});

console.log(concrete)
```

Calculates properties of concrete based on its characteristic.

| Property                                    | Acronym               | Unit |
| :------------------------------------------ | :-------------------: | :--: |
| Characteristic Compressive Strength         | f<sub>ck</sub>        | kN/cm² |
| Mean Compressive Strength                   | f<sub>cm</sub>        | kN/cm² |
| Longitudinal Modulus of Elasticity          | E<sub>c</sub>         | kN/cm² |
| Secant Modulus of Elasticity                | E<sub>cs</sub>        | kN/cm² |
| Strain at Peak Stress                       | &epsilon;<sub>c2</sub>| ‰    |
| Ultimate Strain                             | &epsilon;<sub>cu</sub>| ‰    |
| Mean Tensile Strength                       | f<sub>ct,m</sub>      | kN/cm² |
| Characteristic Lower Bound Tensile Strength | f<sub>ctk,inf</sub>   | kN/cm² |
| Characteristic Upper Bound Tensile Strength | f<sub>ctk,sup</sub>   | kN/cm² |
| Flexural Tensile Strength                   | f<sub>ct,f</sub>      | kN/cm² |

### `AggregateConcrete`

Used internally by the `Concrete` class.

| Property                                                                   | Acronym       | Unit |
| :------------------------------------------------------------------------- | :-----------: | :--: |
| Parameter depending on the type of aggregate that influences the modulus of elasticity | α<sub>E</sub> | -    |


#### `1.2 Steel`

```typescript
import { Steel } from 'nbr6118-ts'

// 1. Define Materials and Geometry
const steel = new Steel('CA-50')

console.log(steel)
```
Property | Acronym | Unit | 
| :---------------------------- | :-----------: | :----: | 
| Steel Type Label | - | - | 
| Characteristic Yield Strength | fyk| kN/cm² | 
| Design Yield Strength | fyd| kN/cm² | 
 
#### `1.3 Aggregate`

```typescript
import { Aggregate } from 'nbr6118-ts';

const aggregate = new Aggregate('granite');
```

Provides properties for different types of concrete aggregates.

| Property                                                                             | Acronym       | Unit |
| :----------------------------------------------------------------------------------- | :-----------: | :--: |
| Parameter that influences the modulus of elasticity, based on the aggregate's origin | α<sub>E</sub> | -    |


#### `1.4 PrestressingSteel`

```typescript
import { PrestressingSteel } from 'nbr6118-ts'

const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 12.7' })

console.log(prestressingSteel)
```

Provides properties for different types of prestressing steel based on their label.

| Property                            | Acronym             | Unit |
| :---------------------------------- | :-----------------: | :--: |
| Characteristic Tensile Strength     | f<sub>ptk</sub>     | MPa  |
| Characteristic Yield Strength       | f<sub>pyk</sub>     | MPa  |
| Maximum Initial Prestressing Stress | &sigma;<sub>pi</sub>  | MPa  |
| Relaxation Type                     | -                   | -    |
| Nominal Diameter                    | &Phi;               | mm   |
| Minimum Area of a Single Cord       | A<sub>p,min</sub>   | cm²  |


### Module 2: Combinations

This module provides classes to calculate load combinations for Serviceability Limit States (SLS) and Ultimate Limit States (ULS) based on NBR 6118. It calculates the maximum bending moment for a simply supported beam under given distributed loads.

The main `Combinations` class aggregates four types of combinations:
- **Quasi-Permanent (SLS):** Used for long-term effects.
- **Frequent (SLS):** Used for verifying cracking and vibrations.
- **Rare (SLS):** Used for verifying cracking formation.
- **Last (ULS):** Used for ultimate strength design (Ultimate Limit State).

```typescript
import { Combinations, Qsi1, Qsi2 } from 'nbr6118-ts';

// 1. Define distributed loads and beam span
const g1 = { value: 0.08, unit: 'kN/cm' }; // Permanent load 1
const g2 = { value: 0.16, unit: 'kN/cm' }; // Permanent load 2
const q = { value: 0.24, unit: 'kN/cm' };  // Variable load
const width = { value: 1000, unit: 'cm' }; // 10m span

// 2. Define combination factors
const qsi1 = new Qsi1(0.7); // Factor for frequent combination
const qsi2 = new Qsi2(0.6); // Factor for quasi-permanent combination

// 3. Create the Combinations instance
const combinations = new Combinations({
    g1, g2, q, width,
    qsi1,
    qsi2,
    gamma_g1: 1.4, // ULS safety factor for g1
    gamma_g2: 1.4, // ULS safety factor for g2
    gamma_q: 1.4   // ULS safety factor for q
});

// 4. Access the calculated moments for each combination
console.log('Quasi-Permanent Moment:', combinations.quasiPermanent.moment);
// Expected: { value: 48000, unit: 'kN*cm' }
console.log('Frequent Moment:', combinations.frequent.moment);
// Expected: { value: 51000, unit: 'kN*cm' }
console.log('Rare Moment:', combinations.rare.moment);
// Expected: { value: 60000, unit: 'kN*cm' }
console.log('Last (ULS) Moment:', combinations.last.moment);
// Expected: { value: 84000, unit: 'kN*cm' }
```

### Module 3: Prestressing Design

#### `3.1 Prestressing Design Estimated`

This module estimates the required prestressing steel area based on material properties, section geometry, and load combinations.

```typescript
import { 
    PrestressingDesign, 
    Concrete, 
    PrestressingSteel, 
    Combinations, 
    Qsi1, 
    Qsi2 
} from 'nbr6118-ts';

// 1. Define the materials
const concrete = new Concrete({
    fck: { value: 3.5, unit: 'kN/cm²' }, // 35 MPa
    section: { type: 'rectangular' }
});

const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 12.7' });

// 2. Define the geometric and design properties
const geometricProperties = {
    Ac: { value: 7200, unit: 'cm²' },
    W1: { value: -144000, unit: 'cm³' }
};

const epmax = { value: -48, unit: 'cm' };
const lossFactor = 0.25;
const ncable = 3;
const prestressingType = 'Limited';

// 3. Define the load combinations
const combinations = new Combinations({
    mg1: { value: 506.25, unit: 'kN * m' },
    mg2: { value: 562.50, unit: 'kN * m' },
    mq: { value: 421.875, unit: 'kN * m' },
    qsi1: new Qsi1(0.60),
    qsi2: new Qsi2(0.40),
});

// 4. Create the prestressing design instance
const prestressingDesign = new PrestressingDesign({
    prestressingSteel,
    geometricProperties,
    lossFactor,
    epmax,
    combinations,
    concrete,
    type: prestressingType,
    ncable
});

// 5. Check the calculated results
console.log('Calculated final prestressing force (P_inf_calc):', prestressingDesign.P_inf_calc);
console.log('Estimated prestressing area (Apestimated):', prestressingDesign.Apestimated);
console.log('Number of strands per cable (ncordagecable):', prestressingDesign.ncordagecable);
console.log('Designed prestressing area (Ap_proj):', prestressingDesign.Ap_proj);
console.log('Designed final prestressing force (P_inf_proj):', prestressingDesign.P_inf_proj);
```

#### `2.2 Prestressing Steel Loss`

This module calculates the immediate and time-dependent (progressive) losses of prestressing force.

##### `2.2.1 Friction Loss`

Calculates the loss of force due to friction between the prestressing tendon and its duct. The example below demonstrates a system with active-passive anchoring.

```typescript
import { FrictionLoss, CableGeometry } from 'nbr6118-ts';

// 1. Define cable geometry
const cableGeo = new CableGeometry({
    width: { value: 1500, unit: 'cm' }, // 15m span
    epmax: { value: -48, unit: 'cm' },
    numPoints: 11
});

// 2. Create Friction Loss instance
const frictionLoss = new FrictionLoss({
    Pi: { value: -2498.72, unit: 'kN' }, // Initial force at the active anchor
    apparentFrictionCoefficient: 0.2,
    anchoring: 'active-passive',
    cableGeometry: cableGeo
});

// 3. Get the force at different points along the cable
const forceAtMidspan = frictionLoss.frictionPrestressLoss(7.5); // Force at 7.5m
const forceAtEnd = frictionLoss.frictionPrestressLoss(15);   // Force at 15m (passive anchor)

console.log('Force at mid-span (7.5m):', forceAtMidspan); // Expected: -2399.636 kN
console.log('Force at passive anchor (15m):', forceAtEnd); // Expected: -2304.48 kN
console.log('Average loss per meter (beta):', frictionLoss.beta); // Expected: { value: 12.95, unit: 'kN/m' }
```

##### `2.2.2 Anchorage Loss`

Calculates the force loss due to rope slippage on the anchorage device. This loss affects a length `xr` from the anchorage.

```typescript
import { AnchorageLoss } from 'nbr6118-ts';

const anchorageLoss = new AnchorageLoss({
    Ap: { value: 17.82, unit: 'cm²' },
    Ep: { value: 19500, unit: 'kN/cm²' }, // 195 GPa
    cableReturn: { value: 0.5, unit: 'cm' }, // Anchorage slip
    tangBeta: { value: 13.211, unit: 'kN/m' }, // Friction loss (beta), obtained from FrictionLoss
    anchoring: 'active-passive'
});

const beamWidth = { value: 1500, unit: 'cm' };

// Get the loss at different points
const lossAtAnchor = anchorageLoss.deltaPanc({ value: 0, unit: 'cm' }, beamWidth);
const lossAtMidspan = anchorageLoss.deltaPanc({ value: 750, unit: 'cm' }, beamWidth);


console.log('Length of influence (xr):', anchorageLoss.xr); // Expected: { value: 1146.8, unit: 'cm' }
console.log('Loss at the anchor (x=0):', lossAtAnchor); // Expected: { value: 302.99, unit: 'kN' }
console.log('Loss at mid-span (x=7.5m):', lossAtMidspan); // Expected: { value: 104.83, unit: 'kN' }

```

##### `2.2.3 Elastic Shortening Loss`

Calculates the loss due to elastic shortening of concrete when the prestressing force is applied. The example assumes sequential tensioning of three cables. The resulting force is `P0`.

```typescript
import { ElasticShorteningLoss } from 'nbr6118-ts';

// Panc is the force after friction and anchorage losses
const panc_half = [2167.976, 2187.793, 2207.61, 2227.427, 2247.244, 2267.06];
const panc_full = [...panc_half, ...panc_half.slice(0, -1).reverse()];

const elasticLoss = new ElasticShorteningLoss({
    Ecs: { value: 2940.3, unit: 'kN/cm²' }, // 29.403 GPa
    Ep: { value: 19500, unit: 'kN/cm²' },   // 195 GPa
    Ac: { value: 7200, unit: 'cm²' },
    Ic: { value: 8640000, unit: 'cm⁴' },
    Ap: { value: 17.82, unit: 'cm²' },
    g1: { value: 18, unit: 'kN/m' },
    ncable: 3,
    Panc: { values: panc_full, unit: 'kN' },

  // Other properties like width, x, and ep are also needed
} as any);

const p0 = elasticLoss.calculateP0();

console.log('Force P0 at mid-span:', p0.values[5]); // Expected: -2241.92 kN

```

##### `2.2.4 Time Dependent Loss`

This class estimates the combined losses over time (creep, shrinkage, and relaxation of the steel) to find the final prestressing force (`P_inf`).

```typescript
import { TimeDependentLoss } from 'nbr6118-ts';


// The P0 values are the result from ElasticShorteningLoss
const p0_half = [-2156.11, -2174.28, -2190.57, -2206.55, -2223.40, -2241.92];
const p0_full = [...p0_half, ...p0_half.slice(0, -1).reverse()];

const timeDependentLoss = new TimeDependentLoss({
    phi: 2.5, // Creep coefficient
    g1: { value: 18, unit: 'kN/m' },
    g2: { value: 20, unit: 'kN/m' },
    Ac: { value: 7200, unit: 'cm²' },
    Ic: { value: 8640000, unit: 'cm⁴' },
    P0: { values: p0_full, unit: 'kN' },
    alphap: 6.632, // Modular ratio (Ep/Ecs)
    // Other properties like width, x, and ep are also needed
} as any);

const finalForce = timeDependentLoss.finalPrestressingForce();
const lossPercentage = timeDependentLoss.calculatedeltappercent();

console.log('Final prestressing force (P_inf) at mid-span:', finalForce.values[5]); // Expected: -1945.57 kN
console.log('Progressive loss percentage at mid-span:', lossPercentage[5]); // Expected: 13.218 %

```

## Running Tests

To run the test suite, use the following command:

```bash
npm test
```
