import * as d3 from "d3";
import React, { useMemo } from "react";

export interface IAreaProps<DataType> {
    data: DataType[],
    keys: string[],
    colors: string[],
    xGetter: (d: DataType) => number,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    legendScale: d3.ScaleOrdinal<string, string>,
    chartHeight: number,
    chartWidth: number
}

export function Area<DataType>(props: IAreaProps<DataType>) {
    const stack = useMemo(() => {
        const orderedKeys = props.keys.sort((a, b) => {
            const aTurnsOnAt = props.data.findIndex(d => d[a as string as keyof DataType] as unknown as number > 0.1);
            const bTurnsOnAt = props.data.findIndex(d => d[b as string as keyof DataType] as unknown as number > 0.1);
            return aTurnsOnAt - bTurnsOnAt;
        });
        return d3
            .stack<DataType>()
            .keys(orderedKeys);
    }, [props.keys, props.data]);

    const stackedSeries = useMemo(() => {
        const s = stack(props.data);
        return s;
    }, [props.data, stack]);

    const area = useMemo(() => {
        return d3.area<{ data: DataType, [key: number]: number }>()
            .x(d => props.xScale(props.xGetter(d.data)))
            .y0(d => props.chartHeight - props.yScale(d[0]))
            .y1(d => props.chartHeight - props.yScale(d[1]));
    }, [props]);

    return (
        <>
            {stackedSeries.map(series => {
                return <path
                    fill={props.legendScale(series.key)}
                    stroke={"grey"}
                    key={series.key}
                    d={area(series) as unknown as string} />;
            })}
        </>
    );
}
