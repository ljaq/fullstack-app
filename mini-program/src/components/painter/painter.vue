<template>
  <view :style="`position: relative;${customStyle || ''};${data.dainterStyle}`">
    <template v-if="!use2D">
      <canvas canvas-id="photo" :style="`${data.photoStyle};position: absolute; left: -9999px; top: -9999rpx;`" />
      <block wx:if="{{dancePalette}}">
        <canvas canvas-id="bottom" :style="`${data.painterStyle};position: absolute;`" />
        <canvas canvas-id="k-canvas" :style="`${data.painterStyle};position: absolute;`" />
        <canvas canvas-id="top" :style="`${data.painterStyle};position: absolute;`" />
        <canvas
          canvas-id="front"
          :style="`${data.painterStyle};position: absolute;`"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchCancel"
          :disable-scroll="true"
        />
      </block>
    </template>
    <template v-if="use2D">
      <canvas type="2d" id="photo" :style="`${data.photoStyle};position: absolute;`" />
    </template>
  </view>
</template>
<script>
import Pen, { penCache, clearPenCache } from './lib/pen'
import Downloader from './lib/downloader'
import WxCanvas from './lib/wx-canvas'

import util from './lib/util.js'
import calc from './lib/calc.js'
import { h } from 'vue'

const downloader = new Downloader()

// 最大尝试的绘制次数
const MAX_PAINT_COUNT = 5
const ACTION_DEFAULT_SIZE = 24
const ACTION_OFFSET = '2rpx'
export default {
  data() {
    return {
      data: {
        picURL: '',
        showCanvas: true,
        painterStyle: '',
        /** 根节点占位：canvas 均为 absolute，需显式宽高参与文档流排版 */
        dainterStyle: '',
        photoStyle: '',
      },
      canvasWidthInPx: 0,
      canvasHeightInPx: 0,
      canvasNode: null,
      paintCount: 0,
      currentPalette: {},
      outterDisabled: false,
      isDisabled: false,
      needClear: false,

      touchedView: {},
      findedIndex: -1,

      startX: 0,
      startY: 0,
      startH: 0,
      startW: 0,
      isScale: false,
      startTimeStamp: 0,

      hasMove: false,
      /** 四角缩放：{ corner, initL, initT, initR, initB, initW, initH } */
      cornerResize: null,
      properties: {},
    }
  },
  props: {
    use2D: {
      type: Boolean,
    },
    customStyle: {
      type: String,
    },
    // 运行自定义选择框和删除缩放按钮
    customActionStyle: {
      type: Object,
    },
    palette: {
      type: Object,
    },
    dancePalette: {
      type: Object,
    },
    // 缩放比，会在传入的 palette 中统一乘以该缩放比
    scaleRatio: {
      type: Number,
      value: 1,
    },
    widthPixels: {
      type: Number,
      value: 0,
    },
    // 启用脏检查，默认 false
    dirty: {
      type: Boolean,
      value: false,
    },
    LRU: {
      type: Boolean,
      value: false,
    },
    action: {
      type: Object,
    },
    disableAction: {
      type: Boolean,
    },
    clearActionBox: {
      type: Boolean,
    },
  },
  watch: {
    palette: {
      handler: function (newVal, oldVal) {
        console.log(newVal, oldVal)

        if (this.isNeedRefresh(newVal, oldVal)) {
          setTimeout(() => {
            this.paintCount = 0
            clearPenCache()
            this.startPaint()
          }, 20)
        }
      },
      immediate: true,
    },
    dancePalette(newVal, oldVal) {
      if (!this.isEmpty(newVal) && !this.properties.use2D) {
        clearPenCache()
        this.initDancePalette(newVal)
      }
    },
    scaleRatio(newVal, oldVal) {
      if (this.properties.use2D) {
        return
      }
      if (oldVal === undefined) {
        return
      }
      if (newVal === oldVal) {
        return
      }
      if (!this.properties.dancePalette || this.isEmpty(this.properties.dancePalette)) {
        return
      }
      clearPenCache()
      this.initDancePalette()
    },
    action(newVal, oldVal) {
      if (newVal && !this.isEmpty(newVal) && !this.properties.use2D) {
        this.doAction(newVal, null, false, true)
      }
    },
    disableAction(isDisabled) {
      this.outterDisabled = isDisabled
      this.isDisabled = isDisabled
    },
    clearActionBox(needClear) {
      if (needClear && !this.needClear) {
        if (this.frontContext) {
          setTimeout(() => {
            this.frontContext.draw()
          }, 100)
          this.touchedView = {}
          this.prevFindedIndex = this.findedIndex
          this.findedIndex = -1
        }
      }
      this.needClear = needClear
    },
  },
  created() {
    console.log('ccccccreadted')

    this.properties = this
  },
  methods: {
    setData(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          this.data[key] = obj[key]
        }
      }
    },
    /**
     * 判断一个 object 是否为 空
     * @param {object} object
     */
    isEmpty(object) {
      for (const i in object) {
        return false
      }
      return true
    },

    isNeedRefresh(newVal, oldVal) {
      if (!newVal || this.isEmpty(newVal) || (this.data.dirty && util.equal(newVal, oldVal))) {
        return false
      }
      return true
    },

    getBox(rect, type) {
      const scaleMul = this.scaleRatio > 0 ? this.scaleRatio : 1
      const cPx = v => `${v / scaleMul}px`
      const boxArea = {
        type: 'rect',
        css: {
          height: cPx(rect.bottom - rect.top),
          width: cPx(rect.right - rect.left),
          left: cPx(rect.left),
          top: cPx(rect.top),
          borderWidth: '4rpx',
          borderColor: '#1A7AF8',
          color: 'transparent',
        },
      }
      if (type === 'text') {
        boxArea.css = Object.assign({}, boxArea.css, {
          borderStyle: 'dashed',
        })
      }
      if (this.properties.customActionStyle && this.properties.customActionStyle.border) {
        boxArea.css = Object.assign({}, boxArea.css, this.properties.customActionStyle.border)
      }
      Object.assign(boxArea, {
        id: 'box',
      })
      return boxArea
    },
    getScaleIcon(rect, type) {
      let scaleArea = {}
      const { customActionStyle } = this.properties
      const scaleMul = this.scaleRatio > 0 ? this.scaleRatio : 1
      const cPx = v => `${v / scaleMul}px`
      const sc = customActionStyle && customActionStyle.scale
      const scaleUrl = sc ? (type === 'text' ? sc.textIcon || sc.icon : sc.imageIcon || sc.icon) : ''
      if (scaleUrl) {
        scaleArea = {
          type: 'image',
          url: scaleUrl,
          css: {
            height: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            width: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            borderRadius: `${ACTION_DEFAULT_SIZE}rpx`,
          },
        }
      } else {
        scaleArea = {
          type: 'rect',
          css: {
            height: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            width: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            borderRadius: `${ACTION_DEFAULT_SIZE}rpx`,
            color: 'rgba(46, 125, 50, 0.95)',
            borderWidth: '2rpx',
            borderColor: 'rgba(255, 255, 255, 0.88)',
          },
        }
      }
      scaleArea.css = Object.assign({}, scaleArea.css, {
        align: 'center',
        left: cPx(rect.right + ACTION_OFFSET.toPx()),
        top:
          type === 'text'
            ? cPx(rect.top - ACTION_OFFSET.toPx() - scaleArea.css.height.toPx() / 2)
            : cPx(rect.bottom - ACTION_OFFSET.toPx() - scaleArea.css.height.toPx() / 2),
      })
      Object.assign(scaleArea, {
        id: 'scale',
      })
      return scaleArea
    },
    getDeleteIcon(rect) {
      let deleteArea = {}
      const { customActionStyle } = this.properties
      const scaleMul = this.scaleRatio > 0 ? this.scaleRatio : 1
      const cPx = v => `${v / scaleMul}px`
      if (customActionStyle && customActionStyle.delete && customActionStyle.delete.icon) {
        deleteArea = {
          type: 'image',
          url: customActionStyle.delete.icon,
          css: {
            height: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            width: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            borderRadius: `${ACTION_DEFAULT_SIZE}rpx`,
          },
        }
      } else {
        deleteArea = {
          type: 'rect',
          css: {
            height: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            width: `${2 * ACTION_DEFAULT_SIZE}rpx`,
            borderRadius: `${ACTION_DEFAULT_SIZE}rpx`,
            color: 'rgba(220, 53, 69, 0.95)',
            borderWidth: '2rpx',
            borderColor: 'rgba(255, 255, 255, 0.88)',
          },
        }
      }
      const dw = deleteArea.css.width.toPx()
      const dh = deleteArea.css.height.toPx()
      deleteArea.css = Object.assign({}, deleteArea.css, {
        align: 'center',
        left: cPx(rect.left + (rect.right - rect.left) / 2),
        top: cPx(rect.top - dh),
      })
      Object.assign(deleteArea, {
        id: 'delete',
      })
      return deleteArea
    },
    /** cornerScale 时四角缩放手势无缩放「按钮」，在选框角上画小圆点提示可拖角缩放（不参与命中，命中仍用 hitCorner） */
    cornerScaleDecorations(rect) {
      const scaleMul = this.scaleRatio > 0 ? this.scaleRatio : 1
      const cPx = v => `${v / scaleMul}px`
      const half = '20rpx'.toPx() / 2
      const dotCss = {
        width: '20rpx',
        height: '20rpx',
        borderRadius: '10rpx',
        color: 'rgba(46, 125, 50, 0.88)',
        borderWidth: '2rpx',
        borderColor: 'rgba(255, 255, 255, 0.85)',
      }
      return [
        { type: 'rect', css: { ...dotCss, left: cPx(rect.left - half), top: cPx(rect.top - half) } },
        { type: 'rect', css: { ...dotCss, left: cPx(rect.right - half), top: cPx(rect.top - half) } },
        { type: 'rect', css: { ...dotCss, left: cPx(rect.left - half), top: cPx(rect.bottom - half) } },
        { type: 'rect', css: { ...dotCss, left: cPx(rect.right - half), top: cPx(rect.bottom - half) } },
      ]
    },
    doAction(action, callback, isMoving, overwrite) {
      if (this.properties.use2D) {
        return
      }
      let newVal = null
      if (action) {
        newVal = action.view
      }
      if (newVal && newVal.id && this.touchedView.id !== newVal.id) {
        // 带 id 的动作给撤回时使用，不带 id，表示对当前选中对象进行操作
        const { views } = this.currentPalette
        for (let i = 0; i < views.length; i++) {
          if (views[i].id === newVal.id) {
            // 跨层回撤，需要重新构建三层关系
            this.touchedView = views[i]
            this.findedIndex = i
            this.sliceLayers()
            break
          }
        }
      }

      const doView = this.touchedView

      if (!doView || this.isEmpty(doView)) {
        return
      }
      if (newVal && newVal.css) {
        if (overwrite) {
          doView.css = newVal.css
        } else if (Array.isArray(doView.css) && Array.isArray(newVal.css)) {
          doView.css = Object.assign({}, ...doView.css, ...newVal.css)
        } else if (Array.isArray(doView.css)) {
          doView.css = Object.assign({}, ...doView.css, newVal.css)
        } else if (Array.isArray(newVal.css)) {
          doView.css = Object.assign({}, doView.css, ...newVal.css)
        } else {
          doView.css = Object.assign({}, doView.css, newVal.css)
        }
      }
      if (newVal && newVal.rect) {
        doView.rect = newVal.rect
      }
      if (newVal && newVal.url && doView.url && newVal.url !== doView.url) {
        downloader
          .download(newVal.url, this.properties.LRU)
          .then(path => {
            if (newVal.url.startsWith('https')) {
              doView.originUrl = newVal.url
            }
            doView.url = path
            uni.getImageInfo({
              src: path,
              success: res => {
                doView.sHeight = res.height
                doView.sWidth = res.width
                this.reDraw(doView, callback, isMoving)
              },
              fail: () => {
                this.reDraw(doView, callback, isMoving)
              },
            })
          })
          .catch(error => {
            // 未下载成功，直接绘制
            console.error(error)
            this.reDraw(doView, callback, isMoving)
          })
      } else {
        if (newVal && Object.prototype.hasOwnProperty.call(newVal, 'text') && newVal.text !== doView.text) {
          doView.text = newVal.text
          if (doView.id) clearPenCache(doView.id)
        }
        if (
          newVal &&
          Object.prototype.hasOwnProperty.call(newVal, 'content') &&
          newVal.content !== doView.content
        ) {
          doView.content = newVal.content
          if (doView.id) clearPenCache(doView.id)
        }
        this.reDraw(doView, callback, isMoving)
      }
    },

    reDraw(doView, callback, isMoving) {
      const draw = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        views: this.isEmpty(doView) ? [] : [doView],
      }
      const pen = new Pen(this.globalContext, draw)

      pen.paint(callbackInfo => {
        callback && callback(callbackInfo)
        this.$emit('viewUpdate', {
          view: this.touchedView,
        })
      })

      const { rect, css, type } = doView

      this.block = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        views: this.isEmpty(doView) ? [] : [this.getBox(rect, doView.type)],
      }
      if (css && css.cornerScale) {
        this.cornerScaleDecorations(rect).forEach(v => this.block.views.push(v))
      }
      if (css && css.scalable && !css.cornerScale) {
        this.block.views.push(this.getScaleIcon(rect, type))
      }
      if (css && css.deletable) {
        this.block.views.push(this.getDeleteIcon(rect))
      }
      const topBlock = new Pen(this.frontContext, this.block)
      topBlock.paint()
    },

    isInView(x, y, rect) {
      return x > rect.left && y > rect.top && x < rect.right && y < rect.bottom
    },

    isInDelete(x, y) {
      for (const view of this.block.views) {
        if (view.id === 'delete') {
          return x > view.rect.left && y > view.rect.top && x < view.rect.right && y < view.rect.bottom
        }
      }
      return false
    },

    isInScale(x, y) {
      for (const view of this.block.views) {
        if (view.id === 'scale') {
          return x > view.rect.left && y > view.rect.top && x < view.rect.right && y < view.rect.bottom
        }
      }
      return false
    },

    onClick() {
      const x = this.startX
      const y = this.startY
      const totalLayerCount = this.currentPalette.views.length
      let canBeTouched = []
      let isDelete = false
      let deleteIndex = -1
      for (let i = totalLayerCount - 1; i >= 0; i--) {
        const view = this.currentPalette.views[i]
        const { rect } = view
        if (this.touchedView && this.touchedView.id && this.touchedView.id === view.id && this.isInDelete(x, y, rect)) {
          canBeTouched.length = 0
          deleteIndex = i
          isDelete = true
          break
        }
        if (this.isInView(x, y, rect)) {
          canBeTouched.push({
            view,
            index: i,
          })
        }
      }
      this.touchedView = {}
      if (canBeTouched.length === 0) {
        this.findedIndex = -1
      } else {
        let i = 0
        const touchAble = canBeTouched.filter(item => Boolean(item.view.id))
        if (touchAble.length === 0) {
          this.findedIndex = canBeTouched[0].index
        } else {
          for (i = 0; i < touchAble.length; i++) {
            if (this.findedIndex === touchAble[i].index) {
              i++
              break
            }
          }
          if (i === touchAble.length) {
            i = 0
          }
          this.touchedView = touchAble[i].view
          this.findedIndex = touchAble[i].index
          this.$emit('viewClicked', {
            view: this.touchedView,
          })
        }
      }
      if (this.findedIndex < 0 || (this.touchedView && !this.touchedView.id)) {
        // 证明点击了背景 或无法移动的view
        this.frontContext.draw()
        if (isDelete) {
          this.$emit('touchEnd', {
            view: this.currentPalette.views[deleteIndex],
            index: deleteIndex,
            type: 'delete',
          })
          this.doAction()
        } else if (this.findedIndex < 0) {
          this.$emit('viewClicked', {})
        }
        this.findedIndex = -1
        this.prevFindedIndex = -1
      } else if (this.touchedView && this.touchedView.id) {
        this.sliceLayers()
      }
    },

    sliceLayers() {
      const bottomLayers = this.currentPalette.views.slice(0, this.findedIndex)
      const topLayers = this.currentPalette.views.slice(this.findedIndex + 1)
      const bottomDraw = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        background: this.currentPalette.background,
        views: bottomLayers,
      }
      const topDraw = {
        width: this.currentPalette.width,
        height: this.currentPalette.height,
        views: topLayers,
      }
      if (this.prevFindedIndex < this.findedIndex) {
        new Pen(this.bottomContext, bottomDraw).paint()
        this.doAction()
        new Pen(this.topContext, topDraw).paint()
      } else {
        new Pen(this.topContext, topDraw).paint()
        this.doAction()
        new Pen(this.bottomContext, bottomDraw).paint()
      }
      this.prevFindedIndex = this.findedIndex
    },

    hitCorner(x, y, rect, margin) {
      const corners = [
        { k: 'tl', cx: rect.left, cy: rect.top },
        { k: 'tr', cx: rect.right, cy: rect.top },
        { k: 'bl', cx: rect.left, cy: rect.bottom },
        { k: 'br', cx: rect.right, cy: rect.bottom },
      ]
      for (let i = 0; i < corners.length; i++) {
        const c = corners[i]
        if (Math.abs(x - c.cx) <= margin && Math.abs(y - c.cy) <= margin) {
          return c.k
        }
      }
      return null
    },

    /** 四角缩放手势热区（rpx→px），略大于可视角标，避免误触可适当减小 */
    cornerHitSlopPx() {
      try {
        const m = '34rpx'.toPx()
        return Math.max(22, m)
      } catch (e) {
        return 28
      }
    },

    onTouchStart(event) {
      if (this.isDisabled) {
        return
      }
      const { x, y } = event.touches[0]
      this.startX = x
      this.startY = y
      this.startTimeStamp = new Date().getTime()
      this.cornerResize = null
      if (this.touchedView && !this.isEmpty(this.touchedView)) {
        const { rect } = this.touchedView
        const css = this.touchedView.css || {}
        if (css.backgroundPanOnly) {
          this.isScale = false
          return
        }
        /** 删除钮与右上角拖角重叠时，须优先删除，否则 isScale 会阻止 onClick 触发删除 */
        if (this.isInDelete(x, y)) {
          this.isScale = false
          return
        }
        if (this.isInScale(x, y)) {
          this.isScale = true
          this.startH = rect.bottom - rect.top
          this.startW = rect.right - rect.left
          return
        }
        const corner = this.hitCorner(x, y, rect, this.cornerHitSlopPx())
        if (corner && css.cornerScale) {
          this.isScale = true
          this.cornerResize = {
            corner,
            initL: rect.left,
            initT: rect.top,
            initR: rect.right,
            initB: rect.bottom,
            initW: rect.right - rect.left,
            initH: rect.bottom - rect.top,
          }
          return
        }
        this.isScale = false
      } else {
        this.isScale = false
      }
    },

    onTouchEnd(e) {
      if (this.isDisabled) {
        return
      }
      const current = new Date().getTime()
      if (current - this.startTimeStamp <= 500 && !this.hasMove) {
        !this.isScale && this.onClick(e)
      } else if (this.touchedView && !this.isEmpty(this.touchedView)) {
        this.$emit('touchEnd', {
          view: this.touchedView,
        })
      }
      this.hasMove = false
      this.cornerResize = null
    },

    onTouchCancel(e) {
      if (this.isDisabled) {
        return
      }
      this.onTouchEnd(e)
    },

    onTouchMove(event) {
      if (this.isDisabled) {
        return
      }
      this.hasMove = true
      if (!this.touchedView || (this.touchedView && !this.touchedView.id)) {
        return
      }
      /**
       * touch 坐标与 view.rect 均在「画布 CSS 像素」空间；而 palette 里带 px 的 css 会在 pen 里经 toPx 再乘 scaleRatio。
       * 故把手势算出的画布像素写入 css 字符串时须先除以 scaleRatio，否则会每帧重复缩放导致严重漂移。
       */
      const scaleMul = this.scaleRatio > 0 ? this.scaleRatio : 1
      const cPx = v => `${v / scaleMul}px`
      const { x, y } = event.touches[0]
      const offsetX = x - this.startX
      const offsetY = y - this.startY
      const { rect, type } = this.touchedView
      const cssTv = this.touchedView.css || {}
      let css = {}

      if (!this.isScale && cssTv.backgroundPanOnly) {
        const panXStr = this.touchedView.css.panX != null ? String(this.touchedView.css.panX) : '0px'
        const panYStr = this.touchedView.css.panY != null ? String(this.touchedView.css.panY) : '0px'
        const px0 = panXStr.toPx ? panXStr.toPx() : 0
        const py0 = panYStr.toPx ? panYStr.toPx() : 0
        const dx = x - this.startX
        const dy = y - this.startY
        this.startX = x
        this.startY = y
        let px = px0 + dx
        let py = py0 + dy
        if (cssTv.mode === 'aspectCover' && this.touchedView.sWidth && this.touchedView.sHeight) {
          const W = rect.right - rect.left
          const H = rect.bottom - rect.top
          const sw = this.touchedView.sWidth
          const sh = this.touchedView.sHeight
          const sc = Math.max(W / sw, H / sh)
          const ddw = sw * sc
          const ddh = sh * sc
          const maxPx = ddw > W ? (ddw - W) / 2 : 0
          const maxPy = ddh > H ? (ddh - H) / 2 : 0
          px = Math.max(-maxPx, Math.min(maxPx, px))
          py = Math.max(-maxPy, Math.min(maxPy, py))
        }
        this.doAction(
          {
            view: {
              css: {
                panX: cPx(px),
                panY: cPx(py),
              },
            },
          },
          null,
          true,
        )
        return
      }

      if (this.isScale && this.cornerResize) {
        clearPenCache(this.touchedView.id)
        const cr = this.cornerResize
        const ratio = cr.initH / Math.max(cr.initW, 1)
        switch (cr.corner) {
          case 'br': {
            const newW = Math.max(24, cr.initW + offsetX)
            const newH = newW * ratio
            css = {
              left: cPx(cr.initL),
              top: cPx(cr.initT),
              width: cPx(newW),
              height: cPx(newH),
            }
            break
          }
          case 'tl': {
            const newW = Math.max(24, cr.initW - offsetX)
            const newH = newW * ratio
            css = {
              left: cPx(cr.initR - newW),
              top: cPx(cr.initB - newH),
              width: cPx(newW),
              height: cPx(newH),
            }
            break
          }
          case 'tr': {
            const newW = Math.max(24, cr.initW + offsetX)
            const newH = newW * ratio
            css = {
              left: cPx(cr.initL),
              top: cPx(cr.initB - newH),
              width: cPx(newW),
              height: cPx(newH),
            }
            break
          }
          case 'bl': {
            const newW = Math.max(24, cr.initW - offsetX)
            const newH = newW * ratio
            css = {
              left: cPx(cr.initR - newW),
              top: cPx(cr.initT),
              width: cPx(newW),
              height: cPx(newH),
            }
            break
          }
          default:
            css = {}
        }
        if (type === 'text') {
          delete css.height
        }
        this.doAction(
          {
            view: {
              css,
            },
          },
          null,
          true,
        )
        return
      }

      if (this.isScale) {
        clearPenCache(this.touchedView.id)
        const newW = this.startW + offsetX > 1 ? this.startW + offsetX : 1
        if (this.touchedView.css && this.touchedView.css.minWidth) {
          if (newW < this.touchedView.css.minWidth.toPx()) {
            return
          }
        }
        if (this.touchedView.rect && this.touchedView.rect.minWidth) {
          if (newW < this.touchedView.rect.minWidth) {
            return
          }
        }
        const newH = this.startH + offsetY > 1 ? this.startH + offsetY : 1
        css = {
          width: cPx(newW),
        }
        if (type !== 'text') {
          if (type === 'image') {
            css.height = cPx((newW * this.startH) / this.startW)
          } else {
            css.height = cPx(newH)
          }
        }
      } else {
        this.startX = x
        this.startY = y
        css = {
          left: cPx(rect.left + offsetX),
          top: cPx(rect.top + offsetY),
          right: undefined,
          bottom: undefined,
        }
      }
      this.doAction(
        {
          view: {
            css,
          },
        },
        null,
        !this.isScale,
      )
    },

    initScreenK() {
      if (!(getApp() && getApp().systemInfo && getApp().systemInfo.screenWidth)) {
        try {
          getApp().systemInfo = uni.getSystemInfoSync()
        } catch (e) {
          console.error(`Painter get system info failed, ${JSON.stringify(e)}`)
          return
        }
      }
      this.screenK = 0.5
      if (getApp() && getApp().systemInfo && getApp().systemInfo.screenWidth) {
        this.screenK = getApp().systemInfo.screenWidth / 750
      }
      setStringPrototype(this.screenK, this.properties.scaleRatio)
    },

    initDancePalette() {
      if (this.properties.use2D) {
        return
      }
      this.isDisabled = true
      this.initScreenK()
      this.downloadImages(this.properties.dancePalette).then(async palette => {
        this.currentPalette = palette
        const { width, height } = palette

        if (!width || !height) {
          console.error(`You should set width and height correctly for painter, width: ${width}, height: ${height}`)
          return
        }
        const wp = width.toPx()
        const hp = height.toPx()
        this.setData({
          painterStyle: `width:${wp}px;height:${hp}px;`,
          dainterStyle: `width:${wp}px;height:${hp}px;min-width:${wp}px;min-height:${hp}px;box-sizing:border-box;flex-shrink:0;`,
        })
        this.frontContext || (this.frontContext = await this.getCanvasContext(this.properties.use2D, 'front'))
        this.bottomContext || (this.bottomContext = await this.getCanvasContext(this.properties.use2D, 'bottom'))
        this.topContext || (this.topContext = await this.getCanvasContext(this.properties.use2D, 'top'))
        this.globalContext || (this.globalContext = await this.getCanvasContext(this.properties.use2D, 'k-canvas'))
        new Pen(this.bottomContext, palette, this.properties.use2D).paint(() => {
          this.isDisabled = false
          this.isDisabled = this.outterDisabled
          this.$emit('didShow')
        })
        this.globalContext.draw()
        this.frontContext.draw()
        this.topContext.draw()
      })
      this.touchedView = {}
    },

    startPaint() {
      console.log('startPaint', this.properties)

      this.initScreenK()
      const { width, height } = this.properties.palette

      if (!width || !height) {
        console.error(`You should set width and height correctly for painter, width: ${width}, height: ${height}`)
        return
      }

      // 固定 widthPixels 导出时，应用 scaleRatio 会与画布 CSS 像素不一致，Pen 绘制的宽高会偏，易出现右侧留白。
      if (this.properties.widthPixels) {
        setStringPrototype(this.screenK, 1)
      }

      let needScale = false
      // 生成图片时，根据设置的像素值重新绘制
      if (width.toPx() !== this.canvasWidthInPx) {
        this.canvasWidthInPx = width.toPx()
        needScale = this.properties.use2D
      }
      if (this.properties.widthPixels) {
        setStringPrototype(this.screenK, this.properties.widthPixels / this.canvasWidthInPx)
        this.canvasWidthInPx = this.properties.widthPixels
      }

      if (this.canvasHeightInPx !== height.toPx()) {
        this.canvasHeightInPx = height.toPx()
        needScale = needScale || this.properties.use2D
      }
      this.setData({
        photoStyle: `width:${this.canvasWidthInPx}px;height:${this.canvasHeightInPx}px;`,
      })
      this.$nextTick(() => {
        this.downloadImages(this.properties.palette).then(async palette => {
          if (!this.photoContext) {
            this.photoContext = await this.getCanvasContext(this.properties.use2D, 'photo')
          }
          if (needScale) {
            const scale = getApp().systemInfo.pixelRatio
            this.photoContext.width = this.canvasWidthInPx * scale
            this.photoContext.height = this.canvasHeightInPx * scale
            this.photoContext.scale(scale, scale)
          }
          new Pen(this.photoContext, palette).paint(() => {
            this.saveImgToLocal()
          })
          setStringPrototype(this.screenK, this.properties.scaleRatio)
        })
      })
    },

    downloadImages(palette) {
      return new Promise((resolve, reject) => {
        let preCount = 0
        let completeCount = 0
        const paletteCopy = JSON.parse(JSON.stringify(palette))
        if (paletteCopy.background) {
          preCount++
          downloader.download(paletteCopy.background, this.properties.LRU).then(
            path => {
              paletteCopy.background = path
              completeCount++
              if (preCount === completeCount) {
                resolve(paletteCopy)
              }
            },
            () => {
              completeCount++
              if (preCount === completeCount) {
                resolve(paletteCopy)
              }
            },
          )
        }
        if (paletteCopy.views) {
          for (const view of paletteCopy.views) {
            if (view && view.type === 'image' && view.url) {
              preCount++
              /* eslint-disable no-loop-func */
              downloader.download(view.url, this.properties.LRU).then(
                path => {
                  view.originUrl = view.url
                  view.url = path
                  uni.getImageInfo({
                    src: path,
                    success: res => {
                      // 获得一下图片信息，供后续裁减使用
                      view.sWidth = res.width
                      view.sHeight = res.height
                    },
                    fail: error => {
                      // 如果图片坏了，则直接置空，防止坑爹的 canvas 画崩溃了
                      console.warn(`getImageInfo ${view.originUrl} failed, ${JSON.stringify(error)}`)
                      view.url = ''
                    },
                    complete: () => {
                      completeCount++
                      if (preCount === completeCount) {
                        resolve(paletteCopy)
                      }
                    },
                  })
                },
                () => {
                  completeCount++
                  if (preCount === completeCount) {
                    resolve(paletteCopy)
                  }
                },
              )
            }
          }
        }
        if (preCount === 0) {
          resolve(paletteCopy)
        }
      })
    },

    saveImgToLocal() {
      const that = this
      const optionsOf2d = {
        canvas: that.canvasNode,
      }
      const optionsOfOld = {
        canvasId: 'photo',
        destWidth: that.canvasWidthInPx,
        destHeight: that.canvasHeightInPx,
      }
      setTimeout(() => {
        uni.canvasToTempFilePath(
          {
            ...(that.properties.use2D ? optionsOf2d : optionsOfOld),
            success: function (res) {
              that.getImageInfo(res.tempFilePath)
            },
            fail: function (error) {
              console.error(`canvasToTempFilePath failed, ${JSON.stringify(error)}`)
              that.$emit('imgErr', {
                error: error,
              })
            },
          },
          this,
        )
      }, 300)
    },

    getCanvasContext(use2D, id) {
      const that = this
      return new Promise(resolve => {
        if (use2D) {
          const query = uni.createSelectorQuery().in(that)
          const selectId = `#${id}`
          query
            .select(selectId)
            .fields({ node: true, size: true })
            .exec(res => {
              that.canvasNode = res[0].node
              const ctx = that.canvasNode.getContext('2d')
              const wxCanvas = new WxCanvas('2d', ctx, id, true, that.canvasNode)
              resolve(wxCanvas)
            })
        } else {
          const temp = uni.createCanvasContext(id, that)
          resolve(new WxCanvas('mina', temp, id, true))
        }
      })
    },

    getImageInfo(filePath) {
      const that = this
      uni.getImageInfo({
        src: filePath,
        success: infoRes => {
          if (that.paintCount > MAX_PAINT_COUNT) {
            const error = `The result is always fault, even we tried ${MAX_PAINT_COUNT} times`
            console.error(error)
            that.$emit('imgErr', {
              error: error,
            })
            return
          }
          // 比例相符时才证明绘制成功，否则进行强制重绘制
          if (
            Math.abs(
              (infoRes.width * that.canvasHeightInPx - that.canvasWidthInPx * infoRes.height) /
                (infoRes.height * that.canvasHeightInPx),
            ) < 0.01
          ) {
            that.$emit('imgOK', {
              path: filePath,
            })
          } else {
            that.startPaint()
          }
          that.paintCount++
        },
        fail: error => {
          console.error(`getImageInfo failed, ${JSON.stringify(error)}`)
          that.$emit('imgErr', {
            error: error,
          })
        },
      })
    },
  },
}

function setStringPrototype(screenK, scale) {
  /* eslint-disable no-extend-native */
  /**
   * string 到对应的 px
   * @param {Number} baseSize 当设置了 % 号时，设置的基准值
   */
  String.prototype.toPx = function toPx(_, baseSize) {
    if (this === '0') {
      return 0
    }
    const REG = /-?[0-9]+(\.[0-9]+)?(rpx|px|%)/

    const parsePx = origin => {
      const results = new RegExp(REG).exec(origin)
      if (!origin || !results) {
        console.error(`The size: ${origin} is illegal`)
        return 0
      }
      const unit = results[2]
      const value = parseFloat(origin)

      let res = 0
      if (unit === 'rpx') {
        res = Math.round(value * (screenK || 0.5) * (scale || 1))
      } else if (unit === 'px') {
        res = Math.round(value * (scale || 1))
      } else if (unit === '%') {
        res = Math.round((value * baseSize) / 100)
      }
      return res
    }
    const formula = /^calc\((.+)\)$/.exec(this)
    if (formula && formula[1]) {
      // 进行 calc 计算
      const afterOne = formula[1].replace(/([^\s\(\+\-\*\/]+)\.(left|right|bottom|top|width|height)/g, word => {
        const [id, attr] = word.split('.')
        return penCache.viewRect[id][attr]
      })
      const afterTwo = afterOne.replace(new RegExp(REG, 'g'), parsePx)
      return calc(afterTwo)
    } else {
      return parsePx(this)
    }
  }
}
</script>
<style></style>
