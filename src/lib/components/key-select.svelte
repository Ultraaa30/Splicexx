<script lang="ts">
    import Music from "lucide-svelte/icons/music-2"
    import ChevronDown from "lucide-svelte/icons/chevron-down"
    import Button from "$lib/components/ui/button/button.svelte"
    import { cn, relativeKey } from "$lib/utils.js"
    import type { ChordType, Key } from "$lib/splice/types"

    let {
        key = $bindable(),
        chord_type = $bindable(),
        onselect,
        anyLabel = "Any key",
    }: {
        key: Key | null
        chord_type: ChordType | null
        onselect: () => void
        anyLabel?: string
    } = $props()

    let open = $state(false)
    let root = $state<HTMLElement>(null!)

    const label = $derived(
        key
            ? `${key}${chord_type ? ` ${chord_type == "minor" ? "Minor" : "Major"}` : ""}`
            : anyLabel
    )

    const setKey = (value: Key) => {
        key = key == value ? null : value
        onselect()
    }

    const setChord = (value: ChordType) => {
        chord_type = chord_type == value ? null : value
        onselect()
    }

    const makeRelative = () => {
        if (!key || !chord_type) return
        const relative = relativeKey(key, chord_type)
        key = relative.key
        chord_type = relative.chord
        onselect()
    }

    const clear = () => {
        key = null
        chord_type = null
        onselect()
    }
</script>

<svelte:window
    onpointerdown={(event) => {
        if (open && !root.contains(event.target as Node)) open = false
    }}
    onkeydown={(event) => {
        if (open && event.key === "Escape") open = false
    }}
/>

{#snippet note(value: Key, display: string)}
    <Button
        variant="outline"
        class={cn(
            "size-10 rounded-full p-0 text-sm font-medium",
            key == value && "border-transparent bg-[#0a84ff] text-white hover:bg-[#0a84ff]/90"
        )}
        onclick={() => setKey(value)}
    >
        {display}
    </Button>
{/snippet}

<div class="relative" bind:this={root}>
    <Button
        variant="outline"
        class="w-[150px] justify-between px-3 font-normal"
        aria-haspopup="true"
        aria-expanded={open}
        onclick={() => (open = !open)}
    >
        <span class="flex items-center gap-2 truncate">
            <Music class="size-4 text-muted-foreground" />
            {label}
        </span>
        <ChevronDown
            class={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180"
            )}
        />
    </Button>

    {#if open}
        <div
            class="absolute left-0 top-full z-50 mt-2 flex w-[300px] flex-col gap-4 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg"
        >
            <div class="flex flex-col gap-1.5">
                <div class="flex gap-1.5">
                    <div class="w-6 shrink-0"></div>
                    {@render note("C#", "C♯")}
                    {@render note("D#", "D♯")}
                    <div class="w-10 shrink-0"></div>
                    {@render note("F#", "F♯")}
                    {@render note("G#", "G♯")}
                    {@render note("A#", "A♯")}
                </div>
                <div class="flex gap-1.5">
                    {@render note("C", "C")}
                    {@render note("D", "D")}
                    {@render note("E", "E")}
                    {@render note("F", "F")}
                    {@render note("G", "G")}
                    {@render note("A", "A")}
                    {@render note("B", "B")}
                </div>
            </div>

            <div class="flex w-full gap-2">
                {#each ["major", "minor"] as chord}
                    <Button
                        variant="outline"
                        class={cn(
                            "h-10 flex-1 rounded-full",
                            chord_type == chord && "border-transparent bg-[#0a84ff] text-white hover:bg-[#0a84ff]/90"
                        )}
                        onclick={() => setChord(chord as ChordType)}
                    >
                        {chord == "major" ? "Major" : "Minor"}
                    </Button>
                {/each}
            </div>

            {#if key || chord_type}
                <div class="flex items-center">
                    {#if key && chord_type}
                        <Button variant="outline" size="sm" onclick={makeRelative}>
                            Make relative
                        </Button>
                    {/if}
                    <Button variant="ghost" size="sm" class="ml-auto" onclick={clear}>
                        Clear
                    </Button>
                </div>
            {/if}
        </div>
    {/if}
</div>
