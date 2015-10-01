/**
 * This is the object that bridges the gap between the game logic and the UI logic
 * of the HTML5 application. This engine requires that the Pixi.js library be loaded
 * beforehand.
 *
 * Arguments:
 *     
 */
function GameEngine (canvasWidth, canvasHeight) {
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
        activeScene = 'SCENE_DNE', // Empty scene string
        scenes = {'SCENE_DNE': new PIXI.Container ()}, // All scenes stored in the Game Engine
        events = {}; // Stores all events as boolean flags to determine if something has happened


    // Game Engine Variables
    var activeAnimations = [],
        inGameEvents = {};      // Used to determine speeches and so on

    /* Function that adds a new scene to the game engine. Existing scenes are overwritten. */
    this.addScene = function (name) {
        scenes[name] = new PIXI.Container ();
        return this;
    }

    /* Function that gets a scene by name, or a new container */
    this.getScene = function (name) {
        return scenes[name] || new PIXI.Container ();
    }

    /* Function that updates everything in the engine */
    this.update = function (i) {

    };

    /* Returns the HTML canvas object for appending to the DOM */
    this.getCanvas = function () {
        return renderer.view;
    };

    /* Resizes the canvas to the new dimensions specified */
    this.resizeCanvas = function (width, height) {
        renderer.resize (width, height);
        return this;
    };

    /* Renders the current state of the game to the PIXI canvas */
    this.render = function () {
        renderer.render (scenes[activeScene]);
        return this;
    };

    /**
     * Instantiates a new movable character in the open world of Pokemon. Used as a parent class
     * for other more specific characters.
     *
     * Argument Options:
     *     charFrontTextures -
     *     charBackTextures  -
     *     charLeftTextures  -
     *     charRightTextures -
     *     charType          -
     *     charGender        -
     *     charName          -
     *     charHeight        -
     *     child             -
     */
    this.Character = function (opts) {
        var opts = opts || {}, char = opts.child || this,

            // View sprites
            FRONT = 0,
            BACK  = 1,
            LEFT  = 2,
            RIGHT = 3,

            // Movement states
            STANDING = 0,
            WALKING = 1,
            RUNNING = 2,
            BIKING = 3,
            SURFING = 4,
            FLYING = 5,
            FISHING = 6,

            // Walking sprites
            STILL0 = 0,
            STEP1  = 1,
            STILL1 = 2,
            STEP2  = 3,

            // Running sprites
            RSTILL0 = 0,
            RSTEP1  = 1,
            RSTILL1 = 2,
            RSTEP2  = 3,

            // Biking sprites
            LEANING = 0,
            PEDAL1  = 1,
            PEDAL2  = 2,
            PEDAL3  = 3,

            // Surfing/Fly sprite
            HM_ING = 0;

            // Fishing sprites
        
        // Set the member variables to the char defined in the options object
        char.id = opts.charID || 'john_doe',
        char.fTextures = './deps/images/characters/' + char.id + '/front';
        char.bTextures = './deps/images/characters/' + char.id + '/back';
        char.lTextures = './deps/images/characters/' + char.id + '/left';
        char.rTextures = './deps/images/characters/' + char.id + '/right';
        char.bTextures = './deps/images/characters/' + char.id + '/battle';
        char.type = opts.charType || 'DEFAULT';
        char.gender = opts.charGender || 'MALE';
        char.name = opts.charName || 'John Doe';
        char.height = opts.charHeight || 2;

        // Default view is front view
        char.view = FRONT;

        // Movement member variables and sprite positioning
        char.movement = STANDING;

        // Coordinates of the character with respect to the origin of the world map
        char.x = 0;
        char.y = 0;

        // Rotates the texture of view based on the incoming movement command
        char.rotate = function (direction) {
            switch (direction) {
                case 'UP':
                    char.view = BACK;
                    break;
                case 'DOWN':
                    char.view = FRONT;
                    break;
                case 'LEFT':
                    char.view = LEFT;
                    break;
                case 'RIGHT':
                    char.view = RIGHT;
                    break;
            }

            return this;
        };

        // Rotates the view texture to display the walking animation
        char.walk = function (direction) {

        };

        function mod (x, y) {
            var modulus = x % y;
            return modulus < 0? y + modulus : modulus;
        };
    };

    /**
     * Instantiates a new battle scene with two GameEngine.Character objects
     */
    this.BattleScene = function (char1, char2, backgroundImageURL) {

    };

    /**
     * LinearAnimation object that handles all of the tweening for the manipulation of a number or color from one state to another
     * along the Cartesion coordinate system. This movement is linear between the starting and ending value (not exactly linear 
     * for colors, but does not oscilate in unexpected ways).
     * Color arrays are tweened using RGB -> XYZ -> CIE-L*ab -> *interpolation* -> CIE-L*ab' -> XYZ' -> RGB'
     *
     * Arguments:
     *     time - time t from the global frame count in the game loop during construction
     *     num  - the number of frames that the animation should last (rk4 adjusts variable framerate as 60fps)
     *     val  - the starting value. if typeof val is not number, it will be treated as an RGB array in the form [R, G, B]
     *            where R, G, and B are values in the range [0, 255]
     *     end  - the ending value for val. if val is a number and end is not a number, error.
     *     name - the name of the animation
     *     func - interpolation function whose domain and range are [0, 1] for non-linear animation, if any (linear assumed).
     */
    function LinearAnimation (time, num, val, end, name, func) {
        var i = 0,
            canceled = false,
            t = time,
            n = num,
            v0 = val,
            e = end,
            f = func || function (a) {return a < 0? 0 : a > 1? 1 : a;},
            cT = v0.length === e.length === 3? new ColorTweener (v0, e, n) : false; // cT = use color tweener flag

        // Simple defensive type check to prevent hours of simple mistakes
        if (!cT && (!isNaN (+v0) && !isNaN (+e))) throw "Start and end value are not the same!";

        /* Returns the animation state at the specified time; returns NaN if (time - t) > n, value at time otherwise */
        this.valueAt = function (time, hex) {
            i = time - t;
            if (i > n || canceled) return NaN;

            // Color interpolation
            else if (cT) return cT.colorAt (i, hex);

            // Numerical interpolation
            else return (1 - f(i / n)) * v0 + f(i / n) * e;
        };

        // Resets this animation to its initial point by updating the recorded time of initialization
        this.reset = function (time) {
            t = time;
            return this;
        };

        // Permanently cancels this animation object
        this.cancel = function () {
            canceled = true;
            return this;
        }

        // Allows for identification of the animation
        this.animationName = name;

        /* Returns the progress of the animation in a percentage as decimal representation */
        this.progress = function () {return canceled? NaN : i / n;};
    }
}
