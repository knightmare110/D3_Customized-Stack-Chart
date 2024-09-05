import * as d3 from "d3";

import React, { useState } from 'react';
import { ILineData, Line } from "./components/Line";
import { OptimizationCurve } from './components/OptimizationCurve';

// Dummy data for line and area charts
const lineData: ILineData[] = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
  { x: 2, y: 30 },
  { x: 3, y: 40 },
  { x: 4, y: 50 }
];

const areaData = [
  { time: 0, category1: 2, category2: 3, category3: 5 },
  { time: 1, category1: 3, category2: 4, category3: 7 },
  { time: 2, category1: 4, category2: 5, category3: 9 },
  { time: 3, category1: 5, category2: 6, category3: 11 },
  { time: 4, category1: 6, category2: 7, category3: 13 }
];

// Area data keys (categories)
const areaKeys = ['category1', 'category2', 'category3'];

// Colors for the areas
const colors = ['#ff9999', '#66b3ff', '#99ff99'];

// Axis props (for X and Y axes)
const xAxisProps = {
  name: 'Time',
  units: 's',
  indicatorKey: 'timeAxis'
};

const lineYAxisProps = {
  name: 'Value',
  units: '',
  indicatorKey: 'lineYAxis'
};

const stackYAxisProps = {
  name: 'Stacked Categories',
  units: '',
  indicatorKey: 'stackYAxis'
};

// Legend scale (mapping categories to colors)
const legendScale = {
  getSymbol: d3.scaleOrdinal<string, string>()
    .domain(areaKeys)
    .range(colors)
};

const App: React.FC = () => {
  const [selectedSliceIndex, setSelectedSliceIndex] = useState<number>(0);

  return (
    <div className="App">
      <h2>Optimization Curve Example</h2>
      <OptimizationCurve
        height={400}
        width={800}
        lineData={lineData}
        areaData={areaData}
        xAreaGetter={d => d.time}
        areaKeys={areaKeys}
        colors={colors}
        setSelectedSliceIndex={setSelectedSliceIndex}
        selectedSliceIndex={selectedSliceIndex}
        legendScale={legendScale}
        xAxisProps={xAxisProps}
        stackAxisProps={stackYAxisProps}
        lineAxisProps={lineYAxisProps}
        showHorizontalReferenceLines={true} // Turn on horizontal reference lines
      />
      <p>Selected slice index: {selectedSliceIndex}</p>
    </div>
  );
}


export default App;
