<script lang="ts">
    import Color from "color";
    export let hex: string;
    export let label: string;
    export let isOpen: boolean;
    export let labelWrapper: HTMLLabelElement;
</script>

<label
    class="flex cursor-pointer flex-row items-center gap-2 py-2 px-4 hover:bg-gray-300"
    class:bg-gray-300={isOpen}
    bind:this={labelWrapper}
>
    <div class="w-0 flex-grow">
        {label}
    </div>
    <span
        class="inline-block h-6 w-6 rounded-full border-2 shadow "
        class:border-white={Color(hex).isDark()}
        class:border-black={Color(hex).isLight()}
        style="background-color: {hex};"
    />
    <input type="hidden" />
</label>
