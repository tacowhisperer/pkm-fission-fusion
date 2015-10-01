var gui = require ('nw.gui'), engine;

// Stuff to do on DOM load
window.addEventListener ('load', function load () {
	window.removeEventListener ('load', load, false);
	initDOMConstruction ();
});

// Window resize handler
window.addEventListener ('resize', function () {if (domConstructed) {
	engine.resizeCanvas (window.innerWidth, window.innerHeight - 35);
}});


/**
 * Constructs the window UI functionality through DOM manipulation. All other dependencies should be loaded by now.
 */
var domConstructed = false;
function initDOMConstruction () {
	initWindowButtons ();
	engine = new GameEngine (window.innerWidth, window.innerHeight - 35);

	// Append the canvas to the DOM
	var windowWrapper = document.getElementById ('window_wrapper');
	windowWrapper.appendChild (engine.getCanvas ());

	// Testing the loader (reset the loader using loader.reset () for loading assets in different parts of the game)
	var loader = PIXI.loader;
	loader.add ('arcanine', 'deps/images/as404.png').load (function (loader, resources) {
		var sprite = new PIXI.Sprite (resources.arcanine.texture);
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
		sprite.position.x = window.innerWidth / 2;
		sprite.position.y = (window.innerHeight - 35) / 2;

		engine.getScene ('SCENE_DNE').addChild (sprite);
		engine.render ();
	});

	// gui.Window.get ().showDevTools ();
	domConstructed = true;
}

/**
 * Initializes the minimize, maximize, and close button functionality and animation upon hovering
 */
function initWindowButtons () {
	var minButton = document.getElementById ('window_minimize'),
		minIconBn = document.getElementById ('window_min_icon'),
		maxButton = document.getElementById ('window_maximize'),
		maxIconBn = document.getElementById ('window_max_icon'),
		clsButton = document.getElementById ('window_close'),
		rldButton = document.getElementById ('window_reload'),
		arrIconBn = document.getElementById ('window_reload_icon_arrow'),
		cirIconBn = document.getElementById ('window_reload_icon_circle'),

		sRGB = [68, 68, 68],
		eRGB = [200, 200, 200],
		wRGB = [255, 255, 255],
		bRGB = [0, 0, 0],
		xRGB = [220, 50, 50],
		nSteps = 12,
		hoverDirs = {
			// button: [positive direction, animating, colorTweener, i]
			minButton: [true, false, new ColorTweener (sRGB, eRGB, nSteps), 0],
			minIconBn: [true, false, new ColorTweener (eRGB, bRGB, nSteps), 0],
			maxButton: [true, false, new ColorTweener (sRGB, eRGB, nSteps), 0],
			maxIconBn: [true, false, new ColorTweener (eRGB, bRGB, nSteps), 0],
			clsButton: [true, false, new ColorTweener (sRGB, xRGB, nSteps), 0],
			rldButton: [true, false, new ColorTweener (sRGB, eRGB, nSteps), 0],
			arrIconBn: [true, false, new ColorTweener (eRGB, bRGB, nSteps), 0],
			cirIconBn: [true, false, new ColorTweener (wRGB, bRGB, nSteps), 0]
		},

		// Index names for readability
		POSITIVELY = 0,
		ANIMATING = 1,
		COLOR_TW  = 2,
		I = 3,
		fadeFunctionActive = false;

	// Minimize button mechanics
	minButton.onclick = function () {
		gui.Window.get ().minimize ();
	};

	minButton.addEventListener ('mouseenter', function () {
		instantiateButtonFade ('minButton', true);
		instantiateButtonFade ('minIconBn', true);
	});

	minButton.addEventListener ('mouseleave', function () {
		instantiateButtonFade ('minButton', false);
		instantiateButtonFade ('minIconBn', false);
	});

	// Maximize button mechanics
	var maximize = true;
	maxButton.onclick = function () {
		if (maximize) gui.Window.get ().maximize ();
		else gui.Window.get ().unmaximize ();
		maximize = !maximize;
	};

	maxButton.addEventListener ('mouseenter', function () {
		instantiateButtonFade ('maxButton', true);
		instantiateButtonFade ('maxIconBn', true);
	});

	maxButton.addEventListener ('mouseleave', function () {
		instantiateButtonFade ('maxButton', false);
		instantiateButtonFade ('maxIconBn', false);
	});

	// Close button mechanics
	clsButton.onclick = function () {
		window.close ();
	};

	clsButton.addEventListener ('mouseenter', function () {
		instantiateButtonFade ('clsButton', true);
	});

	clsButton.addEventListener ('mouseleave', function () {
		instantiateButtonFade ('clsButton', false);
	});

	// Reload button mechanics
	rldButton.onclick = function () {
		location.reload ();
	}

	rldButton.addEventListener ('mouseenter', function () {
		instantiateButtonFade ('rldButton', true);
		instantiateButtonFade ('arrIconBn', true);
		instantiateButtonFade ('cirIconBn', true);
	});

	rldButton.addEventListener ('mouseleave', function () {
		instantiateButtonFade ('rldButton', false);
		instantiateButtonFade ('arrIconBn', false);
		instantiateButtonFade ('cirIconBn', false);
	});

	// Mouseenter/mouseleave handler function for all buttons
	var activatedFadeFunction = false;
	function instantiateButtonFade (button, direction) {
		// Change the direction of the animation to positive and mark it as animating
		hoverDirs[button][POSITIVELY] = direction;
		hoverDirs[button][ANIMATING] = true;

		// Prevent calling fadeWindowButtons function if function is already animating
		if (!fadeFunctionActive && !activatedFadeFunction) {
			activatedFadeFunction = true;
			fadeWindowButtons ();
			activatedFadeFunction = false;
		}
	}

	function fadeWindowButtons () {
		var miB = hoverDirs.minButton,
			miI = hoverDirs.minIconBn,

			maB = hoverDirs.maxButton,
			maI = hoverDirs.maxIconBn,
			
			clB = hoverDirs.clsButton,
			
			rfB = hoverDirs.rldButton,
			arI = hoverDirs.arrIconBn,
			ciI = hoverDirs.cirIconBn;

		if (miB[ANIMATING]) {
			miB[I] += miB[POSITIVELY]? 1 : -1;
			miI[I] += miB[POSITIVELY]? 1 : -1;

			// Fix any overshooting issues caused by fast mouse movement
			if (miB[I] > nSteps) miB[I] = nSteps;
			else if (miB[I] < 0) miB[I] = 0;

			if (miI[I] > nSteps) miI[I] = nSteps;
			else if (miI[I] < 0) miI[I] = 0;

			// Perform the necessary checks
			miB[ANIMATING] = (miB[I] === nSteps) && miB[POSITIVELY]? false : (miB[I] === 0) && !miB[POSITIVELY]? false : true;
			miI[ANIMATING] = (miI[I] === nSteps) && miI[POSITIVELY]? false : (miI[I] === 0) && !miI[POSITIVELY]? false : true;
			
			minButton.style.backgroundColor = miB[COLOR_TW].colorAt (miB[I]);
			minIconBn.style.borderBottom = '1px solid ' + miI[COLOR_TW].colorAt (miI[I]);
		}

		if (maB[ANIMATING]) {
			maB[I] += maB[POSITIVELY]? 1 : -1;
			maI[I] += maB[POSITIVELY]? 1 : -1;

			// Fix any overshooting issues caused by fast mouse movement
			if (maB[I] > nSteps) maB[I] = nSteps;
			else if (maB[I] < 0) maB[I] = 0;
			
			if (maI[I] > nSteps) maI[I] = nSteps;
			else if (maI[I] < 0) maI[I] = 0;

			// Perform the necessary checks
			maB[ANIMATING] = (maB[I] === nSteps) && maB[POSITIVELY]? false : (maB[I] === 0) && !maB[POSITIVELY]? false : true;
			maI[ANIMATING] = (maI[I] === nSteps) && maI[POSITIVELY]? false : (maI[I] === 0) && !maI[POSITIVELY]? false : true;

			maxButton.style.backgroundColor = maB[COLOR_TW].colorAt (maB[I]);
			maxIconBn.style.border = '1px solid ' + maI[COLOR_TW].colorAt (maI[I]);
		}

		if (clB[ANIMATING]) {
			clB[I] += clB[POSITIVELY]? 1 : -1;

			// Fix any overshooting issues caused by fast mouse movement
			if (clB[I] > nSteps) clB[I] = nSteps;
			else if (clB[I] < 0) clB[I] = 0;

			// Perform the necessary checks
			clB[ANIMATING] = (clB[I] === nSteps) && clB[POSITIVELY]? false : (clB[I] === 0) && !clB[POSITIVELY]? false : true;
			clsButton.style.backgroundColor = clB[COLOR_TW].colorAt (clB[I]);
		}

		if (rfB[ANIMATING]) {
			rfB[I] += rfB[POSITIVELY]? 1 : -1;
			arI[I] += rfB[POSITIVELY]? 1 : -1;
			ciI[I] += rfB[POSITIVELY]? 1 : -1;

			// Fix any overshooting issues caused by fast mouse movement
			if (rfB[I] > nSteps) rfB[I] = nSteps;
			else if (rfB[I] < 0) rfB[I] = 0;
			
			if (arI[I] > nSteps) arI[I] = nSteps;
			else if (arI[I] < 0) arI[I] = 0;

			if (ciI[I] > nSteps) ciI[I] = nSteps;
			else if (ciI[I] < 0) ciI[I] = 0;

			// Perform the necessary checks
			rfB[ANIMATING] = (rfB[I] === nSteps) && rfB[POSITIVELY]? false : (rfB[I] === 0) && !rfB[POSITIVELY]? false : true;
			arI[ANIMATING] = (arI[I] === nSteps) && arI[POSITIVELY]? false : (arI[I] === 0) && !arI[POSITIVELY]? false : true;
			ciI[ANIMATING] = (ciI[I] === nSteps) && ciI[POSITIVELY]? false : (ciI[I] === 0) && !ciI[POSITIVELY]? false : true;

			rldButton.style.backgroundColor = rfB[COLOR_TW].colorAt (rfB[I]);
			arrIconBn.style.stroke = arI[COLOR_TW].colorAt (arI[I]);
			cirIconBn.style.stroke = ciI[COLOR_TW].colorAt (ciI[I]);
		}

		if (!(miB[ANIMATING] || maB[ANIMATING] || clB[ANIMATING] || rfB[ANIMATING])) fadeFunctionActive = false;
		else fadeFunctionActive = requestAnimationFrame (fadeWindowButtons);
	}
}

/**
 * RGB Color Tweener that linearly interpolates the starting and the ending color through the CIE-L*ab color space.
 *
 * Arguments:
 *     sRGB, eRGB - Array in the format [0-255, 0-255, 0-255] specifying an RGB color
 *     num - the number of frames that the color will be fading
 */
function ColorTweener (sRGB, eRGB, num) {
    var sLab = xyzToLab (rgbToXYZ (sRGB)),
        eLab = xyzToLab (rgbToXYZ (eRGB)),
        n = num;

    // Returns the color interpolation at i
    this.colorAt = function (i, hex) {
        if (i < 0) i = 0;
        var q = 1 - i / n, p = i / n, r = Math.round,
            cRGB = xyzToRGB (labToXYZ ([q * sLab[0] + p * eLab[0], q * sLab[1] + p * eLab[1], q * sLab[2] + p * eLab[2]]));
        
        return hex? toHexValue (cRGB) : 'rgb(' + r(cRGB[0]) + ', ' + r(cRGB[1]) + ', ' + r(cRGB[2]) + ')';
    };

    // Returns the current rgb value as its numerical value in [0, 16777215]
    function toHexValue (cRGB) {
        return cRGB[0] * 65536 + cRGB[1] * 256 + cRGB[2];
    };

    // Returns the array corresponding the xyz values of the input rgb array
    function rgbToXYZ (rgb) {
        var R = rgb[0] / 255,
            G = rgb[1] / 255,
            B = rgb[2] / 255;

        R = 100 * (R > 0.04045? Math.pow ((R + 0.055) / 1.055, 2.4) : R / 12.92);
        G = 100 * (G > 0.04045? Math.pow ((G + 0.055) / 1.055, 2.4) : G / 12.92);
        B = 100 * (B > 0.04045? Math.pow ((B + 0.055) / 1.055, 2.4) : B / 12.92);

        var X = R * 0.4124 + G * 0.3576 + B * 0.1805,
            Y = R * 0.2126 + G * 0.7152 + B * 0.0722,
            Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

        return [X, Y, Z];
    }

    // Returns the array corresponding to the CIE-L*ab values of the input xyz array
    function xyzToLab (xyz) {
        var X = xyz[0] / 95.047,
            Y = xyz[1] / 100,
            Z = xyz[2] / 108.883,
            T = 1 / 3,
            K = 16 / 116;

        X = X > 0.008856? Math.pow (X, T) : (7.787 * X) + K;
        Y = Y > 0.008856? Math.pow (Y, T) : (7.787 * Y) + K;
        Z = Z > 0.008856? Math.pow (Z, T) : (7.787 * Z) + K;

        var L = (116 * Y) - 16,
            a = 500 * (X - Y),
            b = 200 * (Y - Z);

        return [L, a, b];
    }

    // Returns the array corresponding to the xyz values of the input CIE-L*ab array
    function labToXYZ (Lab) {
        var Y = (Lab[0] + 16) / 116,
            X = Lab[1] / 500 + Y,
            Z = Y - Lab[2] / 200,
            K = 16 / 116;

        X = 95.047 * ((X * X * X) > 0.008856? X * X * X : (X - K) / 7.787);
        Y = 100 * ((Y * Y * Y) > 0.008856? Y * Y * Y : (Y - K) / 7.787);
        Z = 108.883 * ((Z * Z * Z) > 0.008856? Z * Z * Z : (Z - K) / 7.787);

        return [X, Y, Z];
    }

    // Returns the array corresponding to the rgb values of the input xyz array
    function xyzToRGB (xyz) {
        var X = xyz[0] / 100,
            Y = xyz[1] / 100,
            Z = xyz[2] / 100,
            T = 1 / 2.4;

        var R = X *  3.2406 + Y * -1.5372 + Z * -0.4986,
            G = X * -0.9689 + Y *  1.8758 + Z *  0.0415,
            B = X *  0.0557 + Y * -0.2040 + Z *  1.0570;

        R = 255 * (R > 0.0031308? 1.055 * Math.pow (R, T) - 0.055 : 12.92 * R);
        G = 255 * (G > 0.0031308? 1.055 * Math.pow (G, T) - 0.055 : 12.92 * G);
        B = 255 * (B > 0.0031308? 1.055 * Math.pow (B, T) - 0.055 : 12.92 * B);

        return [R, G, B];
    }
}
