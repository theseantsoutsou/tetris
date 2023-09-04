/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

import { Viewport, Constants, Block } from "./types"
import type { Key, KeyPress, State } from "./types"

import { svg, preview, gameover, restart } from "./view"
import { show, hide, render } from "./view"

import { initialState, instantDrop } from "./state"
import { tick, moveY, moveX, rotateBlock, reinitalizeState } from "./state"


/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {

	// Canvas elements
	svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
	svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
	preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
	preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);


	/** User input */

	const key$ = fromEvent<KeyboardEvent>(document, "keypress");

	const fromKey = (keyCode: Key, keyPress: KeyPress) =>
		key$.pipe(filter(({ code }) => code === keyCode), map(() => keyPress));

	const left$ = fromKey("KeyA", {axis: "x", amount: -Block.WIDTH});
	const right$ = fromKey("KeyD", {axis: "x", amount: Block.WIDTH});
	const down$ = fromKey("KeyS", {axis: "y", amount: Block.HEIGHT});
	const up$ = fromKey("KeyW", {axis: "o", amount: 0});
	const drop$ = fromKey("Space", {axis: "d", amount: 0})
	const restart$ = fromKey("KeyR", {axis: "r", amount: 0})

	/** Observables */

	/** Determines the rate of time steps */
	const tick$ = interval(Constants.TICK_RATE_MS);


	const source$ = merge(tick$, left$, right$, down$, up$, drop$, restart$)
		.pipe(
			scan((s: State, action) => {
				if (typeof(action) == "object"){
					if (action.axis == "x") return tick(s, moveX(action.amount)(s))
					else if (action.axis == "y") return tick(s, moveY(action.amount)(s))
					else if (action.axis == "o") return tick(s, rotateBlock(s))
					else if (action.axis == "r" && s.gameEnd) return tick({...reinitalizeState(), highScore:s.highScore})
					else if (action.axis == "d") return tick(s, instantDrop(s))
				}
				else if (typeof(action) == "number") {
					if (s.level < 7) {
						if (action % (105 - s.level * 15 ) != 0) return s
					}
					else if (action % 10 != 0) return s

				}
				return tick(s)
			}, initialState)
		)
		.subscribe((s: State) => {
			
			if (s.gameEnd) {
				show(gameover);
				show(restart);
			} else {
				hide(gameover);
				hide(restart);
				render(s);
			}
		});
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
	window.onload = () => {
		main();
	};
}
