<script lang="ts">
    export let x: number;
    export let y: number;
    export let width: number;
    export let height: number;

    export let ratio = width / height;

    let dragging: HTMLDivElement | undefined = undefined;
    let dragFunc: (pos: { x: number; y: number }) => void = () => {};

    let bodyClass = "";

    function mouseDown(
        event: MouseEvent,
        mode: (pos: { x: number; y: number }) => void,
        claz: string
    ) {
        event.preventDefault();
        dragging = event.target as HTMLDivElement;
        dragFunc = mode;
        bodyClass = claz;
        document.body.classList.add(claz);
    }

    function mouseUp() {
        dragging = undefined;
    }

    function mouseMove(event: MouseEvent) {
        if (!dragging) return;
        dragFunc({
            x: event.clientX,
            y: event.clientY,
        });
    }

    function move(event: MouseEvent) {
        event.preventDefault();
        dragging = event.target as HTMLDivElement;
        let ox = event.offsetX;
        let oy = event.offsetY;
        dragFunc = (pos: { x: number; y: number }) => {
            let bound = dragging.getBoundingClientRect();
            let diffX = pos.x - (bound.x + ox);
            let diffY = pos.y - (bound.y + oy);
            x += diffX;
            y += diffY;
        };
    }

    function expandRight(pos: { x: number }, invert = false) {
        let bound = dragging.getBoundingClientRect();
        let diffX = pos.x - (bound.x + 1 + bound.width / 2);
        let newWidth = Math.max(width + (invert ? -diffX : diffX), 0);
        let newHeight = Math.max(newWidth / ratio, 0);
        let diffHeight = (newHeight - height) / 2;
        width = newWidth;
        height = newHeight;
        y -= diffHeight;
    }

    function expandDown(pos: { y: number }, invert = false) {
        let bound = dragging.getBoundingClientRect();
        let diffY = pos.y - (bound.y + bound.height / 2);
        let newHeight = Math.max(height + (invert ? -diffY : diffY), 0);
        let newWidth = Math.max(newHeight * ratio, 0);
        let diffWidth = (newWidth - width) / 2;
        width = newWidth;
        height = newHeight;
        x -= diffWidth;
    }

    function expandLeft(pos: { x: number }) {
        let oldWidth = width;
        expandRight(pos, true);
        x -= width - oldWidth;
    }

    function expandUp(pos: { y: number }) {
        let oldHeight = height;
        expandDown(pos, true);
        y -= height - oldHeight;
    }

    function expandBR(
        pos: { x: number; y: number },
        invert: { x?: boolean; y?: boolean } = {}
    ) {
        let bound = dragging.getBoundingClientRect();
        let diffX = (pos.x - (bound.x + bound.width / 2)) * (invert.x ? -1 : 1);
        let diffY =
            (pos.y - (bound.y + bound.height / 2)) * (invert.y ? -1 : 1);
        let take = Math.abs(diffX) < Math.abs(diffY) ? diffX : diffY;
        let resizeRate = Math.min(
            Math.abs(diffX) / Math.max(width, 1),
            Math.abs(diffY) / Math.max(height, 1)
        );
        let newWidth = Math.max(
            width + Math.max(width, 1) * resizeRate * (take < 0 ? -1 : 1),
            0
        );
        height = Math.max(newWidth / ratio, 0);
        width = newWidth;
    }

    function expandTL(pos: { x: number; y: number }) {
        let old = { width, height };
        expandBR(pos, { x: true, y: true });
        x -= width - old.width;
        y -= height - old.height;
    }

    function expandTR(pos: { x: number; y: number }) {
        let oldHeight = height;
        expandBR(pos, { y: true });
        y -= height - oldHeight;
    }

    function expandBL(pos: { x: number; y: number }) {
        let oldWidth = width;
        expandBR(pos, { x: true });
        x -= width - oldWidth;
    }
</script>

<svelte:window
    on:mouseup={() => {
        dragging = undefined;
        if (bodyClass.length) document.body.classList.remove(bodyClass);
    }}
    on:mousemove={mouseMove}
/>

<div
    class="this"
    style="left: {x - 6}px;top: {y - 6}px;width: {width + 12}px;height:{height +
        12}px"
    class:dragging={!!dragging}
>
    <div class="flex flex-row">
        <div
            class="resizer h-[6px] w-[6px] rounded-sm border-2"
            class:cursor-nw-resize={!dragging}
            class:dragging={dragging && dragFunc === expandTL}
            on:mousedown={(ev) => mouseDown(ev, expandTL, "cursor-nw-resize")}
        />
        <div
            class="resizer h-[6px] border-b-2 border-dashed"
            style="width: {width}px"
            class:cursor-n-resize={!dragging}
            class:dragging={dragging && dragFunc === expandUp}
            on:mousedown={(ev) => mouseDown(ev, expandUp, "cursor-n-resize")}
        />
        <div
            class="resizer h-[6px] w-[6px] rounded-sm border-2"
            class:cursor-ne-resize={!dragging}
            class:dragging={dragging && dragFunc === expandTR}
            on:mousedown={(ev) => mouseDown(ev, expandTR, "cursor-ne-resize")}
        />
    </div>

    <div class="flex flex-row">
        <div
            class="resizer w-[6px] border-r-2 border-dashed"
            style="height: {height}px"
            class:cursor-w-resize={!dragging}
            class:dragging={dragging && dragFunc === expandLeft}
            on:mousedown={(ev) => mouseDown(ev, expandLeft, "cursor-w-resize")}
        />
        <div
            class="cursor-move"
            style="width: {width}px;height:{height}px"
            on:mousedown={(ev) => move(ev)}
        />
        <div
            class="resizer w-[6px] border-l-2 border-dashed"
            style="height: {height}px"
            class:cursor-e-resize={!dragging}
            class:dragging={dragging && dragFunc === expandRight}
            on:mousedown={(ev) => mouseDown(ev, expandRight, "cursor-e-resize")}
        />
    </div>

    <div class="flex flex-row">
        <div
            class="resizer h-[6px] w-[6px] rounded-sm border-2"
            class:cursor-sw-resize={!dragging}
            class:dragging={dragging && dragFunc === expandBL}
            on:mousedown={(ev) => mouseDown(ev, expandBL, "cursor-sw-resize")}
        />
        <div
            class="resizer h-[6px] border-t-2 border-dashed"
            style="width: {width}px"
            class:cursor-s-resize={!dragging}
            class:dragging={dragging && dragFunc === expandDown}
            on:mousedown={(ev) => mouseDown(ev, expandDown, "cursor-s-resize")}
        />
        <div
            class="resizer h-[6px] w-[6px] rounded-sm border-2"
            class:cursor-se-resize={!dragging}
            class:dragging={dragging && dragFunc === expandBR}
            on:mousedown={(ev) => mouseDown(ev, expandBR, "cursor-se-resize")}
        />
    </div>
</div>

<style lang="postcss">
    div.this {
        @apply absolute z-10 opacity-100;
        mix-blend-mode: difference;
    }
    div.resizer {
        @apply border-white hover:border-blue-500;
    }
    div.dragging div.resizer:hover:not(.dragging) {
        @apply border-white bg-transparent;
    }
    div.resizer.dragging {
        @apply border-blue-500;
    }
</style>
