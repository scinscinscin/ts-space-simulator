import { SuperMath } from "./SuperMath";

export class Tuple {
    constructor(public readonly x: number, public readonly y: number) {}

    get magnitude(): number {
        return SuperMath.magnitude(this.x, this.y);
    }

    get angle(): number {
        // for some reason this actually can return if x is negative lmao
        const base = SuperMath.radToDeg(Math.atan(this.y / this.x));

        let pre: number;
        if (this.x > 0 && this.y > 0) pre = 0;
        else if (this.x > 0) pre = 360;
        else if (this.x !== 0 && this.y > 0) pre = 180;
        else if (this.x < 0 && this.y < 0) pre = 180;
        else pre = 0;

        let total = pre + base;

        // this is true if the tuple is along the y-axis
        if (Number.isNaN(total)) {
            if (this.y === 0) total = 0;
            else if (this.y > 0) total = 90;
            else if (this.y < 0) total = 180;
        }
        return total;
    }

    normalize = () => this.divide(this.magnitude);
    ToString = () => {
        return `[${this.x}, ${this.y}]`;
    };

    add = (b: Tuple) => new Tuple(this.x + b.x, this.y + b.y);
    subtract = (b: Tuple) => new Tuple(this.x - b.x, this.y - b.y);
    multiply = (b: number) => new Tuple(this.x * b, this.y * b);
    divide = (b: number) => new Tuple(this.x / b, this.y / b);

    static dirFromAngle = (theta: number): Tuple => {
        const radians = SuperMath.degToRad(theta);
        return new Tuple(Math.cos(radians), Math.sin(radians));
    };

    static lerp = (a: Tuple, b: Tuple, t: number) => {
        return new Tuple(
            SuperMath.lerp(a.x, b.x, t),
            SuperMath.lerp(a.y, b.y, t)
        );
    };

    static readonly Zero = new Tuple(0, 0);
    static readonly Up = new Tuple(0, 1);

    static convertSimpleKeysToLerpable(simpleKeys: number[]): Tuple[] {
        const response: Tuple[] = [];
        simpleKeys.forEach((a, index) => response.push(new Tuple(index, a)));
        return response;
    }
}
