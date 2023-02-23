<script lang="ts">
    import FontFaceObserver from "fontfaceobserver";
    export let fonts: string[];

    $: load = Promise.all(fonts.map((f) => new FontFaceObserver(f).load()));
</script>

{#await load then}
    <slot {fonts} />
{/await}
