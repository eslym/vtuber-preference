<script lang="ts">
    import { isEqual } from "lodash";
    import * as PIXI from "pixi.js";
    import { getApp, Sprite } from "svelte-pixi";
    import type { SpriteProps } from "svelte-pixi/Sprite.svelte";

    type T = $$Generic<PIXI.Sprite>;

    interface $$Props extends Omit<SpriteProps<T>, "width" | "height"> {
        width: number;
        height: number;
        texture: PIXI.Texture;
    }

    export let width: number;
    export let height: number;
    export let texture: PIXI.Texture;
    export let instance: PIXI.Sprite = undefined;

    let cachedSize = { width: -1, height: -1 };
    let cachedTexture: PIXI.Texture | undefined = undefined;

    $: if (texture && !isEqual(cachedSize, { width, height })) {
        cachedSize = { width, height };
        let { app } = getApp();
        let cachedSprite = new PIXI.Sprite(texture);
        cachedSprite.width = width;
        cachedSprite.height = height;
        cachedTexture = app.renderer.generateTexture(cachedSprite, {
            scaleMode: PIXI.SCALE_MODES.NEAREST,
            region: new PIXI.Rectangle(0, 0, width, height),
        });
    }
</script>

{#if cachedTexture}
    <Sprite texture={cachedTexture} {...$$restProps} bind:instance />
{/if}
