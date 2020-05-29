//
// Control function stub
//

function calculateControl() { return [0, 0, 0, 0, 0, 0]; }


//
// Hooking logic
//

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
		window.__timestep,
	);

	window.__timestep += 1;

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


//
// Adding the code editor
//

// HTML

var editorHTML = `
<div class="bot-console">
	<div class="bot-header">
		Docking Bot!
		<div class="bot-button-group">
			<button id="bot-btn-deploy">Deploy code</button>
			<button id="bot-btn-restart">Restart simulation</button>
			<button id="bot-btn-minimize">Minimize Window</button>
		</div>
	</div>
	<pre id="bot-code-editor">hello world</pre>
</div>
`;

var root = document.createElement('div');
root.innerHTML = editorHTML;
document.body.appendChild(root);

// CSS

var editorCSS = `
.bot-console {
	width: 600px;
	height: 400px;
	position: absolute;
	top: 30px;
	left: 30px;
	z-index: 100;
	background-color: rgb(142, 142, 142);
}
.bot-header {
	padding-left: 30px;
	padding-top: 5px;
	color: white;
	font: 12px/20px Lato,Verdana,Arial,geneva,sans-serif;
	font-size: 14px;
}
.bot-button-group {
	display: inline-block;
	padding-left: 30px;
}
#bot-code-editor {
	height: 100%;
}`;

var style = document.createElement('style');
style.appendChild(document.createTextNode(editorCSS))
document.head.appendChild(style);

// JS

var script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11/ace.min.js";
script.onload = onEditorLoaded;
document.body.appendChild(script); //or something of the likes

//
// All other editor logic
//

function onEditorLoaded() {
	ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11');
	var editor = ace.edit("bot-code-editor");
	editor.session.setMode("ace/mode/javascript");
	editor.setTheme("ace/theme/dracula");
	editor.setValue(startBotCode, -1);
	window.editor = editor;

	var buttonDeploy = document.getElementById('bot-btn-deploy');
	var buttonRestart = document.getElementById('bot-btn-restart');
	var buttonMinimize = document.getElementById('bot-btn-minimize');

	function deployCode() {
		// http://perfectionkills.com/global-eval-what-are-the-options/
		window.eval(editor.getValue());
	}

	function resetPositionWithoutAnimation() {
		// This is a re-implementation of SpaceX's resetPosition, but without
		// the 5 second animation.
		resetMovement(),
		motionVector.set(0, 0, 0);
		translationVector.set(0, 0, 0);
		camera.position.set(12, 30, 50);
		camera.rotation.set(-20 * toRAD, -10 * toRAD, 15 * toRAD);
	}

	buttonDeploy.addEventListener('click', function() {
		deployCode();
	});

	buttonRestart.addEventListener('click', function() {
		deployCode();
		resetPositionWithoutAnimation();
		window.__timestep = 0;
	});

	buttonMinimize.addEventListener('click', function() {
		console.log('Minimize!');
	});
}

startBotCode = `
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

	if (time === 0)
		rotPitch = POSITIVE_LARGE;

	// Return the control commands you want executed
	return [moveX, moveY, moveZ, rotYaw, rotPitch, rotRoll];
}
`;
