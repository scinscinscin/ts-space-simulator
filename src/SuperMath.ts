export const SuperMath = {
    ...Math, // extend the native math object
    magnitude: (a: number, b: number) => {
        const sum = a * a + b * b;
        return Math.sqrt(sum);
    },
    radToDeg: (rad: number) => (rad * 180) / Math.PI,
    degToRad: (deg: number) => (deg * Math.PI) / 180,
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
};
