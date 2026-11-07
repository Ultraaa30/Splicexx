import { querySplice, CategoryList, PacksSearch, PresetsSearch } from "$lib/splice/api"
import { config, isSamplesDirValid } from "$lib/shared/config.svelte"
import { dataStore, fetchAssets, queryStore } from "$lib/shared/store.svelte"
import { ensureFileDirectoryExists, sanitizePath } from "$lib/shared/files.svelte"
import type { AssetFile, PackAsset } from "$lib/splice/types"
import { join } from "@tauri-apps/api/path"
import { create, exists } from "@tauri-apps/plugin-fs"

export type View = "sounds" | "favorites" | "packs" | "presets" | "genres"

export const view = $state({ current: "sounds" as View })

export type PresetAsset = {
    uuid: string
    name: string
    attributes?: string[]
    device?: { name: string } | null
    files: AssetFile[]
}

type GenreTag = { uuid: string; label: string }

export type GenreGroup = {
    uuid: string
    name: string
    categories: {
        uuid: string
        name: string
        tags: GenreTag[]
        subcategories: { uuid: string; name: string; tags: GenreTag[] }[]
    }[]
}

export const packs = $state({
    items: [] as PackAsset[],
    page: 1,
    totalPages: 1,
    loading: false,
    error: false,
    query: "",
})

export const presets = $state({
    items: [] as PresetAsset[],
    page: 1,
    totalPages: 1,
    loading: false,
    error: false,
    query: "",
})

export const genres = $state({
    groups: [] as GenreGroup[],
    loading: false,
    error: false,
})

export async function fetchPacks(reset = false) {
    if (reset) {
        packs.items = []
        packs.page = 1
    }
    packs.loading = true
    packs.error = false
    try {
        const response = await querySplice(PacksSearch, {
            page: packs.page,
            query: packs.query || null,
            tags: [],
        })
        const search = response.data.assetsSearch
        packs.items.push(...search.items)
        packs.totalPages = search.pagination_metadata.totalPages
    } catch (e) {
        console.error("⚠️ Failed to fetch packs", e)
        packs.error = true
    } finally {
        packs.loading = false
    }
}

export function loadMorePacks() {
    if (packs.loading || packs.error || packs.page >= packs.totalPages) return
    packs.page += 1
    fetchPacks()
}

export async function fetchPresets(reset = false) {
    if (reset) {
        presets.items = []
        presets.page = 1
    }
    presets.loading = true
    presets.error = false
    try {
        const response = await querySplice(PresetsSearch, {
            page: presets.page,
            query: presets.query || null,
            tags: [],
        })
        const search = response.data.assetsSearch
        presets.items.push(...search.items)
        presets.totalPages = search.pagination_metadata.totalPages
    } catch (e) {
        console.error("⚠️ Failed to fetch presets", e)
        presets.error = true
    } finally {
        presets.loading = false
    }
}

export function loadMorePresets() {
    if (presets.loading || presets.error || presets.page >= presets.totalPages) return
    presets.page += 1
    fetchPresets()
}

export async function fetchGenres() {
    if (genres.loading || genres.groups.length > 0) return
    genres.loading = true
    genres.error = false
    try {
        const response = await querySplice(CategoryList)
        genres.groups = response.data.categories ?? []
    } catch (e) {
        console.error("⚠️ Failed to fetch genres", e)
        genres.error = true
    } finally {
        genres.loading = false
    }
}

export function openPack(pack: PackAsset) {
    queryStore.packFilter = { uuid: pack.uuid, name: pack.name }
    view.current = "sounds"
    fetchAssets()
}

export function clearPackFilter() {
    queryStore.packFilter = null
    fetchAssets()
}

export function selectGenreTag(tag: GenreTag) {
    if (!dataStore.tags.includes(tag.uuid)) dataStore.tags.push(tag.uuid)
    view.current = "sounds"
    fetchAssets()
}

const NON_DOWNLOADABLE_FILE_TYPES = [
    "preview_mp3",
    "demo_mp3",
    "waveform",
    "cover_image",
    "banner_image",
]

export async function downloadPreset(preset: PresetAsset) {
    const file = preset.files.find(
        (f) => !NON_DOWNLOADABLE_FILE_TYPES.includes(f.asset_file_type_slug)
    )
    if (!file) throw new Error(`No downloadable file for ${preset.name}`)
    if (!config.samples_dir || !isSamplesDirValid()) {
        throw new Error("Samples Directory not set or invalid")
    }

    const filename = file.name ?? file.path.split("/").pop() ?? preset.name
    const absolutePath = await join(
        config.samples_dir,
        "Presets",
        sanitizePath(preset.name),
        sanitizePath(filename)
    )
    if (await exists(absolutePath)) return absolutePath

    const response = await fetch(file.url)
    if (!response.ok) {
        throw new Error(`Preset download failed: HTTP ${response.status}`)
    }
    const buffer = await response.arrayBuffer()

    await ensureFileDirectoryExists(absolutePath)
    const handle = await create(absolutePath)
    await handle.write(new Uint8Array(buffer))
    await handle.close()
    return absolutePath
}
