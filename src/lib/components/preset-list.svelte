<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte"
    import Input from "$lib/components/ui/input/input.svelte"
    import Download from "lucide-svelte/icons/download"
    import LoaderCircle from "lucide-svelte/icons/loader-circle"
    import {
        presets,
        fetchPresets,
        loadMorePresets,
        downloadPreset,
        type PresetAsset,
    } from "$lib/shared/browse.svelte"
    import { onMount } from "svelte"

    let sentinel = $state<HTMLElement>(null!)
    let downloading = $state<Record<string, boolean>>({})
    let status = $state<string | null>(null)

    async function download(preset: PresetAsset) {
        downloading[preset.uuid] = true
        status = null
        try {
            const path = await downloadPreset(preset)
            status = `Saved to ${path}`
        } catch (e: any) {
            console.error("⚠️ Preset download failed", e)
            status = `Download failed: ${e.message}`
        } finally {
            downloading[preset.uuid] = false
        }
    }

    onMount(() => {
        if (presets.items.length == 0) fetchPresets(true)
    })

    $effect(() => {
        void presets.items.length
        void presets.loading
        if (!sentinel) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMorePresets()
            },
            { rootMargin: "240px" }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    })
</script>

<div class="flex flex-col gap-4 px-4 py-2">
    <form
        class="flex gap-2"
        onsubmit={(event) => {
            event.preventDefault()
            fetchPresets(true)
        }}
    >
        <Input placeholder="Search presets..." bind:value={presets.query} />
        <Button type="submit">Search</Button>
    </form>

    <div class="flex flex-col">
        {#each presets.items as preset}
            <div class="flex gap-4 items-center justify-between p-2 rounded-lg hover:bg-muted">
                <div class="flex flex-col min-w-0">
                    <span class="text-sm font-medium truncate">{preset.name}</span>
                    <span class="text-xs text-muted-foreground truncate"
                        >{preset.device?.name ?? "Unknown device"}</span
                    >
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Download preset"
                    disabled={downloading[preset.uuid]}
                    onclick={() => download(preset)}
                >
                    {#if downloading[preset.uuid]}
                        <LoaderCircle class="animate-spin" />
                    {:else}
                        <Download />
                    {/if}
                </Button>
            </div>
        {:else}
            {#if !presets.loading}
                <p class="text-muted-foreground text-sm">No presets found</p>
            {/if}
        {/each}
    </div>

    {#if status}
        <p class="text-muted-foreground text-sm break-all">{status}</p>
    {/if}

    <div
        bind:this={sentinel}
        class="flex h-10 items-center justify-center gap-2 text-sm text-muted-foreground"
    >
        {#if presets.error}
            Couldn't load presets.
            <Button variant="outline" size="sm" onclick={() => fetchPresets()}>Retry</Button>
        {:else if presets.loading}
            Loading more…
        {:else if presets.items.length > 0 && presets.page >= presets.totalPages}
            That's all
        {/if}
    </div>
</div>
