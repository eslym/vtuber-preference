import "./app.css";
import App from "./App.svelte";
import * as PIXI from "pixi.js";

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
PIXI.settings.MIPMAP_TEXTURES = PIXI.MIPMAP_MODES.ON;

const app = new App({
    target: document.body,
});

(window as any).PIXI = PIXI;

export default app;
