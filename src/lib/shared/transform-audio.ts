import { SoundTouch } from "@soundtouchjs/core"

// tempoRatio > 1 speeds the sample up (higher BPM); semitones shifts its pitch.
// Pitch and tempo are set independently by letting the stretch stage compensate
// for the resampling done by the pitch stage.
export function stretchAndShift(
    channels: Float32Array[],
    sampleRate: number,
    tempoRatio: number,
    semitones: number
): Float32Array[] {
    const frames = channels[0].length
    const stereo = channels.length > 1
    const pitch = 2 ** (semitones / 12)

    const st = new SoundTouch({ sampleRate, sampleBufferType: "fifo" })
    st.pitch = pitch
    st.stretch.tempo = tempoRatio / pitch

    const input = new Float32Array(frames * 2)
    for (let i = 0; i < frames; i++) {
        input[2 * i] = channels[0][i]
        input[2 * i + 1] = stereo ? channels[1][i] : channels[0][i]
    }
    st.inputBuffer.putSamples(input)
    // Trailing silence flushes the stretch stage's overlap so the last notes aren't cut off.
    st.inputBuffer.putSamples(new Float32Array(Math.round(sampleRate) * 2))

    const chunks: { data: Float32Array; frames: number }[] = []
    let total = 0
    let stalls = 0
    while (stalls < 3) {
        const pending = st.inputBuffer.frameCount
        st.process()
        const available = st.outputBuffer.frameCount
        if (available > 0) {
            const data = new Float32Array(available * 2)
            st.outputBuffer.extract(data, 0, available)
            st.outputBuffer.receive(available)
            chunks.push({ data, frames: available })
            total += available
            stalls = 0
        } else if (st.inputBuffer.frameCount === pending) {
            stalls++
        }
    }

    const count = Math.min(Math.round(frames / tempoRatio), total)
    const left = new Float32Array(count)
    const right = new Float32Array(count)
    let g = 0
    for (const chunk of chunks) {
        for (let j = 0; j < chunk.frames && g < count; j++, g++) {
            left[g] = chunk.data[2 * j]
            right[g] = chunk.data[2 * j + 1]
        }
    }

    return stereo ? [left, right] : [left]
}
