<script lang="ts" context="module">
    function resize(image: CanvasImageSource, width: number, height: number) {
        let resizeCanvas = document.createElement("canvas");
        resizeCanvas.width = width;
        resizeCanvas.height = height;
        resizeCanvas.getContext("2d").drawImage(image, 0, 0, width, height);
        return resizeCanvas;
    }

    const maskPath = new Path2D(
        "M18 9.55385e-06C6 -0.00873929 0 5.99126 0 18C0 30.0088 0 63.0088 0 117L78 162L114 162L114 18C114 6.00001 108 9.55385e-06 96 9.55385e-06C78 9.55385e-06 77.7324 0.348435 18 9.55385e-06Z"
    );

    const cachedImage = new WeakMap<
        HTMLImageElement,
        { image: HTMLCanvasElement; rect: Rect }
    >();
    const cachedSlot = new Map<string, HTMLCanvasElement>();
</script>

<script lang="ts">
    import Resizer from "./lib/Resizer.svelte";
    import templateUrl from "./assets/template.png";
    import type { Rect, Slot } from "./lib/types";
    import ImageList from "./lib/ImageList.svelte";
    import { onDestroy, onMount } from "svelte";

    let templateImage: HTMLImageElement;

    let canvas: HTMLCanvasElement;

    let saveImage: string | undefined = undefined;

    let dirty = true;
    let drawing = false;

    $: if (slots) dirty = true;

    let slots: Slot[] = [
        {
            name: "第一個看的",
            pos: { x: 48, y: 48 },
            images: [],
        },
        {
            name: "最常看的",
            pos: { x: 166, y: 48 },
            images: [],
        },
        {
            name: "最佳節目",
            pos: { x: 283, y: 48 },
            images: [],
        },
        {
            name: "最瘋狂的",
            pos: { x: 401, y: 48 },
            images: [],
        },
        {
            name: "最療愈的",
            pos: { x: 519, y: 48 },
            images: [],
        },
        {
            name: "聲音最好聽的",
            pos: { x: 48, y: 248 },
            images: [],
        },
        {
            name: "唱歌最好聽的",
            pos: { x: 166, y: 248 },
            images: [],
        },
        {
            name: "最喜歡的",
            pos: { x: 283, y: 248 },
            images: [],
        },
        {
            name: "影響最深遠的",
            pos: { x: 401, y: 248 },
            images: [],
        },
        {
            name: "最漂亮的",
            pos: { x: 519, y: 248 },
            images: [],
        },
        {
            name: "最想犯罪的",
            pos: { x: 48, y: 448 },
            images: [],
        },
        {
            name: "最帥的",
            pos: { x: 166, y: 448 },
            images: [],
        },
        {
            name: "最想推廣的",
            pos: { x: 283, y: 448 },
            images: [],
        },
        {
            name: "最婆的",
            pos: { x: 401, y: 448 },
            images: [],
        },
        {
            name: "最",
            pos: { x: 519, y: 448 },
            dynamic: "",
            images: [],
        },
    ];

    let selectedSlot: number | undefined = undefined;
    let selectedImage: number | undefined = undefined;

    function wait(): Promise<void> {
        return new Promise((res) => setTimeout(res));
    }

    async function draw(slots: Slot[]) {
        if (drawing || !dirty) return;
        dirty = false;
        drawing = true;
        let tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        let ctx = tempCanvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 680, 680);
        for (let slot of slots) {
            if (!slot.images.length) continue;
            ctx.resetTransform();
            ctx.translate(slot.pos.x, slot.pos.y);
            if (slot.dirty || !cachedSlot.has(slot.name)) {
                let slotCanvas = document.createElement("canvas");
                slotCanvas.width = 114;
                slotCanvas.height = 162;
                let slotCtx = slotCanvas.getContext("2d");
                slotCtx.clip(maskPath);
                for (let image of [...slot.images].reverse()) {
                    let cached = cachedImage.get(image.image);
                    if (
                        !cached ||
                        cached.rect.width !== image.rect.width ||
                        cached.rect.height !== image.rect.height
                    ) {
                        let temp = resize(
                            image.image,
                            (image.image.width + image.rect.width) / 2,
                            (image.image.height + image.rect.height) / 2
                        );
                        await wait();
                        cachedImage.set(
                            image.image,
                            (cached = {
                                image: resize(
                                    temp,
                                    image.rect.width,
                                    image.rect.height
                                ),
                                rect: { ...image.rect },
                            })
                        );
                    }
                    slotCtx.drawImage(cached.image, image.pos.x, image.pos.y);
                    await wait();
                }
                cachedSlot.set(slot.name, slotCanvas);
                slot.dirty = false;
            }
            ctx.drawImage(cachedSlot.get(slot.name), 0, 0);
            await wait();
        }
        ctx.resetTransform();
        ctx.drawImage(templateImage, 0, 0);
        for (let slot of slots) {
            if (!slot.dynamic) continue;
            ctx.resetTransform();
            ctx.translate(slot.pos.x, slot.pos.y);
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "black";
            ctx.font =
                '14px "Noto Sans TC", "Noto Sans SC", "Noto Sans JP", sans-serif';
            let testWidth = ctx.measureText(slot.dynamic).width;
            let x = 66;
            if (testWidth > 64) {
                ctx.textAlign = "left";
                x = 34;
            }
            ctx.fillText(slot.dynamic, x, 184);
        }
        canvas.getContext("2d").drawImage(tempCanvas, 0, 0);
        saveImage = canvas.toDataURL("image/jpeg");
        drawing = false;
    }

    let interval: NodeJS.Timer;

    onMount(() => {
        interval = setInterval(() => draw(slots), 10);
    });

    onDestroy(() => {
        clearInterval(interval);
    });
</script>

<img
    class="hidden"
    src={templateUrl}
    alt=""
    on:load={() => draw(slots)}
    bind:this={templateImage}
/>

<div class="flex h-screen w-screen flex-col items-center justify-center gap-4">
    <div class="flex flex-row shadow-lg">
        <div class="template select-none">
            <canvas
                class="absolute"
                bind:this={canvas}
                width="680"
                height="680"
            />
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
                                selectedImage = undefined;
                            }}
                        />
                    {:else}
                        {#each [...slot.images].reverse() as image, index (image.image)}
                            <div
                                class="absolute z-10"
                                on:mousedown={() =>
                                    (selectedImage =
                                        slot.images.length - index - 1)}
                                style="top:{image.pos.y}px;left:{image.pos
                                    .x}px;width:{image.rect
                                    .width}px;height:{image.rect.height}px"
                            />
                        {/each}
                        {#if selectedImage !== undefined}
                            <Resizer
                                bind:x={slots[selectedSlot].images[
                                    selectedImage
                                ].pos.x}
                                bind:y={slots[selectedSlot].images[
                                    selectedImage
                                ].pos.y}
                                bind:width={slots[selectedSlot].images[
                                    selectedImage
                                ].rect.width}
                                bind:height={slots[selectedSlot].images[
                                    selectedImage
                                ].rect.height}
                                ratio={slots[selectedSlot].images[selectedImage]
                                    .image.width /
                                    slots[selectedSlot].images[selectedImage]
                                        .image.height}
                                on:update={() => {
                                    slots[selectedSlot].dirty = true;
                                }}
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
                        bind:selectedImage
                        bind:selectedSlot
                    />
                {/if}
            </div>
            <a
                href={saveImage}
                download="output.jpg"
                target="_blank"
                rel="noreferrer"
                class="bg-slate-400 p-2 text-center text-lg font-bold text-white"
                >保存</a
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
