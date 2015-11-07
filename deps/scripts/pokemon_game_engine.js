/**
 * Engine that executes the logic defined in verified game JSON outlined in the game_JSON_structure.json
 *
 * Arguments:
 *     gameLogic    - JSON object outlining the resources and logic of the Pokemon game
 *     canvasWidth  - the width of the screen as rendered on the HTML5 canvas in the nw.js application
 *     canvasHeight - the height of the screen as rendered on the HTML5 canvas in the nw.js application
 *
 * Requires that the Pixi.js library be loaded beforehand.
 */
function PokemonGameEngine (gameLogic, canvasWidth, canvasHeight) {
    var renderer = PIXI.autoDetectRenderer (canvasWidth, canvasHeight),
        engineWidth = canvasWidth,
        engineHeight = canvasHeight,
        activeScene = ''
}
