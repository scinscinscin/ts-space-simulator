import { Planet } from "./Planet";
import { Rocket, RocketParameters, ThrustKeys } from "./Rocket";
import { TrajectoryData } from "./TrajectoryData";
import { Tuple } from "./Tuple";

function main() {
    const rocketInitTrajData = new TrajectoryData({
        mass: 1000,
        angle: 45,
    });

    const rocketParams: RocketParameters = {};
    const thrustKeys: ThrustKeys = {
        angular: Rocket.generateBlankThrustKeys(20, 0),
        linear: Rocket.generateBlankThrustKeys(20, 0),
    };

    const rocket = new Rocket(
        rocketInitTrajData,
        100, // length of the rocket
        400, // mass of the ship itself (fuel is 600kg)
        rocketParams, // rocket parameters
        thrustKeys // linear and angular thrust keys
    );

    const planetInitTrajData = new TrajectoryData({
        mass: 100000000000,
        position: new Tuple(0, -1000),
    });

    const planet = new Planet(planetInitTrajData, 25); // radius
    const planets: Planet[] = [planet];

    console.log("Initial trajectory data");
    rocket.getCurrentTrajectory().printToConsole();

    const simulationLength = rocket.linearThrustKeys.length;
    for (let i = 0; i < simulationLength; i++) {
        console.log("Calculating for iteration", i);
        rocket.calculateNext(planets);
        rocket.getCurrentTrajectory().printToConsole();
    }
}

main();
