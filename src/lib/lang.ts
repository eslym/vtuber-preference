/**
 * A very simple language system.
 */
import type { Subscriber, Writable } from "svelte/store";

interface Lang extends Writable<Lang> {
    (key: string): string;
    lang: string;
}

const translations: Record<string, any> = import.meta.glob(
    "../locales/*.yaml",
    {
        eager: true,
    }
);

const defaultLang = "zh-TW";
const langKey = "_lang";

const accpetedLang = {
    "zh-TW": true,
    en: true,
} as const;

const subscribers = new Set<Subscriber<Lang>>();

function lang(key: string): string {
    let trans = translations[`../locales/${_.lang}.yaml`];
    let parts = key.split(".");
    let part = parts.shift();
    let current = trans?.default?.[part];
    while (parts.length) {
        let part = parts.shift();
        current = current?.[part];
    }
    return current !== undefined ? `${current}` : `!!{${key}}!!`;
}

function subscibe(subscriber: Subscriber<Lang>, _i: (val?: Lang) => void) {
    subscriber(_);
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
}

export const _: Lang = Object.defineProperties(lang, {
    lang: {
        get() {
            let lang = localStorage.getItem(langKey) ?? defaultLang;
            return accpetedLang[lang] ? lang : defaultLang;
        },
        set(val: string) {
            if (accpetedLang[val] && val !== localStorage.getItem(langKey)) {
                localStorage.setItem(langKey, val);
                for (let sub of subscribers) {
                    sub(_);
                }
            }
        },
    },
}) as any;

_.subscribe = subscibe;
_.set = () => undefined;
_.update = () => undefined;

window.addEventListener("storage", (event) => {
    if (event.key !== langKey) return;
    if (!accpetedLang[event.newValue]) return;
    for (let sub of subscribers) {
        sub(_);
    }
});
