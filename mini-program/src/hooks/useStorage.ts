import { computed, Ref, ref } from 'vue';

interface Options<T> {
  initVal?: T;
  expire?: number;
}

export const VALUE_KEY = '__@LJAQ_VALUE__';
export const TIME_KEY = '__@LJAQ_TIME__';

function useStorage<T = any>(key: string, options?: Options<T>): Ref<T> {
  const { initVal, expire } = options || {};
  const actualValue = ref<any>();

  const value = computed({
    get: () => {
      const _data = uni.getStorageSync(key);
      const _value = _data?.[VALUE_KEY];

      actualValue.value = _value;
      if (initVal && _value === undefined) {
        uni.setStorage({ key, data: { [VALUE_KEY]: initVal, [TIME_KEY]: expire ? new Date().valueOf() : undefined } });
        actualValue.value = initVal;
      }

      if (_value !== undefined) {
        if (expire) {
          const storageTime = _data[TIME_KEY];
          const currentTime = new Date().valueOf();
          // isValid
          if (storageTime + expire >= currentTime) {
            value.value = _value;
            actualValue.value = _value;
          }
          uni.removeStorageSync(key);
          actualValue.value = initVal;
        }
      }
      return actualValue.value;
    },
    set: (val) => {
      actualValue.value = val;
      uni.setStorageSync(key, { [VALUE_KEY]: val, [TIME_KEY]: expire ? new Date().valueOf() : undefined });
    },
  });

  return value;
}

export default useStorage;
