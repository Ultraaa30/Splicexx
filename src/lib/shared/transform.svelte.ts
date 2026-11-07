import type { ChordType, Key } from "$lib/splice/types"

export const transform = $state({
    bpm: null as number | null,
    key: null as Key | null,
    chord: null as ChordType | null,
})

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const FLAT_TO_SHARP: Record<string, string> = {
    DB: "C#",
    EB: "D#",
    GB: "F#",
    AB: "G#",
    BB: "A#",
}

function pitchClass(key: string) {
    const name = key.toUpperCase()
    return CHROMATIC.indexOf(FLAT_TO_SHARP[name] ?? name)
}

export function transformPlan(sample: { bpm?: number | null; key?: string | null }) {
    const tempoRatio =
        transform.bpm && sample.bpm ? transform.bpm / sample.bpm : 1

    let semitones = 0
    if (transform.key && sample.key) {
        const from = pitchClass(sample.key)
        const to = pitchClass(transform.key)
        if (from >= 0 && to >= 0) {
            semitones = ((to - from) % 12 + 12) % 12
            if (semitones > 6) semitones -= 12
        }
    }

    if (tempoRatio === 1 && semitones === 0) return null

    const labels: string[] = []
    if (tempoRatio !== 1) labels.push(`${Math.round(transform.bpm!)}bpm`)
    if (semitones !== 0) {
        labels.push(`${transform.key}${transform.chord == "minor" ? "m" : ""}`)
    }

    return { tempoRatio, semitones, suffix: `_${labels.join("_")}` }
}
