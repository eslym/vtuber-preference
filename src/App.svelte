<script lang="ts">
    import Resizer from "./lib/Resizer.svelte";
    import templateUrl from "./assets/template.png";
    import enTemplateUrl from "./assets/en-template.png";
    import maskUrl from "./assets/mask.png";
    import textBgUrl from "./assets/text-field-bg.png";
    import type { Slot } from "./lib/types";
    import ImageList from "./lib/ImageList.svelte";
    import { Application, Loader, Sprite, Container } from "svelte-pixi";
    import * as PIXI from "pixi.js";
    import CachedResizeSprite from "./lib/CachedResizeSprite.svelte";
    import { tick } from "svelte";
    import CacheSlot from "./lib/CacheSlot.svelte";
    import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
    import FontObserver from "./lib/FontObserver.svelte";
    import SizedText from "./lib/SizedText.svelte";
    import { _ } from "./lib/lang";

    let slotMasks = [];
    let previewMasks = [];

    let slots: Slot[] = [
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 48, y: 48 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 166, y: 48 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 283, y: 48 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 401, y: 48 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 519, y: 48 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 48, y: 248 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 166, y: 248 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#ff0000",
            pos: { x: 283, y: 248 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 401, y: 248 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 519, y: 248 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 48, y: 448 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 166, y: 448 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 283, y: 448 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 401, y: 448 },
            layers: [],
        },
        {
            background: "#ffffff",
            color: "#000000",
            pos: { x: 519, y: 448 },
            layers: [],
        },
    ];

    const white = PIXI.utils.string2hex("#ffffff");

    let selectedSlot: number | undefined = undefined;
    let selectedLayer: number | undefined = undefined;

    let pixiApp: PIXI.Application;

    function makeMask() {
        if (!previewMasks[selectedSlot]) {
            let slot = slots[selectedSlot];
            let mask = new PIXI.Container();
            let bg = mask.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
            bg.width = 680;
            bg.height = 680;
            let s = mask.addChild(new PIXI.Sprite(PIXI.Texture.from(maskUrl)));
            s.filters = [new ColorOverlayFilter(0)];
            s.x = slot.pos.x - 2;
            s.y = slot.pos.y - 2;
            previewMasks[selectedSlot] = new PIXI.Sprite(
                pixiApp.renderer.generateTexture(mask)
            );
        }
        return previewMasks[selectedSlot];
    }

    $: previewMask = pixiApp && selectedSlot !== undefined ? makeMask() : null;

    async function exportImage() {
        selectedLayer = undefined;
        await tick();
        let extract = new PIXI.Extract(pixiApp.renderer as PIXI.Renderer);
        let base64 = extract.base64(pixiApp.stage, "image/jpeg");
        let a = document.createElement("a");
        a.download = "output.jpg";
        a.href = base64;
        a.click();
    }
</script>

<svelte:head>
    <title>{$_("title")}</title>
</svelte:head>

<div
    class="flex h-screen w-screen flex-row bg-opacity-90"
    class:bg-black={selectedSlot !== undefined && selectedLayer !== undefined}
>
    <div
        class="flex flex-grow flex-row items-center justify-center overflow-hidden shadow-lg"
    >
        <div class="template">
            <Application
                width={680}
                height={680}
                backgroundColor={white}
                bind:instance={pixiApp}
                antialias={true}
                resolution={1}
                render={"demand"}
            >
                <Loader
                    resources={[templateUrl, enTemplateUrl, maskUrl, textBgUrl]}
                >
                    <FontObserver
                        fonts={["Noto Sans TC", "Noto Sans SC", "Noto Sans JP"]}
                    >
                        <Container sortableChildren={true}>
                            <Sprite
                                texture={PIXI.Texture.WHITE}
                                width={680}
                                height={680}
                                zIndex={0}
                            />
                            {#each slots as slot, index (slot)}
                                <Container
                                    mask={slotMasks[index]}
                                    {...slot.pos}
                                    zIndex={1}
                                >
                                    <Sprite
                                        texture={PIXI.Texture.from(maskUrl)}
                                        x={-2}
                                        y={-2}
                                        bind:instance={slotMasks[index]}
                                    />
                                    <Sprite
                                        texture={PIXI.Texture.WHITE}
                                        filters={[
                                            new ColorOverlayFilter(
                                                PIXI.utils.string2hex(
                                                    slot.background
                                                )
                                            ),
                                        ]}
                                        width={117}
                                        height={166}
                                    />
                                    <CacheSlot
                                        renderSlot={slot}
                                        selectedLayer={selectedSlot === index
                                            ? selectedLayer
                                            : undefined}
                                    />
                                </Container>
                            {/each}
                            <Sprite
                                texture={PIXI.Texture.from(
                                    $_.lang === "zh-TW"
                                        ? templateUrl
                                        : enTemplateUrl
                                )}
                                width={680}
                                height={680}
                                zIndex={2}
                            />
                            {#each slots as slot}
                                {#if slot.name?.length}
                                    <Container
                                        x={slot.pos.x + 1}
                                        y={slot.pos.y + 167}
                                        zIndex={3}
                                    >
                                        <Sprite
                                            texture={PIXI.Texture.from(
                                                textBgUrl
                                            )}
                                        />
                                        <SizedText
                                            text={slot.name.trim()}
                                            style={{
                                                fill: PIXI.utils.string2hex(
                                                    slot.color
                                                ),
                                                breakWords: true,
                                                fontFamily: [
                                                    "Noto Sans TC",
                                                    "Noto Sans SC",
                                                    "Noto Sans JP",
                                                    "sans-serif",
                                                ],
                                                fontSize: 15,
                                                fontWeight: "bold",
                                                align: "center",
                                                textBaseline: "alphabetic",
                                            }}
                                            anchor={0.5}
                                            x={56}
                                            y={14}
                                            maxWidth={108}
                                            maxHeight={26}
                                        />
                                    </Container>
                                {/if}
                            {/each}
                            <Container
                                mask={previewMask}
                                alpha={0.8}
                                zIndex={4}
                            >
                                {#if selectedSlot !== undefined && selectedLayer !== undefined}
                                    {@const slot = slots[selectedSlot]}
                                    {@const image = slot.layers[selectedLayer]}
                                    <Sprite
                                        texture={PIXI.Texture.WHITE}
                                        width={680}
                                        height={680}
                                        filters={[new ColorOverlayFilter(0)]}
                                    />
                                    <CachedResizeSprite
                                        texture={new PIXI.Texture(
                                            new PIXI.BaseTexture(image.image)
                                        )}
                                        alpha={0.75}
                                        x={slot.pos.x + image.pos.x}
                                        y={slot.pos.y + image.pos.y}
                                        {...image.rect}
                                    />
                                {/if}
                            </Container>
                        </Container>
                    </FontObserver>
                </Loader>
            </Application>
            {#each slots as slot, index}
                <div
                    class="slot"
                    class:outline={selectedSlot === index}
                    style="left: {slot.pos.x}px; top: {slot.pos.y}px;"
                >
                    {#if selectedSlot !== index}
                        <button
                            class="block h-full w-full"
                            on:click={() => {
                                selectedSlot = index;
                                selectedLayer = undefined;
                            }}
                        />
                    {:else}
                        {#each [...slot.layers].reverse() as image, index (image.image)}
                            <div
                                class="absolute z-10"
                                on:mousedown={() =>
                                    (selectedLayer =
                                        slot.layers.length - index - 1)}
                                style="top:{image.pos.y}px;left:{image.pos
                                    .x}px;width:{image.rect
                                    .width}px;height:{image.rect.height}px"
                            />
                        {/each}
                        {#if selectedLayer !== undefined}
                            <Resizer
                                bind:x={slots[selectedSlot].layers[
                                    selectedLayer
                                ].pos.x}
                                bind:y={slots[selectedSlot].layers[
                                    selectedLayer
                                ].pos.y}
                                bind:width={slots[selectedSlot].layers[
                                    selectedLayer
                                ].rect.width}
                                bind:height={slots[selectedSlot].layers[
                                    selectedLayer
                                ].rect.height}
                                ratio={slots[selectedSlot].layers[selectedLayer]
                                    .image.width /
                                    slots[selectedSlot].layers[selectedLayer]
                                        .image.height}
                            />
                        {/if}
                    {/if}
                </div>
            {/each}
        </div>
    </div>
    <div
        class="flex h-full w-80 flex-col overflow-auto border-slate-200 bg-white shadow"
    >
        <button
            class="bg-indigo-600 p-2 text-center text-lg font-bold text-white"
            on:click={exportImage}>{$_("label.export")}</button
        >
        <div class="h-0 flex-grow">
            {#if selectedSlot !== undefined}
                <ImageList
                    bind:slot={slots[selectedSlot]}
                    bind:selectedLayer
                    bind:selectedSlot
                />
            {/if}
        </div>
        <div class="py-2 text-center text-sm italic">
            <p class="font-bold not-italic">
                {$_("label.language")}
                <select bind:value={$_.lang} class="bg-white">
                    <option value="zh-TW">中文</option>
                    <option value="en">English</option>
                </select>
            </p>
            <p class="mt-2">
                {$_("label.credit")}<a
                    class="text-blue-700"
                    target="_blank"
                    rel="noreferrer"
                    href="https://twitter.com/EastAiruier/status/1624174786359496704"
                    >@EastAiruier</a
                >
            </p>
            <p class="mt-2">
                {$_("label.translate")}<a
                    class="text-blue-700"
                    target="_blank"
                    rel="noreferrer"
                    href="https://twitter.com/Ichiroku16_Vt/status/1628215427733266432"
                    >@Ichiroku16_Vt</a
                >
            </p>
            <p class="mt-2">
                {$_("label.code")}<a
                    href="https://github.com/eslym/vtuber-preference"
                    class="text-blue-700"
                    target="_blank"
                    rel="noreferrer">eslym/vtuber-preference</a
                >
            </p>
        </div>
    </div>
</div>

<style lang="postcss">
    .template {
        @apply relative select-none shadow;
        width: 680px;
        height: 680px;
    }
    .slot {
        @apply absolute rounded-2xl outline-4 outline-offset-0 outline-blue-600;
        width: 113px;
        height: 195px;
    }
</style>
