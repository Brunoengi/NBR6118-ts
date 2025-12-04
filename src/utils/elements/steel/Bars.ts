import { A } from 'types/sectionsType.js'

export interface BarsProperties {
    diameter: {
        value: number,
        unit: 'mm'
    },
    sectionArea: {
        value: number,
        unit: 'cm²'
    },
    linearMass: {
        value: number,
        unit: 'kg/m'
    },
    perimeter: {
        value: number,
        unit: 'cm'
    }
}

class Bars {

    static readonly possibleBar: Record<string, BarsProperties> = {
        '5': {
            diameter: {
                value: 5,
                unit: 'mm'
            },
            sectionArea: {
                value: 0.196,
                unit: 'cm²'
            },
            linearMass: {
                value: 0.154,
                unit: 'kg/m'
            },
            perimeter: {
                value: 1.57,
                unit: 'cm'
            }
        },
        '6.3': {
            diameter: {
                value: 6.3,
                unit: 'mm'
            },
            sectionArea: {
                value: 0.312,
                unit: 'cm²'
            },
            linearMass: {
                value: 0.245,
                unit: 'kg/m'
            },
            perimeter: {
                value: 1.98,
                unit: 'cm'
            }
        },
        '8': {
            diameter: {
                value: 8,
                unit: 'mm'
            },
            sectionArea: {
                value: 0.503,
                unit: 'cm²'
            },
            linearMass: {
                value: 0.395,
                unit: 'kg/m'
            },
            perimeter: {
                value: 2.51,
                unit: 'cm'
            }
        },
        '10': {
            diameter: {
                value: 10,
                unit: 'mm'
            },
            sectionArea: {
                value: 0.785,
                unit: 'cm²'
            },
            linearMass: {
                value: 0.617,
                unit: 'kg/m'
            },
            perimeter: {
                value: 3.14,
                unit: 'cm'
            }
        },
        '12.5': {
            diameter: {
                value: 12.5,
                unit: 'mm'
            },
            sectionArea: {
                value: 1.227,
                unit: 'cm²'
            },
            linearMass: {
                value: 0.963,
                unit: 'kg/m'
            },
            perimeter: {
                value: 3.93,
                unit: 'cm'
            }
        },
        '16': {
            diameter: {
                value: 16,
                unit: 'mm'
            },
            sectionArea: {
                value: 2.011,
                unit: 'cm²'
            },
            linearMass: {
                value: 1.578,
                unit: 'kg/m'
            },
            perimeter: {
                value: 5.03,
                unit: 'cm'
            }
        },
        '20': {
            diameter: {
                value: 20,
                unit: 'mm'
            },
            sectionArea: {
                value: 3.142,
                unit: 'cm²'
            },
            linearMass: {
                value: 2.466,
                unit: 'kg/m'
            },
            perimeter: {
                value: 6.28,
                unit: 'cm'
            }
        },
        '22': {
            diameter: {
                value: 22,
                unit: 'mm'
            },
            sectionArea: {
                value: 3.801,
                unit: 'cm²'
            },
            linearMass: {
                value: 2.984,
                unit: 'kg/m'
            },
            perimeter: {
                value: 6.91,
                unit: 'cm'
            }
        },
        '25': {
            diameter: {
                value: 25,
                unit: 'mm'
            },
            sectionArea: {
                value: 4.909,
                unit: 'cm²'
            },
            linearMass: {
                value: 3.853,
                unit: 'kg/m'
            },
            perimeter: {
                value: 7.85,
                unit: 'cm'
            }
        },
        '32': {
            diameter: {
                value: 32,
                unit: 'mm'
            },
            sectionArea: {
                value: 8.042,
                unit: 'cm²'
            },
            linearMass: {
                value: 6.313,
                unit: 'kg/m'
            },
            perimeter: {
                value: 10.05,
                unit: 'cm'
            }
        },
        '40': {
            diameter: {
                value: 40,
                unit: 'mm'
            },
            sectionArea: {
                value: 12.566,
                unit: 'cm²'
            },
            linearMass: {
                value: 9.865,
                unit: 'kg/m'
            },
            perimeter: {
                value: 12.57,
                unit: 'cm'
            }
        }
    }
    readonly necessaryBars: Record<string, number>

    constructor({As}: {As: A}) {
        this.necessaryBars = this.calculateNecessaryBars(As);
    }

    calculateNecessaryBars(As: A){
        const areas = Object.values(Bars.possibleBar).map(bar => bar.sectionArea.value)
        const diameter = Object.values(Bars.possibleBar).map(bar => bar.diameter.value)
        const barNumber = areas.map(area => Math.ceil(As.value / area))
        return Object.fromEntries(diameter.map((diameter, index) => [diameter, barNumber[index]]))
    }
}

export default Bars;