export interface Rect {
    width: number;
    height: number;
}

export interface Pos {
    x: number;
    y: number;
}

export interface SlotImage {
    name: string;
    image: HTMLImageElement;
    rect: Rect;
    pos: Pos;
}

export interface Slot {
    name: string;
    dynamic?: string;
    pos: Pos;
    images: SlotImage[];
}
