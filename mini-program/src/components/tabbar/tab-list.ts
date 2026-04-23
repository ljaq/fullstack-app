import type { TabBar } from '@uni-helper/vite-plugin-uni-pages';

export const tabList = [
  {
    pagePath: 'pages/home/index',
    iconPath: '/static/tab-icons/home.png',
    selectedIconPath: '/static/tab-icons/home-active.png',
    text: '首页',
  },
  {
    pagePath: 'pages/my/index',
    iconPath: '/static/tab-icons/my.png',
    selectedIconPath: '/static/tab-icons/my-active.png',
    text: '我的',
  },
];

export const tabBarConfig: TabBar = {
  // 只有微信小程序支持 custom。App 和 H5 不生效
  custom: true,
  color: '#816f49',
  selectedColor: '#942e21',
  backgroundColor: '#fff',
  list: tabList as unknown as TabBar['list'],
};
