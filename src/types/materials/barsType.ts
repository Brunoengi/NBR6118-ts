export type SteelBarKeyValue = '5' | '6.3' | '8' | '10' | '12.5' | '16' | '20' | '22' | '25' | '32' | '40'
export type SteelBarValue = 5 | 6.3 | 8 | 10 | 12.5 | 16 | 20 | 22 | 25 | 32 | 40

export type SteelBarUnit = 'mm'

export interface SteelBar {
    value: SteelBarKeyValue;
    unit: SteelBarUnit;
} 

export interface BarPropertie {
    diameter: {
        value: SteelBarValue,
        unit: SteelBarUnit
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
