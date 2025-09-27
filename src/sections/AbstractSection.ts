import { GeometricPropsWithUnitsType, GeometricPropsType } from "types/sectionsType.js"
import { IBidimensionalPoint } from "geometric-props"
import { GeometricProps } from "geometric-props"


abstract class AbstractSection {
    public readonly props: GeometricPropsWithUnitsType
    public readonly points: IBidimensionalPoint[]

    constructor(points: IBidimensionalPoint[]) {
        this.points = points
        this.props = this.setProperties(new GeometricProps(points))
    
    }

    setProperties(geometricPropClass: GeometricPropsType): GeometricPropsWithUnitsType {
        return {
            A: {
                value: geometricPropClass.A,
                unit: 'cm²'
            },
            Sx: {
                value: geometricPropClass.Sx,
                unit: 'cm³'
            },
            Sy: {
                value: geometricPropClass.Sy,
                unit: 'cm³'
            },
            Ix: {
                value: geometricPropClass.Ix,
                unit: 'cm⁴'
            },
            Iy: {
                value: geometricPropClass.Iy,
                unit: 'cm⁴'
            },
            Ixy: {
                value: geometricPropClass.Ixy,
                unit: 'cm⁴'
            },
            Xg: {
                value: geometricPropClass.Xg,
                unit: 'cm'

            },
            Yg: {
                value: geometricPropClass.Yg,
                unit: 'cm'
            },
            Ixg: {
                value: geometricPropClass.Ixg,
                unit: 'cm⁴'
            },
            Iyg: {
                value: geometricPropClass.Iyg,
                unit: 'cm⁴'
            },
            Ixyg: {
                value: geometricPropClass.Ixyg,
                unit: 'cm⁴'
            },
            Xmax: {
                value: geometricPropClass.Xmax,
                unit: 'cm'
            },
            Ymax: {
                value: geometricPropClass.Ymax,
                unit: 'cm'
            },
            Xmin: {
                value: geometricPropClass.Xmin,
                unit: 'cm'
            },
            Ymin: {
                value: geometricPropClass.Ymin,
                unit: 'cm'
            },
            height: {
                value: geometricPropClass.height,
                unit: 'cm'
            },
            base: {
                value: geometricPropClass.base,
                unit: 'cm'
            },
            Y1: {
                value: geometricPropClass.Y1,
                unit: 'cm'
            },
            Y2: {
                value: geometricPropClass.Y2,
                unit: 'cm'
            },
            W1: {
                value: geometricPropClass.W1,
                unit: 'cm'
            },
            W2: {
                value: geometricPropClass.W2,
                unit: 'cm'
            }
        }
    }

}

export default AbstractSection