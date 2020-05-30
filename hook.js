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
	try {
		var control = window.calculateControl(
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

		if (!Array.isArray(control) || control.length != 6 || !control.every(function(x) { return [-2, -1, 0, 1, 2].indexOf(x) != -1; })) {
			throw 'calculateControl returned value with wrong format! ' + control;
		}

		window.dispatchEvent(new CustomEvent('calculated_control', { detail: control }));
	}
	catch (error) {
		console.error(error);
		var control = [0, 0, 0, 0, 0, 0];

		window.dispatchEvent(new CustomEvent('calculated_control', { detail: null }));
	}

	window.__timestep += 1;

	controlFunctions = [
		[translateForward, translateBackward],
		[translateLeft, translateRight],
		[translateDown, translateUp],
		[yawRight, yawLeft],
		[pitchDown, pitchUp],
		[rollRight, rollLeft],
	];

	var i;
	for (i = 0; i < controlFunctions.length; i++) {
		var highThrustMode = rotationPulseSize == 1 || translationPulseSize == 0.005;
		var highThrustRequired = Math.abs(control[i] == 2);
		var switchMode = highThrustMode != highThrustRequired;
		if (switchMode) {
			updatePrecision('rotation');
			updatePrecision('position');
		}
		if (control[i] == -2 || control[i] == -1) {
			controlFunctions[i][0]();
		}
		else if (control[i] == 2 || control[i] == 1) {
			controlFunctions[i][1]();
		}
		if (switchMode) {
			updatePrecision('rotation');
			updatePrecision('position');
		}
	}

	window.__render();
};


//
// Adding the code editor
// (code taken from editor_window_mock.html)
//

// HTML

var editorHTML = `
<div class="bot-editor-window">
	<div class="bot-header">
		ISS Docking Bot
		<button id="bot-btn-restart">Update & Restart</button>
		<button id="bot-btn-update">Update</button>
		<button id="bot-btn-minimize">&#x23BD;</button>
		<button id="bot-btn-maximize">&#x25AD;</button>
	</div>
	<pre id="bot-code-editor"></pre>
	<pre id="bot-output"></pre>
</div>
`;

var root = document.createElement('div');
root.innerHTML = editorHTML;
document.body.appendChild(root);

// CSS

var editorCSS = `
.bot-editor-window {
	position: absolute;
	display: flex;
	flex-flow: column;
	z-index: 100;

	background-color: rgb(142, 142, 142);
}

/* Different window sizes */
.bot-editor-window {
	top: 30px;
	left: 30px;
	width: 600px;
	height: 600px;
}
.bot-editor-window.maximized {
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}
.bot-editor-window.minimized {
	top: 30px;
	left: 30px;
	width: 600px;
	height: auto;
}

.bot-header {
	display: flex;
	justify-content: space-between;
	align-items: center;

	padding-left: 15px;
	padding-right: 5px;
	padding-top: 5px;
	padding-bottom: 5px;

	color: white;
	font: 12px/20px Lato,Verdana,Arial,geneva,sans-serif;
	font-size: 14px;	
}
.bot-header button {
	margin: 0 3px;
}
#bot-btn-restart {
	margin-left: 30px;
}
#bot-btn-minimize {
	margin-left: auto;
}

#bot-code-editor {
	height: 100%;
	margin: 0;
	flex-grow: 1;
}
.bit-editor-window.minimized > #bot-code-editor {
	display: none;
}
#bot-output {
	margin: 0;
	padding: 5px 15px;
	font-family: monospace;
	color: white;
	background-color: rgb(1, 63, 10);
}
#bot-output.bot-error{
	background-color: rgb(189, 0, 2);
}
`;

var style = document.createElement('style');
style.appendChild(document.createTextNode(editorCSS))
document.head.appendChild(style);

// JS

var script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11/ace.min.js";
script.onload = onEditorLoaded;
document.body.appendChild(script); //or something of the likes

//
// Editor logic (running the code, errors, minimize/maximize)
//

function onEditorLoaded() {
	// Setting up the Ace editor

	ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11');
	var editor = ace.edit("bot-code-editor");
	editor.session.setMode("ace/mode/javascript");
	editor.setTheme("ace/theme/dracula");
	editor.setValue(startBotCode, -1);
	window.editor = editor;
	// Prevent typing in the editor from activating simulator keyboard shortcuts
	editor.container.addEventListener('keydown', function(e) { e.stopPropagation(); });
	editor.container.addEventListener('keyup', function(e) { e.stopPropagation(); });

	// Minimize/maximize logic

	var editorWindow = document.getElementsByClassName('bot-editor-window')[0];

	document.getElementById('bot-btn-minimize').addEventListener('click', function() {
		editorWindow.classList.toggle('minimized');
		editorWindow.classList.remove('maximized');
		editor.resize();
	});
	document.getElementById('bot-btn-maximize').addEventListener('click', function() {
		editorWindow.classList.toggle('maximized');
		editorWindow.classList.remove('minimized');
		editor.resize();
	});

	// Deploy/restart logic

	var buttonRestart = document.getElementById('bot-btn-restart');
	var buttonUpdate = document.getElementById('bot-btn-update');

	var errorDuringDeployment = false;

	function updateCode() {
		// http://perfectionkills.com/global-eval-what-are-the-options/
		try {
			window.eval(editor.getValue());
			errorDuringDeployment = false;
		}
		catch (error) {
			console.log(error);
			errorDuringDeployment = true;
		}
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

	buttonUpdate.addEventListener('click', function() {
		updateCode();
	});

	buttonRestart.addEventListener('click', function() {
		updateCode();
		resetPositionWithoutAnimation();
		window.__timestep = 0;
	});

	// Control output window
	var output = document.getElementById('bot-output');

	window.addEventListener('calculated_control', function(e) {
		var control = e.detail;
		if (errorDuringDeployment) {
			output.innerText = 'Running the script failed! See JavaScript console for more details.';
			output.classList.add('bot-error');
		}
		else if (control == null) {
			output.innerText = 'Error while computing control! See JavaScript console for more details.';
			output.classList.add('bot-error');
		}
		else {
			res = '';
			var i;
			for (i = 0; i < control.length; i++) {
				res += ' ' + control[i].toString().padStart(2);
			}
			output.innerText = 'Calculated control: [' + res + ' ]';
			output.classList.remove('bot-error');
		}
	});

	// Confirmation dialog on exit
	window.onbeforeunload = function() { return "Did you save your stuff?"; }
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

	if (time < 3)
		rotPitch = POSITIVE_LARGE;

	// Return the control commands you want executed
	return [moveX, moveY, moveZ, rotYaw, rotPitch, rotRoll];
}
`;
