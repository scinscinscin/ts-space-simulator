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
        angular: [0.1, 0, -0.2, 0, 0.1, 0],
        linear: [1, 1, 1, 1, 1, 1],
        //linear: [0, 0, 0, 0, 0, 0],
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

    for (let i = 0; i < 4; i++) {
        console.log("Calculating for iteration", i);
        rocket.calculateNext(planets);
        rocket.getCurrentTrajectory().printToConsole();
    }
}

main();
