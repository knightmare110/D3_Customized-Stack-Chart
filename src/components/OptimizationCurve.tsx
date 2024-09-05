import * as d3 from "d3";
import React, { useMemo } from "react";
import { Area } from "./Area";
import { AxisType, IAxisProps, XAxis } from "./XAxis";
import { ILineData, Line } from "./Line";
import { MouseInteractionRect } from "./MouseInteractionRect";
import { useDimensions } from "./useDimensions";
import { YAxis } from "./YAxis";

export interface ILegend {
    getSymbol: d3.ScaleOrdinal<string, string>
}

export interface IOptimizationCurveProps<AreaData> {
    id?: string,
    height?: number,
    width?: number,
    lineData: ILineData[],
    areaData: AreaData[],
    xAreaGetter: (d: AreaData) => number,
    areaKeys: string[],
    colors: string[],
    setSelectedSliceIndex: (d: number) => void,
    selectedSliceIndex: number,
    legendScale: ILegend,
    xAxisProps: IAxisProps,
    stackAxisProps: IAxisProps,
    lineAxisProps: IAxisProps,
    showHorizontalReferenceLines?: boolean // New flag for horizontal lines
}


export function OptimizationCurve<AreaData>(props: IOptimizationCurveProps<AreaData>) {
    const marginLeft = 88;
    const marginRight = 92;
    const marginTop = 70;
    const marginBottom = 80;

    const [divRef, dimensions] = useDimensions<HTMLDivElement>();
    const chartWidth = useMemo(() => (dimensions?.width ?? 0) - marginLeft - marginRight, [dimensions]);
    const chartHeight = useMemo(() => (dimensions?.height ?? 0) - marginTop - marginBottom, [dimensions]);

    const xScale = useMemo(() => {
        const [xMin, xMax] = [
            d3.min(props.lineData.map(d => d.x)) ?? 0,
            d3.max(props.lineData.map(d => d.x)) ?? 0
        ];
        return d3.scaleLinear<number>()
            .domain([xMin, xMax])
            .range([0, chartWidth])
    }, [props.lineData, chartWidth]);

    const yAreaScale = useMemo(() => {
        const yMin = Math.min(0, ...props.areaData.map(d =>
            Math.min(...props.areaKeys.map(k =>
                d[k as keyof AreaData] as unknown as number)))) ?? 0;

        const yMax = Math.max(
            ...props.areaData.map(d =>
                props.areaKeys.map(k =>
                    d[k as keyof AreaData] as unknown as number)
                    .reduce((a, b) => a + b)));

        return d3.scaleLinear<number>()
            .domain([yMin, yMax])
            .range([0, chartHeight]);
    }, [props, chartHeight]);

    const yLineScale = useMemo(() => {
        const yMin = d3.min(props.lineData.map(ld => ld.y)) ?? 0;
        const yMax = d3.max(props.lineData.map(ld => ld.y)) ?? 0;
        return d3.scaleLinear<number>()
            .domain([yMin, yMax])
            .range([0, chartHeight]);
    }, [props, chartHeight]);

    // Horizontal lines logic based on selected slice index
    const selectedX = useMemo(() => {
        return props.lineData[props.selectedSliceIndex]?.x ?? 0;
    }, [props.selectedSliceIndex, props.lineData]);

    const selectedYLine = useMemo(() => {
        return props.lineData[props.selectedSliceIndex]?.y ?? 0;
    }, [props.selectedSliceIndex, props.lineData]);

    const selectedYArea = useMemo(() => {
        const areaValues = props.areaKeys.map(k => 
            props.areaData[props.selectedSliceIndex][k as keyof AreaData] as unknown as number
        );
        return areaValues.reduce((a, b) => a + b, 0); // Sum of stacked values
    }, [props.selectedSliceIndex, props.areaData, props.areaKeys]);

    return (
        <div className="optimization-chart" ref={divRef}
            style={{
                border: "none",
                background: "white",
                height: (props?.height ? props.height - 4 : ""),
                width: props.width
            }}
        >
            <svg width={dimensions?.width ?? 400}
                height={dimensions ? dimensions?.height : 400}
                id={props.id}
                style={{ background: "white" }}>
                <g transform={`translate(${marginLeft}, ${marginTop})`}>
                    {/* Area and Line Charts */}
                    <Area
                        data={props.areaData}
                        chartHeight={chartHeight}
                        chartWidth={chartWidth}
                        xScale={xScale}
                        yScale={yAreaScale}
                        legendScale={props.legendScale.getSymbol}
                        xGetter={props.xAreaGetter}
                        keys={props.areaKeys}
                        colors={props.colors} />
                    <Line
                        data={props.lineData}
                        yScale={yLineScale}
                        xScale={xScale}
                        chartWidth={chartWidth}
                        chartHeight={chartHeight} />
                    
                    {/* Axes */}
                    <g transform={`translate(0, ${chartHeight})`}>
                        <XAxis scale={xScale} pixelsPerTick={80} {...props.xAxisProps} axisType={AxisType.X} />
                    </g>
                    <YAxis scale={yLineScale} color="red" side="left" pixelsPerTick={40} {...props.lineAxisProps} axisType={AxisType.Line} />
                    <g transform={`translate(${chartWidth}, 0)`}>
                        <YAxis side="right" scale={yAreaScale} pixelsPerTick={40} {...props.stackAxisProps} axisType={AxisType.Stack} />
                    </g>
                    
                    {/* Horizontal Reference Lines */}
                    {props.showHorizontalReferenceLines && (
                        <>
                            {/* Line for Y-axis (left) */}
                            <line x1="0" x2={chartWidth} y1={chartHeight - yLineScale(selectedYLine)} y2={chartHeight - yLineScale(selectedYLine)} stroke="blue" strokeDasharray="4" />
                            {/* Line for Y-axis (right) */}
                            <line x1="0" x2={chartWidth} y1={chartHeight - yAreaScale(selectedYArea)} y2={chartHeight - yAreaScale(selectedYArea)} stroke="green" strokeDasharray="4" />
                        </>
                    )}
                    
                    {/* Interaction */}
                    <MouseInteractionRect
                        chartWidth={chartWidth}
                        chartHeight={chartHeight}
                        xScale={xScale}
                        yScale={yLineScale}
                        data={props.lineData}
                        selectedIndex={props.selectedSliceIndex}
                        setSelectedIndex={props.setSelectedSliceIndex}
                        areaData={props.areaData}
                        areaKeys={props.areaKeys}
                        areaYScale={yAreaScale}
                        xAxis={props.xAxisProps}
                        lineYAxis={props.lineAxisProps}
                        stackYAxis={props.stackAxisProps}
                    />
                </g>
            </svg>
        </div>
    )
}
