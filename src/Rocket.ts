import { Planet } from "./Planet";
import { TrajectoryBody } from "./TrajectoryBody";
import { TrajectoryData } from "./TrajectoryData";
import { Tuple } from "./Tuple";

export interface RocketParameters {
    exhaustVelocity?: number; // exhaust velocity of the rocket's gases in m/s
    fuelBurnRate?: number; // fuel burn rate in kg/s
    maxTorque?: number; // maximum torque that the rocket can apply
}

export interface ThrustKeys {
    linear: Tuple[] | number[];
    angular: Tuple[] | number[];
}

export class Rocket extends TrajectoryBody {
    private fuelMass: number;
    public getFuelOnBoard = () => this.fuelMass;
    public readonly exhaustVelocity: number;
    public readonly fuelBurnRate: number;
    public readonly maxTorque: number;
    public readonly linearThrustKeys: Tuple[];
    public readonly angularThrustKeys: Tuple[];

    constructor(
        startingTrajectoryData: TrajectoryData,
        length: number,
        public readonly shipMass: number, // mass of the ship in kg
        rocketParams: RocketParameters,
        thrustKeys: ThrustKeys
    ) {
        super(startingTrajectoryData, length);
        this.exhaustVelocity = rocketParams.exhaustVelocity ?? 100; // default to 100m
        this.fuelBurnRate = rocketParams.fuelBurnRate ?? 10; // default to 10kg/s
        this.maxTorque = rocketParams.maxTorque ?? 200; // default to 200 kg * m^2 / s^2 * rad

        this.linearThrustKeys = thrustKeyIsSimple(thrustKeys.linear)
            ? Tuple.convertSimpleKeysToLerpable(thrustKeys.linear)
            : thrustKeys.linear;

        this.angularThrustKeys = thrustKeyIsSimple(thrustKeys.angular)
            ? Tuple.convertSimpleKeysToLerpable(thrustKeys.angular)
            : thrustKeys.angular;

        this.fuelMass = startingTrajectoryData.mass - shipMass;
        if (this.fuelMass < 0) {
            throw new Error("Negative fuel mass error");
        }
    }

    getThrust(): Tuple {
        if (this.fuelMass === 0) return Tuple.Zero; // rockets don't generate thrust when they are out of fuel lmao
        const direction = Tuple.dirFromAngle(this.current_tdata.angle);
        const thrustKey = this.getKeyAtTime(this.simulationSecond, "linear");

        // F = m * a
        // F = m * (dv / dt) = dp / dt = v * (dm / dt)
        // take into consideration thrust key
        const force = this.exhaustVelocity * this.fuelBurnRate * thrustKey;

        return direction.multiply(force);
    }

    override getCurrentForces(planets: Planet[]): Tuple {
        let netForce = Tuple.Zero;
        netForce = netForce.add(this.getGravity(planets));
        netForce = netForce.add(this.getThrust());
        return netForce;
    }

    // torque in the program also serves as angular momentum
    // this returns in the units kg * m^2 / s^2 * rad
    override getCurrentTorques() {
        const percentage = this.getKeyAtTime(this.simulationSecond, "angular");
        const force = this.maxTorque * percentage; // force applied based on key
        let torque = (force * Math.sin(Math.PI / 2) * this.length) / 2;
        return torque;
    }

    // this returns in the units of kg * m^2
    override getInertia() {
        // inertia of thin uniform rotating rod is 1/12 * M * L^2
        const inertia =
            (this.current_tdata.mass * Math.pow(this.length, 2)) / 12;
        return inertia;
    }

    override updateMass() {
        if (this.fuelMass === 0) return; // don't update if the fuel is already empty

        const thrustAtTime = this.getKeyAtTime(this.simulationSecond, "linear");
        const angularThrustAtTime = this.getKeyAtTime(
            this.simulationSecond,
            "angular"
        );
        const fuelLoss =
            this.fuelBurnRate * (thrustAtTime + angularThrustAtTime * 0.1);

        this.fuelMass = this.fuelMass - fuelLoss;
        if (this.fuelMass < 0) this.fuelMass = 0;
        this.current_tdata.mass = this.fuelMass + this.shipMass;
    }

    getKeyAtTime(time: number, type: "linear" | "angular"): number {
        time = time - 1; // simulationSecond is 1 by default
        const keys =
            type === "linear" ? this.linearThrustKeys : this.angularThrustKeys;
        let cache: number = keys[0].y;

        for (const key of keys) {
            if (key.x <= time) cache = key.y;
            else break;
        }

        return cache;
    }
}

function thrustKeyIsSimple(a: ThrustKeys["linear"]): a is number[] {
    if (a[0] instanceof Tuple) return false;
    if (typeof a[0] === "number") return true;
    else throw new Error("Thrust key element is neither number or tuple");
}
