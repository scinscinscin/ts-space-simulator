import { Planet } from "./Planet";
import { SuperMath } from "./SuperMath";
import { LerpableTuples, TrajectoryData } from "./TrajectoryData";
import { Tuple } from "./Tuple";
import { UniversalConstant } from "./UniversalConstants";

export class TrajectoryBody {
    public simulationSecond = 1;
    public simulationResolution = 1;

    public readonly length: number;

    protected current_tdata: TrajectoryData;
    protected overallTrajectory: TrajectoryData[] = [];
    public getCurrentTrajectory = () => this.current_tdata;
    public getOverallTrajectory = () => this.overallTrajectory;

    constructor(startingTrajectroryData: TrajectoryData, length: number) {
        this.current_tdata = startingTrajectroryData;
        this.overallTrajectory.push(startingTrajectroryData.clone());
        this.length = length;
    }

    calculateNext(planets: Planet[]) {
        // angular
        let torque = SuperMath.radToDeg(this.getCurrentTorques()); // kg * deg * m^2 / s^2
        // torque actually equals angular momentum here because the timespan of the turn occurs over 1 second
        // let L = angular momentum whose units is kg * rad * m^2 / s
        // torque = dL / dt = (L - L0) / (t - t0) = (L - 0) / (1s)
        // torque * 1 second = L
        const inertia = this.getInertia(); // kg * m^2
        const newAngularVelocity =
            this.current_tdata.angularVelocity + torque / inertia;
        const newAngle = this.current_tdata.angle + newAngularVelocity;

        this.current_tdata.torque = torque;
        this.current_tdata.angularVelocity = newAngularVelocity;
        this.current_tdata.angle = newAngle;

        // linear
        const force = this.getCurrentForces(planets);
        const acceleration = force.divide(this.current_tdata.mass);
        const newVelocity = this.current_tdata.velocity.add(acceleration);
        const newPos = this.current_tdata.position.add(newVelocity);

        this.updateMass();

        this.current_tdata.force = force;
        this.current_tdata.acceleration = acceleration;
        this.current_tdata.velocity = newVelocity;
        this.current_tdata.position = newPos;

        this.overallTrajectory.push(this.current_tdata.clone());
        this.simulationSecond++;
    }

    getCurrentForces(planets: Planet[]) {
        let netForce = Tuple.Zero;
        netForce = netForce.add(this.getGravity(planets));
        return netForce;
    }

    getCurrentTorques() {
        return 0;
    }

    getInertia() {
        return 1;
    }

    getGravity(planets: Planet[]) {
        let netForce = Tuple.Zero;

        for (const planet of planets) {
            // f = G * (m1 * m2) / r^2

            const displacement = planet.current_tdata.position.subtract(
                this.current_tdata.position
            );
            const sqrDistance = Math.pow(displacement.magnitude, 2);

            const scalarForce =
                (UniversalConstant.gconst *
                    this.current_tdata.mass *
                    planet.current_tdata.mass) /
                sqrDistance;

            const direction = displacement.normalize();
            netForce = netForce.add(direction.multiply(scalarForce));
        }

        return netForce;
    }

    getTrajectodyDataIndexAtTime(time: number) {
        if (time < 0) throw new Error("Negative time error");
        const totalTrajData = this.overallTrajectory.length - 1;

        const accurateIndex = time / this.simulationResolution;
        let preIndex = Math.floor(accurateIndex);
        let postIndex = Math.ceil(accurateIndex);
        let lerpValue = accurateIndex - preIndex;

        if (preIndex > totalTrajData || postIndex > totalTrajData) {
            // it is accessing out of range
            preIndex = totalTrajData;
            postIndex = totalTrajData;
            lerpValue = 1;
        }

        return { preIndex, postIndex, lerpValue };
    }

    getLerpableTupleAtTime(time: number, key: LerpableTuples): Tuple {
        const indexes = this.getTrajectodyDataIndexAtTime(time);

        const preKey = this.overallTrajectory[indexes.preIndex][key];
        const postKey = this.overallTrajectory[indexes.postIndex][key];
        return Tuple.lerp(preKey, postKey, indexes.lerpValue);
    }

    updateMass() {}
}
