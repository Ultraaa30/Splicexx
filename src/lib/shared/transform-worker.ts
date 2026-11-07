import { stretchAndShift } from "./transform-audio"

type Job = {
    id: number
    channels: Float32Array[]
    sampleRate: number
    tempoRatio: number
    semitones: number
}

const worker = self as unknown as {
    onmessage: ((event: MessageEvent<Job>) => void) | null
    postMessage(message: unknown, transfer: ArrayBuffer[]): void
}

worker.onmessage = (event) => {
    const { id, channels, sampleRate, tempoRatio, semitones } = event.data
    const output = stretchAndShift(channels, sampleRate, tempoRatio, semitones)
    worker.postMessage(
        { id, channels: output },
        output.map((channel) => channel.buffer as ArrayBuffer)
    )
}
