<script lang="ts">
    import Resizer from "./lib/Resizer.svelte";
    import templateUrl from "./assets/template.jpg";
    import maskUrl from "./assets/mask.png";
    import type { Slot } from "./lib/types";
    import ImageList from "./lib/ImageList.svelte";
    import { onDestroy, onMount } from "svelte";

    let templateImage: HTMLImageElement;
    let maskImage: HTMLImageElement;

    let canvas: HTMLCanvasElement;

    let saveImage: string | undefined = undefined;

    let dirty = true;

    $: if (slots) dirty = true;

    let slots: Slot[] = [
        {
            name: "第一個看的",
            position: { x: 49, y: 49 },
            images: [],
        },
        {
            name: "最常看的",
            position: { x: 167, y: 49 },
            images: [],
        },
        {
            name: "最佳節目",
            position: { x: 284, y: 49 },
            images: [],
        },
        {
            name: "最瘋狂的",
            position: { x: 402, y: 49 },
            images: [],
        },
        {
            name: "最療愈的",
            position: { x: 520, y: 49 },
            images: [],
        },
        {
            name: "聲音最好聽的",
            position: { x: 49, y: 249 },
            images: [],
        },
        {
            name: "唱歌最好聽的",
            position: { x: 167, y: 249 },
            images: [],
        },
        {
            name: "最喜歡的",
            position: { x: 284, y: 249 },
            images: [],
        },
        {
            name: "影響最深遠的",
            position: { x: 402, y: 249 },
            images: [],
        },
        {
            name: "最漂亮的",
            position: { x: 520, y: 249 },
            images: [],
        },
        {
            name: "最想犯罪的",
            position: { x: 49, y: 449 },
            images: [],
        },
        {
            name: "最帥的",
            position: { x: 167, y: 449 },
            images: [],
        },
        {
            name: "最想推廣的",
            position: { x: 284, y: 449 },
            images: [],
        },
        {
            name: "最婆的",
            position: { x: 402, y: 449 },
            images: [],
        },
        {
            name: "最",
            position: { x: 520, y: 449 },
            dynamic: "",
            images: [],
        },
    ];

    let selectedSlot: number | undefined = undefined;
    let selectedImage: number | undefined = undefined;
    let drawing = false;

    function wait() {
        return new Promise((res) => setTimeout(res));
    }

    async function draw(slots: Slot[]) {
        drawing = true;
        dirty = false;
        let tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        let ctx = tempCanvas.getContext("2d");
        ctx.drawImage(templateImage, 0, 0);
        for (let slot of slots) {
            if (slot.dynamic !== undefined) {
                ctx.textAlign = "left";
                ctx.textBaseline = "alphabetic";
                ctx.fillStyle = "black";
                ctx.font =
                    '14px "Noto Sans TC", "Noto Sans SC", "Noto Sans JP", sans-serif';
                let x = slot.position.x + 32;
                let y = slot.position.y + 184;
                ctx.fillText(slot.dynamic, x, y);
            }
            let slotCanvas = document.createElement("canvas");
            slotCanvas.width = maskImage.width;
            slotCanvas.height = maskImage.height;
            let slotCtx = slotCanvas.getContext("2d");
            for (let image of slot.images) {
                slotCtx.drawImage(
                    image.image,
                    image.position.x,
                    image.position.y,
                    image.position.width,
                    image.position.height
                );
                await wait();
            }
            let maskCanvas = document.createElement("canvas");
            maskCanvas.width = maskImage.width;
            maskCanvas.height = maskImage.height;
            let maskCtx = maskCanvas.getContext("2d");
            maskCtx.drawImage(maskImage, 0, 0);
            await wait();
            maskCtx.globalCompositeOperation = "source-in";
            maskCtx.drawImage(slotCanvas, 0, 0);
            ctx.drawImage(maskCanvas, slot.position.x, slot.position.y);
            await wait();
        }
        canvas.getContext("2d").drawImage(tempCanvas, 0, 0);
        saveImage = canvas.toDataURL("image/jpeg");
        drawing = false;
    }

    let internal: NodeJS.Timer = undefined;

    onMount(() => {
        internal = setInterval(() => {
            if (dirty && !drawing) draw(slots);
        }, 50);
    });

    onDestroy(() => {
        clearInterval(internal);
    });
</script>

<img
    class="hidden"
    src={templateUrl}
    alt=""
    on:load={() => draw(slots)}
    bind:this={templateImage}
/>
<img
    class="hidden"
    src={maskUrl}
    alt=""
    on:load={() => draw(slots)}
    bind:this={maskImage}
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
                    style="left: {slot.position.x}px; top: {slot.position.y}px;"
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
                        {#each slot.images as image, index (image.image)}
                            <div
                                class="absolute z-10"
                                on:mousedown={() => (selectedImage = index)}
                                style="top:{image.position.y}px;left:{image
                                    .position.x}px;width:{image.position
                                    .width}px;height:{image.position.height}px"
                            />
                        {/each}
                        {#if selectedImage !== undefined}
                            <Resizer
                                bind:x={slots[selectedSlot].images[
                                    selectedImage
                                ].position.x}
                                bind:y={slots[selectedSlot].images[
                                    selectedImage
                                ].position.y}
                                bind:width={slots[selectedSlot].images[
                                    selectedImage
                                ].position.width}
                                bind:height={slots[selectedSlot].images[
                                    selectedImage
                                ].position.height}
                                ratio={slots[selectedSlot].images[selectedImage]
                                    .width /
                                    slots[selectedSlot].images[selectedImage]
                                        .height}
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
    <div>
        Credit: <a
            class="text-blue-700"
            target="_blank"
            rel="noreferrer"
            href="https://twitter.com/EastAiruier/status/1624174786359496704"
            >@EastAiruier</a
        >
    </div>
</div>

<style lang="postcss">
    .template {
        @apply relative select-none;
        width: 680px;
        height: 680px;
    }
    .slot {
        @apply absolute rounded-2xl outline-4 outline-offset-1 outline-blue-600;
        width: 112px;
        height: 194px;
    }
</style>
