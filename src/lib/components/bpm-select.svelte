<script lang="ts">
    import Gauge from "lucide-svelte/icons/gauge"
    import ChevronDown from "lucide-svelte/icons/chevron-down"
    import Button from "$lib/components/ui/button/button.svelte"
    import { cn } from "$lib/utils"

    const MIN_BPM = 40
    const MAX_BPM = 240

    let {
        bpm = $bindable(),
        min_bpm = $bindable(),
        max_bpm = $bindable(),
        onsubmit,
    }: {
        bpm: string | null
        min_bpm: number | null
        max_bpm: number | null
        onsubmit: () => void
    } = $props()

    let open = $state(false)
    let root = $state<HTMLElement>(null!)
    let tab = $state<"range" | "exact">("range")
    let rangeMin = $state<number | null>(100)
    let rangeMax = $state<number | null>(120)
    let exact = $state<number | null>(120)

    const label = $derived(
        bpm
            ? `${bpm} BPM`
            : min_bpm != null || max_bpm != null
              ? `${min_bpm ?? MIN_BPM}–${max_bpm ?? MAX_BPM} BPM`
              : "Any BPM"
    )

    const percent = (value: number | null) =>
        (((value ?? MIN_BPM) - MIN_BPM) / (MAX_BPM - MIN_BPM)) * 100

    const clamp = (value: number | null, fallback: number) =>
        value == null || Number.isNaN(value)
            ? fallback
            : Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)))

    const toggle = () => {
        if (!open) {
            if (bpm) {
                tab = "exact"
                exact = Number(bpm)
            } else {
                tab = "range"
                rangeMin = min_bpm ?? 100
                rangeMax = max_bpm ?? 120
            }
        }
        open = !open
    }

    const save = () => {
        if (tab == "exact") {
            bpm = String(clamp(exact, 120))
            min_bpm = null
            max_bpm = null
        } else {
            const low = clamp(rangeMin, MIN_BPM)
            const high = clamp(rangeMax, MAX_BPM)
            bpm = null
            min_bpm = Math.min(low, high)
            max_bpm = Math.max(low, high)
        }
        open = false
        onsubmit()
    }

    const clear = () => {
        bpm = null
        min_bpm = null
        max_bpm = null
        open = false
        onsubmit()
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

<div class="relative" bind:this={root}>
    <Button
        variant="outline"
        class="w-[170px] justify-between px-3 font-normal"
        aria-haspopup="true"
        aria-expanded={open}
        onclick={toggle}
    >
        <span class="flex items-center gap-2 truncate">
            <Gauge class="size-4 text-muted-foreground" />
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
            <div class="flex rounded-full bg-muted p-0.5">
                {#each [["range", "Range"], ["exact", "Exact"]] as [id, text]}
                    <button
                        type="button"
                        class={cn(
                            "flex-1 rounded-full py-1 text-sm transition-colors",
                            tab == id
                                ? "bg-[#0a84ff] text-white"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        onclick={() => (tab = id as "range" | "exact")}
                    >
                        {text}
                    </button>
                {/each}
            </div>

            {#if tab == "range"}
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Range</span>
                    <div class="flex items-center gap-2">
                        <input
                            type="number"
                            min={MIN_BPM}
                            max={MAX_BPM}
                            aria-label="Minimum BPM"
                            bind:value={rangeMin}
                            class="h-8 w-16 rounded-full border border-input bg-transparent text-center text-sm outline-none focus:border-foreground/40"
                        />
                        <span class="text-muted-foreground">–</span>
                        <input
                            type="number"
                            min={MIN_BPM}
                            max={MAX_BPM}
                            aria-label="Maximum BPM"
                            bind:value={rangeMax}
                            class="h-8 w-16 rounded-full border border-input bg-transparent text-center text-sm outline-none focus:border-foreground/40"
                        />
                    </div>
                </div>
                <div class="relative h-5">
                    <div class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted"></div>
                    <div
                        class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#0a84ff]"
                        style:left="{percent(rangeMin)}%"
                        style:right="{100 - percent(rangeMax)}%"
                    ></div>
                    <input
                        type="range"
                        class="bpm-range"
                        min={MIN_BPM}
                        max={MAX_BPM}
                        step="1"
                        aria-label="Minimum BPM slider"
                        bind:value={rangeMin}
                        oninput={() => {
                            if (rangeMin != null && rangeMax != null && rangeMin > rangeMax) rangeMin = rangeMax
                        }}
                    />
                    <input
                        type="range"
                        class="bpm-range"
                        min={MIN_BPM}
                        max={MAX_BPM}
                        step="1"
                        aria-label="Maximum BPM slider"
                        bind:value={rangeMax}
                        oninput={() => {
                            if (rangeMin != null && rangeMax != null && rangeMax < rangeMin) rangeMax = rangeMin
                        }}
                    />
                </div>
            {:else}
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Exact</span>
                    <input
                        type="number"
                        min={MIN_BPM}
                        max={MAX_BPM}
                        aria-label="BPM"
                        bind:value={exact}
                        class="h-8 w-16 rounded-full border border-input bg-transparent text-center text-sm outline-none focus:border-foreground/40"
                    />
                </div>
                <div class="relative h-5">
                    <div class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted"></div>
                    <div
                        class="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#0a84ff]"
                        style:width="{percent(exact)}%"
                    ></div>
                    <input
                        type="range"
                        class="bpm-range"
                        min={MIN_BPM}
                        max={MAX_BPM}
                        step="1"
                        aria-label="BPM slider"
                        bind:value={exact}
                    />
                </div>
            {/if}

            <div class="flex justify-between text-xs text-muted-foreground">
                <span>{MIN_BPM}</span>
                <span>{MAX_BPM}</span>
            </div>

            <div class="flex items-center justify-between">
                <Button variant="ghost" size="sm" onclick={clear}>Clear</Button>
                <Button size="sm" class="px-5" onclick={save}>Save</Button>
            </div>
        </div>
    {/if}
</div>

<style>
    .bpm-range {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        pointer-events: none;
    }

    .bpm-range:focus {
        outline: none;
    }

    .bpm-range::-webkit-slider-runnable-track {
        height: 100%;
        background: transparent;
    }

    .bpm-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        pointer-events: auto;
        width: 16px;
        height: 16px;
        margin-top: 2px;
        border-radius: 9999px;
        border: 0;
        background: #fff;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 0.35);
        cursor: pointer;
    }

    .bpm-range::-moz-range-track {
        background: transparent;
    }

    .bpm-range::-moz-range-thumb {
        pointer-events: auto;
        width: 16px;
        height: 16px;
        border: 0;
        border-radius: 9999px;
        background: #fff;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 0.35);
        cursor: pointer;
    }
</style>
