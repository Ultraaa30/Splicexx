<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte"
    import Input from "$lib/components/ui/input/input.svelte"
    import {
        packs,
        fetchPacks,
        loadMorePacks,
        openPack,
    } from "$lib/shared/browse.svelte"
    import { onMount } from "svelte"
    import type { PackAsset } from "$lib/splice/types"

    let sentinel = $state<HTMLElement>(null!)

    const coverUrl = (pack: PackAsset) =>
        pack.files?.find((file) => file.asset_file_type_slug == "cover_image")
            ?.url ?? pack.files?.[0]?.url

    onMount(() => {
        if (packs.items.length == 0) fetchPacks(true)
    })

    $effect(() => {
        void packs.items.length
        void packs.loading
        if (!sentinel) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMorePacks()
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
            fetchPacks(true)
        }}
    >
        <Input placeholder="Search packs..." bind:value={packs.query} />
        <Button type="submit">Search</Button>
    </form>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {#each packs.items as pack}
            <button
                class="flex flex-col gap-2 p-2 rounded-lg text-left hover:bg-muted"
                onclick={() => openPack(pack)}
            >
                <img
                    src={coverUrl(pack)}
                    alt={pack.name}
                    class="w-full aspect-square rounded object-cover bg-muted"
                    draggable="false"
                />
                <span class="text-sm font-medium truncate">{pack.name}</span>
                <span class="text-xs text-muted-foreground truncate"
                    >{pack.provider?.name ?? ""}</span
                >
            </button>
        {:else}
            {#if !packs.loading}
                <p class="text-muted-foreground text-sm">No packs found</p>
            {/if}
        {/each}
    </div>

    <div
        bind:this={sentinel}
        class="flex h-10 items-center justify-center gap-2 text-sm text-muted-foreground"
    >
        {#if packs.error}
            Couldn't load packs.
            <Button variant="outline" size="sm" onclick={() => fetchPacks()}>Retry</Button>
        {:else if packs.loading}
            Loading more…
        {:else if packs.items.length > 0 && packs.page >= packs.totalPages}
            That's all
        {/if}
    </div>
</div>
