import { useLayoutEffect, useState, useRef, RefObject } from "react";

export interface IDimensions {
    width: number;
    height: number;
    top: number;
    left: number;
    x: number;
    y: number;
    right: number;
    bottom: number;
}

export function getDimensions(node: HTMLElement): IDimensions {
    const rect: DOMRect = node.getBoundingClientRect();

    return rect;
}

export type UseDimensionsHook<T extends HTMLElement> = [
    RefObject<T>,
    IDimensions | undefined
]

export function useDimensions<T extends HTMLElement>(): UseDimensionsHook<T> {
    const [dimensions, setDimensions] = useState<IDimensions>();
    const ref = useRef<T>(null);

    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }

        const measure = () => ref.current && setDimensions(getDimensions(ref.current));
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(ref.current);

        const innerRef = ref;
        return () => { innerRef.current && observer.unobserve(innerRef.current) }
    }, [ref]);

    return [ref, dimensions];
}
