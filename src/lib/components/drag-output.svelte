<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte"
    import KeySelect from "$lib/components/key-select.svelte"
    import { transform } from "$lib/shared/transform.svelte"
    import { cn } from "$lib/utils"

    let { class: className }: { class?: string } = $props()

    const active = $derived(Boolean(transform.bpm || transform.key))

    const reset = () => {
        transform.bpm = null
        transform.key = null
        transform.chord = null
    }
</script>

<div class={cn("flex flex-col gap-3 rounded-xl bg-muted/40 p-3", className)}>
    <div class="relative flex items-center justify-center">
        <span class="text-xs font-medium">Drag output</span>
        {#if active}
            <Button variant="ghost" size="sm" class="absolute right-0 h-6 px-2 text-xs" onclick={reset}>
                Reset
            </Button>
        {/if}
    </div>
    <div class="flex flex-col gap-1.5">
        <span class="text-[11px] text-muted-foreground">BPM</span>
        <input
            type="number"
            min="40"
            max="240"
            placeholder="Original"
            aria-label="Drag BPM"
            value={transform.bpm ?? ""}
            oninput={(event) => (transform.bpm = event.currentTarget.valueAsNumber || null)}
            class="h-8 w-full rounded-full border border-input bg-transparent px-3 text-[13px] outline-none focus:border-foreground/40"
        />
    </div>
    <div class="flex flex-col gap-1.5">
        <span class="text-[11px] text-muted-foreground">Key</span>
        <KeySelect
            bind:key={transform.key}
            bind:chord_type={transform.chord}
            onselect={() => {}}
            anyLabel="Keep key"
        />
    </div>
    <p class="text-[11px] leading-snug text-muted-foreground">
        {active
            ? "Applied to samples as you drag them out."
            : "Samples keep their original tempo and key."}
    </p>
</div>
