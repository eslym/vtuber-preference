<script lang="ts">
    import type { Slot, SlotLayer } from "./types";
    import ColorPicker from "svelte-awesome-color-picker";
    import PickerInput from "./PickerInput.svelte";

    export let slot: Slot;
    export let selectedLayer: number | undefined;
    export let selectedSlot: number;

    let input: HTMLInputElement;
    let form: HTMLFormElement;

    function addImage() {
        let file = input.files[0];
        let reader = new FileReader();
        reader.onload = () => {
            let image = new Image();
            image.onload = () => {
                let rect = { width: image.width, height: image.height };
                if (image.width > image.height) {
                    if (image.width > 512) {
                        let rate = image.width / 512;
                        rect.width /= rate;
                        rect.height /= rate;
                    }
                } else if (image.height > 512) {
                    let rate = image.height / 512;
                    rect.width /= rate;
                    rect.height /= rate;
                }
                let img: SlotLayer = {
                    name: file.name,
                    image: image,
                    pos: {
                        x: 56 - rect.width / 2,
                        y: 80 - rect.height / 2,
                    },
                    rect,
                };
                selectedLayer = 0;
                slot.layers = [img, ...slot.layers];
            };
            image.src = reader.result as string;
        };
        reader.readAsDataURL(file);
        form.reset();
    }

    let dragging: false | number = false;

    function dragStart(event: DragEvent, index: number) {
        dragging = index;
        let div = (event.target as HTMLDivElement).parentElement;
        event.dataTransfer.dropEffect = "move";
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", slot.layers[index].name);
        event.dataTransfer.setDragImage(
            div,
            div.clientWidth / 2,
            div.clientHeight / 2
        );
    }

    function dragOver(event: DragEvent, index: number) {
        if (dragging === false) return;
        event.preventDefault();
        let data = slot.layers[dragging];
        let swap = slot.layers[index];
        slot.layers[index] = data;
        slot.layers[dragging] = swap;
        dragging = index;
        event.dataTransfer.dropEffect = "move";
        selectedLayer = index;
    }
</script>

<div class="flex h-full w-full flex-col bg-gray-100">
    <div
        class="flex flex-row items-center bg-slate-600 text-xl font-bold text-white"
    >
        <button
            class="p-2"
            on:click={() => {
                selectedSlot = (15 + selectedSlot - 1) % 15;
                selectedLayer = undefined;
            }}>＜</button
        >
        {#if slot.dynamic === undefined}
            <div class="w-0 flex-grow px-4 py-2">{slot.name}</div>
        {:else}
            <div class="py-2 pl-4">{slot.name}</div>
            <input
                bind:value={slot.dynamic}
                class="w-0 flex-grow bg-transparent py-2 pr-4 font-normal text-slate-200 underline-offset-4 placeholder:text-slate-400 placeholder:underline focus:outline-none"
                placeholder="(自行输入)　　　　　　　　　　　　　　　　　　　　"
            />
        {/if}
        <button
            class="p-2"
            on:click={() => {
                selectedSlot = (selectedSlot + 1) % 15;
                selectedLayer = undefined;
            }}>＞</button
        >
    </div>
    <div>
        <ColorPicker
            bind:hex={slot.background}
            isAlpha={false}
            label="背景色"
            components={{ input: PickerInput }}
        />
    </div>
    <div class="flex h-0 flex-grow flex-col gap-2 p-4">
        <form class="hidden" bind:this={form}>
            <input
                type="file"
                accept=".jpg,.jpeg,.png,.bmp,.webp"
                bind:this={input}
                on:change={addImage}
            />
        </form>
        {#each slot.layers as layer, index (layer.image)}
            <div
                class="flex select-none flex-row items-center gap-4"
                class:bg-slate-300={selectedLayer === index}
                on:mousedown={() => (selectedLayer = index)}
                on:dragover={(event) => dragOver(event, index)}
            >
                <div
                    on:dragstart={(event) => dragStart(event, index)}
                    on:dragend={() => {
                        dragging = false;
                    }}
                    class="flex w-0 flex-grow items-center gap-2 overflow-hidden"
                    draggable="true"
                >
                    <img
                        draggable="false"
                        alt={layer.name}
                        src={layer.image.src}
                        class="h-10 w-10 object-cover"
                    />
                    <div
                        class="w-0 flex-grow overflow-hidden whitespace-nowrap"
                    >
                        {layer.name}
                    </div>
                </div>
                <button
                    class="h-10 w-10 bg-slate-500 font-bold text-white"
                    on:click={() => {
                        slot.layers = slot.layers.filter((l) => l !== layer);
                        selectedLayer =
                            selectedLayer > index
                                ? selectedLayer - 1
                                : selectedLayer < index
                                ? selectedLayer
                                : undefined;
                    }}>Ｘ</button
                >
            </div>
        {/each}
        <button
            class="block p-0.5 hover:bg-gray-300 active:bg-gray-200"
            on:click|stopPropagation={() => input.click()}>添加圖片</button
        >
    </div>
</div>
