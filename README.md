# Write a bot that plays SpaceX's ISS docking simulation

SpaceX have released [iss-sim.spacex.com](https://iss-sim.spacex.com/),
a graphical simulation that lets you manually pilot a spacecraft and dock it to the International Space Station.

This project lets you write your own bot in JavaScript that will pilot the spacecraft automatically,
no complex setup required.

Your task is to implemented a control function that receives the position and rotation of the spacecraft,
and returns acceleration commands to be executed. Your function will be used to pilot the vehicle in the simulation.

## Getting Started

1. Got to [iss-sim.spacex.com](https://iss-sim.spacex.com/)
2. Open the browser's JavaScript console, and **copy-paste in** the contents of [hook.js](https://raw.githubusercontent.com/andrey-leshenko/ISSDockingBotGame/master/hook.js).
3. A code editor with a skeleton for a bot will open. There are buttons to run the bot you have written, and to restart the simulation.

You are now ready to write your own docking bot!

_Suggestion: Read about PID controllers, a very simple and effective control theory tool._


![Bot editor screenshot](https://github.com/andrey-leshenko/ISSDockingBotGame/blob/master/screenshot.png)

## Example Bot

The file [example_bot.js](https://github.com/andrey-leshenko/ISSDockingBotGame/blob/master/example_bot.js)
contains a simple PID controller-based bot that successfully docks to the ISS.
Note that it still has a lot of space for improvement!

## Implementation Details

When a user inserts the JavaScript code into the simulation website:

1. It places a hook on the `render` function, which does a single step of the simulation (in addition to rendering).
   On each simulation step, this hook reads the current position and rotation of the spacecraft and passes it to the `calculateControl` function that the user implements.
   Then, it executes each of the control commands that the bot returned.
2. It opens an instance of the [Ace text editor](https://ace.c9.io/), and sets it up for editing the `calculateControl` function.
   Most of the code there deals with the graphical display of the editor window and its various functions.

## Credits

- Thanks for SpaceX for making this cool simulation.
- Thanks for Daniils Petrovs who wrote an [autopilot bot in clojure](https://github.com/DaniruKun/spacex-iss-docking-sim-autopilot),
  which inspired me to do this project.
