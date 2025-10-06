export interface GeometricPropsType {
    A: number;
    Sx: number;
    Sy: number;
    Ix: number;
    Iy: number;
    Ixy: number;
    Xg: number;
    Yg: number;
    Ixg: number;
    Iyg: number;
    Ixyg: number;
    Xmax: number;
    Ymax: number;
    Xmin: number;
    Ymin: number;
    height: number;
    base: number;
    Y1: number;
    Y2: number;
    W1: number;
    W2: number;
}

export interface A {
    value: number;
    unit: 'cm²';
}

export interface Xg {
    value: number;
    unit: 'cm';
}

export interface Yg {
    value: number;
    unit: 'cm';
}

export interface Ixg {
    value: number;
    unit: 'cm⁴';
}

export interface Iyg {
    value: number;
    unit: 'cm⁴';
}

export interface Ix {
    value: number;
    unit: 'cm⁴';
}

export interface Iy {
    value: number;
    unit: 'cm⁴';
}

export interface Ixy {
    value: number;
    unit: 'cm⁴';
}

export interface Ixyg {
    value: number;
    unit: 'cm⁴';
}

export interface Xmax {
    value: number;
    unit: 'cm';
}

export interface Ymax {
    value: number;
    unit: 'cm';
}

export interface Xmin {
    value: number;
    unit: 'cm';
}

export interface Ymin {
    value: number;
    unit: 'cm';
}

export interface height {
    value: number;
    unit: 'cm';
}

export interface base {
    value: number;
    unit: 'cm';
}

export interface Y1 {
    value: number;
    unit: 'cm';
}

export interface Y2 {
    value: number;
    unit: 'cm';
}

export interface W1 {
    value: number;
    unit: 'cm³';
}

export interface W2 {
    value: number;
    unit: 'cm³'
}

export interface Sx {
    value: number;
    unit: 'cm³';
}

export interface Sy {
    value: number;
    unit: 'cm³';
}

export interface Perimeter {
    value: number;
    unit: 'cm';
}

export interface GeometricPropsWithUnitsType {
    A: A,
    perimeter: Perimeter, 
    Sx: Sx,
    Sy: Sy,
    Ix: Ix,
    Iy: Iy,
    Ixy: Ixy,
    Xg: Xg,
    Yg: Yg,
    Ixg: Ixg,
    Iyg: Iyg,
    Ixyg: Ixyg,
    Xmax: Xmax
    Ymax: Ymax,
    Xmin: Xmin
    Ymin: Ymin,
    height: height
    base: base,
    Y1: Y1,
    Y2: Y2,
    W1: W1,
    W2: W2
}

export interface GeometricPropsWithoutPerimeterType extends Omit<GeometricPropsWithUnitsType, 'perimeter'> {}
