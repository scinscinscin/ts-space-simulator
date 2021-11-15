import { TrajectoryBody } from "./TrajectoryBody";
import { TrajectoryData } from "./TrajectoryData";

export class Planet extends TrajectoryBody {
    public readonly radius: number;
    constructor(startingTrajectoryData: TrajectoryData, radius: number) {
        super(startingTrajectoryData, radius * 2);
        this.radius = radius;
    }

    override getInertia() {
        // moment of inertia of a solid sphere of uniform mass density r about an axis through its center.
        // I = 2/5 * M * R^2
        const inertia =
            0.4 * this.current_tdata.mass * Math.pow(this.radius, 2);
        return inertia;
    }
}
