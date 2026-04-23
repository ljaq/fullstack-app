<template>
  <wd-config-provider :theme-vars="themeVars">
    <slot />
    <wd-toast />
    <wd-notify />
    <wd-dialog />
    <TabList />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import type { ConfigProviderThemeVars } from '@wot-ui/ui';
import TabList from '../components/tabbar/index.vue';

const themeVars: ConfigProviderThemeVars = {};
</script>
