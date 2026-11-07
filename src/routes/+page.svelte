<script lang="ts">
    import SampleListEntry from "./sample-list-entry.svelte"
    import SearchInput from "$lib/components/search-input.svelte"
    import { ScrollArea } from "$lib/components/ui/scroll-area"
    import { onMount, tick } from "svelte"
    import SortSelect from "$lib/components/sort-select.svelte"
    import Search from "lucide-svelte/icons/search"
    import Smile from "lucide-svelte/icons/smile"
    import Ghost from "lucide-svelte/icons/ghost"
    import Shuffle from "lucide-svelte/icons/shuffle"
    import Star from "lucide-svelte/icons/star"
    import X from "lucide-svelte/icons/x"
    import AudioLines from "lucide-svelte/icons/audio-lines"
    import Package from "lucide-svelte/icons/package"
    import SlidersHorizontal from "lucide-svelte/icons/sliders-horizontal"
    import Tags from "lucide-svelte/icons/tags"
    import Button from "$lib/components/ui/button/button.svelte"
    
    import ProgressLoading from "$lib/components/progress-loading.svelte"
    import SortHeader from "$lib/components/sort-header.svelte"
    import ChevronDown from "lucide-svelte/icons/chevron-down"
    import { cn } from "$lib/utils"
    import AssetCategorySelect from "$lib/components/asset-category-select.svelte"
    import BpmSelect from "$lib/components/bpm-select.svelte"
    import AudioPlayer from "$lib/components/audio-player.svelte"
    import TagBadge from "$lib/components/tag-badge.svelte"
    import PackList from "$lib/components/pack-list.svelte"
    import PresetList from "$lib/components/preset-list.svelte"
    import GenreList from "$lib/components/genre-list.svelte"
    import { globalAudio } from "$lib/shared/audio.svelte"
    import type { AssetSortType } from "$lib/splice/types"
    import { loading } from "$lib/shared/loading.svelte"
    import {
        dataStore,
        storeCallbacks,
        queryStore,
        fetchAssets,
        DEFAULT_SORT,
        randomSeed,
    } from "$lib/shared/store.svelte"
    import { favorites, loadFavorites } from "$lib/shared/favorites.svelte"
    
    import {
        view,
        clearPackFilter,
        type View,
    } from "$lib/shared/browse.svelte"
    import SettingsDialog from "$lib/components/settings-dialog.svelte"
    import KeySelect from "$lib/components/key-select.svelte"
    import DragOutput from "$lib/components/drag-output.svelte"

    const VIEWS: { id: View; label: string; icon: typeof AudioLines }[] = [
        { id: "sounds", label: "Sounds", icon: AudioLines },
        { id: "favorites", label: "Favorites", icon: Star },
        { id: "packs", label: "Packs", icon: Package },
        { id: "presets", label: "Presets", icon: SlidersHorizontal },
        { id: "genres", label: "Genres", icon: Tags },
    ]

    const isSoundsView = $derived(view.current == "sounds")
    const isListView = $derived(
        view.current == "sounds" || view.current == "favorites"
    )
    const visibleAssets = $derived(
        view.current == "favorites" ? favorites.items : dataStore.sampleAssets
    )

    $effect(() => {
        if (
            queryStore.sort in ["random", "popularity", "relevance", "recency"]
        ) {
            queryStore.order = "DESC"
        }
    })

    storeCallbacks.onbeforedataupdate = () => {
        viewportRef.scrollTo({ top: 0, behavior: "smooth" })
    }

    storeCallbacks.onbeforetagsupdate = () => {
        if (tagsDrawerRef) {
            tagsDrawerRef.style.height = `${tagsContainerRef.offsetHeight}px`
        }
    }

    let expandTags = $state(false)

    let viewportRef = $state<HTMLElement>(null!)
    let tagsContainerRef = $state<HTMLElement>(null!)
    let tagsDrawerRef = $state<HTMLElement>(null!)
    let searchInputRef = $state<HTMLInputElement>(null!)

    const selectedSampleIndex = $derived(
        visibleAssets.findIndex(
            (sampleAsset) => sampleAsset.uuid == globalAudio.currentAsset?.uuid
        )
    )

    const updateSort = (newSort: AssetSortType) => {
        if (queryStore.sort == newSort) {
            if (queryStore.order == "DESC") {
                queryStore.order = "ASC"
            } else {
                queryStore.sort = DEFAULT_SORT
            }
        } else {
            queryStore.sort = newSort
            queryStore.order = "DESC"
        }
        fetchAssets()
    }

    const gotoPrev = () => {
        const currentIndex = visibleAssets.findIndex(
            (asset) => asset.uuid === globalAudio.currentAsset?.uuid
        )
        if (currentIndex > 0) {
            const sampleAsset = visibleAssets[currentIndex - 1]
            globalAudio.playSampleAsset(sampleAsset)
            const entryEl = document.getElementById(
                `sample-list-entry-${sampleAsset.uuid}`
            )
            if (entryEl)
                entryEl.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
    }

    const gotoNext = () => {
        const currentIndex = visibleAssets.findIndex(
            (asset) => asset.uuid === globalAudio.currentAsset?.uuid
        )
        if (currentIndex !== -1 && currentIndex + 1 < visibleAssets.length) {
            const sampleAsset = visibleAssets[currentIndex + 1]
            globalAudio.playSampleAsset(sampleAsset)
            const entryEl = document.getElementById(
                `sample-list-entry-${sampleAsset.uuid}`
            )
            if (entryEl)
                entryEl.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
    }

    onMount(() => {
        viewportRef.addEventListener("scroll", () => {
            if (
                isSoundsView &&
                !loading.assets &&
                viewportRef.scrollTop + viewportRef.clientHeight >=
                    viewportRef.scrollHeight - viewportRef.clientHeight
            ) {
                queryStore.page += 1
                console.log("📃 End of list reached, loading more assets")
                fetchAssets()
            }
        })

        searchInputRef.focus()

        loadFavorites()
        fetchAssets()
    })
</script>

<main class="flex size-full">
    <aside class="flex w-[212px] shrink-0 flex-col gap-0.5 bg-sidebar-background px-3 pb-3 pt-4 max-md:w-14 max-md:px-2">
        <div class="flex items-center gap-2.5 px-2 pb-5 pt-1">
            <img src="/app-logo.png" alt="" draggable="false" class="size-6 shrink-0 select-none" />
            <span class="text-[15px] font-semibold tracking-tight max-md:hidden">Splicexx</span>
        </div>

        {#each VIEWS as item}
            {@const Icon = item.icon}
            <button
                class={cn(
                    "flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] transition-colors max-md:justify-center max-md:px-0",
                    view.current == item.id
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}
                onclick={() => (view.current = item.id)}
            >
                <Icon
                    size={16}
                    class={view.current == item.id ? "text-[hsl(var(--data))]" : ""}
                />
                <span class="max-md:hidden">{item.label}</span>
            </button>
        {/each}

        <div class="flex flex-1 flex-col justify-center pb-32 max-md:hidden">
            <DragOutput />
        </div>

        <div class="mt-auto flex px-1">
            <SettingsDialog />
        </div>
    </aside>

    <section class="flex min-w-0 flex-1 flex-col">
        <div class="flex flex-col gap-3 px-5 pb-3 pt-4">
            {#if isSoundsView}
                <div class="flex flex-wrap items-center gap-2">
                    <SearchInput
                        bind:value={queryStore.query}
                        onsubmit={fetchAssets}
                        class="flex-grow"
                        bind:inputRef={searchInputRef}
                    />
                    <KeySelect
                        bind:key={queryStore.key}
                        bind:chord_type={queryStore.chord_type}
                        onselect={fetchAssets}
                    />
                    <BpmSelect
                        bind:bpm={queryStore.bpm}
                        bind:min_bpm={queryStore.min_bpm}
                        bind:max_bpm={queryStore.max_bpm}
                        onsubmit={fetchAssets}
                    />
                    <AssetCategorySelect
                        bind:asset_category_slug={queryStore.asset_category_slug}
                        onselect={fetchAssets}
                    />
                </div>

                <div
                    class="transition-[height] ease-in-out overflow-clip"
                    bind:this={tagsDrawerRef}
                >
                    <div
                        class="flex justify-between gap-2"
                        bind:this={tagsContainerRef}
                    >
                        <div class="min-w-0 relative">
                            <div
                                class={cn(
                                    "flex text-nowrap gap-1.5 overflow-clip flex-shrink",
                                    expandTags && "flex-wrap"
                                )}
                            >
                                {#each dataStore.tag_summary as tag}
                                    {@const active = dataStore.tags.includes(
                                        tag.tag.uuid
                                    )}
                                    <TagBadge
                                        label={tag.tag.label}
                                        count={tag.count}
                                        {active}
                                        onclick={() => {
                                            if (active) {
                                                dataStore.tags.splice(
                                                    dataStore.tags.indexOf(
                                                        tag.tag.uuid
                                                    ),
                                                    1
                                                )
                                            } else {
                                                dataStore.tags.push(tag.tag.uuid)
                                            }
                                            fetchAssets()
                                        }}
                                    />
                                {/each}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onclick={() => {
                                expandTags = !expandTags
                                tick().then(() => {
                                    tagsDrawerRef.style.height =
                                        tagsContainerRef.offsetHeight + "px"
                                })
                            }}
                            class="shrink-0"
                        >
                            <ChevronDown
                                class={cn(
                                    "transition-transform ease-in-out",
                                    expandTags ? "rotate-[-180deg]" : ""
                                )}
                            /></Button
                        >
                    </div>
                </div>

                {#if queryStore.packFilter}
                    <div class="flex items-center gap-2 text-[13px]">
                        <span class="text-muted-foreground">Pack</span>
                        <span class="rounded-full bg-muted px-2.5 py-0.5 font-medium"
                            >{queryStore.packFilter.name}</span
                        >
                        <Button
                            variant="ghost"
                            size="icon"
                            class="size-6"
                            aria-label="Clear pack filter"
                            onclick={clearPackFilter}
                        >
                            <X size={14} />
                        </Button>
                    </div>
                {/if}

                <div class="flex items-center gap-2">
                    <h1 class="flex-grow text-[20px] font-semibold tracking-tight">
                        Sounds
                        <span class="ml-1.5 text-[13px] font-normal text-muted-foreground">
                            {dataStore.total_records.toLocaleString()} results
                        </span>
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Shuffle"
                        onclick={() => {
                            queryStore.random_seed = randomSeed()
                            queryStore.sort = "random"
                            fetchAssets()
                        }}
                    >
                        <Shuffle />
                    </Button>
                    <SortSelect
                        bind:sort={queryStore.sort}
                        onselect={fetchAssets}
                        order={queryStore.order}
                    />
                </div>
            {:else if view.current == "favorites"}
                <div class="flex items-center justify-between">
                    <h1 class="text-[20px] font-semibold tracking-tight">Favorites</h1>
                    <span class="text-[13px] text-muted-foreground">
                        {favorites.items.length.toLocaleString()} saved
                    </span>
                </div>
            {:else}
                <h1 class="text-[20px] font-semibold tracking-tight">
                    {VIEWS.find((item) => item.id == view.current)?.label}
                </h1>
            {/if}

            {#if isSoundsView}
                <div class="flex items-center justify-between px-3 text-xs text-muted-foreground">
                    <span class="w-24">Pack</span>
                    <SortHeader
                        value="name"
                        label="Filename"
                        sort={queryStore.sort}
                        order={queryStore.order}
                        onsort={updateSort}
                        class="flex-[3_1_auto]"
                    />
                    <SortHeader
                        value="duration"
                        label="Time"
                        sort={queryStore.sort}
                        order={queryStore.order}
                        onsort={updateSort}
                        class="w-14"
                    />
                    <SortHeader
                        value="key"
                        label="Key"
                        sort={queryStore.sort}
                        order={queryStore.order}
                        onsort={updateSort}
                        class="w-14"
                    />
                    <SortHeader
                        value="bpm"
                        label="BPM"
                        sort={queryStore.sort}
                        order={queryStore.order}
                        onsort={updateSort}
                        class="w-14"
                    />
                </div>
            {/if}

            {#if isListView}
                <ProgressLoading
                    loading={loading.assets || loading.waveformsCount > 0}
                />
            {/if}
        </div>

        <ScrollArea class="flex-grow px-2" bind:viewportRef onkeydown={(e) => {
            if (!isListView) return
            switch (e.key) {
                case "ArrowUp":
                    e.preventDefault()
                    gotoPrev()
                    break
                case "ArrowDown":
                    e.preventDefault()
                    gotoNext()
                    break
                case "ArrowLeft":
                    e.preventDefault()
                    gotoPrev()
                    break
                case "ArrowRight":
                    e.preventDefault()
                    gotoNext()
                    break
                case " ":
                    e.preventDefault()
                    globalAudio.togglePlay()
                    break
            }
        }}>
            {#if view.current == "packs"}
                <PackList />
            {:else if view.current == "presets"}
                <PresetList />
            {:else if view.current == "genres"}
                <GenreList />
            {:else}
                <div class="flex flex-col gap-0.5 py-1">
                    {#each visibleAssets as sampleAsset}
                        {@const selected =
                            globalAudio.currentAsset?.uuid == sampleAsset.uuid}
                        <SampleListEntry
                            {sampleAsset}
                            {selected}
                            playing={selected && !globalAudio.paused}
                        />
                    {:else}
                        <div
                            class="flex flex-col gap-2 justify-center items-center size-full py-16 text-muted-foreground"
                        >
                            {#if view.current == "favorites"}
                                <Star size={40} />
                                <p class="font-semibold text-foreground">No favorites yet</p>
                                <p class="text-sm">Click the star on a sample to save it here</p>
                            {:else if loading.fetchError}
                                <Ghost size={40} />
                                <p class="font-semibold text-foreground">Something went wrong</p>
                                <p class="text-sm">Couldn't load any samples</p>
                                <Button variant="outline" onclick={fetchAssets}>Retry</Button>
                            {:else if loading.beforeFirstLoad}
                                <Smile size={40} />
                                <p class="font-semibold text-foreground">Hey there!</p>
                                <p class="text-sm">Make some cool music, will ya?</p>
                            {:else}
                                <Search size={40} />
                                <p class="font-semibold text-foreground">No results</p>
                                <p class="text-sm">Try different keywords</p>
                            {/if}
                        </div>
                    {/each}
                    {#if view.current == "sounds" && loading.fetchError && dataStore.sampleAssets.length > 0}
                        <div
                            class="flex flex-col py-8 gap-2 justify-center items-center text-muted-foreground"
                        >
                            <Ghost size={40} />
                            <p class="font-semibold text-foreground">Something went wrong</p>
                            <p class="text-sm">Couldn't load any more samples</p>
                            <Button variant="outline" onclick={fetchAssets}>Retry</Button>
                        </div>
                    {/if}
                </div>
            {/if}
        </ScrollArea>

        <div class="px-3 pb-3 pt-2">
            <AudioPlayer
                onprev={gotoPrev}
                onnext={gotoNext}
                class="rounded-2xl bg-card shadow-lg shadow-black/40"
            />
        </div>
    </section>
</main>
