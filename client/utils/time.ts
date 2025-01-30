import dayjs, { Dayjs } from 'dayjs';

export const ONE_DAY = 24 * 60 * 60 * 1000;

const getMillisecond = (time: any) => {
  const { seconds } = time || {};
  const tim = seconds || time;
  if (String(tim).length <= 10) {
    return tim * 1000;
  }
  if (typeof tim !== 'number') {
    return Number(tim);
  }
  return tim;
};
export function formatTime(t?: string | Dayjs, formats = 'YYYY-MM-DD HH:mm:ss') {
  if (!t || t === '0001-01-01T00:00:00') return '--';
  if (t && typeof t === 'string' && !t.includes('T') && !t.includes('-')) {
    return dayjs(getMillisecond(t)).format(formats);
  }
  return dayjs(t).format(formats);
}

export const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

// antd日期选择空间的时间限制方法（可选当前时间之前）
export const getDisabledTime = (date: Dayjs, type: 'before' | 'after') => {
  type = type || 'before';
  const disableTime: any = {
    disabledHours: () => [],
    disabledMinutes: () => [],
    disabledSeconds: () => [],
  };
  if (!date || (date && date.date() === dayjs().date())) {
    // 未选或选择今天
    if (type === 'before') {
      disableTime.disabledHours = () => range(0, 24).splice(new Date().getHours() + 1);
      disableTime.disabledMinutes = () => range(0, 60).splice(new Date().getMinutes() + 1);
      disableTime.disabledSeconds = () => range(0, 60).splice(new Date().getSeconds() + 1);
    } else {
      disableTime.disabledHours = () => range(0, 24).splice(0, new Date().getHours());
      disableTime.disabledMinutes = () => range(0, 60).splice(0, new Date().getMinutes());
      disableTime.disabledSeconds = () => range(0, 60).splice(0, new Date().getSeconds());
    }
    if (date && date.hour() === dayjs().hour()) {
      if (type === 'before') {
        disableTime.disabledMinutes = () => range(0, 60).splice(new Date().getMinutes() + 1);
      } else {
        disableTime.disabledMinutes = () => range(0, 60).splice(0, new Date().getMinutes());
      }
      if (date && date.minute() === dayjs().minute()) {
        if (type === 'before') {
          disableTime.disabledSeconds = () => range(0, 60).splice(new Date().getSeconds() + 1);
        } else {
          disableTime.disabledSeconds = () => range(0, 60).splice(0, new Date().getSeconds());
        }
      } else {
        disableTime.disabledSeconds = () => range(0, 0);
      }
    } else {
      disableTime.disabledMinutes = () => range(0, 0);
      disableTime.disabledSeconds = () => range(0, 0);
    }
  } else if (date && date.date() !== dayjs().date()) {
    disableTime.disabledHours = () => range(0, 0);
    disableTime.disabledMinutes = () => range(0, 0);
    disableTime.disabledSeconds = () => range(0, 0);
  }
  return disableTime;
};
