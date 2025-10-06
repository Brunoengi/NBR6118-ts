import { GeometricPropsWithUnitsType, GeometricPropsType, GeometricPropsWithoutPerimeterType } from "types/sectionsType.js"
import { IBidimensionalPoint } from "geometric-props"
import { GeometricProps } from "geometric-props"
import { Distance } from "types/index.js"

abstract class AbstractSection {
    public readonly props: GeometricPropsWithUnitsType
    public readonly points: IBidimensionalPoint[]

    constructor(points: IBidimensionalPoint[]) {
        this.points = points
        this.props = { ...this.setProperties(new GeometricProps(points)), perimeter: this.calculatePerimeter() }
    }

    setProperties(geometricPropClass: GeometricPropsType): Omit<GeometricPropsWithUnitsType, 'perimeter'> {
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
                unit: 'cm³'
            },
            W2: {
                value: geometricPropClass.W2,
                unit: 'cm³'
            }
        }
    }

    setProperties_upperHorizontaLine({ points, yLine }: { points: IBidimensionalPoint[], yLine: Distance }): GeometricPropsWithoutPerimeterType {
        const yValue = yLine.value;
        const originalPoints = points.slice(0, -1); // Remove o ponto de fechamento duplicado

        // Se todos os pontos estiverem acima da linha, retorna as propriedades originais
        const allPointsAbove = originalPoints.every(p => p.y >= yValue);
        if (allPointsAbove) {
            return this.setProperties(new GeometricProps(points));
        }

        const upperPoints: IBidimensionalPoint[] = [];

        for (let i = 0; i < originalPoints.length; i++) {
            const p1 = originalPoints[i];
            const p2 = originalPoints[(i + 1) % originalPoints.length];

            const p1_above = p1.y >= yValue;
            const p2_above = p2.y >= yValue;

            if (p1_above) {
                upperPoints.push(p1);
            }

            // Se a aresta (p1, p2) cruza a linha yValue
            if (p1_above !== p2_above) {
                // Evita divisão por zero se a linha for horizontal
                if (p2.y - p1.y !== 0) {
                    const x_intersect = p1.x + (p2.x - p1.x) * (yValue - p1.y) / (p2.y - p1.y);
                    upperPoints.push({ x: x_intersect, y: yValue });
                }
            }
        }

        if (upperPoints.length > 0) {
            upperPoints.push(upperPoints[0]); // Fecha o polígono
            return this.setProperties(new GeometricProps(upperPoints));
        }
        return this.setProperties(new GeometricProps([])); // Retorna propriedades zeradas se não houver pontos
    }

    calculatePerimeter(): Distance {
        const points = this.points;
        let perimeter = 0;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            perimeter += Math.sqrt(dx * dx + dy * dy);
        }

        return {
            value: perimeter,
            unit: 'cm'
        };
    }
}

export default AbstractSection