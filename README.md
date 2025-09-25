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
import Concrete from './src/buildingElements/Concrete.js'

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
import Steel from './src/buildingElements/Steel.js'

// 1. Define Materials and Geometry
const steel = new Steel('CA 50')

console.log(steel)
```
Property | Acronym | Unit | 
| :---------------------------- | :-----------: | :----: | 
| Steel Type Label | - | - | 
| Characteristic Yield Strength | fyk| kN/cm² | 
| Design Yield Strength | fyd| kN/cm² | 
 
#### `1.3 Aggregate`

```typescript
import Aggregate from './src/buildingElements/Aggregate.js';

const aggregate = new Aggregate('granite');
```

Provides properties for different types of concrete aggregates.

| Property                                                                             | Acronym       | Unit |
| :----------------------------------------------------------------------------------- | :-----------: | :--: |
| Parameter that influences the modulus of elasticity, based on the aggregate's origin | α<sub>E</sub> | -    |


#### `1.4 PrestressingSteel`

```typescript
import PrestressingSteel from './src/buildingElements/PrestressingSteel.js'

const prestressingSteel = new PrestressingSteel({ label: 'CP 190 RB 12.7' })

console.log(prepressingSteel)
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




## Running Tests

To run the test suite, use the following command:

```bash
npm test
```
