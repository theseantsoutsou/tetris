import { Viewport, Constants, Block } from "./types"
import type { Piece, TetrisBlock, State } from "./types"
import { getActiveBlock, getStoppedBlocks, RNG } from "./utils";

export { initialState }
export { tick, moveY, moveX, rotateBlock, instantDrop, reinitalizeState}

/** State processing */

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State, move: Function = moveBlock(s)) => {

    const newBlock = createBlock(s.objCount)

    const allStopped = s.blocks.reduce((acc, val) => acc && val.stopped, true)
    if (allStopped && !s.clearing) {
        return {
            ...s,
            blocks: [...s.blocks, s.nextBlock],
            nextBlock: newBlock,
            ghost: placeGhost(s)(s.nextBlock),
            objCount: s.objCount + 1
        }
    }

    const activeBlocks = move(getActiveBlock(s))

    const stoppedBlocks = getStoppedBlocks(s)

    const newState = {
        ...s,
        blocks: stoppedBlocks.concat(activeBlocks),
        ghost: placeGhost(s)(activeBlocks),
        clearing: true
    }

    const removalState = removeRow(newState)(Constants.GRID_HEIGHT)

    const newStoppedBlocks = getStoppedBlocks(removalState)

    return newStoppedBlocks.length && checkGameEnd(newStoppedBlocks[newStoppedBlocks.length - 1]) ? 
        { ...removalState, gameEnd: true} 
        : removalState
}


/*************************************************************************************************/
/**                                                                                              */
/**                                       BLOCK CREATION                                         */
/**                                                                                              */
/*************************************************************************************************/


const createPiece = (x: number, y: number, color: string, center: boolean = false): Piece => {
    const piece = {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${Block.WIDTH * x}`,
        y: `${Block.HEIGHT * y}`,
        style: `fill: ${color}`,
        center: `${center}`
    }
    return piece
}


const createBlock = (objCount: number): TetrisBlock => {
    const o_block = {
        id: `block`,
        components: [
            createPiece(4, -1, "yellow"),
            createPiece(5, -1, "yellow"),
            createPiece(4, 0, "yellow"),
            createPiece(5, 0, "yellow")
        ],
        height: 2,
        stopped: false,
        kickOffset: 0
    }


    const t_block = {
        id: `block`,
        components: [
            createPiece(5, -1, "purple"),
            createPiece(4, 0, "purple"),
            createPiece(5, 0, "purple", true),
            createPiece(6, 0, "purple")
        ],
        height: 2,
        stopped: false,
        kickOffset: 0
    }


    const j_block = {
        id: `block`,
        components: [
            createPiece(4, -1, "blue"),
            createPiece(4, 0, "blue"),
            createPiece(5, 0, "blue", true),
            createPiece(6, 0, "blue")
        ],
        height: 2,
        stopped: false,
        kickOffset: 0
    }


    const l_block = {
        id: `block`,
        components: [
            createPiece(4, 0, "orange"),
            createPiece(5, 0, "orange", true),
            createPiece(6, 0, "orange"),
            createPiece(6, -1, "orange")
        ],
        height: 2,
        stopped: false,
        kickOffset: 0
    }

    const i_block = {
        id: `block`,
        components: [
            createPiece(3, -1, "cyan"),
            createPiece(4, -1, "cyan"),
            createPiece(5, -1, "cyan", true),
            createPiece(6, -1, "cyan")
        ],
        height: 2,
        stopped: false,
        kickOffset: 0
    }

    const s_block = {
        id: `block`,
        components: [
            createPiece(4, 0, "green"),
            createPiece(5, 0, "green", true),
            createPiece(5, -1, "green"),
            createPiece(6, -1, "green")
        ],
        height: 2,
        stopped: false,
        kickOffset: 0
    }

    const z_block = {
        id: `block`,
        components: [
            createPiece(4, -1, "red"),
            createPiece(5, -1, "red"),
            createPiece(5, 0, "red", true),
            createPiece(6, 0, "red")
        ],
        height: 2,
        stopped: false,
        kickOffset: 0
    }

    const typesOfBlocks = [i_block, j_block, l_block, o_block, s_block, t_block, z_block]

    const index = RNG.scale(RNG.hash(Date.now() * (objCount + 1)))

    return typesOfBlocks[index]

}


/*************************************************************************************************/
/**                                                                                              */
/**                                     COLLISION CHECKING                                       */
/**                                                                                              */
/*************************************************************************************************/


const checkSideCollision = (s: State) => (activeBlock: TetrisBlock) => (amount: number): boolean => {
    const activePieces = activeBlock.components
    const otherPieces = s.blocks
        .filter(block => block.stopped)
        .map(block => block.components)
        .reduce((flatArray, row) => flatArray.concat(row), []);

    const willCollide = (active: Piece, other: Piece) => {
        return (amount > 0 
            && Number(active.x) + Block.WIDTH == Number(other.x) 
            && Number(active.y) == Number(other.y))
            || (amount < 0 
            && Number(active.x) - Block.WIDTH == Number(other.x) 
            && Number(active.y) == Number(other.y))
    }

    const isOnTheSide = (block: TetrisBlock) => {
        return block.components
            .some(piece => 
                (amount < 0 && Number(piece.x) == 0) 
              ||(amount > 0 && Number(piece.x) == Viewport.CANVAS_WIDTH - Block.WIDTH)
            )
    }

    return isOnTheSide(activeBlock) 
        || activePieces.some(active => otherPieces.some(other => willCollide(active, other)))
}


const checkBottomCollision = (s: State) => (activeBlock: TetrisBlock): boolean => {

    const willCollide = (active: Piece, other: Piece) => 
           Number(active.y) + Block.HEIGHT == Number(other.y) 
        && Number(active.x) == Number(other.x)

    const isOnTheBottom = (block: TetrisBlock) => 
        block.components.some(piece => Number(piece.y) == Viewport.CANVAS_HEIGHT - Block.HEIGHT)
        
    const activePieces = activeBlock.components

    const otherPieces = getStoppedBlocks(s)
        .map(block => block.components)
        .reduce((flatArray, row) => flatArray.concat(row), []);

    return isOnTheBottom(activeBlock) 
        || activePieces.some(active => otherPieces.some(other => willCollide(active, other)))
}


const checkRotationCollision = (s: State) => (rotatedBlock: TetrisBlock): boolean => {
    const otherBlocks = getStoppedBlocks(s)
    const rotatedPieces = rotatedBlock.components
    const collideWithBorder = rotatedPieces.some(piece => Number(piece.x) <= 0 || Number(piece.x) >= Viewport.CANVAS_WIDTH - Block.WIDTH)
                           || rotatedPieces.some(piece => Number(piece.y) == Viewport.CANVAS_HEIGHT - Block.HEIGHT)

    const willCollide = rotatedPieces.some(
        active => otherBlocks.some(
            otherBlock => otherBlock.components.some(
                other => active.x == other.x && active.y == other.y)))

    return collideWithBorder || willCollide
}


const checkGameEnd = (movedBlock: TetrisBlock): boolean => {
    const activePieces = movedBlock.components
    return activePieces.some(piece => Number(piece.y) == 0)
}


/*************************************************************************************************/
/**                                                                                              */
/**                                        MOVE BLOCKS                                           */
/**                                                                                              */
/*************************************************************************************************/


const moveBlock = (s: State) => (o: TetrisBlock): TetrisBlock => {
    if ((!o.stopped || s.clearing) && !checkBottomCollision(s)(o)) {
        return {
            ...o,
            components: o.components.map(piece => {
                return { ...piece, y: String(Number(piece.y) + Block.HEIGHT) }
            })
        }
    }
    else {
        return { ...o, stopped: true }
    }
}


const moveX = (amount: number) => (s: State) => (activeBlock: TetrisBlock): TetrisBlock => {
    if (!activeBlock.stopped && !checkSideCollision(s)(activeBlock)(amount)) {
        const movedPieces = activeBlock.components.map(piece => {
            return { ...piece, x: String(Number(piece.x) + amount) }
        })
        return { ...activeBlock, components: movedPieces }
    }

    return activeBlock

}

const moveY = (amount: number) => (s: State) => (activeBlock: TetrisBlock): TetrisBlock => {
    if (!activeBlock.stopped && !checkBottomCollision(s)(activeBlock)) {
        const movedPieces = activeBlock.components.map(piece => {
            return { ...piece, y: String(Number(piece.y) + amount) }
        })
        return { ...activeBlock, components: movedPieces }
    }

    return activeBlock
}


const rotateBlock = (s: State) => (activeBlock: TetrisBlock): TetrisBlock => {
    const pivotPiece = activeBlock.components.filter(piece => piece.center === "true")
    if (pivotPiece.length) {
        const centerBlock = pivotPiece[0],
              centerX = Number(centerBlock.x),
              centerY = Number(centerBlock.y)

        const rotatedPieces = activeBlock.components.map(piece => {
            return {
                ...piece,
                x: `${centerX - (Number(piece.y) - centerY)}`,
                y: `${centerY + (Number(piece.x) - centerX)}`
            }
        })

        const rotatedBlock = { ...activeBlock, components: rotatedPieces }
        
        if (checkRotationCollision(s)(rotatedBlock)) {
            const kickedBlock = wallKick(rotatedBlock)
            if (!checkRotationCollision(s)(kickedBlock)) return undoWallKickShift(kickedBlock)
        }
        else {
            return rotatedBlock
        }
    }

    return activeBlock

}


const wallKick = (activeBlock: TetrisBlock, shift: number=0): TetrisBlock => {
    const pieces = activeBlock.components
    const leftCollision = pieces.some(piece => Number(piece.x) <= 0)
    const rightCollision =  pieces.some(piece => Number(piece.x) >= Viewport.CANVAS_WIDTH - Block.WIDTH)
    const sideCollision = leftCollision || rightCollision
    const bottomCollision = pieces.some(piece => Number(piece.y) == Viewport.CANVAS_HEIGHT - Block.HEIGHT)

    const shiftAmount = leftCollision ? Block.WIDTH : rightCollision ? -Block.WIDTH : 0

    if (bottomCollision || !sideCollision) {
        return {
            ...activeBlock,
            kickOffset: shift > 0 ? Block.WIDTH : shift < 0 ? -Block.WIDTH : 0
        }
    }                   
    const movedBlock = {
        ...activeBlock,
        components: activeBlock.components.map(piece => ({...piece, x: `${Number(piece.x) + shiftAmount}`}))
    }

    return wallKick(movedBlock, shift + shiftAmount)

}


const undoWallKickShift = (activeBlock: TetrisBlock): TetrisBlock => {
    const shiftedPieces = activeBlock.components
        .map(piece => ({...piece, x: `${Number(piece.x) - activeBlock.kickOffset}`}))
    
    return {...activeBlock, components: shiftedPieces, kickOffset: 0}
}


const instantDrop = (s: State) => (activeBlock: TetrisBlock): TetrisBlock => {
    if (s.ghost) return s.ghost
    return activeBlock
}


/*************************************************************************************************/
/**                                                                                              */
/**                                     FULL ROW ACTIONS                                         */
/**                                                                                              */
/*************************************************************************************************/


const fullRowCheck = (s: State) => (row: number): boolean => {
    const y = Block.HEIGHT * row
    const pieces = s.blocks
        .map(block => block.components)
        .reduce((flatArray, row) => flatArray.concat(row), []);
    const piecesAtY = pieces.filter(piece => Number(piece.y) == y)

    return piecesAtY.length == Constants.GRID_WIDTH ? true : false
}


const removeRow = (s: State) => (row: number): State => {
    const allStopped = s.blocks.reduce((acc, val) => acc && val.stopped, true)

    const moveSomePieces = (block: TetrisBlock) => {
        const movedComponents = block.components
            .map(piece => Number(piece.y) < row * Block.HEIGHT ? 
                { ...piece, y: `${Number(piece.y) + Block.HEIGHT}` } 
                : piece
            )
        return { ...block, components: movedComponents }
    }

    if (row == 0) return { ...s, clearing: false }

    if (s.clearing && allStopped && fullRowCheck(s)(row)) {
        const y = Block.HEIGHT * row
        const updatedBlocks = s.blocks
            .map(block => ({ ...block, components: block.components.filter(piece => Number(piece.y) != y) }))
            .filter(block => block.components.length > 0)
            .map(block => block.components.some(piece => Number(piece.y) < y) ? moveSomePieces(block) : block)
        
        const score = s.score + Constants.CLEAR_SCORE
        const level = Math.floor(score/Constants.LEVEL_SCORE) + 1
        const highScore = score > s.highScore ? score : s.highScore

        const updatedState = {
            ...s,
            blocks: updatedBlocks,
            ghost: null,
            score: score,
            level: level,
            highScore: highScore
        }

        return removeRow(updatedState)(row + 1)

    }

    return removeRow(s)(row - 1)
}


/*************************************************************************************************/
/**                                                                                              */
/**                                        GHOST VIEW                                            */
/**                                                                                              */
/*************************************************************************************************/


const placeGhost = (s: State) => (activeBlock: TetrisBlock): TetrisBlock => {
    const pieces = activeBlock.components
    if (checkBottomCollision(s)(activeBlock)) return activeBlock

    const lowerBlock = {
        ...activeBlock,
        components: pieces.map(piece => ({...piece, y: `${Number(piece.y) + Block.HEIGHT}`}))
    }
    return placeGhost(s)(lowerBlock)
}


/*************************************************************************************************/
/**                                                                                              */
/**                                   STATE INITIALIZATION                                       */
/**                                                                                              */
/*************************************************************************************************/


const initialState: State = {
    blocks: [],
    nextBlock: createBlock(0),
    ghost: null,
    level: 1,
    objCount: 1,
    highScore: 0,
    score: 0,
    gameEnd: false,
    clearing: false
} as const;


const reinitalizeState = (): State => {
    return {...initialState, nextBlock: createBlock(0)}
}





