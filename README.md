# NBR 6118-ts

A TypeScript library for structural engineering calculations based on the Brazilian standard NBR 6118/2023. This project provides classes for modeling and calculating properties of concrete, steel, load combinations, and prestressing design.

## Installation

```bash
npm install nbr6118-ts

# or clone the repository:
git clone https://github.com/your-username/nbr6118-ts.git
cd nbr6118-ts
npm install
```

## Getting Started

### Module 1: Materials

Here you can create your material and verify your properties

#### `1.1 Concrete`

```typescript
import Concrete from './src/buildingElements/Concrete.js';

// 1. Define Materials and Geometry
const concrete = new Concrete({
  fck: { value: 3.5, unit: 'kN/cm²' },
  aggregate: 'granite',
  section: { type: 'rectangular' }
});
```

Calculates properties of concrete based on its characteristic.

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


#### `1.2 Steel`

```typescript
import Steel from './src/buildingElements/Steel.js';

// 1. Define Materials and Geometry
const steel = new Steel('CA 50');
```

## Running Tests

To run the test suite, use the following command:

```bash
npm test
```
