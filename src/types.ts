export { Viewport, Constants, Block }
export type { Key, KeyPress, Event, Piece, TetrisBlock, State }


/** Constants */

const Viewport = {
	CANVAS_WIDTH: 200,
	CANVAS_HEIGHT: 400,
	PREVIEW_WIDTH: 160,
	PREVIEW_HEIGHT: 80,
} as const;

const Constants = {
	TICK_RATE_MS: 1,
	GRID_WIDTH: 10,
	GRID_HEIGHT: 20,
	CLEAR_SCORE: 100,
	LEVEL_SCORE: 500
} as const;

const Block = {
	WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
	HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};


/** Types */

type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "Space" | "KeyR";

type KeyPress = Readonly<{
	axis: string,
	amount: number
}>

type Event = "keydown" | "keyup" | "keypress";

type Piece = Readonly<{
	height: string,
	width: string,
	x: string,
	y: string,
	style: string
	center: string
}>

type TetrisBlock = Readonly<{
	id: string
	components: ReadonlyArray<Piece>,
	height: number,
	stopped: boolean
	kickOffset: number
}>

type State = Readonly<{
	blocks: ReadonlyArray<TetrisBlock>,
	nextBlock: TetrisBlock,
	ghost: TetrisBlock | null,
	level: number,
	objCount: number,
	highScore: number,
	score: number,
	gameEnd: boolean,
	clearing: boolean
}>;