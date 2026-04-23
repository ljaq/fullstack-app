<template>
  <wd-tabbar bordered safe-area-inset-bottom placeholder fixed v-model="tabStore.current" @change="handleChange">
    <wd-tabbar-item
      v-for="(item, index) in tabList"
      :key="index"
      :title="item.text"
      :name="index"
      :icon="tabStore.current === index ? item.selectedIconPath : item.iconPath"
    ></wd-tabbar-item>
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { tabList } from './tab-list';
import { onLoad } from '@dcloudio/uni-app';
import { useTabStore } from 'stores/tab'

const tabStore = useTabStore();

const handleChange = (e: any) => {
  uni.switchTab({
    url: '/' + tabList[e.value].pagePath,
  });
};

onLoad(() => {
  const pages = getCurrentPages();
  const index = tabList.findIndex((item) => item.pagePath === pages[pages.length - 1].route);
  tabStore.current = index !== -1 ? index : 0;
});
</script>
