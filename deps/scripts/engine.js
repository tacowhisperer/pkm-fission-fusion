/**
 * This is the object that bridges the gap between the game logic and the UI logic
 * of the HTML5 application. This engine requires that the Pixi.js library be loaded
 * beforehand.
 *
 * Arguments:
 *     
 */
function GameEngine (canvasWidth, canvasHeight, eventJSON) {
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
        eWidth = canvasWidth, // engine width (same as canvas width)
        eHeight = canvasHeight, // engine height (same as canvas height)
        activeScene = 'SCENE_DNE', // Empty scene string
        scenes = {'SCENE_DNE': new PIXI.Container ()}; // All scenes stored in the Game Engine, and all scenes are always centered

        // Initialize SCENE_DNE to be in the center of the screen, and make all subsequent adds be centered
        scenes['SCENE_DNE'].position.set (canvasWidth / 2, canvasHeight / 2);

    // Stores all events as boolean flags to determine if something has happened
    this.events = new EventHandler (eventJSON);


    // Game Engine Variables
    var activeAnimations = [],
        inGameEvents = {};      // Used to determine speeches within characters and so on

    /* Returns the string of the active scene name */
    this.getActiveScene = function () {return scenes[activeScene];};

    /* Function that creates a new scene to the game engine. Existing scenes are overwritten. */
    this.createScene = function (name) {
        scenes[name] = new PIXI.Container ();
        scenes[name].position.set (eWidth / 2, eHeight / 2);
        return this;
    };

    /* Function that chages the active scene to another existing scene, or creates it and sets it if it does not exist. */
    this.setActiveScene = function (name) {
        activeScene = name;
        if (!scenes[name]) {
            scenes[name] = new PIXI.Container ();
            scenes[name].position.set (eWidth / 2, eHeight / 2);
        }
        return this;
    }

    /* Function that gets a scene by name, or undefined if non-existent */
    this.getScene = function (name) {
        return scenes[name];
    };

    /* Function that deletes a scene from the scenes object if it exists */
    this.deleteScene = function (name) {
        if (scenes[name]) delete scenes[name];
        return this;
    };

    /* Function that returns the scenes object */
    this.getScenes = function () {return scenes;};

    /* Function that updates everything in the engine. Generates a time i through Runge-Kutta integration*/
    var t_i, i_t = 0;
    this.update = function () {
        var FRAMES_PER_MS = 1 / 20,
            dt = new Date ().getTime () - t_i,
            i_t = rk4 (i_t, FRAMES_PER_MS, dt, function () {return 0;})[0];
        return this;
    };

    /* Initializes the engine time variable for the update method */
    this.initClock = function () {
        t_i = new Date ().getTime ();
        return this;
    };

    /* Returns the HTML canvas object for appending to the DOM */
    this.getCanvas = function () {
        return renderer.view;
    };

    /* Resizes the canvas to the new dimensions specified */
    this.resizeCanvas = function (width, height) {
        renderer.resize (width, height);
        eWidth = width;
        eHeight = height;
        for (var scene in scenes) {
            scenes[scene].position.set (width / 2, height / 2);
        }
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


        // Textures are stored at deps/images/characters/ [char.id] / [front, back, left, right, battle, etc.]
        // char.id is the string that locates the texture in the global asset loader
        char.fTextures = 'deps/images/characters/' + char.id + '/front';
        char.bTextures = 'deps/images/characters/' + char.id + '/back';
        char.lTextures = 'deps/images/characters/' + char.id + '/left';
        char.rTextures = 'deps/images/characters/' + char.id + '/right';
        char.bTextures = 'deps/images/characters/' + char.id + '/battle';
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

        // Scene information


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

        // Adds the character to a scene


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
     * Instantiates a new open world location where the main character is free to walk around and talk to
     * other characters, find items, use HMs, continue story mode, encounter wild pokemon, etc. 
     *
     * It is structurally the same as a tree.
     *
     * Arguments and Options:
     *     worldImage         - jpg, png, etc. of the walkable room/route/etc. Dimensions should be multiples
     *                          of x pixels to identify each tile.
     *     worldImageMetadata - JSON defining the collision/entry/exit points of tiles in worldImage as a Cartesian
     *                          coordinate relative to each tile starting from the bottom left-hand corner
     */
    this.OpenWorld = function (worldImage, worldImageMetadata, opts, chars) {
        // OpenWorld member variables
        this.image = worldImage;
        this.unpenatrable = worldImageMetadata.unpenatrable;
        this.water = worldImageMetadata.water;
        this.wildPokemon = worldImageMetadata.wildPokemon;
        this.bigBoulders = worldImageMetadata.bigBoulders;
        this.ledges = worldImageMetadata.ledges;
        this.cliffs = worldImageMetadata.cliffs;
        this.hole = worldImageMetadata.holes;

        // OpenWorld children (rooms, subcaves, etc.)
        this.children = [];

        // OpenWorld characters, or empty (for dev purposes)
        this.characters = chars || {};
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

    /**
     * Function that performs Runge-Kutta integration for a discrete value dt.
     *
     * Arguments:
     *     x  - initial position
     *     v  - initial velocity
     *     dt - timestep
     *     a  - acceleration function handler
     *
     * Returns:
     *     [xf, vf] - array containing the next position and velocity
     */
    function rk4 (x, v, dt, a) {
        var C = 0.5 * dt, K = dt / 6;
        a = a || function () {return 0;};

        var x1 = x,             v1 = v,             a1 = a (x, v, 0),
            x2 = x + C * v1,    v2 = v + C * a1,    a2 = a (x2, v2, C),
            x3 = x + C * v2,    v3 = v + C * a2,    a3 = a (x3, v3, C),
            x4 = x + v3 * dt,   v4 = v + a3 * dt,   a4 = a (x4, v4, dt);

        var xf = x + K * (v1 + 2 * v2 + 2 * v3 + v4),
            vf = v + K * (a1 + 2 * a2 + 2 * a3 + a4);
        
        return [xf, vf];
    };
}

/**
 * Instantiates the engine event handler to simplify events. Allows for independent events (such as
 * finding an item and it disappearing from the screen), or co-dependent events (such as acquiring
 * a set of items for an event to "fire"). More methods will be added as deemed necessary.
 *
 * Arguments:
 *     eventJSON - plain object with pre-written event names mapped to a plain object containing two member
 *                 variables "parents" and "children", each which are arrays of the strings of the parent
 *                 anc child events (adjacency list)
 */
function EventHandler (eventJSON) {
    var events = eventJSON || {
    /*  eventName0: {
            parents: ['parentEvent0', 'parentEvent1', ...],
            children: ['child0', 'child1', ...],

            // ADDED IN DURING CONSTRUCTION AND FOR INTERNAL USE ONLY
            fired: false // used to differentiate between an event being fired (increases children countdown tickers)
                         // vs being fireable (checks countdown ticker)
        }, ... */
    };

    // Add the internal representation variables to the events plain object
    for (var ev in events) {
        var evnt = events[ev];

        evnt.parents = toMapping (set (evnt.parents));
        evnt.children = set (evnt.children);
        evnt.fired = false;
    }

    // Adds an event to the events plain object, or overwrites them if they exist -> chainable
    this.addEvent = function (name, parents, children) {
        // Adds an isolated event (not dependent on other events and no events depend on it)
        if (arguments.length === 1) events[name] = {parents: {}, children: [], fired: false};

        // Both parents and children must be Arrays to add to the events object
        else if (typeof name == 'string' || typeof name == 'number' && parents instanceof Array && children instanceof Array) {
            events[name] = {};

            var newEvent = events[name];
            newEvent.parents = toMapping (set (parents));
            newEvent.children = set (children);
            newEvent.fired = false;

            // recursively add non-existent parents, or add properties to existing parent events if properties don't already exist
            for (var parent in newEvent.parents) {
                var pEvent = events[parent];

                if (!pEvent) this.addEvent (parent, [], [name]);
                else if (pEvent.children.indexOf (name) === -1) pEvent.children.push (name);
            }

            // recursively add non-existing children, or add properties to existing children events
            for (var i = 0; i < newEvent.children.length; i++) {
                var cEvent = events[newEvent.children[i]];

                if (!cEvent) this.addEvent (newEvent.children[i], [name], []);
                else if (!cEvent.parents[name]) {
                    cEvent.parents[name] = false;
                    cEvent.fired = false;
                }
            }
        }

        return this;
    };

    // Removes an event from the events plain object if it exists, does nothing otherwise -> chainable
    this.removeEvent = function () {
        for (var a = 0; a < arguments.length; a++) {
            var name = arguments[a];
            if (events[name]) {
                // Remove the element from the parents' children arrays
                var eventParents = events[name].parents;
                for (var parent in eventParents) {
                    var parentChildren = events[parent].children;
                    parentChildren.splice (parentChildren.indexOf (name), 1);
                }

                // Remove the event from its children's dependencies
                var eventChildren = events[name].children;
                for (var i = 0; i < eventChildren.length; i++) {
                    var childrenParents = events[eventChildren[i]].parents;
                    delete childrenParents[name];
                }

                delete events[name];
            }
        }

        return this;
    };

    // Attempts to fire input events, but does nothing if not all parent events have fired -> chainable
    this.fire = function () {
        for (var a = 0; a < arguments.length; a++) {
            // Only fire an event if all parents have fired
            var name = arguments[a], ev = events[name];
            if (ev) {
                var allFired = true;
                for (var parent in ev.parents) {
                    if (!events[parent].fired) {
                        allFired = false;
                        break;
                    }
                }

                if (allFired) {
                    ev.fired = true;
                    for (var i = 0; i < ev.children.length; i++) events[ev.children[i]].parents[name] = true;
                }
            }
        }

        return this;
    };

    // Un-fires an event; does nothing if the event does not exist -> chainable
    this.unFire = function () {
        for (var a = 0; a < arguments.length; a++) {
            // Unfire the event and update all children mappings
            var name = arguments[a], ev = events[name];
            if (ev) {
                ev.fired = false;
                for (var i = 0; i < ev.children.length; i++) {
                    events[ev.children[i]].parents[name] = false;
                    events[ev.children[i]].fired = false;
                }
            }
        }

        return this;
    }

    // Checks the status of an event -> boolean
    this.isFired = function (name) {return events[name]? events[name].fired : null;};

    // Adds a parent event to the specified event. Does nothing if the name/parent event does not exist. -> chainable
    this.addParentTo = function (name, parent) {
        if (events[name] && events[parent] && typeof events[name].parents[parent] != 'boolean') {
            events[name].parents[parent] = events[parent].fired;
            events[name].fired = false;
            events[parent].children.push (name);
        }

        return this;
    };

    // Removes a parent event to the specified event. Does nothing if the name/parent event does not exist. -> chainable
    this.removeParentFrom = function (name, parent) {
        if (events[name] && events[parent] && typeof events[name].parents[parent] == 'boolean') {
            delete events[name].parents[parent];
            events[name].fired = false;
            events[parent].children.splice (events[parent].children.indexOf (name), 1);
        }

        return this;
    };

    // Maps each element in the set array to false
    function toMapping (setArray) {
        var map = {};
        for (var i = 0; i < setArray.length; i++) map[setArray[i]] = false;
        return map;
    }

    // Returns the keys of the mapping as an array
    function toArray (mapping) {
        var arr = [];
        for (var prop in mapping) arr.push (prop);
        return arr;
    }

    // Reduces an array to a set like in Python. Code taken from https://gist.github.com/brettz9/6137753
    function set (array) {return array.reduce (function (a, v) {if (a.indexOf (v) === -1) {a.push (v);} return a;}, []);}

    // Returns a human-readable adjacency list of the events stored in the event handler
    this.toString = function () {
        var s = '', f = true;
        for (var ev in events) {
            var e = events[ev], ln = '"' + ev + '" -> f: ' + e.fired + '; p: ' + toArray (e.parents) + '; c: ' + e.children;
            s += !f? '\n    ' + ln : (function () {f = false; return '    ' + ln;})();
        }

        return '{\n' + s + '\n}';
    };
}
