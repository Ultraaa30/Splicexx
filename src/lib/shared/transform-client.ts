type Pending = {
    resolve: (channels: Float32Array[]) => void
    reject: (error: Error) => void
}

let worker: Worker | null = null
let nextId = 0
const waiting = new Map<number, Pending>()

function getWorker() {
    if (!worker) {
        worker = new Worker(new URL("./transform-worker.ts", import.meta.url), {
            type: "module",
        })
        worker.onmessage = (event: MessageEvent<{ id: number; channels: Float32Array[] }>) => {
            waiting.get(event.data.id)?.resolve(event.data.channels)
            waiting.delete(event.data.id)
        }
        worker.onerror = (event) => {
            for (const pending of waiting.values()) {
                pending.reject(new Error(event.message))
            }
            waiting.clear()
        }
    }
    return worker
}

export function stretchAndShiftAsync(
    channels: Float32Array[],
    sampleRate: number,
    tempoRatio: number,
    semitones: number
) {
    const id = nextId++
    const copies = channels.map((channel) => channel.slice())
    return new Promise<Float32Array[]>((resolve, reject) => {
        waiting.set(id, { resolve, reject })
        getWorker().postMessage(
            { id, channels: copies, sampleRate, tempoRatio, semitones },
            copies.map((channel) => channel.buffer as ArrayBuffer)
        )
    })
}
