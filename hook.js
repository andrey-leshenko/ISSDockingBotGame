// Thrust types
NEGATIVE_LARGE = -2;
NEGATIVE_SMALL = -1;
NONE = 0;
POSITIVE_SMALL = 1;
POSITIVE_LARGE = 2;

//
// This function is called on each simulation step.
//
// Input: The current position, rotation and time
// Output: The control commands
//

function calculateControl(
	posX,	// - forward		+ backward
	posY,	// - left			+ right
	posZ,	// - down			+ up
	yaw,	// - right			+ left
	pitch,	// - down			+ up
	roll,	// - CW				+ CCW
	yawRate,
	pitchRate,
	rollRate,
	time)	// in simulation steps, starts from 0
{
	var moveX		= NONE;
	var moveY		= NONE;
	var moveZ		= NONE;
	var rotYaw		= NONE;
	var rotPitch	= NONE;
	var rotRoll		= NONE;

	// Your control code
	
	function pid(t, dt, kp, kd) {
		var res = kp * t + kd * dt;
		if (res > 0)
			return NEGATIVE_SMALL;
		else
			return POSITIVE_SMALL;
	}

	rotYaw = pid(yaw, yawRate, 1, -3);
	rotPitch = pid(pitch, pitchRate, 1, -3);
	rotRoll = pid(roll, rollRate, 1, -3);

	var dx = posX - window.lastX;
	var dy = posY - window.lastY;
	var dz = posZ - window.lastZ;

	window.lastX = posX;
	window.lastY = posY;
	window.lastZ = posZ;

	//if (Math.abs(yaw) + Math.abs(pitch) + Math.abs(roll) < 0.5) {
		moveX = pid(posX + 0.2, dx, 1, 300);
		moveY = pid(posY, dy, 1, 50);
		moveZ = pid(posZ, dz, 1, 50);
	//}

	// Return the control commands you want executed
	return [moveX, moveY, moveZ, rotYaw, rotPitch, rotRoll];
}


//
// Hooking logic. No need to change this!
//

if (!window.__render) {
	window.__render = window.render;
	window.__timestep = 0;

	window.render = function() {
		var control = calculateControl(
			(camera.position.z - issObject.position.z),
			(camera.position.x - issObject.position.x),
			(camera.position.y - issObject.position.y),
			fixedRotationY,
			fixedRotationX,
			fixedRotationZ,
			.1 * rateRotationY,
			.1 * rateRotationX,
			.1 * rateRotationZ,
			window.__timestep += 1,
		);

		controlFunctions = [
			[translateForward, translateBackward],
			[translateLeft, translateRight],
			[translateDown, translateUp],
			[yawRight, yawLeft],
			[pitchDown, pitchUp],
			[rollRight, rollLeft],
		]

		var i;
		for (i = 0; i < controlFunctions.length; i++) {
			if (Math.abs(control[i] == 2)) {
				updatePrecision('rotation');
				updatePrecision('position');
			}
			if (control[i] == -2 || control[i] == -1) {
				controlFunctions[i][0]();
			}
			else if (control[i] == 2 || control[i] == 1) {
				controlFunctions[i][1]();
			}
			if (Math.abs(control[i]) == 2) {
				resetPrecision();
			}
		}

		window.__render();
	};
}
