/// <reference types="svelte" />
/// <reference types="vite/client" />

declare module "*.yml" {
    const data: any;
    export default data;
}

declare module "*.yaml" {
    const data: any;
    export default data;
}
