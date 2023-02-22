<script lang="ts">
    import Resizer from "./lib/Resizer.svelte";
    import templateUrl from "./assets/template.png";
    import bgUrl from "./assets/white-bg.jpg";
    import maskUrl from "./assets/mask.png";
    import type { Slot } from "./lib/types";
    import ImageList from "./lib/ImageList.svelte";
    import { Application, Loader, Sprite, Container, Text } from "svelte-pixi";
    import * as PIXI from "pixi.js";
    import CachedResizeSprite from "./lib/CachedResizeSprite.svelte";
    import { tick } from "svelte";
    import CacheSlot from "./lib/CacheSlot.svelte";

    let slotMasks = [];
    let previewMasks = [];

    let slots: Slot[] = [
        {
            name: "第一個看的",
            pos: { x: 48, y: 48 },
            layers: [],
        },
        {
            name: "最常看的",
            pos: { x: 166, y: 48 },
            layers: [],
        },
        {
            name: "最佳節目",
            pos: { x: 283, y: 48 },
            layers: [],
        },
        {
            name: "最瘋狂的",
            pos: { x: 401, y: 48 },
            layers: [],
        },
        {
            name: "最療愈的",
            pos: { x: 519, y: 48 },
            layers: [],
        },
        {
            name: "聲音最好聽的",
            pos: { x: 48, y: 248 },
            layers: [],
        },
        {
            name: "唱歌最好聽的",
            pos: { x: 166, y: 248 },
            layers: [],
        },
        {
            name: "最喜歡的",
            pos: { x: 283, y: 248 },
            layers: [],
        },
        {
            name: "影響最深遠的",
            pos: { x: 401, y: 248 },
            layers: [],
        },
        {
            name: "最漂亮的",
            pos: { x: 519, y: 248 },
            layers: [],
        },
        {
            name: "最想犯罪的",
            pos: { x: 48, y: 448 },
            layers: [],
        },
        {
            name: "最帥的",
            pos: { x: 166, y: 448 },
            layers: [],
        },
        {
            name: "最想推廣的",
            pos: { x: 283, y: 448 },
            layers: [],
        },
        {
            name: "最婆的",
            pos: { x: 401, y: 448 },
            layers: [],
        },
        {
            name: "最",
            pos: { x: 519, y: 448 },
            dynamic: "",
            layers: [],
        },
    ];

    const white = PIXI.utils.string2hex("#ffffff");

    let selectedSlot: number | undefined = undefined;
    let selectedLayer: number | undefined = undefined;

    let pixiApp: PIXI.Application;

    let invert = new PIXI.filters.ColorMatrixFilter();
    invert.negative(true);

    function makeMask() {
        if (!previewMasks[selectedSlot]) {
            let slot = slots[selectedSlot];
            let mask = new PIXI.Container();
            mask.addChild(new PIXI.Sprite(PIXI.Texture.from(bgUrl)));
            let s = mask.addChild(new PIXI.Sprite(PIXI.Texture.from(maskUrl)));
            s.filters = [invert];
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
        selectedSlot = undefined;
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

<div class="flex h-screen w-screen flex-col items-center justify-center gap-4">
    <div class="flex flex-row shadow-lg">
        <div class="template">
            <Application
                width={680}
                height={680}
                backgroundColor={white}
                bind:instance={pixiApp}
                antialias={true}
                render={"demand"}
            >
                <Loader resources={[templateUrl, bgUrl, maskUrl]}>
                    <Sprite texture={PIXI.Texture.from(bgUrl)} />
                    {#each slots as slot, index (slot.name)}
                        <Container mask={slotMasks[index]} {...slot.pos}>
                            <Sprite
                                texture={PIXI.Texture.from(maskUrl)}
                                x={-2}
                                y={-2}
                                bind:instance={slotMasks[index]}
                            />
                            <CacheSlot
                                appSlot={slot}
                                selectedLayer={selectedSlot === index
                                    ? selectedLayer
                                    : undefined}
                            />
                        </Container>
                    {/each}
                    <Sprite
                        texture={PIXI.Texture.from(templateUrl)}
                        width={680}
                        height={680}
                    />
                    {#each slots as slot}
                        {#if slot.dynamic}
                            <Container {...slot.pos}>
                                <Text
                                    text={slot.dynamic}
                                    x={34}
                                    y={169}
                                    style={{
                                        fill: 0,
                                        fontFamily: [
                                            "Noto Sans TC",
                                            "Noto Sans SC",
                                            "Noto Sans JP",
                                            "sans-serif",
                                        ],
                                        fontSize: 16,
                                        fontWeight: "600",
                                        align: "center",
                                        textBaseline: "alphabetic",
                                    }}
                                />
                            </Container>
                        {/if}
                    {/each}
                    <Container mask={previewMask} alpha={0.75}>
                        {#if selectedSlot !== undefined && selectedLayer !== undefined}
                            {@const slot = slots[selectedSlot]}
                            {@const image = slot.layers[selectedLayer]}
                            <Sprite texture={PIXI.Texture.from(bgUrl)} />
                            <CachedResizeSprite
                                texture={new PIXI.Texture(
                                    new PIXI.BaseTexture(image.image)
                                )}
                                x={slot.pos.x + image.pos.x}
                                y={slot.pos.y + image.pos.y}
                                {...image.rect}
                            />
                        {/if}
                    </Container>
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
        <div class="flex w-80 flex-col overflow-auto bg-white">
            <div class="h-0 flex-grow">
                {#if selectedSlot !== undefined}
                    <ImageList
                        bind:slot={slots[selectedSlot]}
                        bind:selectedLayer
                        bind:selectedSlot
                    />
                {/if}
            </div>
            <button
                class="bg-slate-400 p-2 text-center text-lg font-bold text-white"
                on:click={exportImage}>保存</button
            >
        </div>
    </div>
    <div class="text-center text-sm italic">
        <p>
            Credit: <a
                class="text-blue-700"
                target="_blank"
                rel="noreferrer"
                href="https://twitter.com/EastAiruier/status/1624174786359496704"
                >@EastAiruier</a
            >
        </p>
        <p class="mt-2">
            代碼: <a
                href="https://github.com/eslym/vtuber-preference"
                class="text-blue-700"
                target="_blank"
                rel="noreferrer">eslym/vtuber-preference</a
            >
        </p>
    </div>
</div>

<style lang="postcss">
    .template {
        @apply relative select-none;
        width: 680px;
        height: 680px;
    }
    .slot {
        @apply absolute rounded-2xl outline-4 outline-offset-0 outline-blue-600;
        width: 113px;
        height: 195px;
    }
</style>
