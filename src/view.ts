import { Block } from "./types"
import type { TetrisBlock, State } from "./types"

export { svg, preview, gameover, restart }
export { show, hide, createSvgElement, render, renderBlocks, renderPreview, updateStats }


/** Rendering (side effects) */

const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
	HTMLElement;
const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
	HTMLElement;
const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
	HTMLElement;
const restart = document.querySelector("#restart") as SVGGraphicsElement & HTMLElement;
const container = document.querySelector("#main") as HTMLElement;


// Text fields
const levelText = document.querySelector("#levelText") as HTMLElement;
const scoreText = document.querySelector("#scoreText") as HTMLElement;
const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
	elem.setAttribute("visibility", "visible");
	elem.parentNode!.appendChild(elem);
};


/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) => {
	elem.setAttribute("visibility", "hidden");
};
	

/**
 * Renders the current state to the canvas.
 *
 * In MVC terms, this updates the View using the Model.
 *
 * @param s Current state
 */
const render = (s: State) => {

	preview.innerHTML = ""

	const rects = svg.querySelectorAll("rect:not(#gameOver rect):not(#restart rect)")
	rects.forEach(rect => rect.remove())

	renderBlocks(svg, s);
	renderPreview(preview, s);
	updateStats(levelText, scoreText, highScoreText, s);
	
};

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
	namespace: string | null,
	name: string,
	props: Record<string, string> = {}
) => {
	const elem = document.createElementNS(namespace, name) as SVGElement;
	Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
	return elem;
};


function renderPieces(svg: SVGGraphicsElement & HTMLElement, block: TetrisBlock): void{
	block.components.map(piece => {
		const cube = createSvgElement(svg.namespaceURI, "rect", piece);
		svg.appendChild(cube);
	})
}

function renderGhost(svg: SVGGraphicsElement & HTMLElement, block: TetrisBlock): void {
	block.components.map(piece => {
		const cube = createSvgElement(svg.namespaceURI, "rect", {
			...piece,
			style: `${piece.style}; opacity: 0.3`
		});
		svg.appendChild(cube);
	})
}


function renderBlocks(svg: SVGGraphicsElement & HTMLElement, s: State): void {
	s.blocks.map(block => renderPieces(svg, block));
	if (s.ghost) renderGhost(svg, s.ghost);
}

function renderPreview(preview: SVGGraphicsElement & HTMLElement, s: State): void {
	s.nextBlock.components.map(piece => {
		const cube = createSvgElement(preview.namespaceURI, "rect", {
			...piece,
			x: `${Number(piece.x) - Block.WIDTH * 2}`,
			y: `${Number(piece.y) + Block.HEIGHT * 2}`,
		});
		preview.appendChild(cube);
	})
}

function updateStats(levelText: HTMLElement, scoreText: HTMLElement, highScoreText: HTMLElement, s: State): void {
	levelText.innerHTML	= `${s.level}`
	scoreText.innerHTML = `${s.score}`
	highScoreText.innerHTML = `${s.highScore}`
}


