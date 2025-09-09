## Project for calculating properties of steel, concrete and others based on NBR 6118/2023

All properties:

| Concrete Properties                                                      | Acronym               | Unit    |
| :---                                                                     | :---:                 | :---:   |
| Ultimate strain                                                           | &epsilon;<sub>u</sub> | ‰       |
| Rupture strain                                                            | &epsilon;<sub>0</sub> | ‰       |
| Characteristic compressive strength                                       | f<sub>ck</sub>        | MPa     |
| Longitudinal Modulus of Elasticity                                        | E<sub>c</sub>         | MPa     |
| Secant Modulus of Elasticity                                              | E<sub>cs</sub>        | MPa     |
| Direct tensile strength                                                   | f<sub>ct</sub>        | MPa     |
| Mean tensile strength                                                     | f<sub>ct,m</sub>      | MPa     |
| Flexural tensile strength                                                 | f<sub>ct,f</sub>      | MPa     |
| Characteristic lower bound tensile strength                               | f<sub>ctk,inf</sub>   | MPa     |
| Characteristic upper bound tensile strength                               | f<sub>ctk,sup</sub>   | MPa     |




| Aggregate Properties                                                                   | Acronym               | Unit    |
| :---                                                                                   | :---:                 | :---:   |
| Parameter depending on the type of aggregate that influences the modulus of elasticity | α<sub>E</sub>         | -       |


### Example:

```
const aggregate = new AgregateConcrete("granite")
const concrete = new Concrete(30, aggregate)

console.log("Concrete properties:")
console.log(`fck: ${concrete.fck.value} MPa`)
console.log(`fcm: ${concrete.fcm.value} MPa`)
console.log(`Ec: ${concrete.Ec.value} MPa`)
console.log(`Ecs: ${concrete.Ecs.value} MPa`)
console.log(`e0: ${concrete.e0.value} ‰`)
console.log(`eu: ${concrete.eu.value} ‰`)
console.log(`fctm: ${concrete.fctm.value} MPa`)
console.log(`fctk_inf: ${concrete.fctk_inf.value} MPa`)
console.log(`fctk_sup: ${concrete.fctk_sup.value} MPa`)
console.log(`Aggregate type: ${concrete.agregate.type}`)
console.log(`Aggregate alpha_e: ${concrete.agregate.alpha_e}`)
```

