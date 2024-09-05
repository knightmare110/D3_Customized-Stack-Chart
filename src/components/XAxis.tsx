import * as d3 from "d3";
import React, { useMemo } from "react";
import { humanReadableNumberFormatter } from "./NumberFormatter";

export enum AxisType {
    X,
    Line,
    Stack
}

export interface IAxisProps {
    name: string,
    units: string,
    unitInFront?: boolean
    openEditModalCallback?: (indicatorKey: string) => void;
    editableName?: boolean
    axisType?: AxisType
    indicatorKey: string
}

export interface IXAxisProps extends IAxisProps {
    scale: d3.ScaleLinear<number, number>,
    pixelsPerTick?: number,
}

export function XAxis(props: IXAxisProps) {

    const range = useMemo(() => {
        return props.scale.range();
    }, [props.scale]);

    const ticks = useMemo(() => {
        const width = range[1] - range[0];
        const pixelsPerTick = props.pixelsPerTick ?? 30;
        const numberOfTicksTarget = Math.max(1, Math.floor(width / pixelsPerTick));

        return props.scale.ticks(numberOfTicksTarget).map(value => ({
            value, xOffset: props.scale(value)
        }));
    }, [props, range]);

    return (
        <>
            <text className="xaxis-text"
                transform={`translate(${props.scale.range()[1] / 2}, 50)`}
                style={{ textAnchor: "middle", fontSize: "20px" }}>
                {props.name} ({props.units})
                {props.editableName &&
                    <tspan className="omit-from-svg-download"
                        style={{ cursor: "pointer" }}
                        onClick={() => { if (props.openEditModalCallback) props.openEditModalCallback(props.indicatorKey); }}
                    >&nbsp; ✏️</tspan>
                }
            </text>
            <path fill="none" d={`M ${range[0]} 6 v -6 H ${range[1]} v 6`} stroke="currentColor" strokeWidth={1} />
            {
                ticks.map(({ value, xOffset }) => (
                    <g key={value} transform={`translate(${xOffset}, 0)`}>
                        <line y2="6" stroke="currentColor" />
                        <text key={value} style={{ fontSize: "14px", textAnchor: "middle", transform: "translateY(20px)" }}>
                            {humanReadableNumberFormatter(value)}
                        </text>
                    </g>
                ))
            }
        </>
    );
}
