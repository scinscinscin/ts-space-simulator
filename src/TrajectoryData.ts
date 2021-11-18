import { Tuple } from "./Tuple";

// list of properties of TrajectoryData class whos type are Tuples
export type LerpableTuples = "position" | "velocity" | "acceleration";

export interface TrajectoryDataParameters {
    mass: number;
    position?: Tuple;
    velocity?: Tuple;
    acceleration?: Tuple;
    force?: Tuple;
    angle?: number;
    angularVelocity?: number;
    torque?: number;
}

export class TrajectoryData {
    public mass: number;
    public position: Tuple;
    public velocity: Tuple;
    public acceleration: Tuple;
    public force: Tuple;
    public angle: number;
    public angularVelocity: number;
    public torque: number;

    constructor(data: TrajectoryDataParameters) {
        this.mass = data.mass;
        this.position = data.position ?? Tuple.Zero;
        this.velocity = data.velocity ?? Tuple.Zero;
        this.acceleration = data.acceleration ?? Tuple.Zero;
        this.force = data.force ?? Tuple.Zero;
        this.angle = data.angle ?? 0;
        this.angularVelocity = data.angularVelocity ?? 0;
        this.torque = data.torque ?? 0;
    }

    dump(): TrajectoryDataParameters {
        return {
            mass: this.mass,
            position: this.position,
            velocity: this.velocity,
            acceleration: this.acceleration,
            force: this.force,
            angle: this.angle,
            angularVelocity: this.angularVelocity,
            torque: this.torque,
        };
    }

    clone() {
        return new TrajectoryData(this.dump());
    }

    printToConsole() {
        console.log("Mass: " + this.mass);
        console.log("Force:        " + this.force.ToString());
        console.log("Acceleration: " + this.acceleration.ToString());
        console.log("Velocity:     " + this.velocity.ToString());
        console.log("Position:     " + this.position.ToString());
        console.log("Angle: " + this.angle + " deg");
        console.log("Angular Velocity: " + this.angularVelocity + " deg/sec");
        console.log("Torque: " + this.torque + " kg * deg * m^2 / s^2");
        console.log("");
    }
}
