import * as d3 from "d3";
import React, { useMemo } from "react";

export interface ILineProps {
    data: ILineData[],
    chartWidth: number,
    chartHeight: number,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>
}

export interface ILineData {
    x: number,
    y: number
}

export function Line(props: ILineProps) {
    const line = useMemo(() => {
        return d3.line<ILineData>()
            .x(d => props.xScale(d.x))
            .y(d => props.chartHeight - props.yScale(d.y));
    }, [props]);

    return (
        <path d={line(props.data) ?? ""} fill="none" stroke="red" strokeWidth={1.5} />
    );
}

