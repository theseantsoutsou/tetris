export { getStoppedBlocks, getActiveBlock, RNG }
import { State, TetrisBlock } from "./types";

const getStoppedBlocks = (s: State): ReadonlyArray<TetrisBlock> => {
    return s.blocks.filter(block => block.stopped)
}

const getActiveBlock = (s: State): TetrisBlock => {
    return s.blocks.filter(block => !block.stopped)[0]
}

/**
 * A random number generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 */
abstract class RNG {
    // LCG using GCC's constants
    private static m = 0x80000000; // 2**31
    private static a = 1103515245;
    private static c = 12345;

    /**
     * Call `hash` repeatedly to generate the sequence of hashes.
     * @param seed 
     * @returns a hash of the seed
     */
    public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

    /**
     * Takes hash value and scales it to the range [0, 6]
     */
    public static scale = (hash: number) => Math.floor(7 *(hash) / RNG.m);
}