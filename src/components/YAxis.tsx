import React, { useMemo } from "react";
import { humanReadableNumberFormatter } from "./NumberFormatter";
import { IAxisProps } from "./XAxis";

export interface IYAxisProps extends IAxisProps {
    side: "left" | "right",
    scale: d3.ScaleLinear<number, number>,
    pixelsPerTick?: number,
    color?: string
}

export const YAxis = (props: IYAxisProps) => {
    const range = useMemo(() => {
        return props.scale.range();
    }, [props.scale]);

    const ticks = useMemo(() => {
        const width = range[1] - range[0];
        const pixelsPerTick = props.pixelsPerTick ?? 30;
        const numberOfTicksTarget = Math.max(1, Math.floor(width / pixelsPerTick));

        return props.scale.ticks(numberOfTicksTarget).map(value => ({
            value, yOffset: props.scale(value)
        }));
    }, [props, range]);

    const start = props.side === "left" ? -6 : 6;
    const endMarker = props.side === "left" ? 6 : -6;
    const textTranslate = props.side === "left" ? -10 : 10;
    const textAnchor = (props.side === "left" ? "end" : "start");
    const labelTranslation = props.side === "left" ? -50 : 65;

    return (
        <>
            <path
                fill="none"
                d={`M ${start} 0 h ${endMarker} v ${range[1]} h ${-endMarker}`}
                stroke={props.color ?? "black"}
                strokeWidth={1} />
            <text
                transform={`translate(${labelTranslation}, ${range[1] / 2}) rotate(-90)`}
                style={{ textAnchor: "middle", fontSize: "20px" }}
                fill={props.color ?? "black"}>
                {props.name} ({props.units})
                {props.editableName &&
                    <tspan className="omit-from-svg-download" style={{ cursor: "pointer" }}
                        onClick={() => { if (props.openEditModalCallback) props.openEditModalCallback(props.indicatorKey); }}>&nbsp; ✏️</tspan>
                }
            </text>
            {ticks.map(({ value, yOffset }) => (
                <g key={value} transform={`translate(0, ${range[1] - yOffset})`}>
                    <line x2={`${props.side === "left" ? -6 : 6}`} stroke={props.color ?? "black"} />
                    <text key={value}
                        style={{ fontSize: "14px", textAnchor: textAnchor }}
                        fill={props.color ?? "black"}
                        transform={`translate(${textTranslate}, 3)`}>
                        {value > 50 ? humanReadableNumberFormatter(value) : value}
                    </text>
                </g>
            ))}
        </>
    );
}
