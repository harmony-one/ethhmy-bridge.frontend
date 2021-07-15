import { BigNumber } from '@ethersproject/bignumber';
import { Box } from 'grommet';
import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  HistogramData,
  ChartOptions,
  HistogramSeriesPartialOptions,
} from 'lightweight-charts';
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from '@ethersproject/units';

export function useHistogramChart(
  ref: React.MutableRefObject<HTMLDivElement>,
  chartOptions?: Partial<ChartOptions>,
  histogramOptions?: HistogramSeriesPartialOptions,
): [
  React.MutableRefObject<IChartApi>,
  React.MutableRefObject<ISeriesApi<'Histogram'>>,
] {
  const chartRef = useRef<IChartApi>();
  const seriesRef = useRef<ISeriesApi<'Histogram'>>();

  useEffect(() => {
    const chart = createChart(ref.current, {
      width: ref.current.offsetWidth,
      height: 300,
      rightPriceScale: {
        drawTicks: false,
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      ...chartOptions,
    });

    const series = chart.addHistogramSeries({
      ...histogramOptions,
    });

    chartRef.current = chart;
    seriesRef.current = series;
  }, []);

  return [chartRef, seriesRef];
}

export function TotalLockedDailyChart({ data }) {
  const chartElRef = useRef<HTMLDivElement>();
  const [chartRef, seriesRef] = useHistogramChart(chartElRef);

  useEffect(() => {
    seriesRef.current.setData(
      Array.from(data)
        .map(
          ([time, value]) =>
            ({
              time,
              value:
                parseInt(
                  BigNumber.from(value)
                    .div(parseUnits('1', 16))
                    .toString(),
                ) / 100,
            } as HistogramData),
        )
        .sort((a, b) => (a.time > b.time ? 1 : -1))
        .slice(-60),
    );

    chartRef.current.timeScale().fitContent();
    chartRef.current.priceScale().applyOptions({
      autoScale: true,
    });
  }, [data]);

  return (
    <Box
      width="100%"
      pad="medium"
      background="white"
      margin="small"
      round="xxsmall"
      border={{
        color: '#e7ecf7',
      }}
    >
      <div>TVL</div>
      <div ref={chartElRef}></div>
    </Box>
  );
}

export function VolumeDailyChart({ data }) {
  const chartElRef = useRef<HTMLDivElement>();
  const [chartRef, seriesRef] = useHistogramChart(
    chartElRef,
    {},
    {
      color: '#47b8eb',
    },
  );

  useEffect(() => {
    seriesRef.current.setData(
      Array.from(data)
        .map(
          ([time, value]) =>
            ({
              time,
              value:
                parseInt(
                  BigNumber.from(value)
                    .div(parseUnits('1', 16))
                    .toString(),
                ) / 100,
            } as HistogramData),
        )
        .sort((a, b) => (a.time > b.time ? 1 : -1))
        .slice(-60),
    );

    chartRef.current.timeScale().fitContent();
    chartRef.current.priceScale().applyOptions({
      autoScale: true,
    });
  }, [data]);

  return (
    <Box
      width="100%"
      pad="medium"
      background="white"
      margin="small"
      round="xxsmall"
      border={{
        color: '#e7ecf7',
      }}
    >
      <div>Volume</div>
      <div ref={chartElRef}></div>
    </Box>
  );
}
