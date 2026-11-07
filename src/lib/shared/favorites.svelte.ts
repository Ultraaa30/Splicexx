import type { SampleAsset } from "$lib/splice/types"
import { appConfigDir } from "@tauri-apps/api/path"
import {
    BaseDirectory,
    create,
    exists,
    mkdir,
    readTextFile,
    writeTextFile,
} from "@tauri-apps/plugin-fs"

const FAVORITES_FILE_NAME = "favorites.json"

export const favorites = $state({ items: [] as SampleAsset[] })

export const isFavorite = (uuid: string) =>
    favorites.items.some((item) => item.uuid == uuid)

export async function loadFavorites() {
    try {
        if (
            await exists(FAVORITES_FILE_NAME, {
                baseDir: BaseDirectory.AppConfig,
            })
        ) {
            favorites.items = JSON.parse(
                await readTextFile(FAVORITES_FILE_NAME, {
                    baseDir: BaseDirectory.AppConfig,
                })
            )
        }
    } catch (e) {
        console.error("⚠️ Failed to load favorites", e)
    }
}

async function saveFavorites() {
    const appConfig = await appConfigDir()
    if (!(await exists(appConfig))) await mkdir(appConfig, { recursive: true })

    if (
        !(await exists(FAVORITES_FILE_NAME, {
            baseDir: BaseDirectory.AppConfig,
        }))
    ) {
        await create(FAVORITES_FILE_NAME, { baseDir: BaseDirectory.AppConfig })
    }

    await writeTextFile(FAVORITES_FILE_NAME, JSON.stringify(favorites.items), {
        baseDir: BaseDirectory.AppConfig,
    })
}

export async function toggleFavorite(sampleAsset: SampleAsset) {
    if (isFavorite(sampleAsset.uuid)) {
        favorites.items = favorites.items.filter(
            (item) => item.uuid != sampleAsset.uuid
        )
    } else {
        favorites.items.push(sampleAsset)
    }
    await saveFavorites()
}
