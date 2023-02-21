import "./app.css";
import App from "./App.svelte";
import * as PIXI from "pixi.js";

const app = new App({
    target: document.body,
});

(window as any).PIXI = PIXI;

export default app;
