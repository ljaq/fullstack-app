import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'
import { tabBarConfig } from './src/components/tabbar/tab-list'

export default defineUniPages({
  pages: [],
  globalStyle: {
    navigationBarTextStyle: 'black',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'uni-app',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': '@wot-ui/ui/components/wd-$1/wd-$1.vue',
    },
  },
  tabBar: tabBarConfig,
})
