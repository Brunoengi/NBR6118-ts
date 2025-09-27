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

export interface GeometricPropsWithUnitsType {
    A: {
        value: number;
        unit: 'cm²';
    },
    Sx: {
        value: number;
        unit: 'cm³';
    }
    Sy: {
        value: number;
        unit: 'cm³';
    };
    Ix: {
        value: number;
        unit: 'cm⁴';
    };
    Iy: {
        value: number;
        unit: 'cm⁴';
    };
    Ixy: {
        value: number;
        unit: 'cm⁴';
    };
    Xg: {
        value: number;
        unit: 'cm';
    
    },
    Yg: {
        value: number;
        unit: 'cm';
    };
    Ixg: {
        value: number;
        unit: 'cm⁴';
    };
    Iyg: {
        value: number;
        unit: 'cm⁴';
    };
    Ixyg: {
        value: number;
        unit: 'cm⁴';
    };
    Xmax: {
        value: number;
        unit: 'cm';
    };
    Ymax: {
        value: number;
        unit: 'cm';
    };
    Xmin: {
        value: number;
        unit: 'cm';
    };
    Ymin: {
        value: number;
        unit: 'cm';
    };
    height: {
        value: number;
        unit: 'cm';
    };
    base: {
        value: number;
        unit: 'cm';
    };
    Y1: {
        value: number;
        unit: 'cm';
    };
    Y2: {
        value: number;
        unit: 'cm';
    };
    W1: {
        value: number;
        unit: 'cm';
    };
    W2: {
        value: number;
        unit: 'cm';
    };
}

