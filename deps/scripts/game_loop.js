/**
 * Function that handles all time updates
 */
function gameLoop () {

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
}

var i = 0, fpms = 1 / 20, t = 0;

function loop () {
	var dt = new Date ().getTime () - t;

	console.log ('i prev: ' + i);

	i = rk4 (i, fpms, dt, function () {return 0;})[0];
	t = new Date ().getTime ();
	
	console.log ('i after: ' + i + '\n\n');

	setTimeout (function () {requestAnimationFrame (loop);}, Math.random () * 1000 + 500);
}

(function () {
	t = new Date ().getTime ();
	loop ();
})();