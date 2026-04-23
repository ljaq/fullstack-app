import useStorage from 'hooks/useStorage';
import { defineStore } from 'pinia';

export const useTabStore = defineStore('tab', () => {
  const current = useStorage<number>('tab', { initVal: 0 });

  return { current };
});
