import { Tuple } from "./Tuple";

export const SuperMath = {
    ...Math, // extend the native math object
    magnitude: (a: number, b: number) => {
        const sum = a * a + b * b;
        return Math.sqrt(sum);
    },
    radToDeg: (rad: number) => (rad * 180) / Math.PI,
    degToRad: (deg: number) => (deg * Math.PI) / 180,
    lerp: (a: number, b: number, t: number) => a + (b - a) * t,
    epsilonRound: (a: number, b: number) => {
        const places = Math.pow(10, b);
        return Math.round(a * places + Number.EPSILON) / places;
    },

    /**
     * How collision detection works:
     * It's a system of equations between a circle and a line (This is only applicable of the rocket is not moving in a vertical line)
     * y = mx + b						// where m is the slope and b is the y-intercept of the line
     * r^2 = (x-h)^2 + (y-k)^2			// where r is the radius of the planet and (h, k) are the coordinates of the center
     *
     * To make life easier, the coordinates of the rocket will be taken relative to the planet, thus the y-intercept of the line equation is set to 0
     * If we combine both equations, we get:
     * r^2 = (x-h)^2 + (mx-k)^2												// substitution
     * r^2 = (x^2 - 2hx + h^2) + (m^2 * x^2 - 2mkx + k^2)					// expansion
     * 0 = (x^2 + m^2 * x^2) + (-2hx - 2mkx) + (h^2 + k^2 - r^2)			// organization
     * 0 = (m^2 + 1) * x^2 + (-2h - 2mk) * x + (h^2 + k^2 - r^2)			// factorization
     *
     * Thus we can get the values of x where the line intersects with the circumference of the circle using the quadratic formula where:
     * a = (m^2 + 1)
     * b = -2h - 2mk
     * c = h^2 + k^2 - r^2
     *
     * As JavaScript does not have support for imaginary numbers, we should only perform collision detection if the discriminant is
     * not negative as this means that there are atleast 1 intersections
     *
     * The quadratic formula = (-b - (s * sqrt(b^2 - 4 * a * c))) / 2a is used, which is a modification of the original quadratic formula
     * where s is the sign of the change in x-coordinate. s is -1 if the rocket is moving the left and +1 if moving to the right
     * The reason why the minus sign is used as a default is because the vertex of the parabola lies between the x values of the two intersections
     * Thus if the rocket is travelling to the right (s is positive) then the closer intersection is the one on the left, subtraction must be performed
     * On the contrary, if the rocket is travelling to the left (s is negative), then the closer intersection is the one on the right, addition must be performed
     *
     * It is also important to note that it is possible to generate values of x even there is no actual intersection as the slope does not contain
     * data about the directionality of travel of the rocket. For example, travelling to the top right and bottom left yield the same slope
     * Thus we have to check if the generated x value lies between on the correct side of the plane
     */

    // prettier-ignore
    collisionDetection: (
		absoluteRocketPos: Tuple,
        velocity: Tuple,
        absolutePlanetPos: Tuple,
        planetRadius: number
	) => {
		const slope = velocity.y / velocity.x;
        const relativePlanetPosition = absolutePlanetPos.subtract(absoluteRocketPos);

        let intersectionTuple: Tuple | undefined; // x-coordinate relative to the rocket where the intersection took place

        if (slope !== Infinity && slope !== -1 * Infinity) {
			// A, B, C are coefficients of the quadratic equation Ax^2 + Bx + C
			const A = Math.pow(slope, 2) + 1;
			const B = -2 * relativePlanetPosition.x - 2 * slope * relativePlanetPosition.y;
			const C = Math.pow(relativePlanetPosition.x, 2) + Math.pow(relativePlanetPosition.y, 2) - Math.pow(planetRadius, 2);
			
			const xsign = Math.sign(velocity.x);
			const discriminant = Math.pow(B, 2) - 4 * A * C;
			
			// do not compute for imaginary roots
			if(discriminant >= 0){
				let intersection = (-1 * B - (xsign * Math.sqrt(discriminant))) / (2 * A);
				intersection = SuperMath.epsilonRound(intersection, 6); // remove any floating point weirdness

				if(
					(xsign === 1 && intersection > 0) && // rocket is moving to the right therefore intersection should be on the right side
					(intersection <= velocity.x) // check that the intersection is between the x-velocity
				) intersectionTuple = new Tuple(intersection, intersection * slope);
				
				if(
					(xsign === -1 && intersection < 0) && // rocket is moving to the left therefore intersection should be on the left
					(intersection >= velocity.x) // check that the intersection is between the x-velocity 
				) intersectionTuple = new Tuple(intersection, intersection * slope);
			}
		} else {
			// there can only be a vertical collision if the relative x-position of the planet to the rocket is 0 
            if(relativePlanetPosition.x === 0){
				const ysign = Math.sign(velocity.y); // +1 if the rocket is moving up, -1 if the rocket is moving down
				let intersection = -1 * ysign * planetRadius + relativePlanetPosition.y;
				intersection = SuperMath.epsilonRound(intersection, 6); // remove any floating point weirdness 
				if(intersection === -0) intersection = 0;

				if(
					(ysign === 1 && intersection >= 0) && // rocket is moving up therefore intersection should be greater than 0
					(intersection <= velocity.y) // check that the intersection is between the y-velocity
				) intersectionTuple = new Tuple(0, intersection);

				if(
					(ysign === -1 && intersection <= 0) && // rocket is moving down therefore intersection should be lesser than 0
					(intersection >= velocity.y) // check that the intersection is between the y-velocity
				) intersectionTuple = new Tuple(0, intersection);
			}
        }

        if(intersectionTuple !== undefined){
			const absoluteIntersection = absoluteRocketPos.add(intersectionTuple);
			console.log("Absolute intersection took place at: " + absoluteIntersection.ToString())
			return absoluteIntersection;
		}else{
			return undefined;
		}
	},
};
