var gui = require ('nw.gui');

window.addEventListener ('load', function load () {
	window.removeEventListener ('load', load, false);
	initDOMConstruction ();
});

/**
 * Constructs the window UI functionality through DOM manipulation.
 */
function initDOMConstruction () {
	initWindowButtons ();
	initKeyboard ();
	/*var win = gui.Window.get ();
	for (var prop in win) {
		console.log ('gui.Window.get ().' + prop + '(' + win[prop] + ')');
	}*/

	// gui.Window.get ().showDevTools ();
}

/**
 * Initializes keyboard input. Assumes a QWERTY layout.
 */
function initKeyboard (engine) {

	var BACKSPACE = 8,    PAUSE   = 19,   PAGE_DOWN   = 34,   DOWN_ARROW = 40,   NUM_2 = 50,   NUM_8 = 56,   LTR_E = 69,
		TAB       = 9,    BREAK   = 3,    END         = 35,   PRNT_SCRN  = 44,   NUM_3 = 51,   NUM_9 = 57,   LTR_F = 70,
		ENTER     = 13,   CAPS    = 20,   HOME        = 36,   INSERT     = 45,   NUM_4 = 52,   LTR_A = 65,   LTR_G = 71,
		SHIFT     = 16,   ESC     = 27,   LEFT_ARROW  = 37,   DELETE     = 46,   NUM_5 = 53,   LTR_B = 66,   LTR_H = 72,
		CTRL      = 17,   SPACE   = 32,   UP_ARROW    = 38,   NUM_0      = 48,   NUM_6 = 54,   LTR_C = 67,   LTR_I = 73,
		ALT       = 18,   PAGE_UP = 33,   RIGHT_ARROW = 39,   NUM_1      = 49,   NUM_7 = 55,   LTR_D = 68,   LTR_J = 74,


		LTR_K = 75,    LTR_Q = 81,    LTR_W = 87,     F3 = 114,    F9          = 120,    NUMPAD_0 = 96,     NUMPAD_6  = 102,
		LTR_L = 76,    LTR_R = 82,    LTR_X = 88,     F4 = 115,    F10         = 121,    NUMPAD_1 = 97,     NUMPAD_7  = 103,
		LTR_M = 77,    LTR_S = 83,    LTR_Y = 89,     F5 = 116,    F11         = 122,    NUMPAD_2 = 98,     NUMPAD_8  = 104,
		LTR_N = 78,    LTR_T = 84,    LTR_Z = 90,     F6 = 117,    F12         = 123,    NUMPAD_3 = 99,     NUMPAD_9  = 105,
		LTR_O = 79,    LTR_U = 85,    F1    = 112,    F7 = 118,    NUM_LOCK    = 144,    NUMPAD_4 = 100,    COMMA_LT  = 188,
		LTR_P = 80,    LTR_V = 86,    F2    = 113,    F8 = 119,    SCROLL_LOCK = 145,    NUMPAD_5 = 101,    PERIOD_GT = 190,

		_FSLASH_QM       = 191,    MUTE_TOGGLE  = 173,   LITERAL = 0,
		_BTICK_TILDE     = 192,    VOLUME_DOWN  = 174,   PRESSED = 1,
		_OBRACKET_OBRACE = 219,    VOLUME_UP    = 175,
		_BSLASH_PIPE     = 220,    __SEMI_COLON = 186,
		_CBRACKET_CBRACE = 221,    _PLUS_EQUALS = 187,
		_SQUOTE_DQUOTE   = 222,    _HYPHEN_UND_ = 189;

	// Used to transform each key code into its literal representation in JavaScript, or string label if literal not available.
	// Also used to keep track of actively pressed down keys. Note that some keys do not have a down press, only up press.
	var keyMap = {}, logger = new ActiveKeyLogger ();

	// Map the keys according to the pre-defined key code variables, and false for pressed down
	keyMap[_FSLASH_QM] = ['/-?', false];
	keyMap[_BTICK_TILDE] = ['`-~', false];
	keyMap[_OBRACKET_OBRACE] = ['[-{', false];
	keyMap[_BSLASH_PIPE] = ['\\-|', false];
	keyMap[_CBRACKET_CBRACE] = [']-}', false];
	keyMap[_SQUOTE_DQUOTE] = ["'-\"", false];
	keyMap[MUTE_TOGGLE] = ['MUTETOGGLE', false];
	keyMap[VOLUME_UP] = ['VOLUMEUP', false];
	keyMap[VOLUME_DOWN] = ['VOLUMEDOWN', false];
	keyMap[__SEMI_COLON] = [';-:', false];
	keyMap[_PLUS_EQUALS] = ['=-+', false];
	keyMap[_HYPHEN_UND_] = ['--_', false];

	keyMap[COMMA_LT] = [',-<', false];
	keyMap[PERIOD_GT] = ['.->', false];

	keyMap[NUM_LOCK] = ['NUMLOCK', false];
	keyMap[SCROLL_LOCK] = ['SCROLLLOCK', false];

	keyMap[F1] = ['F1', false];
	keyMap[F2] = ['F2', false];
	keyMap[F3] = ['F3', false];
	keyMap[F4] = ['F4', false];
	keyMap[F5] = ['F5', false];
	keyMap[F6] = ['F6', false];
	keyMap[F7] = ['F7', false];
	keyMap[F8] = ['F8', false];
	keyMap[F9] = ['F9', false];
	keyMap[F10] = ['F10', false];
	keyMap[F11] = ['F11', false];
	keyMap[F12] = ['F12', false];

	keyMap[LTR_A] = ['a-A', false];
	keyMap[LTR_B] = ['b-B', false];
	keyMap[LTR_C] = ['c-C', false];
	keyMap[LTR_D] = ['d-D', false];
	keyMap[LTR_E] = ['e-E', false];
	keyMap[LTR_F] = ['f-F', false];
	keyMap[LTR_G] = ['g-G', false];
	keyMap[LTR_H] = ['h-H', false];
	keyMap[LTR_I] = ['i-I', false];
	keyMap[LTR_J] = ['j-J', false];
	keyMap[LTR_K] = ['k-K', false];
	keyMap[LTR_L] = ['l-L', false];
	keyMap[LTR_M] = ['m-M', false];
	keyMap[LTR_N] = ['n-N', false];
	keyMap[LTR_O] = ['o-O', false];
	keyMap[LTR_P] = ['p-P', false];
	keyMap[LTR_Q] = ['q-Q', false];
	keyMap[LTR_R] = ['r-R', false];
	keyMap[LTR_S] = ['s-S', false];
	keyMap[LTR_T] = ['t-T', false];
	keyMap[LTR_U] = ['u-U', false];
	keyMap[LTR_V] = ['v-V', false];
	keyMap[LTR_W] = ['w-W', false];
	keyMap[LTR_X] = ['x-X', false];
	keyMap[LTR_Y] = ['y-Y', false];
	keyMap[LTR_Z] = ['z-Z', false];

	keyMap[NUMPAD_0] = ['0', false];
	keyMap[NUMPAD_1] = ['1', false];
	keyMap[NUMPAD_2] = ['2', false];
	keyMap[NUMPAD_3] = ['3', false];
	keyMap[NUMPAD_4] = ['4', false];
	keyMap[NUMPAD_5] = ['5', false];
	keyMap[NUMPAD_6] = ['6', false];
	keyMap[NUMPAD_7] = ['7', false];
	keyMap[NUMPAD_8] = ['8', false];
	keyMap[NUMPAD_9] = ['9', false];

	keyMap[NUM_0] = ['0-)', false];
	keyMap[NUM_1] = ['1-!', false];
	keyMap[NUM_2] = ['2-@', false];
	keyMap[NUM_3] = ['3-#', false];
	keyMap[NUM_4] = ['4-$', false];
	keyMap[NUM_5] = ['5-%', false];
	keyMap[NUM_6] = ['6-^', false];
	keyMap[NUM_7] = ['7-&', false];
	keyMap[NUM_8] = ['8-*', false];
	keyMap[NUM_9] = ['9-(', false];

	keyMap[INSERT] = ['INSERT', false];
	keyMap[DELETE] = ['DELETE', false];

	keyMap[BACKSPACE] = ['BACKSPACE', false];
	keyMap[TAB] = ['TAB', false];
	keyMap[ENTER] = ['ENTER', false];
	keyMap[SHIFT] = ['SHIFT', false];
	keyMap[CTRL] = ['CTRL', false];
	keyMap[ALT] = ['ALT', false];

	keyMap[PAUSE] = ['PAUSE', false];
	keyMap[BREAK] = ['BREAK', false];
	keyMap[CAPS] = ['CAPS', false];
	keyMap[ESC] = ['ESC', false];
	keyMap[SPACE] = ['SPACE', false];

	keyMap[PAGE_UP] = ['PAGEUP', false];
	keyMap[PAGE_DOWN] = ['PAGEDOWN', false];
	keyMap[END] = ['END', false];
	keyMap[HOME] = ['HOME', false];

	keyMap[UP_ARROW] = ['UP', false];
	keyMap[LEFT_ARROW] = ['LEFT', false];
	keyMap[DOWN_ARROW] = ['DOWN', false];
	keyMap[RIGHT_ARROW] = ['RIGHT', false];

	document.onkeydown = function (e) {
		var elem = document.getElementById ('keyboard_literal'),
			key = e.keyCode;

		if (keyMap[key]) {
			keyMap[key][PRESSED] = true;
			logger.appendKey (key);
		}

		elem.innerHTML = shift (key) || 'unknown e.keyCode -> ' + key;
		elem.setAttribute ('class', 'not_null');

		document.getElementById ('keyboard_input').innerHTML = key;
		document.getElementById ('keyboard_active').innerHTML = logger.activeKeys ().join (' + ');
	};

	document.onkeyup = function (e) {
		var elem = document.getElementById ('keyboard_literal'),
			key = e.keyCode;

		if (keyMap[key]) {
			keyMap[key][PRESSED] = false;
			logger.popKey (key);
		}

		elem.innerHTML = shift (key) || 'unknown e.keyCode -> ' + key;
		elem.setAttribute ('class', 'null');

		document.getElementById ('keyboard_input').innerHTML = key;
		document.getElementById ('keyboard_active').innerHTML = logger.activeKeys ().join (' + ');
	}

	// Shifts the keyCode literal according to the qwerty keyboard map if the key can be shifted and the shift key is pressed
	function shift (keyCode) {
		if (keyMap[keyCode][LITERAL].charAt (1) === '-') {
			if (keyMap[SHIFT][PRESSED]) return keyMap[keyCode][LITERAL].charAt (2);
			else return keyMap[keyCode][LITERAL].charAt (0);
		}

		// Return the literal stored in the keyMap if in the map, or null if it's not in the map
		return keyMap[keyCode] && keyMap[keyCode][LITERAL] || null;
	}

	/**
	 * Holds the keys that are active (pressed down) at any given time. Does not store the order that the keys were pressed,
	 * exept modifier keys (shift, ctrl, alt). Those have to be pressed and held first. Stores the string representation rather
	 * as a value of the keyCode. Use a for-in loop for this.
	 */
	function ActiveKeyLogger () {
		var actives = {},
			modQ = [],
			i;

		// Since only one key can be physicall pressed down at any time, disregard duplicates from auto-repeat
		this.appendKey = function (key) {
			var check1 = key === SHIFT || key === CTRL || key === ALT,
				i = modQ.indexOf (keyMap[key][LITERAL]);

			// The keyup event wasn't fired, so the modifier is still in the modQ even though it shouldn't
			if (check1 && i >= 0) modQ.splice (i, 1);

			// Standard checks for active pressing
			if (check1 && i < 0) modQ.push (keyMap[key][LITERAL]);

			else if (!actives[key]) actives[key] = shift (key);

			return this;
		}

		// Removes a key from the active selection
		this.popKey = function (key) {
			if ((key===SHIFT||key===CTRL||key===ALT) && (i = modQ.indexOf(keyMap[key][LITERAL])) >= 0) modQ.splice(i, 1);
			else if (actives[key]) delete actives[key];

			return this;
		}

		// Returns an array of all modifier keys + non-modifier keys actively pressed
		this.activeKeys = function () {
			var active = [];
			for (var p in actives) active.push (actives[p]);
			return modQ.concat (active);
		}
	}
}



/**
 * Initializes the minimize, maximize, and close button functionality and animation upon hovering
 */
function initWindowButtons () {

	var maximize = true;

	var minButton = document.getElementById ('window_minimize'),
		minIconBn = document.getElementById ('window_min_icon'),
		maxButton = document.getElementById ('window_maximize'),
		maxIconBn = document.getElementById ('window_max_icon'),
		clsButton = document.getElementById ('window_close'),

		sRGB = [68, 68, 68],
		eRGB = [200, 200, 200],
		bRGB = [0, 0, 0],
		xRGB = [220, 50, 50],
		nSteps = 12,
		hoverDirs = {
			// button: [positive direction, animating, colorTweener, i]
			minButton: [true, false, new ColorTweener (sRGB, eRGB, nSteps), 0],
			minIconBn: [true, false, new ColorTweener (eRGB, bRGB, nSteps), 0],
			maxButton: [true, false, new ColorTweener (sRGB, eRGB, nSteps), 0],
			maxIconBn: [true, false, new ColorTweener (eRGB, bRGB, nSteps), 0],
			clsButton: [true, false, new ColorTweener (sRGB, xRGB, nSteps), 0]
		},

		// Index names for readability
		POSITIVELY = 0,
		ANIMATING = 1,
		COLOR_TW  = 2,
		I = 3,
		fadeFunctionActive = false;

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

	clsButton.onclick = function () {
		window.close ();
	};

	clsButton.addEventListener ('mouseenter', function () {
		instantiateButtonFade ('clsButton', true);
	});

	clsButton.addEventListener ('mouseleave', function () {
		instantiateButtonFade ('clsButton', false);
	});

	// Mouseenter/mouseleave handler function for all buttons
	function instantiateButtonFade (button, direction) {
		// Change the direction of the animation to positive and mark it as animating
		hoverDirs[button][POSITIVELY] = direction;
		hoverDirs[button][ANIMATING] = true;

		// Prevent calling fadeWindowButtons function if function is already animating
		if (!fadeFunctionActive) {
			fadeFunctionActive = true;
			fadeWindowButtons ();
		}
	}

	function fadeWindowButtons () {
		var miB = hoverDirs.minButton,
			miI = hoverDirs.minIconBn,
			maB = hoverDirs.maxButton,
			maI = hoverDirs.maxIconBn,
			clB = hoverDirs.clsButton;

		if (miB[ANIMATING]) {
			miB[I] += miB[POSITIVELY]? 1 : -1;
			miI[I] += miB[POSITIVELY]? 1 : -1;

			miB[ANIMATING] = (miB[I] === nSteps) && miB[POSITIVELY]? false : (miB[I] === 0) && !miB[POSITIVELY]? false : true;
			miI[ANIMATING] = (miI[I] === nSteps) && miI[POSITIVELY]? false : (miI[I] === 0) && !miI[POSITIVELY]? false : true;
			
			minButton.style.backgroundColor = miB[COLOR_TW].colorAt (miB[I]);
			minIconBn.style.borderBottom = '1px solid ' + miI[COLOR_TW].colorAt (miI[I]);
		}

		if (maB[ANIMATING]) {
			maB[I] += maB[POSITIVELY]? 1 : -1;
			maI[I] += maB[POSITIVELY]? 1 : -1;

			maB[ANIMATING] = (maB[I] === nSteps) && maB[POSITIVELY]? false : (maB[I] === 0) && !maB[POSITIVELY]? false : true;
			maI[ANIMATING] = (maI[I] === nSteps) && maI[POSITIVELY]? false : (maI[I] === 0) && !maI[POSITIVELY]? false : true;

			maxButton.style.backgroundColor = maB[COLOR_TW].colorAt (maB[I]);
			maxIconBn.style.border = '1px solid ' + maI[COLOR_TW].colorAt (maI[I]);
		}

		if (clB[ANIMATING]) {
			clB[I] += clB[POSITIVELY]? 1 : -1;
			clB[ANIMATING] = (clB[I] === nSteps) && clB[POSITIVELY]? false : (clB[I] === 0) && !clB[POSITIVELY]? false : true;
			clsButton.style.backgroundColor = clB[COLOR_TW].colorAt (clB[I]);
		}

		if (!(miB[ANIMATING] || maB[ANIMATING] || clB[ANIMATING])) fadeFunctionActive = false;
		else fadeFunctionActive = requestAnimationFrame (fadeWindowButtons);
	}
}

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
