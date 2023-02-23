<script lang="ts">
    import Color from "color";
    export let hex: string;
    export let label: string;
    export let isOpen: boolean;
    export let labelWrapper: HTMLLabelElement;
</script>

<label
    class="flex cursor-pointer flex-row items-center"
    bind:this={labelWrapper}
>
    <span
        class="inline-block h-4 w-4 rounded-full border shadow "
        class:border-white={Color(hex).isDark()}
        class:border-black={Color(hex).isLight()}
        style="background-color: {hex};"
    />
    <input type="hidden" value="{isOpen}{label}" />
</label>
