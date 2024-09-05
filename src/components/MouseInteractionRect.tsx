import React, { useRef, MouseEvent, useCallback, useState, useMemo } from "react";
import { ILineData } from "./Line";
import { decimalNumberFormatter, humanReadableNumberFormatter } from "./NumberFormatter";
import { IAxisProps } from "./XAxis";

export interface IMouseInteractionRectProps<AreaData> {
    chartWidth: number,
    chartHeight: number,
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    data: ILineData[],
    setSelectedIndex: (index: number) => void,
    selectedIndex: number,
    areaData: AreaData[],
    areaKeys: string[],
    areaYScale: d3.ScaleLinear<number, number>,
    xAxis: IAxisProps,
    lineYAxis: IAxisProps,
    stackYAxis: IAxisProps
}

interface IMouseInteractionInfo {
    x: number,
    y: number,
    closestXIndex: number
}

/**
   MouseInteractionRect is a rectangle to draw over an svg in order
   to capture the mouse events. It has no color so it will be invisible.
   It enables the capture of the 'selected slice' so that it can be passed
   back to the chart and then up to the application.
 */
export function MouseInteractionRect<AreaData>(props: IMouseInteractionRectProps<AreaData>) {
    const rectRef = useRef<SVGRectElement>(null);

    const [mouseInfo, setMouseInfo] = useState<IMouseInteractionInfo>({
        x: 0,
        y: 0,
        closestXIndex: 0,
    });

    const [showCallout, setShowCallout] = useState<boolean>(false);

    const onMouseOver = useCallback(() => {
        setShowCallout(true);
    }, []);

    const onMouseLeave = useCallback(() => {
        setShowCallout(false);
    }, []);

    /**
       When the mouse is moving over the rect, we need to get the information
       about where it is at so we can track which is the closest valid x value
       on the chart.
     */
    const onMouseMove = useCallback((e: MouseEvent) => {
        if (rectRef.current === null) {
            return null;
        }

        // First we figure out where the chart is on the page
        // subtract its coordinates from the mouse coordinates to
        // find out the mouse coordinates in chart-space.
        const boundingRect = rectRef.current.getBoundingClientRect();
        const svgX = e.clientX - boundingRect.left;

        // Then we transform the chart-space x coordinate into domain-space
        // NOTE: This is not guaranteed to be a valid point on the chart,
        // it could be between two points - it is purely derrived from interpolation.
        const x0 = props.xScale.invert(svgX);

        // After that, we go through each of the data points in the chart
        // and figure out which one is the closest to our domain value
        const diffs = props.data.map((d, i) => { return { i: i, diff: Math.abs(d.x - x0) }; });
        const closest = diffs.reduce((a, b) => { return a.diff < b.diff ? a : b; });
        const index = closest.i;

        // Once we have the index, we can grab the original data
        // and figure out the actual range(chart)-space x coordinate
        // of the data point.
        const xValue = props.data[index].x
        const xCoord = props.xScale(xValue);

        // Same with the y
        const yValue = props.data[index].y;
        const yCoord = props.chartHeight - props.yScale(yValue);

        setMouseInfo({
            x: xCoord,
            y: yCoord,
            closestXIndex: index
        });
    }, [props, rectRef]);

    const onMouseDown = useCallback(() => {
        if (!mouseInfo) {
            return;
        }

        props.setSelectedIndex(mouseInfo.closestXIndex);
    }, [mouseInfo, props]);

    const calloutHeight = 64;

    const selectedXCoordinate = useMemo(() => {
        return props.xScale(props.data[props.selectedIndex].x);
    }, [props]);

    const selectedLineYCoordinate = useMemo(() => {
        return props.chartHeight - props.yScale(props.data[props.selectedIndex].y)
    }, [props]);

    const getAreaYSum = useCallback((index: number) => {
        const values = props.areaKeys.map(k => props.areaData[index][k as keyof AreaData] as unknown as number);
        return values.reduce((a, b) => a + b);
    }, [props])

    const calloutValues: string[] = useMemo(() => {

        const lineValue = props.data[mouseInfo.closestXIndex].y;
        const stackValue = getAreaYSum(mouseInfo.closestXIndex);

        return [
            " " + props.xAxis.name + ": " + decimalNumberFormatter(props.data[mouseInfo.closestXIndex].x) + "% ",
            props.lineYAxis.name + ": " + (props.lineYAxis.unitInFront ? props.lineYAxis.units : "") + humanReadableNumberFormatter(lineValue, lineValue < 1 ? 3 : 2) + (props.lineYAxis.unitInFront ? "" : ` ${props.lineYAxis.units}`),
            props.stackYAxis.name + ": " + (props.stackYAxis.unitInFront ? props.stackYAxis.units : "") + humanReadableNumberFormatter(stackValue, stackValue < 1 ? 3 : 2) + (props.stackYAxis.unitInFront ? "" : ` ${props.stackYAxis.units}`)
        ];
    }, [props.data, props.xAxis.name, props.lineYAxis.name, props.lineYAxis.unitInFront, props.lineYAxis.units, props.stackYAxis.name, props.stackYAxis.unitInFront, props.stackYAxis.units, mouseInfo.closestXIndex, getAreaYSum]);

    const calloutTextRefs = useRef<Array<SVGTextElement | null>>([])

    const calloutValuesMaxLength = calloutTextRefs.current.reduce((max, b) => b ? max > b.getBBox().width ? max : b.getBBox().width : 0, 0) + 16;

    return (
        <>
            <g>
                <path d={`M ${selectedXCoordinate} ${props.chartHeight}  v -${props.areaYScale(getAreaYSum(props.selectedIndex))}`} stroke="red" />
                <circle
                    cx={selectedXCoordinate}
                    cy={selectedLineYCoordinate}
                    fill="red"
                    stroke="black"
                    r="7"
                    opacity={1} />
            </g>
            {showCallout &&
                <g transform={`translate(${mouseInfo.x}, ${mouseInfo.y})`}>
                    <path d={`M ${calloutValuesMaxLength / 2} -25 c 0 3 -2 5 -5 5 h -${calloutValuesMaxLength / 2 - 8} l -3 3 l -3 -3 h -${calloutValuesMaxLength / 2 - 8} c -3 0 -5 -2 -5 -5 v -${calloutHeight - 10} c -0 -3 2 -5 5 -5 h ${calloutValuesMaxLength - 10} c 3 -0 5 2 5 5 z`} fill="white" stroke="black" />

                    {calloutValues && calloutValues.map((callout, i) =>
                        <text
                            key={i}
                            ref={x => calloutTextRefs.current[i] = x}
                            transform={`translate(0, ${-63.7 + 17 * i})`}
                            textAnchor="middle"
                            fontSize="1rem"
                            fill="#2080C2"
                            fontWeight={"bold"}>
                            {callout}
                        </text>
                    )}
                </g>
            }
            <rect
                ref={rectRef}
                pointerEvents="all"
                fill="none"
                onMouseOver={onMouseOver}
                onMouseLeave={onMouseLeave}
                onMouseMove={onMouseMove}
                onMouseDown={onMouseDown}
                width={props.chartWidth}
                height={props.chartHeight} />
        </>
    );
}
