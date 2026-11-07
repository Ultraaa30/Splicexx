import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ChordType, Key } from "./splice/types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatKey = (key: Key, chord_type: ChordType | null = null) => {
    return key.toUpperCase() + (chord_type ? ` ${chord_type.substring(0,3)}` : "")
}

const CHROMATIC: Key[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

export function relativeKey(key: Key, chord_type: ChordType): { key: Key; chord: ChordType } {
    const shift = chord_type == "minor" ? 3 : 9
    return {
        key: CHROMATIC[(CHROMATIC.indexOf(key) + shift) % 12],
        chord: chord_type == "minor" ? "major" : "minor",
    }
}
