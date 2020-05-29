gsap.defaults({
    overwrite: "auto"
}),
gsap.config({
    nullTargetWarn: !1
});
var deviceSettings = {
    isWebGL: !1,
    isAndroid: null,
    isIEMobile: null,
    isiPod: null,
    isiPhone: null,
    isiPad: null,
    isiOS: null,
    isMobile: null,
    isTablet: null,
    isWinSafari: null,
    isMacSafari: null
};
function setupDeviceSettings() {
    var t = navigator.userAgent.toLowerCase();
    deviceSettings.isAndroid = -1 < t.indexOf("android"),
    deviceSettings.isiPod = null !== navigator.userAgent.match(/iPod/i),
    deviceSettings.isiPhone = null !== navigator.userAgent.match(/iPhone/i),
    deviceSettings.isiPad = null !== navigator.userAgent.match(/iPad/i),
    deviceSettings.isiOS = !!navigator.userAgent.match(/(iPad|iPhone|iPod)/i),
    deviceSettings.isIEMobile = null !== navigator.userAgent.match(/iemobile/i);
    var e = navigator.platform.toLowerCase();
    deviceSettings.isIEMobile || deviceSettings.isAndroid || deviceSettings.isiPhone || deviceSettings.isiPad || "ipad" === e || "iphone" === e || "ipod" === e || "android" === e || "palm" === e || "windows phone" === e || "blackberry" === e || "linux armv7l" === e ? (deviceSettings.isMobile = !0,
    document.body.className += "isMobile") : document.body.className += "isDesktop"
}
var i, x, y, camera, scene, stats, renderer, navballRenderer, navballCamera, navballScene, tooltipRenderer, hitDirection, navballWidth = 200, navballHeight = 200, mouse = new THREE.Vector2, mouseX = 0, mouseY = 0, width = window.innerWidth, height = window.innerHeight, windowHalfX = width / 2, windowHalfY = height / 2, isAliasing = !0, isMouseDown = !1, toRAD = Math.PI / 180, isGameOver = !0, isEventsEnabled = !1, rateRotationX = 0, rateRotationY = 0, rateRotationZ = 0, rateCurrent = 0, rateSpeedSize = 1, translationPulseSize = .001, rotationPulseSize = .5, hitArray = [], hitRaycaster = new THREE.Raycaster, hitDirectionVector = new THREE.Vector3, hitDistance = 1, quaternion = new THREE.Quaternion;
quaternion.setFromAxisAngle(new THREE.Vector3(0,0,0), Math.PI / 2);
var $ = document.querySelector.bind(document)
  , $$ = document.querySelectorAll.bind(document);
function initWebgl() {
    setupDeviceSettings(),
    gsap.set(".hud-tip .circle", {
        drawSVG: "60% 90%"
    }),
    gsap.set(".worm", {
        transformOrigin: "center center"
    }),
    gsap.set("#worm-roll", {
        drawSVG: "50% 50%",
        rotation: 90
    }),
    gsap.set("#worm-pitch", {
        drawSVG: "50% 50%",
        rotation: 180
    }),
    gsap.set("#worm-yaw", {
        drawSVG: "50% 50%",
        rotation: -90
    }),
    gsap.set("#hud-worms", {
        autoAlpha: 1,
        display: "block"
    }),
    gsap.set("#hud, #hud-darken, #iss_target, #navball, #translation-status, #rotation-controls, #translation-controls, #helpers, #instructions", {
        autoAlpha: 0
    }),
    gsap.set("#hud-tips, #navball, #rotation-controls, #translation-controls", {
        z: 1
    }),
    scene = new THREE.Scene,
    scene.fog = new THREE.Fog(0,0,6e7),
    camera = new THREE.PerspectiveCamera(35,width / height,.5,6e7),
    camera.position.z = 50,
    camera.position.y = 0,
    camera.rotation.order = "YXZ",
    scene.add(camera),
    hitDirection = camera.getWorldDirection(hitDirectionVector),
    hitRaycaster = new THREE.Raycaster(camera.position,hitDirection,0,hitDistance),
    deviceSettings.isMobile && (isAliasing = !1),
    renderer = new THREE.WebGLRenderer({
        alpha: !1,
        antialias: isAliasing
    }),
    renderer.setSize(width, height),
    renderer.setClearColor(0, 1),
    document.getElementById("interactive").appendChild(renderer.domElement),
    navballScene = new THREE.Scene,
    navballCamera = new THREE.PerspectiveCamera(50,1,1,2e3),
    navballCamera.position.z = 15,
    navballCamera.position.y = 0,
    navballCamera.rotation.z = 180 * toRAD,
    navballScene.add(navballCamera),
    navballRenderer = new THREE.WebGLRenderer({
        alpha: !0,
        antialias: !0
    }),
    navballRenderer.setSize(navballWidth, navballHeight, !1),
    navballRenderer.setClearColor(0, 0);
    var t = document.getElementById("navball");
    t.appendChild(navballRenderer.domElement),
    t.style.transform = "rotate(180deg)",
    tooltipRenderer = new THREE.CSS2DRenderer,
    tooltipRenderer.setSize(window.innerWidth, window.innerHeight),
    tooltipRenderer.domElement.style.position = "absolute",
    tooltipRenderer.domElement.style.top = 0,
    document.getElementById("iss_labels").appendChild(tooltipRenderer.domElement),
    window.addEventListener("resize", onWindowResize, !1),
    onWindowResize(),
    renderer.compile(scene, camera),
    animate(),
    initPreloader(),
    createWormhole(),
    createTunnel(),
    createSonic(),
    createStarfield(),
    createEarth(),
    createStars(),
    createNavball(),
    createIss(),
    createLights(),
    startPreloader()
}
var texturesLoaded, texturesTotal, loadingManager = new THREE.LoadingManager, imageLoader = new THREE.ImageLoader(loadingManager), jsonLoader = new THREE.FileLoader(loadingManager), textureLoader = new THREE.TextureLoader(loadingManager);
function startPreloader() {
    gsap.set("#preloader-circle .circle-color, #preloader-circle .circle-grey", {
        drawSVG: "0% 0%",
        autoAlpha: 0
    }),
    gsap.set("#preloader-circle", {
        rotation: -90
    });
    var t = new TimelineMax({
        paused: !0
    });
    t.fromTo("#interactive", 3, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none"
    }, 0),
    t.fromTo("#preloader-circle .circle-grey", 3, {
        drawSVG: "0% 0%"
    }, {
        drawSVG: "0% 102%",
        ease: "expo.inOut"
    }, 0),
    t.to("#preloader-circle .circle-color", 1, {
        autoAlpha: 1
    }, 0),
    t.fromTo("#preloader-inner, #preloader-circle .circle-grey", 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none"
    }, 0),
    t.play(0)
}
var forwardViewSpriteTexture, forwardViewSpriteJson;
function initPreloader() {
    earthTexture = deviceSettings.isMobile ? textureLoader.load("img/earth_mobile.jpg") : textureLoader.load("img/earth.jpg"),
    navballTexture = textureLoader.load("img/navball.png"),
    sonicTexture = textureLoader.load("img/texture_fire.jpg"),
    tunnelTexture = textureLoader.load("img/texture_wormhole.jpg"),
    wormholeTexture = textureLoader.load("img/texture_wormhole.jpg"),
    starfieldTexture = textureLoader.load("img/texture_star.jpg"),
    forwardViewSpriteTexture = textureLoader.load("img/hud/ForwardViewSprites2.png"),
    jsonLoader.setResponseType("json"),
    jsonLoader.load("img/hud/ForwardViewSprites.json", function(t) {
        forwardViewSpriteJson = t
    }),
    loadingManager.onProgress = function(t, e, o) {
        renderer.compile(scene, camera),
        texturesTotal = o,
        texturesLoaded = e
    }
    ,
    loadingManager.onLoad = function() {
        createOrb()
    }
}
function updatePreloader(t) {
    var e = 100 + texturesTotal
      , o = t + texturesLoaded
      , a = Math.round(100 * (o / e));
    gsap.to("#preloader-circle .circle-color", .25, {
        drawSVG: "0% " + a + "%",
        immediateRender: !1,
        ease: "expo.out"
    }),
    $("#preloader-percent").innerHTML = a
}
function hidePreloader() {
    var t = new TimelineMax({
        paused: !0,
        onComplete: function() {}
    });
    t.to("#preloader-circle .circle-color", 2, {
        drawSVG: "100% 100%",
        ease: "expo.inOut",
        immediateRender: !1
    }, 0),
    t.to("#preloader", 1, {
        autoAlpha: 0,
        ease: "none"
    }, 1),
    t.play(0)
}
function initExperience() {
    document.addEventListener("mousedown", onDocumentMouseDown, !1),
    document.addEventListener("mousemove", onDocumentMouseMove, !1),
    document.addEventListener("mouseup", onDocumentMouseUp, !1),
    initButtons(),
    renderer.compile(scene, camera),
    isEventsEnabled = !0,
    hidePreloader(),
    showIntro()
}
var flightInput = "";
function initButtons() {
    deviceSettings.isMobile ? ($("#begin-button").addEventListener("touchstart", hideIntro, !1),
    $("#fail-button").addEventListener("touchstart", showInterface, !1),
    $("#success-button").addEventListener("touchstart", showInterface, !1),
    $("#option-restart").addEventListener("touchstart", resetPosition, !1),
    $("#instructions-button").addEventListener("touchstart", instructionsOpen, !1),
    $("#option-instructions").addEventListener("touchstart", instructionsOpen, !1),
    $("#instructions .modal-close").addEventListener("touchstart", instructionsClose, !1),
    $("#arrow-prev").addEventListener("touchstart", instructionsPrevious, !1),
    $("#arrow-next").addEventListener("touchstart", instructionsNext, !1),
    $("#option-settings").addEventListener("touchstart", settingsOpen, !1),
    $("#settings .modal-close").addEventListener("touchstart", settingsClose, !1),
    $("#setting-gravity").addEventListener("touchstart", toggleGravity, !1),
    $("#setting-earth").addEventListener("touchstart", toggleEarthShape, !1),
    $("#translate-forward-button").addEventListener("touchstart", translateForward, !1),
    $("#translate-backward-button").addEventListener("touchstart", translateBackward, !1),
    $("#translate-down-button").addEventListener("touchstart", translateDown, !1),
    $("#translate-up-button").addEventListener("touchstart", translateUp, !1),
    $("#translate-right-button").addEventListener("touchstart", translateRight, !1),
    $("#translate-left-button").addEventListener("touchstart", translateLeft, !1),
    $("#toggle-translation").addEventListener("touchstart", toggleTranslation, !1),
    $("#yaw-left-button").addEventListener("touchstart", yawLeft, !1),
    $("#yaw-right-button").addEventListener("touchstart", yawRight, !1),
    $("#pitch-up-button").addEventListener("touchstart", pitchUp, !1),
    $("#pitch-down-button").addEventListener("touchstart", pitchDown, !1),
    $("#roll-left-button").addEventListener("touchstart", rollLeft, !1),
    $("#roll-right-button").addEventListener("touchstart", rollRight, !1),
    $("#toggle-rotation").addEventListener("touchstart", toggleRotation, !1)) : ($("#begin-button").addEventListener("click", hideIntro, !1),
    $("#fail-button").addEventListener("click", showInterface, !1),
    $("#success-button").addEventListener("click", showInterface, !1),
    $("#option-restart").addEventListener("click", resetPosition, !1),
    $("#instructions-button").addEventListener("click", instructionsOpen, !1),
    $("#option-instructions").addEventListener("click", instructionsOpen, !1),
    $("#instructions .modal-close").addEventListener("click", instructionsClose, !1),
    $("#arrow-prev").addEventListener("click", instructionsPrevious, !1),
    $("#arrow-next").addEventListener("click", instructionsNext, !1),
    $("#option-settings").addEventListener("click", settingsOpen, !1),
    $("#settings .modal-close").addEventListener("click", settingsClose, !1),
    $("#setting-gravity").addEventListener("click", toggleGravity, !1),
    $("#setting-earth").addEventListener("click", toggleEarthShape, !1),
    $("#translate-forward-button").addEventListener("click", translateForward, !1),
    $("#translate-backward-button").addEventListener("click", translateBackward, !1),
    $("#translate-down-button").addEventListener("click", translateDown, !1),
    $("#translate-up-button").addEventListener("click", translateUp, !1),
    $("#translate-right-button").addEventListener("click", translateRight, !1),
    $("#translate-left-button").addEventListener("click", translateLeft, !1),
    $("#toggle-translation").addEventListener("click", toggleTranslation, !1),
    $("#yaw-left-button").addEventListener("click", yawLeft, !1),
    $("#yaw-right-button").addEventListener("click", yawRight, !1),
    $("#pitch-up-button").addEventListener("click", pitchUp, !1),
    $("#pitch-down-button").addEventListener("click", pitchDown, !1),
    $("#roll-left-button").addEventListener("click", rollLeft, !1),
    $("#roll-right-button").addEventListener("click", rollRight, !1),
    $("#toggle-rotation").addEventListener("click", toggleRotation, !1)),
    document.addEventListener("keydown", function(t) {
        if (!isGameOver) {
            var e = t.keyCode || t.which
              , o = {
                forward: 69,
                backward: 81,
                move_right: 68,
                move_down: 83,
                move_left: 65,
                move_up: 87,
                roll_left: 103,
                roll_right: 105,
                rotate_left: 100,
                rotate_up: 104,
                rotate_right: 102,
                rotate_down: 101,
                roll_left2: 188,
                roll_right2: 190,
                rotate_right2: 39,
                rotate_up2: 38,
                rotate_left2: 37,
                rotate_down2: 40,
                toggle_earth: 48
            };
            switch (e) {
            case o.rotate_left:
            case o.rotate_left2:
                $("#yaw-left-button").classList.add("active");
                break;
            case o.rotate_right:
            case o.rotate_right2:
                $("#yaw-right-button").classList.add("active");
                break;
            case o.rotate_up:
            case o.rotate_up2:
                $("#pitch-up-button").classList.add("active");
                break;
            case o.rotate_down:
            case o.rotate_down2:
                $("#pitch-down-button").classList.add("active");
                break;
            case o.roll_left:
            case o.roll_left2:
                $("#roll-left-button").classList.add("active");
                break;
            case o.roll_right:
            case o.roll_right2:
                $("#roll-right-button").classList.add("active");
                break;
            case o.move_up:
                $("#translate-up-button").classList.add("active");
                break;
            case o.move_down:
                $("#translate-down-button").classList.add("active");
                break;
            case o.move_left:
                $("#translate-left-button").classList.add("active");
                break;
            case o.move_right:
                $("#translate-right-button").classList.add("active");
                break;
            case o.forward:
                $("#translate-forward-button").classList.add("active");
                break;
            case o.backward:
                $("#translate-backward-button").classList.add("active");
                break;
            case o.toggle_earth:
            }
            flightInput = t.keyCode + flightInput,
            "50495353" === flightInput.substring(0, 8) && (gsap.to(motionVector, 5, {
                x: 0,
                y: 0,
                z: 0,
                ease: "circ.out"
            }),
            gsap.to(translationVector, 5, {
                x: 0,
                y: 0,
                z: 0,
                ease: "circ.out"
            }),
            gsap.to(camera.position, 5, {
                x: 0,
                y: 0,
                z: -149.5,
                ease: "circ.out"
            }),
            gsap.to(camera.rotation, 5, {
                x: 0 * toRAD,
                y: 0 * toRAD,
                z: 0 * toRAD,
                ease: "circ.out"
            })),
            ("728482656984657670" === flightInput.substring(0, 18) || "7284826569" === flightInput.substring(0, 10)) && toggleEarthShape()
        }
    }),
    document.addEventListener("keyup", function(t) {
        if (!isGameOver) {
            var e = t.keyCode || t.which
              , o = {
                forward: 69,
                backward: 81,
                move_right: 68,
                move_down: 83,
                move_left: 65,
                move_up: 87,
                roll_left: 103,
                roll_right: 105,
                rotate_left: 100,
                rotate_up: 104,
                rotate_right: 102,
                rotate_down: 101,
                roll_left2: 188,
                roll_right2: 190,
                rotate_right2: 39,
                rotate_up2: 38,
                rotate_left2: 37,
                rotate_down2: 40
            };
            e === o.rotate_left || e === o.rotate_left2 ? (yawLeft(),
            $("#yaw-left-button").classList.remove("active")) : e === o.rotate_right || e === o.rotate_right2 ? (yawRight(),
            $("#yaw-right-button").classList.remove("active")) : e === o.rotate_up || e === o.rotate_up2 ? (pitchUp(),
            $("#pitch-up-button").classList.remove("active")) : e === o.rotate_down || e === o.rotate_down2 ? (pitchDown(),
            $("#pitch-down-button").classList.remove("active")) : e === o.roll_left || e === o.roll_left2 ? (rollLeft(),
            $("#roll-left-button").classList.remove("active")) : e === o.roll_right || e === o.roll_right2 ? (rollRight(),
            $("#roll-right-button").classList.remove("active")) : e === o.move_up ? (translateUp(),
            $("#translate-up-button").classList.remove("active")) : e === o.move_down ? (translateDown(),
            $("#translate-down-button").classList.remove("active")) : e === o.move_left ? (translateLeft(),
            $("#translate-left-button").classList.remove("active")) : e === o.move_right ? (translateRight(),
            $("#translate-right-button").classList.remove("active")) : e === o.forward ? (translateForward(),
            $("#translate-forward-button").classList.remove("active")) : e === o.backward ? (translateBackward(),
            $("#translate-backward-button").classList.remove("active")) : void 0
        }
    })
}
var isToggling = !1;
function updateToggleStatus() {
    isToggling = !0,
    setTimeout(function() {
        isToggling = !1
    }, 500)
}
function updatePrecision(t) {
    "rotation" === t && (rotationPulseSize = .5 === rotationPulseSize ? 1 : .5,
    $("#rotation-controls").classList.toggle("large"),
    $("#precision-rotation-status").classList.toggle("large"),
    $("#hud-tips").classList.toggle("rotation-large")),
    "translation" === t && (translationPulseSize = .001 === translationPulseSize ? .005 : .001,
    $("#translation-controls").classList.toggle("large"),
    $("#precision-translation-status").classList.toggle("large"),
    $("#hud-tips").classList.toggle("translation-large"))
}
function toggleTranslation() {
    !1 === isToggling && (updateToggleStatus(),
    updatePrecision("translation"))
}
function toggleRotation() {
    !1 === isToggling && (updateToggleStatus(),
    updatePrecision("rotation"))
}
function resetPrecision() {
    $("#rotation-controls").classList.contains("large") && updatePrecision("rotation"),
    $("#translation-controls").classList.contains("large") && updatePrecision("translation")
}
var introAnimationIn, introAnimationOut, interfaceAnimationIn, interfaceAnimationOut, isIntroStarted = !1;
function showIntro() {
    introAnimationIn = new TimelineMax({
        paused: !0
    }),
    introAnimationIn.fromTo("#intro", 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        display: "block",
        ease: "none"
    }, 0),
    introAnimationIn.staggerFromTo("#logoSVG .stroke_white", 1, {
        stroke: "#000000"
    }, {
        stroke: "#FFFFFF",
        ease: "none"
    }, .1, 1),
    introAnimationIn.staggerFromTo("#logoSVG .stroke_white", 2, {
        drawSVG: "50% 50%"
    }, {
        drawSVG: "0% 100%",
        ease: "circ.inOut"
    }, .25, 1),
    introAnimationIn.fromTo("#logoSVG .fill", 2, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none"
    }, 4),
    introAnimationIn.staggerFromTo("#intro-step1 .animate", 2, {
        y: 50,
        autoAlpha: 0
    }, {
        y: 0,
        autoAlpha: 1,
        ease: "expo.out"
    }, .25, 4),
    introAnimationIn.play(0)
}
function showIntroHelpers() {
    gsap.set("#logoSVG, #intro-step1", {
        display: "none"
    }),
    gsap.set("#intro-step2", {
        autoAlpha: 1,
        display: "block"
    }),
    gsap.fromTo("#intro-step2 h2, #intro-step2 p, #intro-step2 .message-button", 2, {
        y: 50,
        autoAlpha: 0
    }, {
        y: 0,
        autoAlpha: 1,
        ease: "expo.out",
        stagger: .25
    })
}
function hideIntro() {
    isIntroStarted || (isIntroStarted = !0,
    introAnimationOut = new TimelineMax({
        paused: !0
    }),
    introAnimationOut.fromTo("#intro", .5, {
        autoAlpha: 1
    }, {
        autoAlpha: 0,
        ease: "none"
    }, 0),
    introAnimationOut.play(0))
}
function showInterface() {
    interfaceAnimationIn = new TimelineMax({
        paused: !0,
        onComplete: function() {
            isGameOver = !1
        }
    }),
    interfaceAnimationIn.to("#fail, #success", .5, {
        autoAlpha: 0
    }, 0),
    interfaceAnimationIn.fromTo("#hud-darken, #iss_target, #navball, #helpers", 3, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none",
        onStart: function() {
            $("#rotation-controls").classList.remove("hidden"),
            $("#translation-controls").classList.remove("hidden")
        }
    }, 1),
    interfaceAnimationIn.to(camera.position, 5, {
        x: 12,
        y: 30,
        ease: "expo.inOut"
    }, 2),
    interfaceAnimationIn.to(camera.rotation, 5, {
        x: -20 * toRAD,
        y: -10 * toRAD,
        z: 15 * toRAD,
        ease: "expo.inOut"
    }, 2),
    interfaceAnimationIn.fromTo("#rotation-controls, #translation-controls", .5, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none"
    }, 0),
    interfaceAnimationIn.fromTo("#hud", 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none"
    }, 2),
    interfaceAnimationIn.fromTo("#hud-ring", 1.5, {
        rotation: 180
    }, {
        rotation: 0,
        ease: "expo.out"
    }, 2),
    interfaceAnimationIn.fromTo("#hud-ring-inner", 1.5, {
        rotation: -180
    }, {
        rotation: 0,
        ease: "expo.out"
    }, 2),
    interfaceAnimationIn.fromTo("#hud-ring, #hud-ring-inner", 1.5, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none"
    }, 2),
    interfaceAnimationIn.staggerFromTo("#hud .hud-item .error, #hud .hud-item .rate, #pyr .distance", 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none"
    }, .1, 3),
    interfaceAnimationIn.fromTo("#range .label", 1, {
        scrambleText: {
            text: " "
        }
    }, {
        scrambleText: {
            text: "RANGE",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 3),
    interfaceAnimationIn.fromTo("#rate .label", 1, {
        scrambleText: {
            text: " "
        }
    }, {
        scrambleText: {
            text: "RATE",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 3),
    interfaceAnimationIn.fromTo("#roll-label", 1, {
        scrambleText: {
            text: " "
        }
    }, {
        scrambleText: {
            text: "ROLL",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 3.25),
    interfaceAnimationIn.fromTo("#pitch-label", 1, {
        scrambleText: {
            text: " "
        }
    }, {
        scrambleText: {
            text: "PITCH",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 3.25),
    interfaceAnimationIn.fromTo("#pyr-label", 1, {
        scrambleText: {
            text: " "
        }
    }, {
        scrambleText: {
            text: "XYZ",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 3.25),
    interfaceAnimationIn.fromTo("#yaw-label", 1, {
        scrambleText: {
            text: " "
        }
    }, {
        scrambleText: {
            text: "YAW",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 3.25),
    interfaceAnimationIn.fromTo("#options", 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "none"
    }, 3),
    interfaceAnimationIn.play(0)
}
function hideInterface(t) {
    isGameOver = !0,
    interfaceAnimationOut = new TimelineMax({
        paused: !0,
        onStart: function() {
            $("#rotation-controls").classList.add("hidden"),
            $("#translation-controls").classList.add("hidden")
        }
    }),
    interfaceAnimationOut.to("#hud-darken", .5, {
        autoAlpha: 0,
        ease: Linear.easeOut
    }, 0),
    interfaceAnimationOut.to("#hud, #iss_target, #navball, #helpers", 1.5, {
        autoAlpha: 0,
        ease: Linear.easeOut
    }, 0),
    interfaceAnimationOut.to("#hud .hud-item .error, #hud .hud-item .rate, #pyr .distance", .5, {
        autoAlpha: 0,
        ease: "none"
    }, 0),
    interfaceAnimationOut.to("#range .label", 1.5, {
        scrambleText: {
            text: " ",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 0),
    interfaceAnimationOut.to("#rate .label", 1.5, {
        scrambleText: {
            text: " ",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 0),
    interfaceAnimationOut.to("#roll-label", 1.5, {
        scrambleText: {
            text: " ",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 0),
    interfaceAnimationOut.to("#pitch-label", 1.5, {
        scrambleText: {
            text: " ",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 0),
    interfaceAnimationOut.to("#pyr-label", 1.5, {
        scrambleText: {
            text: " ",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 0),
    interfaceAnimationOut.to("#yaw-label", 1.5, {
        scrambleText: {
            text: " ",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 0),
    interfaceAnimationOut.to("#hud-ring", 1.5, {
        rotation: 180,
        ease: "expo.out"
    }, 0),
    interfaceAnimationOut.to("#hud-ring-inner", 1.5, {
        rotation: -180,
        ease: "expo.out"
    }, 0),
    interfaceAnimationOut.to("#rotation-controls, #translation-controls", 1, {
        autoAlpha: 0
    }, .5),
    interfaceAnimationOut.to(camera.position, 5, {
        x: 0,
        y: 0,
        z: 50,
        ease: "expo.inOut"
    }, 0),
    interfaceAnimationOut.to(camera.rotation, 5, {
        x: 0,
        y: 0,
        z: 0,
        ease: "expo.inOut"
    }, 0),
    interfaceAnimationOut.to(motionVector, 5, {
        x: 0,
        y: 0,
        z: 0,
        ease: "expo.inOut"
    }, 0),
    interfaceAnimationOut.to(translationVector, 5, {
        x: 0,
        y: 0,
        z: 0,
        ease: "expo.inOut"
    }, 0),
    "success" === t && (interfaceAnimationOut.fromTo("#success", 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        display: "block"
    }, 2),
    interfaceAnimationOut.fromTo("#success h3", 2, {
        scrambleText: {
            text: " "
        }
    }, {
        scrambleText: {
            text: "SUCCESS",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 2),
    interfaceAnimationOut.fromTo("#success-button", 1, {
        y: 50,
        autoAlpha: 0
    }, {
        y: 0,
        autoAlpha: 1,
        ease: "expo.out"
    }, 3)),
    "fail" === t && (interfaceAnimationOut.fromTo("#fail", 1.5, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        display: "block"
    }, 2),
    interfaceAnimationOut.fromTo("#fail h3", 1.5, {
        scrambleText: {
            text: " "
        }
    }, {
        scrambleText: {
            text: "GAME OVER",
            chars: "0123456789!@#$%^&*()"
        },
        ease: "none"
    }, 2),
    interfaceAnimationOut.fromTo("#fail-button", 1, {
        y: 50,
        autoAlpha: 0
    }, {
        y: 0,
        autoAlpha: 1,
        ease: "expo.out"
    }, 3)),
    interfaceAnimationOut.to("#options", 1, {
        autoAlpha: 0,
        ease: "none"
    }, 0),
    interfaceAnimationOut.play(0),
    resetMovement()
}
function resetMovement() {
    rateRotationX = 0,
    rateRotationY = 0,
    rateRotationZ = 0,
    currentRotationX = 0,
    currentRotationY = 0,
    currentRotationZ = 0,
    targetRotationX = 0,
    targetRotationY = 0,
    targetRotationZ = 0,
    updateWormRateColor(rateRotationZ, "roll"),
    updateWormRateColor(rateRotationX, "pitch"),
    updateWormRateColor(rateRotationY, "yaw"),
    gsap.to("#worm-roll, #worm-pitch, #worm-yaw", 2, {
        drawSVG: "50% 50%",
        ease: "expo.out"
    }),
    resetPrecision()
}
function resetPosition() {
    resetMovement(),
    gsap.to(motionVector, 5, {
        x: 0,
        y: 0,
        z: 0,
        ease: "expo.out"
    }),
    gsap.to(translationVector, 5, {
        x: 0,
        y: 0,
        z: 0,
        ease: "expo.out"
    }),
    gsap.to(camera.position, 5, {
        x: 12,
        y: 30,
        z: 50,
        ease: "expo.out"
    }),
    gsap.to(camera.rotation, 5, {
        x: -20 * toRAD,
        y: -10 * toRAD,
        z: 15 * toRAD,
        ease: "expo.out"
    })
}
var lightObject, lightClose, lightFar, lightBurst, lightISS_Primary, lightISS_Secondary, lightISS_Top, lightISS_Bottom, lightCamera, lightBurstGeometry, lightBurstMaterial, lightBurstMesh, lightBurstHelper, lightColorAnimation, lightColor = new THREE.Color(13434879), lightColor1 = new THREE.Color(16766097), lightColor2 = new THREE.Color(6657945), lightColor3 = new THREE.Color(16766097), lightColorWhite = new THREE.Color(16777215), lightColorArray = [], lightsCreated = !1;
function createLights() {
    lightObject = new THREE.Object3D,
    scene.add(lightObject),
    lightClose = new THREE.PointLight(lightColor,4,250),
    lightClose.position.set(0, 0, 50),
    lightObject.add(lightClose),
    lightFar = new THREE.PointLight(lightColor,4,5e3),
    lightFar.position.set(0, 0, 1e3),
    lightObject.add(lightFar),
    lightBurst = new THREE.PointLight(lightColor,5,100),
    lightBurst.position.set(0, 0, -350),
    lightObject.add(lightBurst),
    lightISS_Primary = new THREE.PointLight(lightColorWhite,0,0),
    lightISS_Primary.position.set(0, 4e10, 4e10),
    scene.add(lightISS_Primary),
    lightISS_Secondary = new THREE.PointLight(lightColorWhite,0,500,2),
    lightISS_Secondary.position.set(0, 100, 250),
    issObject.add(lightISS_Secondary),
    lightISS_Top = new THREE.PointLight(lightColorWhite,0,500),
    lightISS_Top.position.set(0, -250, 0),
    issObject.add(lightISS_Top),
    lightISS_Bottom = new THREE.PointLight(lightColorWhite,0,500),
    lightISS_Bottom.position.set(0, 250, 0),
    issObject.add(lightISS_Bottom),
    lightCamera = new THREE.PointLight(lightColorWhite,.25,5,2),
    camera.add(lightCamera),
    lightColorArray = [lightFar.color, lightClose.color, lightBurst.color],
    lightColorAnimation = new TimelineMax({
        paused: !0,
        repeat: -1
    }),
    lightColorAnimation.to(lightColorArray, 2, {
        r: lightColor1.r,
        g: lightColor1.g,
        b: lightColor1.b
    }, 0),
    lightColorAnimation.to(lightColorArray, 2, {
        r: lightColor2.r,
        g: lightColor2.g,
        b: lightColor2.b
    }, 2),
    lightColorAnimation.to(lightColorArray, 2, {
        r: lightColor3.r,
        g: lightColor3.g,
        b: lightColor3.b
    }, 4),
    lightColorAnimation.to(lightColorArray, 2, {
        r: lightColorWhite.r,
        g: lightColorWhite.g,
        b: lightColorWhite.b
    }, 6),
    lightColorAnimation.to(lightColorArray, 2, {
        r: lightColor1.r,
        g: lightColor1.g,
        b: lightColor1.b
    }, 8),
    lightColorAnimation.timeScale(2),
    lightsCreated = !0
}
var lightVars = {
    velocity: 0,
    intensity: 0,
    color: 75
};
function renderLights() {
    lightsCreated && (warpVars.isFinished || (isIntroStarted ? !warpVars.isTriggered && (gsap.to(lightVars, 1, {
        velocity: 12,
        intensity: 10
    }),
    lightColorAnimation.play()) : warpVars.isTriggered && (gsap.to(lightVars, 3, {
        velocity: 0,
        intensity: 0
    }),
    lightColorAnimation.pause())),
    100 <= lightBurst.position.z && (lightBurst.position.z = -500),
    lightBurst.position.z += lightVars.velocity)
}
var warpObject, wormholeObject, wormholeTexture, wormholeGeometry, wormholeMaterial, wormholeMesh, warpVars = {
    isTriggered: !1,
    isFinished: !1,
    distanceSpeed: .1,
    distanceCurrent: 5e5
}, isWarpComplete = !1, wormholeVars = {
    opacity: 0,
    textureSpeed: 0,
    rotationSpeed: 0
}, wormholeCreated = !1;
function createWormhole() {
    warpObject = new THREE.Group,
    scene.add(warpObject),
    wormholeObject = new THREE.Object3D,
    warpObject.add(wormholeObject),
    wormholeTexture.wrapT = THREE.RepeatWrapping,
    wormholeTexture.wrapS = THREE.RepeatWrapping,
    wormholeGeometry = new THREE.CylinderGeometry(25,0,400,40,40,!0),
    wormholeMaterial = new THREE.MeshLambertMaterial({
        color: 16777215,
        opacity: 0,
        map: wormholeTexture,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: !0,
        depthTest: !1
    }),
    wormholeMaterial.needsUpdate = !0,
    wormholeMesh = new THREE.Mesh(wormholeGeometry,wormholeMaterial),
    wormholeMesh.position.set(0, 0, 0),
    wormholeMesh.rotation.x = Math.PI / 2,
    wormholeObject.add(wormholeMesh),
    wormholeObject.position.set(0, 0, 0),
    renderer.compile(scene, camera),
    wormholeCreated = !0
}
function renderWormhole() {
    wormholeCreated && (warpVars.isFinished || (isIntroStarted ? !warpVars.isTriggered && (gsap.to(wormholeVars, 2, {
        opacity: 1,
        onStart: function() {
            wormholeObject.visible = !0
        }
    }),
    gsap.to(wormholeVars, 1, {
        textureSpeed: 5,
        rotationSpeed: 25
    }),
    gsap.to(wormholeObject.scale, 1, {
        z: 3,
        ease: "expo.inOut"
    })) : warpVars.isTriggered && (gsap.to(wormholeVars, 2, {
        opacity: 0
    }),
    gsap.to(wormholeVars, 2, {
        textureSpeed: 0,
        rotationSpeed: 0
    }),
    gsap.to(wormholeObject.scale, 1.25, {
        z: 1
    }))),
    0 >= wormholeVars.opacity ? wormholeObject.visible && (wormholeObject.visible = !1) : (wormholeMaterial.opacity = wormholeVars.opacity,
    wormholeObject.rotation.z -= .001 * wormholeVars.rotationSpeed,
    wormholeTexture.offset.y -= .001 * wormholeVars.textureSpeed,
    wormholeMaterial.needsUpdate = !0))
}
var tunnelObject, tunnelTexture, tunnelGeometry, tunnelMaterial, tunnelMesh, tunnelVars = {
    opacity: 0,
    textureSpeed: .1,
    rotationSpeed: 1
}, tunnelCreated = !1;
function createTunnel() {
    tunnelObject = new THREE.Object3D,
    warpObject.add(tunnelObject),
    tunnelTexture = wormholeTexture,
    tunnelTexture.wrapT = THREE.RepeatWrapping,
    tunnelTexture.wrapS = THREE.RepeatWrapping,
    tunnelGeometry = new THREE.CylinderGeometry(200,20,2e3,30,30,!0),
    tunnelMaterial = new THREE.MeshLambertMaterial({
        color: 16777215,
        opacity: 0,
        map: tunnelTexture,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: !0,
        depthTest: !0
    }),
    tunnelMaterial.needsUpdate = !0,
    tunnelMesh = new THREE.Mesh(tunnelGeometry,tunnelMaterial),
    tunnelMesh.position.set(0, 0, -1e3),
    tunnelMesh.rotation.x = Math.PI / 2,
    tunnelObject.add(tunnelMesh),
    renderer.compile(scene, camera),
    tunnelCreated = !0
}
function renderTunnel() {
    tunnelCreated && (warpVars.isFinished || (isIntroStarted ? !warpVars.isTriggered && (gsap.to(tunnelVars, 2, {
        opacity: 1,
        onStart: function() {
            tunnelObject.visible = !0
        }
    }),
    gsap.to(tunnelVars, 1, {
        textureSpeed: 5,
        rotationSpeed: 45
    })) : warpVars.isTriggered && (gsap.to(tunnelVars, 2, {
        opacity: 0
    }),
    gsap.to(tunnelVars, 2, {
        textureSpeed: .1,
        rotationSpeed: 1
    }))),
    0 >= tunnelVars.opacity ? tunnelObject.visible && (tunnelObject.visible = !1) : (tunnelMaterial.opacity = tunnelVars.opacity,
    tunnelObject.rotation.z -= .001 * tunnelVars.rotationSpeed,
    tunnelTexture.offset.y -= .001 * tunnelVars.textureSpeed,
    tunnelMaterial.needsUpdate = !0))
}
var sonicObject, sonicTexture, sonicGeometry, sonicMaterial, sonicMesh, sonicVars = {
    opacity: 0,
    textureSpeed: 0,
    rotationSpeed: 0,
    textureRepeat: 1
}, sonicAnimation = new TimelineMax({
    paused: !0
}), sonicCreated = !1;
function createSonic() {
    sonicObject = new THREE.Object3D,
    warpObject.add(sonicObject),
    sonicTexture.wrapT = THREE.RepeatWrapping,
    sonicTexture.wrapS = THREE.RepeatWrapping,
    sonicTexture.repeat.set(1, 1),
    sonicGeometry = new THREE.CylinderGeometry(50,0,500,40,40,!0),
    sonicMaterial = new THREE.MeshLambertMaterial({
        color: 16777215,
        map: sonicTexture,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: !0,
        depthTest: !0
    }),
    sonicMaterial.needsUpdate = !0,
    sonicMesh = new THREE.Mesh(sonicGeometry,sonicMaterial),
    sonicMesh.rotation.x = Math.PI / 2,
    sonicObject.add(sonicMesh),
    sonicTexture.offset.y = -1e4,
    sonicMaterial.needsUpdate = !0,
    renderer.compile(scene, camera),
    sonicCreated = !0
}
function renderSonic() {
    sonicCreated && (warpVars.isFinished || (isIntroStarted ? !warpVars.isTriggered && (gsap.to(sonicVars, 2, {
        opacity: 1,
        onStart: function() {
            sonicObject.visible = !0
        }
    }),
    gsap.to(sonicVars, 4, {
        textureSpeed: 30,
        rotationSpeed: 45,
        textureRepeat: 2
    })) : warpVars.isTriggered && (gsap.to(sonicVars, 1, {
        opacity: 0
    }),
    gsap.to(sonicVars, 1, {
        textureSpeed: 0,
        rotationSpeed: 0,
        textureRepeat: 1
    }))),
    0 >= sonicVars.opacity ? sonicObject.visible && (sonicObject.visible = !1) : (sonicMaterial.opacity = sonicVars.opacity,
    sonicTexture.repeat.set(1, sonicVars.textureRepeat),
    sonicObject.rotation.z -= .001 * sonicVars.rotationSpeed,
    sonicTexture.offset.y -= .001 * sonicVars.textureSpeed,
    sonicMaterial.needsUpdate = !0))
}
var starfieldObject, starfieldTexture, starfieldMaterial, starfieldMaterialBlue, starfieldMaterialOrange, starfieldMaterialWhite, starfieldColorTotal, starfieldTotal = 500, starfieldScaleFactor = 1, starfieldStartZ = -450, starfieldEndZ = 50, starfieldMaxDistance = 250, starfieldMaxDistanceZ = 500, starBuffer = 15, starfieldSpritesArray = [], starfieldObjectsArray = [], starfieldDetailsArray = [], starfieldColorBase = new THREE.Color(16766097), starfieldColorBlue = new THREE.Color(6657945), starfieldColorOrange = new THREE.Color(16766097), starfieldColorWhite = new THREE.Color(16777215), starfieldColorHyper = new THREE.Color(16777215), starfieldMaterialArray = [], starfieldMaterialColorArray = [], starfieldVars = {
    velocity: .1,
    scale: 1,
    stretch: 1,
    rotation: -90,
    lookat: 0
}, starfieldCreated = !1;
function createStarfield() {
    for (starfieldObject = new THREE.Group,
    starfieldMaterialBlue = new THREE.MeshBasicMaterial({
        map: starfieldTexture,
        opacity: 1,
        color: starfieldColorBlue,
        transparent: !0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: !1
    }),
    starfieldMaterialOrange = new THREE.MeshBasicMaterial({
        map: starfieldTexture,
        opacity: 1,
        color: starfieldColorOrange,
        transparent: !0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: !1
    }),
    starfieldMaterialWhite = new THREE.MeshBasicMaterial({
        map: starfieldTexture,
        opacity: 1,
        color: starfieldColorWhite,
        transparent: !0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: !1
    }),
    starfieldMaterialArray = [starfieldMaterialBlue, starfieldMaterialOrange, starfieldMaterialWhite],
    starfieldMaterialColorArray = [starfieldMaterialBlue.color, starfieldMaterialOrange.color, starfieldMaterialWhite.color],
    starfieldColorTotal = starfieldMaterialArray.length - 1,
    deviceSettings.isMobile && (starfieldTotal = Math.floor(starfieldTotal / 3),
    starfieldScaleFactor = 1),
    i = 0; i < starfieldTotal; i++) {
        var t = new THREE.Vector3;
        t.x = Math.random() * starfieldMaxDistance - 125,
        t.y = Math.random() * starfieldMaxDistance - 125,
        t.z = -500 * Math.random(),
        (0 <= t.x || 2 > t.x) && (t.x += starBuffer),
        (0 >= t.x || -2 > t.x) && (t.x -= starBuffer),
        (0 <= t.y || 2 > t.y) && (t.y += starBuffer),
        (0 >= t.y || -2 > t.y) && (t.y -= starBuffer);
        var e = new THREE.PlaneBufferGeometry(1,1,1)
          , o = starfieldMaterialArray[generateRandomNumber(0, starfieldColorTotal)]
          , a = new THREE.Mesh(e,o);
        a.userData = {
            id: i
        };
        var r = new THREE.Object3D;
        r.add(a),
        a.rotation.x = 90 * toRAD,
        starfieldObjectsArray.push(r),
        starfieldSpritesArray.push(a),
        starfieldObject.add(r),
        r.position.set(t.x, t.y, t.z),
        r.up = new THREE.Vector3(0,0,1),
        r.lookAt(new THREE.Vector3(0,0,t.z));
        var n = a.rotation.x
          , s = a.rotation.y
          , l = a.rotation.z
          , d = .01 * (100 * Math.random()) + starfieldScaleFactor;
        a.scale.set(d, d, d);
        var p = t.y / starfieldStartZ;
        starfieldDetailsArray.push({
            origin: new THREE.Vector3(t.x,t.y,starfieldStartZ),
            current: new THREE.Vector3(t.x,t.y,t.z),
            destination: new THREE.Vector3(t.x,t.y,starfieldEndZ),
            rot: new THREE.Vector3(n,s,l),
            scale: d,
            rotation: 90,
            velocity: (1 - p) * -9
        })
    }
    warpObject.add(starfieldObject),
    renderer.compile(scene, camera),
    starfieldCreated = !0
}
function renderStarfield() {
    if (starfieldCreated) {
        warpVars.isFinished || (isIntroStarted ? !warpVars.isTriggered && (gsap.to(starfieldVars, 1, {
            velocity: 15
        }),
        gsap.to(starfieldVars, 1, {
            scale: 1,
            stretch: 25
        }),
        gsap.to(starfieldVars, .5, {
            rotation: 0
        }),
        gsap.to(starfieldMaterialColorArray, 2, {
            r: starfieldColorHyper.r,
            g: starfieldColorHyper.g,
            b: starfieldColorHyper.b
        })) : warpVars.isTriggered && (gsap.to(starfieldVars, 3, {
            velocity: .05
        }),
        gsap.to(starfieldVars, .5, {
            scale: 1,
            stretch: 1
        }),
        gsap.to(starfieldVars, .5, {
            rotation: -90
        }),
        gsap.to(starfieldMaterialBlue.color, 2, {
            r: starfieldColorBlue.r,
            g: starfieldColorBlue.g,
            b: starfieldColorBlue.b
        }),
        gsap.to(starfieldMaterialOrange.color, 2, {
            r: starfieldColorOrange.r,
            g: starfieldColorOrange.g,
            b: starfieldColorOrange.b
        }),
        gsap.to(starfieldMaterialWhite.color, 2, {
            r: starfieldColorWhite.r,
            g: starfieldColorWhite.g,
            b: starfieldColorWhite.b
        })));
        for (var t, e = 0; e < starfieldDetailsArray.length; e++)
            t = starfieldDetailsArray[e],
            t.current.z >= t.destination.z && (t.current.z = t.origin.z),
            t.current.z += starfieldVars.velocity,
            starfieldObjectsArray[e].position.z = t.current.z,
            starfieldSpritesArray[e].scale.x = t.scale * starfieldVars.scale,
            starfieldSpritesArray[e].scale.y = t.scale * starfieldVars.scale * starfieldVars.stretch,
            starfieldSpritesArray[e].rotation.x = starfieldVars.rotation * toRAD
    }
}
function updateDistance() {
    warpVars.isFinished || (isIntroStarted ? !warpVars.isTriggered && (warpVars.isTriggered = !0,
    gsap.to(warpVars, 1, {
        distanceSpeed: 5512
    })) : warpVars.isTriggered && (warpVars.isTriggered = !1,
    gsap.to(warpVars, 1, {
        distanceSpeed: .1
    })),
    warpVars.distanceCurrent -= warpVars.distanceSpeed,
    0 >= warpVars.distanceCurrent && (warpVars.isFinished = !0,
    warpVars.distanceCurrent = 0,
    finishWarp()))
}
function updateWarpStatus() {
    warpVars.isFinished || (isIntroStarted ? !warpVars.isTriggered && (warpVars.isTriggered = !0) : warpVars.isTriggered && (warpVars.isTriggered = !1))
}
function finishWarp() {
    for (isWarpComplete = !0,
    gsap.to([sonicVars, tunnelVars, wormholeVars], 1, {
        opacity: 0
    }),
    gsap.to([sonicVars, tunnelVars, wormholeVars], 3, {
        textureSpeed: 0,
        rotationSpeed: 0
    }),
    gsap.to(lightVars, 3, {
        velocity: 0,
        intensity: 0
    }),
    gsap.to(starfieldVars, 3, {
        scale: 1,
        stretch: 1,
        velocity: 0
    }),
    gsap.to(starfieldMaterialBlue.color, 2, {
        r: starfieldColorBlue.r,
        g: starfieldColorBlue.g,
        b: starfieldColorBlue.b
    }),
    gsap.to(starfieldMaterialOrange.color, 2, {
        r: starfieldColorOrange.r,
        g: starfieldColorOrange.g,
        b: starfieldColorOrange.b
    }),
    gsap.to(starfieldMaterialWhite.color, 2, {
        r: starfieldColorWhite.r,
        g: starfieldColorWhite.g,
        b: starfieldColorWhite.b
    }),
    gsap.to([starfieldMaterialBlue, starfieldMaterialOrange, starfieldMaterialWhite], 3, {
        opacity: 0,
        onComplete: function() {
            starfieldObject.visible = !1
        }
    }),
    issObject.visible = !0,
    issObject.scale.set(1, 1, 1),
    gsap.to(lightISS_Primary, 2, {
        intensity: .75,
        ease: "none"
    }),
    gsap.to(lightISS_Secondary, 2, {
        intensity: 1,
        ease: "none"
    }),
    gsap.to([lightISS_Top, lightISS_Bottom], 2, {
        intensity: .5,
        ease: "none"
    }),
    gsap.to([lightClose, lightFar, lightBurst], 1, {
        intensity: 0,
        ease: "none",
        onComplete: function() {
            lightColorAnimation.pause()
        }
    }),
    gsap.fromTo(issObject.position, 3, {
        z: -1e3
    }, {
        z: -150,
        ease: "expo.out"
    }),
    gsap.to([starMaterialBlue, starMaterialOrange, starMaterialWhite], 5, {
        opacity: 1,
        onStart: function() {
            starsObject.visible = !0
        }
    }),
    i = 0; i < orbSpriteArray.length; i++)
        gsap.to(orbSpriteArray[i].scale, 3, {
            x: orbSpriteSize,
            y: orbSpriteSize,
            z: orbSpriteSize,
            ease: "expo.out",
            delay: .5
        });
    var t = orbRingBufferGeometry.attributes.alpha.array
      , e = orbRingOpacityArray;
    e.onUpdate = function() {
        orbRingBufferGeometry.attributes.alpha.needsUpdate = !0
    }
    ,
    gsap.to(t, 3, e),
    gsap.fromTo(orbObject.position, 3, {
        z: -50
    }, {
        z: 0,
        ease: "expo.out"
    }),
    showInterface()
}
var universeBgTexture, universeBgMaterial, universeBgGeometry, universeBgMesh, universeCreated = !1;
function createUniverse() {
    universeBgGeometry = new THREE.SphereGeometry(3e7,32,32),
    universeBgMaterial = new THREE.MeshBasicMaterial({
        map: universeBgTexture,
        transparent: !0,
        opacity: 0,
        side: THREE.BackSide
    }),
    universeBgMaterial.anisotropy = renderer.capabilities.getMaxAnisotropy(),
    universeBgMesh = new THREE.Mesh(universeBgGeometry,universeBgMaterial),
    scene.add(universeBgMesh),
    renderer.compile(scene, camera)
}
var starsObject, starMaterialBlue, starMaterialOrange, starMaterialWhite, starDistance = 3e7, starTotal = 2e3, starScaleFactor = 1, starMaterialArray = [], starMaterialColorArray = [], starsCreated = !1;
function createStars() {
    for (starsObject = new THREE.Group,
    starsObject.visible = !1,
    scene.add(starsObject),
    starMaterialBlue = new THREE.MeshBasicMaterial({
        map: starfieldTexture,
        color: starfieldColorBlue,
        opacity: 0,
        transparent: !0,
        blending: THREE.AdditiveBlending,
        depthWrite: !1,
        depthTest: !0
    }),
    starMaterialOrange = new THREE.MeshBasicMaterial({
        map: starfieldTexture,
        color: starfieldColorOrange,
        transparent: !0,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: !1,
        depthTest: !0
    }),
    starMaterialWhite = new THREE.MeshBasicMaterial({
        map: starfieldTexture,
        color: starfieldColorWhite,
        transparent: !0,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: !1,
        depthTest: !0
    }),
    starMaterialArray = [starMaterialBlue, starMaterialOrange, starMaterialWhite],
    starMaterialColorArray = [starMaterialBlue.color, starMaterialOrange.color, starMaterialWhite.color],
    starColorTotal = starMaterialArray.length - 1,
    deviceSettings.isMobile && (starTotal = Math.floor(starTotal / 3),
    starScaleFactor = 1.5),
    i = 0; i < starTotal; i++) {
        var t = new THREE.Vector3
          , e = 2 * Math.PI * Math.random()
          , o = Math.acos(2 * Math.random() - 1);
        t.x = 0 + starDistance * Math.sin(o) * Math.cos(e),
        t.y = 0 + starDistance * Math.sin(o) * Math.sin(e),
        t.z = 0 + starDistance * Math.cos(o);
        var a = new THREE.PlaneBufferGeometry(1,1,1)
          , r = starMaterialArray[generateRandomNumber(0, starColorTotal)]
          , n = new THREE.Mesh(a,r);
        n.position.set(t.x, t.y, t.z),
        n.lookAt(new THREE.Vector3(0,0,0));
        var s = 1e3 * generateRandomNumber(100, 350) * starScaleFactor;
        i > .25 * starTotal && (s = 2e5),
        n.scale.set(s, s, s),
        starsObject.add(n)
    }
    starsCreated = !0
}
var earthObject, earthTexture, earthMesh, flatEarthObject, flatEarthTexture, flatEarthMesh, isFlatEarth = !1, isEarthCreated = !1, isFlatEarthCreated = !1;
function createEarth() {
    earthObject = new THREE.Object3D,
    scene.add(earthObject),
    earthMesh = new THREE.Mesh(new THREE.SphereGeometry(6371,64,64),new THREE.MeshPhongMaterial({
        map: earthTexture,
        shininess: 0
    })),
    earthMesh.material.anisotropy = renderer.capabilities.getMaxAnisotropy(),
    earthObject.add(earthMesh);
    earthObject.position.y = -1000 * (450 + 6371),
    earthObject.rotation.z = 51 * toRAD,
    earthObject.scale.set(1000, 1000, 1000),
    renderer.compile(scene, camera),
    isEarthCreated = !0
}
function createFlatEarth() {
    flatEarthObject = new THREE.Object3D,
    scene.add(flatEarthObject),
    flatEarthObject.position.set(0, -1500, -3e3),
    flatEarthObject.rotation.x = -100 * toRAD,
    flatEarthObject.scale.set(2, 2, 2),
    flatEarthObject.visible = !1,
    flatEarthTexture = textureLoader.load("img/flat_earth.png"),
    flatEarthMesh = new THREE.Mesh(new THREE.PlaneGeometry(2048,2048,32),new THREE.MeshPhongMaterial({
        map: flatEarthTexture,
        transparent: !0
    })),
    flatEarthObject.add(flatEarthMesh),
    isFlatEarthCreated = !0
}
function renderEarth() {
    isFlatEarth && (flatEarthMesh.rotation.z = flatEarthMesh.rotation.z += .05 * toRAD)
}
function createSheetMaterial(t, e) {
    var o = {
        map: {
            type: "t",
            value: e
        },
        u_opacity: {
            type: "t",
            value: 1
        },
        u_uvRect: {
            type: "v4",
            value: new THREE.Vector4(t.x / 2048,t.y / 2048,t.w / 2048,t.h / 2048)
        }
    };
    return new THREE.ShaderMaterial({
        uniforms: o,
        vertexShader: document.getElementById("vertex_shader").textContent,
        fragmentShader: document.getElementById("fragment_shader").textContent,
        blending: THREE.AdditiveBlending,
        transparent: !0,
        side: THREE.DoubleSide,
        depthWrite: !1,
        depthTest: !1
    })
}
function getFrame(t) {
    var e = forwardViewSpriteJson.frames;
    for (let o of Object.keys(e)) {
        let a = e[o];
        if (t === o)
            return a.frame
    }
}
var orbObject, orbRollObject, orbPitchObject, orbYawObject, orbFadeTarget, orbRadius = 15, orbTotal = 180, orbAngle = 2 * Math.PI / 180, orbSpriteSize = .35, orbArrowArray = [], orbBracketArray = [], orbNumberArray = [], orbSpriteArray = [], isOrbCreated = !1;
function createOrb() {
    orbObject = new THREE.Object3D,
    orbObject.rotation.order = "YXZ",
    camera.add(orbObject),
    orbRollObject = new THREE.Object3D,
    orbObject.add(orbRollObject),
    orbYawObject = new THREE.Object3D,
    orbRollObject.add(orbYawObject),
    orbPitchObject = new THREE.Object3D,
    orbRollObject.add(orbPitchObject);
    var t = []
      , e = []
      , o = getFrame("numbers/num-0-yaw.png", forwardViewSpriteJson);
    t.push(o);
    var a = forwardViewSpriteJson.frames;
    for (let o of Object.keys(a)) {
        let r = a[o]
          , i = r.frame;
        if (i.name = o,
        -1 < o.indexOf("arrows/") && orbArrowArray.push(i),
        -1 < o.indexOf("brackets/") && orbBracketArray.push(i),
        -1 < o.indexOf("numbers/num-pos-")) {
            if ("numbers/num-pos-180.png" === o)
                continue;
            t.push(i)
        }
        if (-1 < o.indexOf("numbers/num-neg-")) {
            if ("numbers/num-neg-180.png" === o)
                continue;
            e.push(i)
        }
    }
    var r = getFrame("numbers/num-end-yaw.png", forwardViewSpriteJson);
    e.push(r),
    e = e.reverse(),
    orbNumberArray = t.concat(e);
    var n = new THREE.PlaneGeometry(1,1,1,1);
    for (i = 0; i < orbTotal; i++)
        if (0 != i % 2) {
            var s = new THREE.Vector3;
            s.x = orbRadius * Math.cos(orbAngle * i),
            s.y = 0,
            s.z = orbRadius * Math.sin(orbAngle * i),
            s.applyAxisAngle(new THREE.Vector3(0,1,0), 90 * toRAD);
            var l;
            l = 90 > i ? 10 >= i ? createSheetMaterial(orbArrowArray[i + 9], forwardViewSpriteTexture) : createSheetMaterial(orbArrowArray[19], forwardViewSpriteTexture) : 171 <= i ? createSheetMaterial(orbArrowArray[179 - i], forwardViewSpriteTexture) : createSheetMaterial(orbArrowArray[9], forwardViewSpriteTexture),
            l.needsUpdate = !0;
            var d = new THREE.Mesh(n,l);
            d.position.set(s.x, s.y, s.z),
            d.scale.set(orbSpriteSize, orbSpriteSize, orbSpriteSize),
            d.scale.set(.01, .01, .01),
            d.lookAt(new THREE.Vector3(0,0,0)),
            orbSpriteArray.push(d),
            orbYawObject.add(d);
            var s = new THREE.Vector3;
            s.x = 0,
            s.y = orbRadius * Math.cos(orbAngle * i),
            s.z = orbRadius * Math.sin(orbAngle * i),
            s.applyAxisAngle(new THREE.Vector3(1,0,0), -90 * toRAD);
            var l;
            l = 90 > i ? 10 >= i ? createSheetMaterial(orbBracketArray[i + 9], forwardViewSpriteTexture) : createSheetMaterial(orbBracketArray[19], forwardViewSpriteTexture) : 171 <= i ? createSheetMaterial(orbBracketArray[179 - i], forwardViewSpriteTexture) : createSheetMaterial(orbBracketArray[9], forwardViewSpriteTexture),
            l.needsUpdate = !0;
            var p = new THREE.Mesh(n,l);
            p.position.set(s.x, s.y, s.z),
            p.scale.set(orbSpriteSize, orbSpriteSize, orbSpriteSize),
            p.scale.set(.01, .01, .01),
            p.up = new THREE.Vector3(0,0,1),
            p.lookAt(new THREE.Vector3(0,0,0)),
            orbSpriteArray.push(p),
            orbPitchObject.add(p)
        }
    for (i = 0; i < orbTotal; i++)
        if (0 == i % 2) {
            var s = new THREE.Vector3;
            s.x = orbRadius * Math.cos(orbAngle * i),
            s.y = 0,
            s.z = orbRadius * Math.sin(orbAngle * i),
            s.applyAxisAngle(new THREE.Vector3(0,1,0), 90 * toRAD);
            var l;
            if (0 === i) {
                var c = getFrame("numbers/num-0-yaw.png", forwardViewSpriteJson);
                l = createSheetMaterial(c, forwardViewSpriteTexture)
            } else if (90 === i) {
                var c = getFrame("numbers/num-end-yaw.png", forwardViewSpriteJson);
                l = createSheetMaterial(c, forwardViewSpriteTexture)
            } else
                l = createSheetMaterial(orbNumberArray[i], forwardViewSpriteTexture);
            var u = new THREE.Mesh(n,l);
            u.position.set(s.x, s.y, s.z),
            u.scale.set(orbSpriteSize, orbSpriteSize, orbSpriteSize),
            u.scale.set(.01, .01, .01),
            u.lookAt(new THREE.Vector3(0,0,0)),
            orbSpriteArray.push(u),
            orbYawObject.add(u);
            var s = new THREE.Vector3;
            s.x = 0,
            s.y = orbRadius * Math.cos(orbAngle * i),
            s.z = orbRadius * Math.sin(orbAngle * i),
            s.applyAxisAngle(new THREE.Vector3(1,0,0), -90 * toRAD);
            var l;
            if (0 === i) {
                var c = getFrame("numbers/num-0-pitch.png", forwardViewSpriteJson);
                l = createSheetMaterial(c, forwardViewSpriteTexture)
            } else if (90 === i) {
                var c = getFrame("numbers/num-end-pitch.png", forwardViewSpriteJson);
                l = createSheetMaterial(c, forwardViewSpriteTexture)
            } else
                l = createSheetMaterial(orbNumberArray[i], forwardViewSpriteTexture);
            var u = new THREE.Mesh(n,l);
            u.position.set(s.x, s.y, s.z),
            u.scale.set(orbSpriteSize, orbSpriteSize, orbSpriteSize),
            u.scale.set(.01, .01, .01),
            u.lookAt(new THREE.Vector3(0,0,0)),
            orbSpriteArray.push(u),
            orbPitchObject.add(u)
        }
    orbFadeTarget = new THREE.Mesh(n,new THREE.MeshBasicMaterial({})),
    orbFadeTarget.position.set(0, 0, -15),
    orbFadeTarget.rotation.x = 90 * toRAD,
    orbObject.add(orbFadeTarget),
    createRings(),
    isOrbCreated = !0
}
var orbRingObject, orbRingBufferGeometry, orbRingShaderMaterial, orbRingMesh1, orbRingMesh2, orbRingMesh3, orbRingMesh4, orbRingLineTotal = 250, orbRingAngle = 2 * Math.PI / 250, orbRingVerticesArray = [], orbRingMaxOpacity = .25, orbRingOpacityArray = [];
function createRings() {
    for (orbRingObject = new THREE.Object3D,
    orbRollObject.add(orbRingObject),
    r = 0; r < orbRingLineTotal; r++) {
        var t = new THREE.Vector3;
        t.x = orbRadius * Math.cos(orbRingAngle * r),
        t.y = 0,
        t.z = orbRadius * Math.sin(orbRingAngle * r),
        t.applyAxisAngle(new THREE.Vector3(0,1,0), 90 * toRAD),
        orbRingVerticesArray.push(t)
    }
    orbRingBufferGeometry = new THREE.BufferGeometry,
    orbRingShaderUniforms = {
        color: {
            value: new THREE.Color(16777215)
        },
        fogColor: {
            type: "c",
            value: scene.fog.color
        },
        fogNear: {
            type: "f",
            value: scene.fog.near
        },
        fogFar: {
            type: "f",
            value: scene.fog.far
        }
    },
    orbRingShaderMaterial = new THREE.ShaderMaterial({
        uniforms: orbRingShaderUniforms,
        vertexShader: document.getElementById("line_vertexshader").textContent,
        fragmentShader: document.getElementById("line_fragmentshader").textContent,
        blending: THREE.AdditiveBlending,
        depthTest: !1,
        fog: !0,
        transparent: !0
    });
    for (var e = orbFadeTarget.getWorldPosition(new THREE.Vector3), o = new Float32Array(3 * orbRingVerticesArray.length), a = new Float32Array(orbRingVerticesArray.length), r = 0; r < orbRingVerticesArray.length; r++) {
        o[3 * r] = orbRingVerticesArray[r].x,
        o[3 * r + 1] = orbRingVerticesArray[r].y,
        o[3 * r + 2] = orbRingVerticesArray[r].z;
        var n = orbRingVerticesArray[r]
          , s = Math.abs(n.distanceTo(e))
          , l = opacityDistanceClamp(s, 5, 1, orbRingMaxOpacity);
        orbRingOpacityArray.push(l),
        a[r] = 0
    }
    orbRingBufferGeometry.setAttribute("position", new THREE.BufferAttribute(o,3)),
    orbRingBufferGeometry.setAttribute("alpha", new THREE.BufferAttribute(a,1)),
    orbRingMesh1 = new THREE.LineLoop(orbRingBufferGeometry,orbRingShaderMaterial),
    orbRingMesh2 = orbRingMesh1.clone(),
    orbRingMesh3 = orbRingMesh1.clone(),
    orbRingMesh4 = orbRingMesh1.clone(),
    orbRingMesh1.position.y = 4,
    orbRingMesh1.rotation.x = -12 * toRAD,
    orbRingMesh2.position.y = -4,
    orbRingMesh2.rotation.x = 12 * toRAD,
    orbRingMesh3.position.x = -4,
    orbRingMesh3.rotation.y = -12 * toRAD,
    orbRingMesh3.rotation.z = 90 * toRAD,
    orbRingMesh4.position.x = 4,
    orbRingMesh4.rotation.y = 12 * toRAD,
    orbRingMesh4.rotation.z = 90 * toRAD,
    orbRingObject.add(orbRingMesh1),
    orbRingObject.add(orbRingMesh2),
    orbRingObject.add(orbRingMesh3),
    orbRingObject.add(orbRingMesh4)
}
function opacityDistanceClamp(t, e, o, a) {
    var r = a;
    return t < e && (t > o ? r = (t - o) / (e - o) * a : r = 0),
    r
}
function rotatePoint(t, e, o, a, r) {
    var i = Math.PI / 180 * r
      , n = Math.cos(i)
      , s = Math.sin(i);
    return [n * (o - t) + s * (a - e) + t, n * (a - e) - s * (o - t) + e]
}
function getDistance(t, e) {
    var o = t.position.x - e.position.x
      , a = t.position.y - e.position.y
      , r = t.position.z - e.position.z;
    return sqrt(o * o + a * a + r * r)
}
function renderOrb() {
    if (isOrbCreated) {
        orbYawObject.rotation.y = -camera.rotation.y,
        orbPitchObject.rotation.x = -camera.rotation.x,
        orbRollObject.rotation.z = -camera.rotation.z;
        var t = orbFadeTarget.getWorldPosition(new THREE.Vector3);
        for (i = 0; i < orbSpriteArray.length; i++) {
            var e = orbSpriteArray[i].getWorldPosition(new THREE.Vector3)
              , o = Math.abs(e.distanceTo(t));
            orbSpriteArray[i].material.uniforms.u_opacity.value = opacityDistanceClamp(o, 5, 2, 1)
        }
    }
}
var issObject, issMesh, issLoader, issModel = "iss.glb", isIssLoaded = !1;
function createIss() {
    issObject = new THREE.Object3D,
    issObject.position.z = -1e3,
    issObject.scale.set(.001, .001, .001),
    scene.add(issObject),
    issLoader = new THREE.GLTFLoader().setPath("3d/"),
    deviceSettings.isMobile && (issModel = "iss_mobile.glb"),
    issLoader.load(issModel, function(t) {
        function e(t, e) {
            var o = new THREE.Mesh(new THREE.TorusGeometry(10,.3,5,6),new THREE.MeshBasicMaterial({
                color: 2413309,
                transparent: !0,
                opacity: e,
                side: THREE.DoubleSide
            }));
            return o.scale.set(t, t, t),
            o
        }
        t.scene.traverse(function(t) {
            t.isMesh
        }),
        issMesh = t.scene,
        issObject.add(issMesh),
        hitArray.push(issMesh),
        renderer.compile(scene, camera),
        isIssLoaded = !0;
        var o = e(1, .15);
        o.position.z = 20,
        issObject.add(o);
        var a = e(2, .2);
        a.position.z = 40,
        issObject.add(a);
        var r = e(4, .25);
        r.position.z = 80,
        issObject.add(r);
        var i = document.createElement("div");
        i.className = "label",
        i.id = "iss_target";
        var n = new THREE.CSS2DObject(i);
        n.position.set(0, 0, 0),
        issObject.add(n),
        gsap.to("#preloader-circle .circle-color", .25, {
            drawSVG: "0% 100%",
            ease: "expo.out",
            onComplete: function() {
                initExperience()
            }
        })
    }, function(t) {
        var e = Math.round(100 * (t.loaded / t.total));
        updatePreloader(e)
    })
}
var teslaMesh, isTeslaCreated = !1, isTeslaLoaded = !1;
function createTesla() {
    var t = new THREE.GLTFLoader().setPath("3d/");
    t.load("tesla.glb", function(t) {
        teslaMesh = t.scene,
        teslaMesh.position.set(12, 42, 80),
        teslaMesh.rotation.y = 90 * toRAD,
        teslaMesh.visible = !1,
        scene.add(teslaMesh),
        hitArray.push(teslaMesh);
        var e = new THREE.PointLight(lightColorWhite,1,5);
        e.position.set(12, 44, 78),
        scene.add(e),
        isTeslaLoaded = !0
    }, function() {}),
    isTeslaCreated = !0
}
function renderTesla() {
    2.5 < camera.rotation.y || -2.5 > camera.rotation.y ? (!isTeslaCreated && createTesla(),
    isTeslaLoaded && (teslaMesh.visible = !0)) : isTeslaLoaded && (teslaMesh.visible = !1)
}
var navballRotationObject, navballPerspectiveObject, navballObject, navballGeometry, navballMaterial, navballTexture, navballMesh, navballMarkerObject, navballLights, navballLightsGlowBottom, navballLightsParticle, navballRadius = 5, navballLightsColor = new THREE.Color("#FFFFFF"), navballLightsIntensity = 1.5, navballLightsDistance = 400, navballLightsDecay = 1, navballCreated = !1;
function createNavball() {
    navballRotationObject = new THREE.Group,
    navballScene.add(navballRotationObject),
    navballPerspectiveObject = new THREE.Group,
    navballScene.add(navballPerspectiveObject),
    navballObject = new THREE.Object3D,
    navballObject.position.x = 0,
    navballObject.position.y = 0,
    navballObject.position.z = -15,
    navballCamera.add(navballObject),
    navballGeometry = new THREE.IcosahedronGeometry(navballRadius,1),
    navballTexture.anisotropy = 16,
    navballMaterial = new THREE.MeshPhongMaterial({
        map: navballTexture
    }),
    navballSphereGeometry = new THREE.SphereGeometry(navballRadius,32,32),
    navballMesh = new THREE.Mesh(navballSphereGeometry,navballMaterial),
    navballMesh.rotation.x = -90 * toRAD,
    navballMesh.rotation.y = 0 * toRAD,
    navballMesh.rotation.z = -90 * toRAD,
    navballMesh.updateMatrix(),
    navballObject.add(navballMesh),
    navballLights = new THREE.PointLight(navballLightsColor,navballLightsIntensity,navballLightsDistance,navballLightsDecay),
    navballLights.position.x = 0,
    navballLights.position.y = 100,
    navballLights.position.z = 100,
    navballScene.add(navballLights),
    navballRenderer.compile(scene, camera),
    navballCreated = !0
}
function renderNavball() {
    if (navballCreated) {
        var t = new THREE.Quaternion().copy(camera.quaternion).conjugate();
        navballObject.setRotationFromQuaternion(t)
    }
}
var prevRange, prevRangeTime, moveSpeed = .05, currentLocationX = 0, currentLocationY = 0, currentLocationZ = 0, targetLocationX = 0, targetLocationY = 0, targetLocationZ = 0, currentRotationX = 0, currentRotationY = 0, currentRotationZ = 0, targetRotationX = 0, targetRotationY = 0, targetRotationZ = 0, fixedRotationX = 0, fixedRotationY = 0, fixedRotationZ = 0, motionVector = new THREE.Vector3(0,0,0), translationVector = new THREE.Vector3(0,0,0), gravity = 1e-4, rangeRateCounter = 0, smoothRangeRate = 0, rateSmoothingFactor = 2;
function animate() {
    requestAnimationFrame(animate),
    render()
}
function render() {
	// NOTE: The rendeting function we would like to hook on to.
    if (scene.updateMatrixWorld(),
    isWarpComplete) {
        currentRotationX = currentRotationX += (.01 * -targetRotationX - currentRotationX) * moveSpeed,
        currentRotationY = currentRotationY += (.01 * -targetRotationY - currentRotationY) * moveSpeed,
        currentRotationZ = currentRotationZ += (.01 * -targetRotationZ - currentRotationZ) * moveSpeed,
        camera.rotateX(currentRotationX),
        camera.rotateY(currentRotationY),
        camera.rotateZ(currentRotationZ),
        currentLocationX = currentLocationX += (-0 - currentLocationX) * moveSpeed,
        currentLocationY = currentLocationY += (-0 - currentLocationY) * moveSpeed,
        currentLocationZ = currentLocationZ += (-0 - currentLocationZ) * moveSpeed,
        camera.position.add(motionVector),
        !isGameOver && isGravity && (camera.position.y -= gravity),
        fixedRotationX = (camera.rotation.x / toRAD).toFixed(1),
        fixedRotationY = (camera.rotation.y / toRAD).toFixed(1),
        fixedRotationZ = (camera.rotation.z / toRAD).toFixed(1),
        $("#pitch .error").innerHTML = fixedRotationX + "\xB0",
        $("#yaw .error").innerHTML = fixedRotationY + "\xB0",
        $("#roll .error").innerHTML = fixedRotationZ + "\xB0";
        var t = .1 * rateRotationX
          , e = .1 * rateRotationY
          , o = .1 * rateRotationZ;
        $("#pitch .rate").innerHTML = t.toFixed(1) + " \xB0/s",
        $("#yaw .rate").innerHTML = e.toFixed(1) + " \xB0/s",
        $("#roll .rate").innerHTML = o.toFixed(1) + " \xB0/s";
        var a = camera.position.z - issObject.position.z
          , r = camera.position.x - issObject.position.x
          , i = camera.position.y - issObject.position.y;
        $("#x-range .distance").innerHTML = a.toFixed(1) + " m",
        $("#y-range .distance").innerHTML = r.toFixed(1) + " m",
        $("#z-range .distance").innerHTML = i.toFixed(1) + " m";
        var n = Math.sqrt(a * a + r * r + i * i);
        if ($("#range .rate").innerHTML = n.toFixed(1) + " m",
        rangeRateCounter += 1,
        20 <= rangeRateCounter) {
            rangeRateCounter = 0;
            var s = Date.now();
            rateCurrent = .75 * (1e3 * ((n - prevRange) / (s - prevRangeTime))),
            smoothRangeRate += (rateCurrent - smoothRangeRate) / rateSmoothingFactor,
            $("#rate .rate").innerHTML = smoothRangeRate.toFixed(3) + " m/s",
            prevRange = n,
            prevRangeTime = s
        }
        prevRange = n,
        prevRangeTime = Date.now(),
        earthMesh.rotateY(1e-4)
    } else
        camera.position.x += .01 * (mouseX - camera.position.x),
        camera.position.y += .01 * (-mouseY - camera.position.y),
        camera.lookAt(scene.position);
    renderWormhole(),
    renderTunnel(),
    renderSonic(),
    renderStarfield(),
    renderLights(),
    renderNavball(),
    renderEarth(),
    renderOrb(),
    renderTesla(),
    updateDistance(),
    updateWarpStatus(),
    checkCollision(),
    renderer.render(scene, camera),
    navballRenderer.render(navballScene, navballCamera),
    tooltipRenderer.render(scene, camera)
}
var toleranceRotation = .2
  , toleranceRate = .004;
function checkCollision() {
    if (!0 !== isGameOver) {
        var t = hitRaycaster.intersectObjects(hitArray, !0)
          , e = Math.abs(camera.position.distanceTo(issObject.position))
          , o = Math.abs(camera.rotation.x / toRAD)
          , a = Math.abs(camera.rotation.y / toRAD)
          , r = Math.abs(camera.rotation.z / toRAD)
          , i = Math.abs(motionVector.x)
          , n = Math.abs(motionVector.y)
          , s = Math.abs(motionVector.z);
        if (hitDistance = .5 < e ? 1 : .1,
        hitRaycaster.far = hitDistance,
        .02 <= i || .02 <= n || .02 <= s ? updateRateColor("warning") : i > toleranceRate || n > toleranceRate || s > toleranceRate ? updateRateColor("caution") : updateRateColor("normal"),
        0 < t.length && ($("#fail-message").innerHTML = "You made contact with the International Space Station.",
        hideInterface("fail")),
        500 < e && ($("#fail-message").innerHTML = "You are too far away from the International Space Station.",
        hideInterface("fail")),
        .2 > e && -150 < camera.position.z)
            if (o <= toleranceRotation && a <= toleranceRotation && r <= toleranceRotation && i <= toleranceRate && n <= toleranceRate && s <= toleranceRate)
                hideInterface("success");
            else {
                var l = "";
                (o > toleranceRotation || a > toleranceRotation || r > toleranceRotation) && (l = "ROTATION"),
                (i > toleranceRate || n > toleranceRate || s > toleranceRate) && ("" != l && (l += ", "),
                l += "SPEED"),
                $("#fail-message").innerHTML = "The following errors occurred: <span class='red'>" + l + "<span>",
                hideInterface("fail")
            }
    }
}
function rollLeft() {
    !0 === isGameOver || (targetRotationZ -= rotationPulseSize * toRAD,
    rateRotationZ -= rateSpeedSize,
    gsap.fromTo("#tip-roll-left", 1.25, {
        rotation: -25,
        autoAlpha: 1
    }, {
        rotation: -90,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    updateWorm("roll"))
}
function rollRight() {
    !0 === isGameOver || (targetRotationZ += rotationPulseSize * toRAD,
    rateRotationZ += rateSpeedSize,
    gsap.fromTo("#tip-roll-right", 1.25, {
        rotation: 25,
        autoAlpha: 1
    }, {
        rotation: 90,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    updateWorm("roll"))
}
function pitchDown() {
    !0 === isGameOver || (targetRotationX += rotationPulseSize * toRAD,
    rateRotationX += rateSpeedSize,
    gsap.fromTo("#tip-pitch-down", 1.25, {
        rotation: 180,
        rotationX: -25,
        autoAlpha: 1
    }, {
        rotationX: -90,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    updateWorm("pitch"))
}
function pitchUp() {
    !0 === isGameOver || (targetRotationX -= rotationPulseSize * toRAD,
    rateRotationX -= rateSpeedSize,
    gsap.fromTo("#tip-pitch-up", 1.25, {
        rotationX: -25,
        autoAlpha: 1
    }, {
        rotationX: -90,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    updateWorm("pitch"))
}
function yawLeft() {
    !0 === isGameOver || (targetRotationY -= rotationPulseSize * toRAD,
    rateRotationY -= rateSpeedSize,
    gsap.fromTo("#tip-yaw-left", 1.25, {
        rotation: -90,
        rotationX: -25,
        autoAlpha: 1
    }, {
        rotationX: -90,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    updateWorm("yaw"))
}
function yawRight() {
    !0 === isGameOver || (targetRotationY += rotationPulseSize * toRAD,
    rateRotationY += rateSpeedSize,
    gsap.fromTo("#tip-yaw-right", 1.25, {
        rotation: 90,
        rotationX: -25,
        autoAlpha: 1
    }, {
        rotationX: -90,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    updateWorm("yaw"))
}
function translateForward() {
    !0 === isGameOver || (translationVector = new THREE.Vector3(0,0,-translationPulseSize),
    translationVector.applyQuaternion(camera.quaternion),
    motionVector.add(translationVector),
    gsap.fromTo("#tip-translate-forward-up .arrow, #tip-translate-forward-right .arrow, #tip-translate-forward-down .arrow, #tip-translate-forward-left .arrow", 2, {
        y: 250,
        scale: 1,
        autoAlpha: 1
    }, {
        y: 100,
        scale: .25,
        autoAlpha: 0,
        ease: "expo.out"
    }))
}
function translateBackward() {
    !0 === isGameOver || (translationVector = new THREE.Vector3(0,0,translationPulseSize),
    translationVector.applyQuaternion(camera.quaternion),
    motionVector.add(translationVector),
    gsap.fromTo("#tip-translate-backward-up .arrow, #tip-translate-backward-right .arrow, #tip-translate-backward-down .arrow, #tip-translate-backward-left .arrow", 2, {
        y: 100,
        scaleX: 0,
        scaleY: 0
    }, {
        y: 250,
        scaleX: 1,
        scaleY: 1,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translate-backward-up .arrow, #tip-translate-backward-right .arrow, #tip-translate-backward-down .arrow, #tip-translate-backward-left .arrow", 3, {
        autoAlpha: 1
    }, {
        autoAlpha: 0,
        ease: "expo.out"
    }))
}
function translateDown() {
    !0 === isGameOver || (translationVector = new THREE.Vector3(0,-translationPulseSize,0),
    translationVector.applyQuaternion(camera.quaternion),
    motionVector.add(translationVector),
    gsap.fromTo("#tip-translatey-pos .arrow1", 2, {
        x: 0,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -50,
        scale: 1,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translatey-pos .arrow2", 2, {
        x: -5,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -100,
        scale: .5,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translatey-pos .arrow3", 2, {
        x: -10,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -150,
        scale: .25,
        autoAlpha: 0,
        ease: "expo.out"
    }))
}
function translateUp() {
    !0 === isGameOver || (translationVector = new THREE.Vector3(0,translationPulseSize,0),
    translationVector.applyQuaternion(camera.quaternion),
    motionVector.add(translationVector),
    gsap.fromTo("#tip-translatey-neg .arrow1", 2, {
        x: 0,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -50,
        scale: 1,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translatey-neg .arrow2", 2, {
        x: -5,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -100,
        scale: .5,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translatey-neg .arrow3", 2, {
        x: -10,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -150,
        scale: .25,
        autoAlpha: 0,
        ease: "expo.out"
    }))
}
function translateRight() {
    !0 === isGameOver || (translationVector = new THREE.Vector3(translationPulseSize,0,0),
    translationVector.applyQuaternion(camera.quaternion),
    motionVector.add(translationVector),
    gsap.fromTo("#tip-translatex-pos .arrow1", 2, {
        x: 0,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -50,
        scale: 1,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translatex-pos .arrow2", 2, {
        x: -5,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -100,
        scale: .5,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translatex-pos .arrow3", 2, {
        x: -10,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -150,
        scale: .25,
        autoAlpha: 0,
        ease: "expo.out"
    }))
}
function translateLeft() {
    !0 === isGameOver || (translationVector = new THREE.Vector3(-translationPulseSize,0,0),
    translationVector.applyQuaternion(camera.quaternion),
    motionVector.add(translationVector),
    gsap.fromTo("#tip-translatex-neg .arrow1", 2, {
        x: 0,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -50,
        scale: 1,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translatex-neg .arrow2", 2, {
        x: -5,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -100,
        scale: .5,
        autoAlpha: 0,
        ease: "expo.out"
    }),
    gsap.fromTo("#tip-translatex-neg .arrow3", 2, {
        x: -10,
        scale: 1,
        autoAlpha: 1
    }, {
        x: -150,
        scale: .25,
        autoAlpha: 0,
        ease: "expo.out"
    }))
}
var wormRate = 0
  , wormRateCaution = 5
  , wormRateWarning = 7
  , wormRateClamp = 6.65
  , wormPercentageBase = 50
  , wormPercentageOffset = 2;
function updateWorm(t) {
    var e;
    "roll" === t ? (wormRate = updateWormRate(rateRotationZ),
    updateWormRateColor(rateRotationZ, "roll"),
    0 > rateRotationZ ? e = 48 + wormRate + "% " + wormPercentageBase + "%" : 0 === rateRotationZ ? e = "48.5% 51.5%" : 0 < rateRotationZ && (e = "50% " + (52 + wormRate) + "%")) : "pitch" === t ? (wormRate = updateWormRate(rateRotationX),
    updateWormRateColor(rateRotationX, "pitch"),
    0 > rateRotationX ? e = 48 + wormRate + "% " + wormPercentageBase + "%" : 0 === rateRotationX ? e = "48.5% 51.5%" : 0 < rateRotationX && (e = "50% " + (52 + wormRate) + "%")) : "yaw" === t ? (wormRate = updateWormRate(rateRotationY),
    updateWormRateColor(rateRotationY, "yaw"),
    0 > rateRotationY ? e = "50% " + (52 - wormRate) + "%" : 0 === rateRotationY ? e = "48.5% 51.5%" : 0 < rateRotationY && (e = 48 - wormRate + "% " + wormPercentageBase + "%")) : void 0;
    gsap.to("#worm-" + t, 1, {
        drawSVG: e,
        ease: "expo.out"
    })
}
function updateWormRate(t) {
    return t <= -wormRateClamp ? t = -wormRateClamp : t >= wormRateClamp && (t = wormRateClamp),
    t
}
function updateWormRateColor(t, e) {
    var o = Math.abs(t);
    $("#worm-" + e).classList.remove("caution"),
    $("#worm-" + e).classList.remove("warning"),
    $("#" + e + " .rate").classList.remove("caution"),
    $("#" + e + " .rate").classList.remove("warning"),
    o < wormRateCaution || (o >= wormRateCaution && o < wormRateWarning ? ($("#worm-" + e).classList.add("caution"),
    $("#" + e + " .rate").classList.add("caution")) : o >= wormRateWarning && ($("#worm-" + e).classList.add("warning"),
    $("#" + e + " .rate").classList.add("warning")))
}
var rateCategory = "";
function updateRateColor(t) {
    if (t !== rateCategory) {
        var e = $("#rate .rate");
        e.classList.remove("caution"),
        e.classList.remove("warning"),
        "caution" == t && e.classList.add("caution"),
        "warning" === t && e.classList.add("warning")
    }
}
var instructionsStep = 1
  , instructionsTotal = 7;
function instructionsOpen() {
    gsap.fromTo("#instructions", .25, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        display: "block",
        ease: "none"
    }),
    gsap.fromTo("#instructions .modal-close", 1, {
        rotation: -90,
        autoAlpha: 0
    }, {
        rotation: 0,
        autoAlpha: 1,
        ease: Expo.easeOut
    }),
    gsap.fromTo("#instructions #arrow-prev", 1, {
        x: 25,
        autoAlpha: 0
    }, {
        x: 0,
        autoAlpha: 1,
        ease: Expo.easeOut
    }),
    gsap.fromTo("#instructions #arrow-next", 1, {
        x: -25,
        autoAlpha: 0
    }, {
        x: 0,
        autoAlpha: 1,
        ease: Expo.easeOut
    }),
    instructionsChange()
}
function instructionsClose() {
    instructionsStep = 1,
    gsap.fromTo("#instructions", .25, {
        autoAlpha: 1
    }, {
        autoAlpha: 0,
        ease: "none"
    })
}
function instructionsPrevious() {
    instructionsStep--,
    1 > instructionsStep && (instructionsStep = instructionsTotal),
    instructionsChange()
}
function instructionsNext() {
    instructionsStep++,
    instructionsStep > instructionsTotal && (instructionsStep = 1),
    instructionsChange()
}
function instructionsChange() {
    var t = "#instruction" + instructionsStep;
    gsap.set(".instruction-item", {
        autoAlpha: 0,
        display: "none"
    }),
    gsap.fromTo(t, .5, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        display: "inline-block",
        ease: "none"
    }),
    gsap.fromTo(t + " h3", 1, {
        y: -50,
        autoAlpha: 0
    }, {
        y: 0,
        autoAlpha: 1,
        ease: "expo.out"
    }),
    gsap.fromTo(t + " p", 1, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        ease: "expo.out"
    }),
    gsap.fromTo(t + " img", 1, {
        scale: .5,
        autoAlpha: 0
    }, {
        scale: 1,
        autoAlpha: 1,
        ease: "expo.out"
    }),
    $("#instructions-status").innerHTML = instructionsStep + " / " + instructionsTotal
}
function settingsOpen() {
    gsap.fromTo("#settings", .25, {
        autoAlpha: 0
    }, {
        autoAlpha: 1,
        display: "block",
        ease: "none"
    }),
    gsap.fromTo("#settings .modal-close", 1, {
        rotation: -90,
        autoAlpha: 0
    }, {
        rotation: 0,
        autoAlpha: 1,
        ease: Expo.easeOut
    })
}
function settingsClose() {
    gsap.fromTo("#settings", .25, {
        autoAlpha: 1
    }, {
        autoAlpha: 0,
        ease: "none"
    })
}
var isGravity = !0;
function toggleGravity() {
    isGravity ? (isGravity = !1,
    $("#setting-gravity").classList.remove("active"),
    $("#setting-gravity span").innerHTML = "OFF") : (isGravity = !0,
    $("#setting-gravity").classList.add("active"),
    $("#setting-gravity span").innerHTML = "ON")
}
function toggleEarthShape() {
    isFlatEarthCreated || createFlatEarth(),
    isFlatEarth ? (isFlatEarth = !1,
    earthObject.visible = !0,
    flatEarthObject.visible = !1,
    $("#setting-earth span").innerHTML = "OBLATE SPHEROID") : (isFlatEarth = !0,
    earthObject.visible = !1,
    flatEarthObject.visible = !0,
    $("#setting-earth span").innerHTML = "FLAT")
}
function generateRandomNumber(t, e) {
    var o = Math.floor(Math.random() * (e - t + 1)) + t;
    return o
}
function onWindowResize() {
    width = window.innerWidth,
    height = window.innerHeight,
    camera.aspect = width / height,
    camera.updateProjectionMatrix(),
    renderer.setSize(width, height),
    tooltipRenderer.setSize(width, height)
}
function onDocumentMouseDown(t) {
    !1 === isEventsEnabled || (t.preventDefault(),
    isMouseDown = !0)
}
function onDocumentMouseMove(t) {
    !1 === isEventsEnabled || (mouseX = .001 * (t.clientX - windowHalfX),
    mouseY = .001 * (t.clientY - windowHalfY))
}
function onDocumentMouseUp(t) {
    !1 === isEventsEnabled || (t.preventDefault(),
    isMouseDown = !1)
}
if (WEBGL.isWebGLAvailable())
    deviceSettings.isWebGL = !0,
    initWebgl();
else {
    var warning = WEBGL.getWebGLErrorMessage();
    document.getElementById("preloader").appendChild(warning)
}

