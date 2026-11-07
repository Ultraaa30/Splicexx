import { emit, listen } from "@tauri-apps/api/event"

// ------------- Templates are copy-pasted from the browser devtools network tab -------------
// Make sure the variables are complete and have appropriate default values

interface QueryTemplate {
    operationName: string
    variables: any
    query: string
}

export const SamplesSearch = {
    operationName: "SamplesSearch",
    variables: {
        order: "DESC",
        sort: "relevance",
        limit: 50,
        page: 1,
        tags: [],
        tags_exclude: [],
        attributes: [],
        key: null,
        chord_type: null,
        bpm: null,
        min_bpm: null,
        max_bpm: null,
        asset_category_slug: null,
        random_seed: null,
        query: null,
        ac_uuid: null,
        legacy: true,
        filepath: null,
    },
    query: 'query SamplesSearch($asset_status_slug: AssetStatusSlug, $page: Int, $order: SortOrder = DESC, $limit: Int = 50, $sort: AssetSortType = relevance, $parent_asset_uuid: GUID, $parent_asset_type: AssetTypeSlug, $query: String, $tags: [ID!], $tags_exclude: [ID!], $attributes: [AssetAttributeSlug!], $key: String, $chord_type: String, $min_bpm: Int, $max_bpm: Int, $bpm: String, $liked: Boolean, $licensed: Boolean, $filepath: String, $asset_category_slug: AssetCategorySlug, $random_seed: String, $coso_seed: CosoSeedInput, $ac_uuid: String, $legacy: Boolean) {\n  assetsSearch(\n    filter: {legacy: $legacy, published: true, asset_type_slug: sample, asset_status_slug: $asset_status_slug, asset_category_slug: $asset_category_slug, query: $query, tag_ids: $tags, tag_ids_exclude: $tags_exclude, attributes: $attributes, key: $key, chord_type: $chord_type, min_bpm: $min_bpm, max_bpm: $max_bpm, bpm: $bpm, liked: $liked, licensed: $licensed, filepath: $filepath, ac_uuid: $ac_uuid, coso_seed: $coso_seed}\n    children: {parent_asset_uuid: $parent_asset_uuid}\n    pagination: {page: $page, limit: $limit}\n    sort: {sort: $sort, order: $order, random_seed: $random_seed}\n    legacy: {parent_asset_type: $parent_asset_type, use: $legacy}\n  ) {\n    ...assetDetails\n    __typename\n  }\n}\n\nfragment assetDetails on AssetPage {\n  ...assetPageItems\n  ...assetTagSummaries\n  ...assetDeviceSummaries\n  pagination_metadata {\n    currentPage\n    totalPages\n    __typename\n  }\n  response_metadata {\n    next\n    previous\n    records\n    __typename\n  }\n  __typename\n}\n\nfragment assetPageItems on AssetPage {\n  items {\n    ... on IAsset {\n      asset_prices {\n        amount\n        currency\n        __typename\n      }\n      uuid\n      name\n      liked\n      licensed\n      asset_type {\n        label\n        __typename\n      }\n      asset_type_slug\n      tags {\n        uuid\n        label\n        taxonomy {\n          uuid\n          name\n          __typename\n        }\n        __typename\n      }\n      files {\n        name\n        hash\n        path\n        asset_file_type_slug\n        url\n        __typename\n      }\n      __typename\n    }\n    ... on IAssetChild {\n      parents(filter: {asset_type_slug: pack}) {\n        items {\n          __typename\n          ... on PackAsset {\n            uuid\n            name\n            permalink_base_url\n            asset_type_slug\n            files {\n              path\n              asset_file_type_slug\n              url\n              __typename\n            }\n            permalink_slug\n            child_asset_counts {\n              type\n              count\n              __typename\n            }\n            main_genre\n            __typename\n          }\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on SampleAsset {\n      uuid\n      name\n      bpm\n      chord_type\n      duration\n      instrument\n      key\n      asset_category_slug\n      has_similar_sounds\n      has_coso\n      attributes\n      coso_playback_metadata {\n        psOffset\n        numBars\n        playbackBpm\n        __typename\n      }\n      __typename\n    }\n    ... on PresetAsset {\n      uuid\n      name\n      attributes\n      device {\n        name\n        uuid\n        plugin_type\n        minimum_device_version\n        __typename\n      }\n      asset_devices {\n        device {\n          name\n          uuid\n          device_type_slug\n          minimum_device_version\n          __typename\n          ... on PluginDevice {\n            plugin_type\n            __typename\n          }\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on PackAsset {\n      uuid\n      name\n      provider {\n        name\n        created_at\n        __typename\n      }\n      provider_uuid\n      uuid\n      permalink_slug\n      permalink_base_url\n      main_genre\n      __typename\n    }\n    ... on ILegacyAsset {\n      catalog_uuid\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment assetTagSummaries on AssetPage {\n  tag_summary {\n    tag {\n      uuid\n      label\n      taxonomy {\n        uuid\n        name\n        __typename\n      }\n      __typename\n    }\n    count\n    __typename\n  }\n  __typename\n}\n\nfragment assetDeviceSummaries on AssetPage {\n  device_summary {\n    device {\n      uuid\n      name\n      __typename\n    }\n    count\n    __typename\n  }\n  __typename\n}\n',
}

export const PresetsSearch = {
    operationName: "PresetsSearch",
    variables: {
        order: "DESC",
        sort: "relevance",
        limit: 50,
        page: 1,
        tags: [],
        random_seed: null,
        query: null,
        legacy: true,
    },
    query: "query PresetsSearch($page: Int, $order: SortOrder = DESC, $limit: Int = 50, $sort: AssetSortType = relevance, $random_seed: String, $tags: [ID!], $query: String, $legacy: Boolean) {\n  assetsSearch(\n    filter: {legacy: $legacy, published: true, asset_type_slug: preset, query: $query, tag_ids: $tags}\n    pagination: {page: $page, limit: $limit}\n    sort: {sort: $sort, order: $order, random_seed: $random_seed}\n  ) {\n    items {\n      ... on IAsset {\n        uuid\n        name\n        asset_type_slug\n        files {\n          name\n          hash\n          path\n          asset_file_type_slug\n          url\n          __typename\n        }\n        __typename\n      }\n      ... on PresetAsset {\n        attributes\n        device {\n          name\n          uuid\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    pagination_metadata {\n      currentPage\n      totalPages\n      __typename\n    }\n    response_metadata {\n      records\n      __typename\n    }\n    __typename\n  }\n}",
}

export const CategoryList = {
    operationName: "CategoryList",
    variables: { tagCategory: "genres" },
    query: "query CategoryList($tagCategory: String!) {\n  categories: tagCategoryList(permalink_slug: $tagCategory, v2Enabled: true) {\n    uuid\n    permalink_slug\n    name\n    categories {\n      uuid\n      name\n      permalink\n      description\n      altDescription\n      altName\n      tags {\n        uuid\n        label\n        __typename\n      }\n      subcategories {\n        uuid\n        name\n        permalink\n        description\n        altDescription\n        altName\n        tags {\n          uuid\n          label\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
}

export const GenreByPermalink = {
    operationName: "GenreByPermalink",
    variables: { permalink: "hip-hop" },
    query: "query GenreByPermalink($permalink: String!) {\n  genre: wwwGenre(permalink: $permalink) {\n    description\n    seo_description\n    name\n    permalink\n    bpm_high\n    bpm_low\n    year\n    locations\n    genres_influenced {\n      name\n      permalink\n      __typename\n    }\n    genres_influenced_by {\n      name\n      permalink\n      __typename\n    }\n    __typename\n  }\n}",
}

export const GenreOverview = {
    operationName: "GenreOverview",
    variables: { tags: [] },
    query: "query GenreOverview($tags: [ID]) {\n  samples: assetsSearch(\n    filter: {legacy: true, published: true, asset_type_slug: sample, tag_ids: $tags}\n    pagination: {page: 1, limit: 9}\n    sort: {sort: popularity, order: DESC}\n  ) {\n    ...assetPageItems\n    __typename\n  }\n  presets: assetsSearch(\n    filter: {legacy: true, published: true, asset_type_slug: preset, tag_ids: $tags}\n    pagination: {limit: 9}\n  ) {\n    ...assetPageItems\n    __typename\n  }\n  packs: assetsSearch(\n    filter: {legacy: true, published: true, asset_type_slug: pack, tag_ids: $tags}\n    pagination: {page: 1, limit: 6}\n    sort: {sort: popularity, order: DESC}\n  ) {\n    ...assetPageItems\n    __typename\n  }\n}\n\nfragment assetPageItems on AssetPage {\n  items {\n    ... on IAsset {\n      asset_type_slug\n      asset_prices {\n        amount\n        currency\n        __typename\n      }\n      uuid\n      name\n      tags {\n        uuid\n        label\n        __typename\n      }\n      files {\n        uuid\n        name\n        hash\n        path\n        asset_file_type_slug\n        url\n        __typename\n      }\n      __typename\n    }\n    ... on IAssetChild {\n      parents(filter: {asset_type_slug: pack}) {\n        items {\n          ... on PackAsset {\n            permalink_slug\n            permalink_base_url\n            uuid\n            name\n            files {\n              uuid\n              path\n              asset_file_type_slug\n              url\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on SampleAsset {\n      bpm\n      chord_type\n      key\n      duration\n      uuid\n      name\n      asset_category_slug\n      __typename\n    }\n    ... on PresetAsset {\n      uuid\n      name\n      asset_devices {\n        uuid\n        device {\n          name\n          uuid\n          minimum_device_version\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on PackAsset {\n      uuid\n      name\n      provider {\n        name\n        permalink_slug\n        __typename\n      }\n      provider_uuid\n      uuid\n      permalink_slug\n      permalink_base_url\n      main_genre\n      __typename\n    }\n    __typename\n  }\n  __typename\n}",
}

export const PacksSearch = {
    operationName: "PacksSearch",
    variables: {
        order: "DESC",
        limit: 50,
        sort: "popularity",
        tags: ["hip hop"],
        random_seed: null,
        page: 1,
    },
    query: "query PacksSearch($page: Int, $order: SortOrder = DESC, $limit: Int = 50, $sort: AssetSortType = relevance, $random_seed: String, $tags: [ID!], $query: String, $ac_uuid: String) {\n  assetsSearch(\n    filter: {legacy: true, published: true, asset_type_slug: pack, tag_ids: $tags, query: $query, ac_uuid: $ac_uuid}\n    pagination: {page: $page, limit: $limit}\n    sort: {sort: $sort, order: $order, random_seed: $random_seed}\n  ) {\n    ...assetDetails\n    __typename\n  }\n}\n\nfragment assetDetails on AssetPage {\n  ...assetPageItems\n  ...assetTagSummaries\n  pagination_metadata {\n    currentPage\n    totalPages\n    __typename\n  }\n  response_metadata {\n    records\n    __typename\n  }\n  __typename\n}\n\nfragment assetPageItems on AssetPage {\n  items {\n    ... on IAsset {\n      asset_type_slug\n      asset_prices {\n        amount\n        currency\n        __typename\n      }\n      uuid\n      name\n      tags {\n        uuid\n        label\n        __typename\n      }\n      files {\n        uuid\n        name\n        hash\n        path\n        asset_file_type_slug\n        url\n        __typename\n      }\n      __typename\n    }\n    ... on IAssetChild {\n      parents(filter: {asset_type_slug: pack}) {\n        items {\n          ... on PackAsset {\n            permalink_slug\n            permalink_base_url\n            uuid\n            name\n            files {\n              uuid\n              path\n              asset_file_type_slug\n              url\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on SampleAsset {\n      bpm\n      chord_type\n      key\n      duration\n      uuid\n      name\n      asset_category_slug\n      __typename\n    }\n    ... on PresetAsset {\n      uuid\n      name\n      asset_devices {\n        uuid\n        device {\n          name\n          uuid\n          minimum_device_version\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on PackAsset {\n      uuid\n      name\n      provider {\n        name\n        permalink_slug\n        __typename\n      }\n      provider_uuid\n      uuid\n      permalink_slug\n      permalink_base_url\n      main_genre\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment assetTagSummaries on AssetPage {\n  tag_summary {\n    count\n    tag {\n      uuid\n      label\n      taxonomy {\n        uuid\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}",
}

export const PacksByPermalink = {
    operationName: "PackByPermalink",
    variables: { permalink: "oliver-vol-3" },
    query: "query PackByPermalink($permalink: String!) {\n  pack: packAsset(permalink: $permalink) {\n    uuid\n    name\n    main_genre\n    description\n    permalink_slug\n    permalink_base_url\n    provider {\n      uuid\n      name\n      permalink_slug\n      __typename\n    }\n    files {\n      uuid\n      asset_file_type_slug\n      url\n      path\n      __typename\n    }\n    child_asset_counts {\n      type\n      count\n      __typename\n    }\n    companion_packs {\n      uuid\n      description\n      permalink_slug\n      files {\n        uuid\n        asset_file_type_slug\n        url\n        path\n        __typename\n      }\n      main_genre\n      provider {\n        uuid\n        name\n        permalink_slug\n        __typename\n      }\n      main_genre\n      name\n      __typename\n    }\n    story {\n      uuid\n      background_url\n      description\n      title\n      videos {\n        background_url\n        url\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
}

export const SoundsSearchAutocomplete = {
    operationName: "SoundsSearchAutocomplete",
    variables: { term: "" },
    query: 'query SoundsSearchAutocomplete($term: String!) {\n  soundsSearchSuggestions(searchTerm: $term, limit: 7, context: "marketplace") {\n    autocompleteUuid\n    results {\n      autocompleteTerm\n      termType\n      length\n      offset\n      __typename\n    }\n    __typename\n  }\n}',
}

// ---------------------------------------------------------------

// Splice's GraphQL endpoint only accepts requests from splice.com (CORS + Cloudflare),
// so the request is relayed through the hidden splice.com webview in the Rust backend.
function spliceSearch(body: string): Promise<string> {
    const id = crypto.randomUUID()

    return new Promise<string>((resolve, reject) => {
        let unlisten: (() => void) | null = null

        // The helper may still be loading splice.com and drops events it isn't listening for yet.
        const reEmit = setInterval(() => {
            emit("splice-search", { id, body })
        }, 1500)

        const settle = () => {
            clearInterval(reEmit)
            clearTimeout(timer)
            unlisten?.()
        }

        const timer = setTimeout(() => {
            settle()
            reject(new Error("Splice search timed out (the helper webview may still be clearing Cloudflare)."))
        }, 20000)

        listen<{ id: string; ok: boolean; body?: string; error?: string }>("splice-result", (ev) => {
            if (ev.payload.id !== id) return
            settle()
            if (ev.payload.ok && ev.payload.body != null) {
                resolve(ev.payload.body)
            } else {
                reject(new Error(ev.payload.error ?? "Splice search failed"))
            }
        }).then((fn) => {
            unlisten = fn
            emit("splice-search", { id, body })
        })
    })
}

export async function querySplice(
    template: QueryTemplate,
    variables: typeof template.variables = {}
) {
    const body = { ...template }
    Object.assign(body.variables, variables)
    const startTime = Date.now()
    console.log("💌 Requesting", body)
    const json = JSON.parse(await spliceSearch(JSON.stringify(body)))
    console.log("📬 Received", json, "after", Date.now() - startTime, "ms")
    return json
}
