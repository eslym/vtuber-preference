<script lang="ts">
    import type { Slot, SlotLayer } from "./types";
    import * as PIXI from "pixi.js";
    import { Container, getApp, Sprite } from "svelte-pixi";
    import { isEqual } from "lodash";

    export let appSlot: Slot;
    export let selectedLayer: number | undefined;

    let state: { selected?: number; layers?: string[] } = {};

    let cachedTextures = new WeakMap<HTMLImageElement, PIXI.Texture>();

    let cachedSize = { width: -1, height: -1 };
    let cachedSizedSelected: PIXI.Texture | undefined = undefined;

    let { app } = getApp();

    let lowerHalf: PIXI.Texture | undefined = undefined;
    let upperHalf: PIXI.Texture | undefined = undefined;
    let fullCache: PIXI.Texture | undefined = undefined;
    let selectedTextrue: PIXI.Texture | undefined = undefined;

    $: selectedSize =
        selectedLayer !== undefined
            ? appSlot.layers[selectedLayer].rect
            : undefined;

    $: if (selectedLayer !== undefined) {
        cachedTextures.delete(appSlot.layers[selectedLayer].image);
        cachedSize = { width: -1, height: -1 };
        cachedSizedSelected = undefined;
    }

    $: if (selectedTextrue && !isEqual(cachedSize, selectedSize)) {
        cachedSize = { ...selectedSize };
        let cachedSprite = new PIXI.Sprite(selectedTextrue);
        cachedSprite.width = cachedSize.width;
        cachedSprite.height = cachedSize.height;
        cachedSizedSelected = app.renderer.generateTexture(cachedSprite, {
            scaleMode: PIXI.SCALE_MODES.NEAREST,
            region: new PIXI.Rectangle(
                0,
                0,
                cachedSize.width,
                cachedSize.height
            ),
        });
    }

    $: if (
        !isEqual(state, {
            selected: selectedLayer,
            layers: appSlot.layers.map((l) => l.image.src),
        })
    ) {
        state = {
            selected: selectedLayer,
            layers: appSlot.layers.map((l) => l.image.src),
        };
        selectedTextrue =
            selectedLayer !== undefined
                ? new PIXI.Texture(
                      new PIXI.BaseTexture(appSlot.layers[selectedLayer].image)
                  )
                : undefined;
        lowerHalf =
            selectedLayer !== undefined
                ? cacheLayers(appSlot.layers.slice(selectedLayer + 1))
                : undefined;
        upperHalf =
            selectedLayer !== undefined
                ? cacheLayers(appSlot.layers.slice(0, selectedLayer))
                : undefined;
        fullCache =
            selectedLayer === undefined
                ? cacheLayers(appSlot.layers)
                : undefined;
    }

    function getTexture(layer: SlotLayer) {
        if (!cachedTextures.has(layer.image)) {
            let sprite = new PIXI.Sprite(
                new PIXI.Texture(new PIXI.BaseTexture(layer.image))
            );
            sprite.x = layer.pos.x;
            sprite.y = layer.pos.y;
            sprite.width = layer.rect.width;
            sprite.height = layer.rect.height;
            cachedTextures.set(
                layer.image,
                app.renderer.generateTexture(sprite, {
                    scaleMode: PIXI.SCALE_MODES.NEAREST,
                    region: new PIXI.Rectangle(0, 0, 117, 166),
                })
            );
        }
        return cachedTextures.get(layer.image);
    }

    function cacheLayers(layers: SlotLayer[]) {
        let container = new PIXI.Container();
        for (let layer of [...layers].reverse()) {
            container.addChild(new PIXI.Sprite(getTexture(layer)));
        }
        return app.renderer.generateTexture(container, {
            scaleMode: PIXI.SCALE_MODES.NEAREST,
            region: new PIXI.Rectangle(0, 0, 117, 166),
        });
    }
</script>

{#if upperHalf && lowerHalf && cachedSizedSelected}
    <Container>
        <Sprite texture={lowerHalf} />
        <Sprite
            texture={cachedSizedSelected}
            {...appSlot.layers[selectedLayer].pos}
        />
        <Sprite texture={upperHalf} />
    </Container>
{:else if fullCache}
    <Sprite texture={fullCache} />
{/if}
