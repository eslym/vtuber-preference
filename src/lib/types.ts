export interface SlotImage {
    name: string;
    image: HTMLImageElement;
    width: number;
    height: number;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface Slot {
    name: string;
    dynamic?: string;
    position: {
        x: number;
        y: number;
    };
    images: SlotImage[];
}
