# NBR 6118-ts

A TypeScript library for structural engineering calculations based on the Brazilian standard NBR 6118/2023. This project provides classes for modeling and calculating properties of concrete, steel, load combinations, and prestressing design.

## Installation

```bash
npm install nbr6118-ts
```
*(Note: This assumes the package is published to npm. For local development, clone the repository and install dependencies.)*

```bash
git clone https://github.com/your-username/nbr6118-ts.git
cd nbr6118-ts
npm install
```

## Getting Started

Here is a complete example of how to dimension a prestressed concrete element, from defining the materials to calculating the required prestressing force.

```typescript
import Concrete from './src/buildingElements/Concrete.js';
import PrestressingSteel from './src/buildingElements/PrestressingSteel.js';
import { Combinations, Qsi1, Qsi2 } from './src/combinations/Load.js';
import PrestressingDesign from './src/structuralDesign/PrestressingSteel.js';

// 1. Define Materials
const concrete = new Concrete({
  fck: 35,
  aggregate: 'granite',
  section: {
    type: 'rectangular'
  }
});

const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 9.5' });

// 2. Define Geometric Properties
const geometricProperties = {
    Ac: { value: 3162.5, unit: 'cm²' },
    W1: { value: -65455.5, unit: 'cm³' }
};

const epmax = { value: -48, unit: 'cm' };

// 3. Define Loads and Combinations
const combinations = new Combinations({
    mg1: { value: 500, unit: 'kN * m' },
    mg2: { value: 500, unit: 'kN * m' },
    mq: { value: 490.63, unit: 'kN * m' },
    qsi1: new Qsi1(0.656),
    qsi2: new Qsi2(0.484)
});

// 4. Create the Design Instance
const prestressingDesign = new PrestressingDesign({
    prestressingSteel,
    geometricProperties,
    lossFactor: 0.2,
    epmax,
    combinations,
    concrete,
    type: 'Limited' // or 'Complete'
});

// 5. Get the Results
const p_inf = prestressingDesign.P_inf_calc;
const p_initial = prestressingDesign.P_initial_calc;

console.log(`Final Required Prestressing Force (P_inf): ${p_inf.value.toFixed(2)} ${p_inf.unit}`);
console.log(`Initial Required Prestressing Force (P_0): ${p_initial.value.toFixed(2)} ${p_initial.unit}`);
console.log(`Concrete Flexural Tensile Strength (f_ct,f): ${concrete.fctf.value.toFixed(2)} ${concrete.fctf.unit}`);
```

## API Reference

### `Concrete`

Calculates properties of concrete based on its characteristic compressive strength (`fck`).

| Property                                    | Acronym               | Unit |
| :------------------------------------------ | :-------------------: | :--: |
| Characteristic Compressive Strength         | f<sub>ck</sub>        | MPa  |
| Mean Compressive Strength                   | f<sub>cm</sub>        | MPa  |
| Longitudinal Modulus of Elasticity          | E<sub>c</sub>         | MPa  |
| Secant Modulus of Elasticity                | E<sub>cs</sub>        | MPa  |
| Strain at Peak Stress                       | &epsilon;<sub>c2</sub>| ‰    |
| Ultimate Strain                             | &epsilon;<sub>cu</sub>| ‰    |
| Mean Tensile Strength                       | f<sub>ct,m</sub>      | MPa  |
| Characteristic Lower Bound Tensile Strength | f<sub>ctk,inf</sub>   | MPa  |
| Characteristic Upper Bound Tensile Strength | f<sub>ctk,sup</sub>   | MPa  |
| Flexural Tensile Strength                   | f<sub>ct,f</sub>      | MPa  |

### `AggregateConcrete`

Used internally by the `Concrete` class.

| Property                                                                   | Acronym       | Unit |
| :------------------------------------------------------------------------- | :-----------: | :--: |
| Parameter depending on the type of aggregate that influences the modulus of elasticity | α<sub>E</sub> | -    |

### `PrestressingSteel`

Defines the properties of a specific type of prestressing steel.

| Property                      | Acronym             | Unit |
| :---------------------------- | :-----------------: | :--: |
| Characteristic Tensile Strength | f<sub>ptk</sub>     | MPa  |
| Nominal Diameter              | &Phi;               | mm   |
| Minimum Area of a Strand      | A<sub>p,min</sub>   | cm²  |
| Relaxation Type               | -                   | RB/RN|

### `Combinations`

Calculates the design moments for different serviceability limit states.

| Property                   | Acronym           | Unit   | Description                |
| :------------------------- | :---------------: | :----: | :------------------------- |
| Quasi-Permanent Moment     | M<sub>qp</sub>    | kN·m   | `mg1 + mg2 + ψ₂·mq`        |
| Frequent Moment            | M<sub>f</sub>     | kN·m   | `mg1 + mg2 + ψ₁·mq`        |
| Rare Moment                | M<sub>r</sub>     | kN·m   | `mg1 + mg2 + mq`           |

### `PrestressingDesign`

The main class for performing the prestressing design calculations.

| Property                                | Acronym           | Unit | Description                                                              |
| :-------------------------------------- | :---------------: | :--: | :----------------------------------------------------------------------- |
| Final Required Prestressing Force       | P<sub>&infin;</sub> | kN   | The maximum required force between ELS-D and ELS-F checks.               |
| Initial Required Prestressing Force     | P<sub>0</sub>     | kN   | The required force at the time of tensioning, accounting for losses.     |

## Running Tests

To run the test suite, use the following command:

```bash
npm test
```


