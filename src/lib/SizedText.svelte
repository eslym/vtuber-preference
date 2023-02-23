<script lang="ts">
    import { isEqual } from "lodash";
    import * as PIXI from "pixi.js";
    import { getApp, Sprite } from "svelte-pixi";
    import type { PointLike } from "svelte-pixi/util/data-types";

    export let text: string;
    export let style: Partial<
        Omit<PIXI.ITextStyle, "wordWrap" | "wordWrapWidth">
    > = {};

    export let maxWidth: number;
    export let maxHeight: number;

    export let x: number = 0;
    export let y: number = 0;
    export let anchor: PointLike = 0;

    let texture: PIXI.Texture | undefined = undefined;

    let state: {
        text?: string;
        style?: Partial<Omit<PIXI.ITextStyle, "wordWrap" | "wordWrapWidth">>;
    } = {};

    $: if (!isEqual(state, { text, style })) texture = makeTexture();

    function calculateScale(style: PIXI.ITextStyle, wordWrapWidth: number) {
        let textStyle = new PIXI.TextStyle(style);
        textStyle.wordWrapWidth = wordWrapWidth;
        let metrics = PIXI.TextMetrics.measureText(
            text,
            textStyle,
            textStyle.wordWrap
        );
        let scale = 1;
        if (metrics.width > maxWidth) {
            scale = maxWidth / metrics.width;
        }
        if (metrics.height * scale > maxHeight) {
            scale *= maxHeight / (metrics.height * scale);
        }
        return scale;
    }

    function makeTexture() {
        state = { text, style };
        let { app } = getApp();
        let textStyle = new PIXI.TextStyle({
            ...style,
            wordWrap: true,
            wordWrapWidth: maxWidth,
        });
        let scale = calculateScale(textStyle, maxWidth);
        if (scale < 1) {
            let bound = maxWidth;
            let current = maxWidth / scale;
            scale = calculateScale(textStyle, current);
            // binary search to find the word wrap width which can produce the largest scale.
            while (true) {
                let nw = (bound + current) / 2;
                let ns = calculateScale(textStyle, nw);
                if (ns > scale) {
                    current = nw;
                    scale = ns;
                    continue;
                }
                let fw = current + (nw - bound);
                let fs = calculateScale(textStyle, fw);
                if (fs > scale) {
                    bound = current;
                    current = fw;
                    scale = fs;
                    continue;
                }
                break;
            }
            textStyle.wordWrapWidth = current;
        }
        let drawText = new PIXI.Text(text, textStyle);
        drawText.width *= scale;
        drawText.height *= scale;
        return app.renderer.generateTexture(drawText, {
            region: new PIXI.Rectangle(0, 0, drawText.width, drawText.height),
        });
    }
</script>

{#if texture}
    <Sprite {texture} {x} {y} {anchor} />
{/if}
