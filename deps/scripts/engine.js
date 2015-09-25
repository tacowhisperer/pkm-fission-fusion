/**
 * This is the object that bridges the gap between the game logic and the UI logic
 * of the HTML5 application. This engine requires that the Pixi.js library be loaded
 * beforehand.
 *
 * Arguments:
 *     canvasID - string of the ID to make the Pixi.js library
 */
function GameEngine (canvasID, canvasWidth, canvasHeight) {
    /*
    Default PIXI Renderer Options (PIXI.DEFAULT_RENDER_OPTIONS):
        Name   |   Type   |   Default Value
        -----------------------------------------------------------------
        view                    |   HTMLCanvasElement   |   null
        transparent             |   boolean             |   false
        antialias               |   boolean             |   false
        forceFXAA               |   boolean             |   false
        preserveDrawingBuffer   |   boolean             |   false
        resolution              |   number              |   1
        backgroundColor         |   number              |   0x000000
        clearBeforeRender       |   boolean             |   true
        autoResize              |   boolean             |   false

    All objects that are rendered on the screen have the following members:
        Name   |   Type   |   Description
        ----------------------------------------------------------------------------------------------------------------
        alpha           |   number           |   The opacity of the object
        cacheAsBitmap   |   boolean          |   Set true to cache this obj as bitmap; null to remove
        filterArea      |   PIXI.Rectangle   |   Area to apply filter
        filters         |   Array.<PIXI.AbstractFilter>    |   Sets the filter for this obj. Only works for WebGL
        mask            |   PIXI.Graphics || PIXI.Sprite   |   Sets a mask for this obj like PhotoShop; remove with null
        parent          |   PIXI.Container (read only)     |   Display Object container containing this obj
        pivot           |   PIXI.Point       |   The pivot point of this obj for rotation
        position        |   PIXI.Point       |   Coordinate of this obj relative to the coordinates of parent
        renderable      |   boolean          |   Boolean if this obj is renderable. updateTransform will still be called
        rotation        |   number           |   Rotation of this obj in radians
        scale           |   PIXI.Point       |   Scale factor of this obj
        visible         |   boolean          |   False if you don't want to draw this obj. updateTransform called anyway
        worldAlpha      |   number (read only)             |   The multiplied alpha of this obj
        worldTransform  |   PIXI.Matrix (read only)        |   Current transform of this obj based on world (parent)
        worldVisible    |   boolean (read only)            |   Indicates if the sprite is globally visible
        x               |   number           |   x-coordinate relative to local coordinate of the parent
        y               |   number           |   y-coordinate relative to local coordinate of the parent

    All objects that are rendered on the screen have the following methods (P = PIXI):
        Name (Arguments) -> Returns
        --------------------------------------------------------------------------------------------------------------------------
        // Base destroy method for generic display objects
        destroy () -> undefined

        // Returns a texture of the display object to create sprites. Useful if the displayObject is static/complex and reused
        generateTexture (renderer<P.CanvasRenderer || P.WebGLRenderer>, scaleMode<P.SCALE_MODES>, resolution<number>) -> P.Texture

        // Retrieves the bounds of the displayObject as a rectangle object
        getBounds (matrix<P.Matrix>) -> P.Rectangle

        // Retrieves the local bounds of the displayObject as a rectangle object
        getLocalBounds () -> P.Rectangle

        // Sets the parent Container of this DisplayObject and returns the Container that this object was added to
        setParent (container<Container>) -> Container

        // Calculates the global position of the display object
        toGlobal (position<P.Point>) -> P.Point

        // Calculates the local position of the display object relatove to another point
        toLocal (position<P.Point>, from<P.DisplayObject>) -> P.Point
    */
    // HTML Elements
    var renderer = PIXI.autoDetectRenderer (canvasWidth, canvasHeight), // PIXI renderer
        scene = new PIXI.Container ();                                  // Scene container

    // Game Engine Variables
    var activeAnimations = [];

    /* Function that updates everything in the engine */
    this.tick = function (i) {

    };

    /* Returns the HTML canvas object for appending to the DOM */
    this.getCanvas = function () {
        return renderer.view;
    };

    /**
     * Animation object that handles all of the tweening for the manipulation of a number or color from one state to another.
     * Color arrays are tweened using RGB -> XYZ -> CIE-L*ab -> *interpolation* -> CIE-L*ab' -> XYZ' -> RGB'
     *
     * Arguments:
     *     time - time t from the global frame count in the game loop during construction
     *     num  - the number of frames that the animation should last (rk4 adjusts variable framerate as 60fps)
     *     val  - the starting value. if typeof val is not number, it will be treated as an RGB array in the form [R, G, B]
     *            where R, G, and B are values in the range [0, 255]
     *     end  - the ending value for val. if val is a number and end is not a number, error.
     *     func - interpolation function whose domain and range are [0, 1] for non-linear animation, if any (linear assumed).
     */
    function Animation (time, num, val, end, func) {
        var t = time,
            n = num,
            v0 = val,
            v = val,
            e = end,
            f = func || function (a) {return i < 0? 0 : a;},
            cT = v.length === e.length === 3? new ColorTweener (v, e, n) : false; // cT = use color tweener flag

        // Simple defensive type check to prevent hours of simple mistakes
        if (!cT && (!isNaN (+v) && !isNaN (+e))) throw "Start and end value are not the same!";

        /* Alias for stepping this animation one frame further. Returns NaN if (time - t) > n, v otherwise */
        this.step = function (time, hex) {
            var i = time - t;
            if (i > n) return NaN;

            // Color interpolation
            else if (cT) cT.colorAt (i, hex);

            // Numerical interpolation
            else v = (1 - f(i / n)) * v0 + f(i / n) * e;
        };
    }

    /**
     * RGB Color Tweener that fades from the starting color to the ending color through the CIE-L*ab color space. Does
     * not require a starting time because of rk4 time integration.
     */
    function ColorTweener (sRGB, eRGB, num) {
        var sLab = xyzToLab (rgbToXYZ (sRGB)),
            eLab = xyzToLab (rgbToXYZ (eRGB)),
            n = num;

        // Returns the color interpolation at i
        this.colorAt = function (i, hex) {
            if (i < 0) i = 0;
            var q = 1 - i / n, p = i / n,
                cRGB = xyzToRGB (labToXYZ ([q * sLab[0] + p * eLab[0], q * sLab[1] + p * eLab[1], q * sLab[2] + p * eLab[2]]));
            
            return hex? toHexValue (cRGB) : cRGB;
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
}