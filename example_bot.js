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

var initialized = false;
var lastX;
var lastY;
var lastZ;

function calculateControl(
	posX,		// - forward		+ backward
	posY,		// - left			+ right
	posZ,		// - down			+ up
	yaw,		// - right			+ left
	pitch,		// - down			+ up
	roll,		// - CW				+ CCW
	yawRate,	// speed with which the yaw is changing
	pitchRate,	// speed with which the pitch is changing
	rollRate,	// speed with which the roll is changing
	time)		// in simulation steps, starts from 0
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

	var dx = posX - lastX;
	var dy = posY - lastY;
	var dz = posZ - lastZ;

	lastX = posX;
	lastY = posY;
	lastZ = posZ;

	if (!initialized) {
		dx = dy = dz = 0;
		initialized = true;
	}

	moveX = pid(posX + 0.2, dx, 1, 300);
	moveY = pid(posY, dy, 1, 50);
	moveZ = pid(posZ, dz, 1, 50);

	// Return the control commands you want executed
	return [moveX, moveY, moveZ, rotYaw, rotPitch, rotRoll];
}


