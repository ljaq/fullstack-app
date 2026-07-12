import { CSSProperties } from 'vue';

export interface IView {
  type: 'rect' | 'text' | 'image' | 'qrcode';
  text?: string;
  url?: string;
  id?: string;
  /** 事实上painter中view的css属性并不完全与CSSProperties一致。 */
  /** 有一些属性painter并不支持，而当你需要开启一些“高级”能力时，属性的使用方式也与css规范不一致。 */
  /** 具体的区别我们将在下方对应的view介绍中详细讲解，在这里使用CSSProperties仅仅是为了让你享受代码提示 */
  css: CSSProperties;
}

export interface IPalette {
  background: string; // 整个模版的背景，支持网络图片的链接、纯色和渐变色
  width: string;
  height: string;
  borderRadius: string;
  views: Array<IView>;
}

export interface ICustomActionStyle {
  border: string; // 动态编辑选择框的边框样式
  scale: {
    textIcon: string; // 文字view所使用的缩放图标图片
    imageIcon: string; // 图片view所使用的缩放图标图片
  };
  delete: {
    icon: string; // 删除图标图片
  };
}
