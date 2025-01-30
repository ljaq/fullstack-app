import { forwardRef } from 'react';
import { Empty, Spin } from 'antd';
import './ECharts.less';
import Charts from './Charts';
import type { EChartOption, EChartsResponsiveOption } from 'echarts';
const ECharts = forwardRef(
  (
    {
      disabled,
      loading = false,
      className,
      noData,
      option,
      height,
    }: {
      disabled?: boolean;
      noData?: boolean | string;
      loading?: boolean;
      option?: EChartOption | EChartsResponsiveOption;
      className?: string;
      height?: string | number;
    },
    ref,
  ) => {
    if (noData) {
      return (
        <div className={`echarts-box ${className}`} style={{ overflow: 'hidden', height }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={typeof noData === 'string' ? noData : '暂无数据'} />
        </div>
      );
    }
    return (
      <Spin spinning={loading} size="large">
        <Charts ref={ref} option={option} disabled={disabled} className={className} height={height} />
      </Spin>
    );
  },
);

export default ECharts;
