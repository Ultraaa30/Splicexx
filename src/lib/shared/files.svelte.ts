import type { SampleAsset } from "$lib/splice/types"
import { join, sep } from "@tauri-apps/api/path"
import { exists, create, mkdir } from "@tauri-apps/plugin-fs"
import { getDescrambledSampleURL } from "./store.svelte"
import { config, isSamplesDirValid } from "$lib/shared/config.svelte"
import { encode } from "node-wav"
import { Buffer } from "buffer"
import { transformPlan } from "$lib/shared/transform.svelte"
import { stretchAndShiftAsync } from "$lib/shared/transform-client"

globalThis.Buffer = Buffer // node-wav needs Buffer which is not defined when using Vite

export const sanitizePath = (path: string) => path.replace(/[^a-zA-Z0-9#_\-\.\/]/g, "_")

const sampleAssetPath = (sampleAsset: SampleAsset, suffix: string) => {
    const fileName = suffix
        ? `${sampleAsset.name.replace(/.wav$/i, "")}${suffix}.wav`
        : sampleAsset.name
    return sanitizePath(`${sampleAsset.parents.items[0].name}/${fileName}`)
}

export async function ensureFileDirectoryExists(filePath: string) {
    const separator = sep()
    const dirs = filePath.split(separator).slice(0, -1) // Remove the filename
    let currentPath = ""

    for (const dir of dirs) {
        currentPath += dir + separator
        if (!(await exists(currentPath))) {
            await mkdir(currentPath)
        }
    }
}

export async function absoluteSamplePath(sampleAsset: SampleAsset, suffix = "") {
    if (!config.samples_dir) {
        throw new Error("❌ Samples Directory not set")
    }

    if (!isSamplesDirValid()) {
        throw new Error("❌ Samples Directory invalid")
    }

    return await join(config.samples_dir, sampleAssetPath(sampleAsset, suffix))
}

async function writeSample(sampleAsset: SampleAsset) {
    const plan = transformPlan(sampleAsset)
    const absolutePath = await absoluteSamplePath(sampleAsset, plan?.suffix)

    if (!absolutePath) {
        throw new Error("❌ Invalid path")
    }

    if (await exists(absolutePath)) {
        console.log("🗃️ Sample already exists at", absolutePath)
        return absolutePath
    }

    const blobURL = await getDescrambledSampleURL(sampleAsset)

    const response = await fetch(blobURL)

    const blob = await response.blob()

    const buffer = await blob.arrayBuffer()

    const samples = await new AudioContext().decodeAudioData(buffer)
    const channels: Float32Array[] = []

    for (let i = 0; i < samples.numberOfChannels; i++) {
        const channel = samples.getChannelData(i)
        
        // Calculate 12ms in samples based on the actual sample rate
        const trimSamples = config.cut_mp3_delay ? Math.floor(samples.sampleRate * 0.012) : 0
        
        const start = trimSamples
        const end = (sampleAsset.duration / 1000) * samples.sampleRate + start
        
        // Make sure we don't try to slice beyond the available data
        const safeEnd = Math.min(end, channel.length)
        
        channels.push(channel.subarray(start, safeEnd))
    }

    const output = plan
        ? await stretchAndShiftAsync(channels, samples.sampleRate, plan.tempoRatio, plan.semitones)
        : channels

    const wavData = encode(output as any, {
        bitDepth: 16,
        sampleRate: samples.sampleRate,
    })

    console.log("🏆 Sample converted! Saving at", absolutePath)

    await ensureFileDirectoryExists(absolutePath)

    const file = await create(absolutePath)
    await file.write(new Uint8Array(wavData))
    await file.close()

    console.log("🎉 Success!")

    return absolutePath
}

const pendingSaves = new Map<string, Promise<string>>()

export function prepareSample(sampleAsset: SampleAsset) {
    const key = sampleAsset.uuid + (transformPlan(sampleAsset)?.suffix ?? "")
    let pending = pendingSaves.get(key)
    if (!pending) {
        pending = writeSample(sampleAsset).finally(() => pendingSaves.delete(key))
        pendingSaves.set(key, pending)
    }
    return pending
}

export function prefetchSample(sampleAsset: SampleAsset) {
    if (transformPlan(sampleAsset)) prepareSample(sampleAsset).catch(() => {})
}

export async function absolutePackImagePath(sampleAsset: SampleAsset) {
    if (!config.samples_dir) {
        throw new Error("❌ Samples Directory not set")
    }

    if (!isSamplesDirValid()) {
        throw new Error("❌ Samples Directory invalid")
    }

    const pack = sampleAsset.parents.items[0]
    const packDir = sanitizePath(pack.name)
    return await join(config.samples_dir, packDir, "cover.jpg")
}

export async function savePackImage(sampleAsset: SampleAsset) {
    const pack = sampleAsset.parents.items[0]
    const packImageUrl = pack?.files[0].url

    const absolutePath = await absolutePackImagePath(sampleAsset)

    if (!absolutePath) {
        throw new Error("❌ Invalid path")
    }

    if (await exists(absolutePath)) {
        console.log("🗃️ Image already exists at", absolutePath)
        return absolutePath
    }

    try {
        const response = await fetch(packImageUrl)
        if (!response.ok) throw new Error("Failed to fetch image")
        const buffer = await response.arrayBuffer()

        console.log("🖼️ Saving pack image at", absolutePath)

        await ensureFileDirectoryExists(absolutePath)

        const file = await create(absolutePath)
        await file.write(new Uint8Array(buffer))
        await file.close()

        console.log("🎉 Pack image saved!")

        return absolutePath
    } catch (e: any) {
        console.log(e.message)
        if (e instanceof TypeError && (e.message.includes("Failed to fetch") || e.message.includes("Load failed"))) {
            console.warn("⚠️ CORS error or network issue when fetching pack image", e)
            return null
        }
        throw e
    }
}

