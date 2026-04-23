var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/adapters/mini/index.ts
var index_exports = {};
__export(index_exports, {
  createMiniAdapter: () => createMiniAdapter
});
module.exports = __toCommonJS(index_exports);
function miniRequestUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const raw = "";
  const origin = (typeof raw === "string" && raw.length > 0 ? raw : "http://127.0.0.1:3606").replace(
    /\/$/,
    ""
  );
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
var MiniStorage = class {
  getItem(key) {
    try {
      const value = uni.getStorageSync(key);
      return value !== "" ? value : null;
    } catch {
      return null;
    }
  }
  setItem(key, value) {
    uni.setStorageSync(key, value);
  }
  removeItem(key) {
    uni.removeStorageSync(key);
  }
};
var MiniFetch = class {
  /**
   * 使用 uni.request 发起请求
   * 返回兼容 Web 标准 Response 接口的对象
   */
  async fetch(url, init) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: miniRequestUrl(url),
        method: init.method?.toUpperCase() || "GET",
        data: init.body,
        header: init.headers,
        success: (res) => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusCode === 200 ? "OK" : "Error",
            headers: res.header || {},
            json: async () => res.data,
            text: async () => typeof res.data === "string" ? res.data : JSON.stringify(res.data),
            blob: async () => {
              return new Blob([JSON.stringify(res.data)], {
                type: "application/json"
              });
            }
          });
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
  /**
   * 模拟 FormData
   * 小程序环境不支持原生 FormData，使用对象模拟
   */
  FormData = class MiniFormData {
    _data = {};
    append(name, value) {
      this._data[name] = value;
    }
    /** 转换为普通对象，用于 uni.request 传输 */
    toObject() {
      return this._data;
    }
  };
};
var MiniMessage = class {
  error(message) {
    uni.showToast({
      title: message,
      icon: "none",
      duration: 3e3
    });
  }
  success(message) {
    uni.showToast({
      title: message,
      icon: "success",
      duration: 2e3
    });
  }
  warning(message) {
    uni.showToast({
      title: message,
      icon: "none",
      duration: 3e3
    });
  }
  info(message) {
    uni.showToast({
      title: message,
      icon: "none",
      duration: 2e3
    });
  }
};
var MiniCrypto = class {
  subtle = {
    /**
     * 计算消息摘要
     * 小程序环境使用简化实现（生产环境需使用加密库）
     */
    async digest(_algorithm, data) {
      const decoder = new TextDecoder();
      const dataStr = decoder.decode(data);
      const hash = await this.simpleHash(dataStr);
      const encoder = new TextEncoder();
      return encoder.encode(hash).buffer;
    },
    /**
     * 导入密钥（简化实现）
     */
    async importKey(_format, _keyData, algorithm, extractable, keyUsages) {
      return {
        algorithm,
        extractable,
        type: "secret",
        usages: keyUsages
      };
    },
    /**
     * 签名（简化实现）
     */
    async sign(_algorithm, key, data) {
      const decoder = new TextDecoder();
      const dataStr = decoder.decode(data);
      const hash = await this.simpleHash(dataStr + JSON.stringify(key.algorithm));
      const encoder = new TextEncoder();
      return encoder.encode(hash).buffer;
    },
    /**
     * 简单的哈希函数（仅用于示例，生产环境请使用真实加密库）
     */
    async simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).padStart(64, "0");
    }
  };
};
var MiniRouter = class {
  push(url) {
    const targetUrl = url.startsWith("/") ? url : `/${url}`;
    uni.navigateTo({ url: targetUrl });
  }
  replace(url) {
    const targetUrl = url.startsWith("/") ? url : `/${url}`;
    uni.redirectTo({ url: targetUrl });
  }
  back() {
    uni.navigateBack();
  }
};
function createMiniAdapter() {
  return {
    storage: new MiniStorage(),
    fetch: new MiniFetch(),
    message: new MiniMessage(),
    crypto: new MiniCrypto(),
    router: new MiniRouter()
  };
}
