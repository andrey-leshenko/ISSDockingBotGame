# Write a Bot to Dock to the ISS

SpaceX have released [iss-sim.spacex.com](https://iss-sim.spacex.com/),
a graphical simulation that lets you manually pilot a spacecraft and dock it to the International Space Station.

This project lets you write your own bot in JavaScript that will pilot the spacecraft automatically,
no complex setup required.

Your task is to implemented a control function that receives the position and rotation of the spacecraft,
and returns acceleration commands to be executed. Your function will be used to pilot the vehicle in the simulation.

## Getting Started

1. Got to [iss-sim.spacex.com](https://iss-sim.spacex.com/)
2. Open the browser's JavaScript console, and paste in `console.log("hello world!")`
3. A code editor with a skeleton for a bot will open. There are buttons to run the bot you have written, and to restart the simulation.

## Implementation Details

When a user inserts the JavaScript code into the simulation website:

1. It places a hook on the `render` function, which does a single step of the simulation (in addition to rendering).
   On each simulation step, this hook reads the current position and rotation of the spacecraft and passes it to the `calculateControl` function that the user implements.
   Then, it executes each of the control commands that the bot returned.
2. Opens an instance of the [Ace text editor](https://ace.c9.io/), and sets it up for editing the `calculateControl` function.
   Most of the code there deals with the graphical display of the editor window and its various functions.

## Credits

- Thanks for SpaceX for making this cool simulation.
- Thanks for Daniils Petrovs who wrote an [autopilot bot in clojure](https://github.com/DaniruKun/spacex-iss-docking-sim-autopilot),
  which inspired me to do this project.
