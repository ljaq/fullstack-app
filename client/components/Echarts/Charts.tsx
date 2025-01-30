import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as echarts from 'echarts';
import 'echarts-wordcloud';
import 'echarts';
import './ECharts.less';
import { useDeepCompareEffect } from 'react-use';
import elementResizeEvent, { unbind } from './elementResizeEvent';

const Charts = forwardRef(
  (
    {
      disabled,
      option,
      className,
      height,
    }: {
      option?: echarts.EChartOption | echarts.EChartsResponsiveOption;
      disabled?: boolean;
      className?: string;
      height?: string | number;
    },
    ref,
  ) => {
    const ele = useRef<HTMLElement>();

    const [myChart, setMyChart] = useState<echarts.ECharts>();

    useEffect(() => {
      if (!myChart) {
        const chart = echarts.init(ele.current as HTMLDivElement, undefined, {
          renderer: 'svg',
        });
        setMyChart(chart);
      }
    }, [myChart]);

    useEffect(() => {
      if (myChart) {
        const resize = () => myChart.resize();
        const timer = setTimeout(resize, 1);
        unbind(ele.current?.parentElement, '');
        elementResizeEvent(ele.current?.parentElement, resize);
        window.addEventListener('resize', resize);

        return () => {
          timer && clearTimeout(timer);
          window.removeEventListener('resize', resize);
        };
      }
    }, [myChart]);

    useDeepCompareEffect(() => {
      option &&
        myChart?.setOption(
          {
            ...option,
          },
          true,
        );
    }, [myChart, option || {}]);

    useImperativeHandle(
      ref,
      () => ({
        myChart,
      }),
      [myChart],
    );
    return (
      <div
        style={{
          position: 'relative',
          ...(disabled ? { pointerEvents: 'none', background: '#f0f0f0' } : {}),
        }}>
        <div ref={ele as any} className={`echarts-box ${className}`} style={{ height }} />
      </div>
    );
  },
);
export default Charts;
