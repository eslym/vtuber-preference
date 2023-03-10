export interface Rect {
    width: number;
    height: number;
}

export interface Pos {
    x: number;
    y: number;
}

export interface SlotLayer {
    name: string;
    image: HTMLImageElement;
    rect: Rect;
    pos: Pos;
}

export interface Slot {
    name?: string;
    background: string;
    color: string;
    pos: Pos;
    layers: SlotLayer[];
}
