<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte"
    import {
        genres,
        fetchGenres,
        selectGenreTag,
    } from "$lib/shared/browse.svelte"
    import { onMount } from "svelte"

    onMount(() => {
        fetchGenres()
    })
</script>

<div class="flex flex-col gap-6 px-4 py-2">
    {#if genres.loading}
        <p class="text-muted-foreground text-sm">Loading genres...</p>
    {/if}

    {#if genres.error}
        <div class="flex gap-2 items-center text-muted-foreground text-sm">
            Couldn't load genres.
            <Button onclick={() => fetchGenres()}>Retry</Button>
        </div>
    {/if}

    {#each genres.groups as group}
        {#each group.categories ?? [] as category}
            <section class="flex flex-col gap-2">
                <h3 class="font-bold">{category.name}</h3>
                <div class="flex flex-wrap gap-2">
                    {#each category.tags ?? [] as tag}
                        <Button variant="outline" onclick={() => selectGenreTag(tag)}
                            >{tag.label}</Button
                        >
                    {/each}
                </div>
                {#each category.subcategories ?? [] as subcategory}
                    <div class="flex flex-col gap-2 pl-4">
                        <h4 class="text-sm text-muted-foreground">{subcategory.name}</h4>
                        <div class="flex flex-wrap gap-2">
                            {#each subcategory.tags ?? [] as tag}
                                <Button variant="ghost" onclick={() => selectGenreTag(tag)}
                                    >{tag.label}</Button
                                >
                            {/each}
                        </div>
                    </div>
                {/each}
            </section>
        {/each}
    {/each}
</div>
