// pages/shot/index.js
const device = wx.getSystemInfoSync();
const width = device.windowWidth;
const height = device.windowHeight;
const TOUCH_STATE = ['touchstarted', 'touchmoved', 'touchended'];

Page({
  oldScale: 1,
  newScale: 1,
  imgLeft: 0,
  imgTop: 0,
  scaleWidth: 350,
  scaleHeihgt: 667,
  deviceRadio: device.windowWidth / 750,
  cropperTarget: '',
  rectX: 0,
  rectY: 0,
  baseWidth: 350,
  baseHeight: 667,
  /**
   * 页面的初始数据
   */
  data: {
    id: 'cropper',
    width: width, // 画布宽度
    height: height, // 画布高度
    scale: 2.5, // 最大缩放倍数
    zoom: 5, // 缩放系数
    background: 'rgba(0,0,0,0.6)',
    src: '',
    cut: {
      x: (width - 200) / 2, // 裁剪框x轴起点
      y: (width - 200) / 2, // 裁剪框y轴期起点
      width: 200, // 裁剪框宽度
      height: 200 // 裁剪框高度
    },
    avatarImg: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {
      url
    } = options;
    this.setData({
      src: url || wx.getStorageSync('imageUrl')
    })

    this.init();

  },

  init() {
    const {
      id,
      src
    } = this.data;
    this.ctx = wx.createCanvasContext(id);

    this.cutt();
    this.imageInit();
    this.setTouchState(this, false, false, false);
    this.update();
  },

  cutt() {
    let self = this.data;
    let boundWidth = self.width;
    let boundHeight = self.height;
    let ref = self.cut;
    let x = ref.x;
    if (x === void 0) x = 0;
    let y = ref.y;
    if (y === void 0) y = 0;
    let width = ref.width;
    if (width === void 0) width = boundWidth;
    let height = ref.height;
    if (height === void 0) height = boundHeight;


  },

  /**
   * 设置边界
   * @param imgLeft 图片左上角横坐标值
   * @param imgTop 图片左上角纵坐标值
   */
  outsideBound(imgLeft, imgTop) {
    let self = this.data;
    let boundWidth = self.width;
    let boundHeight = self.height;
    let ref = self.cut;
    if (ref === void 0) ref = {};
    let x = ref.x;
    if (x === void 0) x = 0;
    let y = ref.y;
    if (y === void 0) y = 0;
    let width = ref.width;
    if (width === void 0) width = boundWidth;
    let height = ref.height;
    if (height === void 0) height = boundHeight;

    this.imgLeft = imgLeft >= x ?
      x :
      this.scaleWidth + imgLeft - x <= width ?
        x + width - this.scaleWidth :
        imgLeft;

    this.imgTop = imgTop >= y ?
      y :
      this.scaleHeihgt + imgTop - y <= height ?
        y + height - this.scaleHeihgt :
        imgTop;

  },

  setBoundStyle() {
    let self = this.data;
    let boundWidth = self.width;
    let boundHeight = self.height;
    let ref = self.cut;
    if (ref === void 0) ref = {};
    let x = ref.x;
    if (x === void 0) x = 0;
    let y = ref.y;
    if (y === void 0) y = 0;
    let width = ref.width;
    if (width === void 0) width = boundWidth;
    let height = ref.height;
    if (height === void 0) height = boundHeight;


    let color = ref.color;
    if (color === void 0) color = '#00bd29';
    let mask = ref.mask;
    if (mask === void 0) mask = 'rgba(0,0,0,0.6)';
    let lineWidth = ref.lineWidth;
    if (lineWidth === void 0) lineWidth = 1;

    // 绘制半透明层
    this.ctx.beginPath();
    this.ctx.setFillStyle(mask);
    this.ctx.fillRect(0, 0, x, boundHeight);
    this.ctx.fillRect(x, 0, width, y);
    this.ctx.fillRect(x, y + height, width, boundHeight - y - height);
    this.ctx.fillRect(x + width, 0, boundWidth - x - width, boundHeight);
    this.ctx.fill();

    let boundOption = [{
      start: {
        x: x - lineWidth,
        y: y + 10 - lineWidth
      },
      step1: {
        x: x - lineWidth,
        y: y - lineWidth
      },
      step2: {
        x: x + 10 - lineWidth,
        y: y - lineWidth
      }
    },
    {
      start: {
        x: x - lineWidth,
        y: y + height - 10 + lineWidth
      },
      step1: {
        x: x - lineWidth,
        y: y + height + lineWidth
      },
      step2: {
        x: x + 10 - lineWidth,
        y: y + height + lineWidth
      }
    },
    {
      start: {
        x: x + width - 10 + lineWidth,
        y: y - lineWidth
      },
      step1: {
        x: x + width + lineWidth,
        y: y - lineWidth
      },
      step2: {
        x: x + width + lineWidth,
        y: y + 10 - lineWidth
      }
    },
    {
      start: {
        x: x + width + lineWidth,
        y: y + height - 10 + lineWidth
      },
      step1: {
        x: x + width + lineWidth,
        y: y + height + lineWidth
      },
      step2: {
        x: x + width - 10 + lineWidth,
        y: y + height + lineWidth
      }
    }
    ]

    boundOption.forEach((op) => {
      this.ctx.beginPath();
      this.ctx.setStrokeStyle(color);
      this.ctx.setLineWidth(lineWidth);
      this.ctx.moveTo(op.start.x, op.start.y);
      this.ctx.lineTo(op.step1.x, op.step1.y);
      this.ctx.lineTo(op.step2.x, op.step2.y);
      this.ctx.stroke();
    })
  },

  /**
   * 画布初始化
   */
  imageInit() {
    const self = this.data;
    let id = self.id;
    let deviceRadio = this.deviceRadio;
    let boundWidth = self.width;
    let boundHeight = self.height;
    let ref = self.cut;
    let x = ref.x;
    if (x === void 0) x = 0;
    let y = ref.y;
    if (y === void 0) y = 0;
    let width = ref.width;
    if (width === void 0) width = boundWidth;
    let height = ref.height;
    if (height === void 0) height = boundHeight;

    if (self.src) {
      this.getImageInfo(self.src);
    }
  },

  /**
   * 更新画布
   */
  updateCanvas() {
    console.log("updateCanvas:::", this.cropperTarget, this.imgLeft, this.imgTop, this.scaleWidth, this.scaleHeihgt)
    if (this.cropperTarget) {
      this.ctx.drawImage(this.cropperTarget, this.imgLeft, this.imgTop, this.scaleWidth, this.scaleHeihgt);
    }
    this.setBoundStyle();
    this.ctx.draw();
  },

  /**
   * 获取图片信息
   * @param src 图片地址
   */
  getImageInfo(src) {
    const {
      cut: {
        width,
        height,
        x,
        y
      }
    } = this.data;

    wx.getImageInfo({
      src: src,
      success: res => {
        console.log("获取图片的信息:::", res);
        let innerAspectRadio = res.width / res.height;
        this.cropperTarget = res.path;

        if (innerAspectRadio < width / height) {
          this.rectX = x;
          this.baseWidth = width;
          this.baseHeight = width / innerAspectRadio;
          this.rectY = y - Math.abs((height - this.baseHeight) / 2);
        } else {
          this.rectY = y;
          this.baseWidth = height * innerAspectRadio;
          this.baseHeight = height;
          this.rectX = x - Math.abs((width - this.baseWidth) / 2);
        }

        this.imgLeft = this.rectX;
        this.imgTop = this.rectY;
        this.scaleWidth = this.baseWidth;
        this.scaleHeihgt = this.baseHeight;
        this.updateCanvas();

      }
    });
  },

  /**
   * 保存图片
   */
  getCropperImage() {
    const {
      id,
      cut: {
        width,
        height,
        x,
        y
      }
    } = this.data;
    const deviceRadio = this.deviceRadio;

    let args = [],
      len = arguments.length;
    while (len--) args[len] = arguments[len];

    let ARG_TYPE = toString.call(args[0]);

    console.log("getCropperImage::", ARG_TYPE)
    switch (ARG_TYPE) {
      case '[object Object]':
        let ref = args[0];
        let qualtity = ref.qualtity;
        if (qualtity === void 0) qualtity = 10;

        if (typeof (qualtity) !== 'number') {
          console.error(('quality:' + qualtity + ' is invalid'));
        } else if (qualtity < 0 || qualtity > 10) {
          console.error('quality should be ranged in 0 ~ 10');
        }

        wx.canvasToTempFilePath({
          canvasId: id,
          x: x,
          y: y,
          width: width,
          height: height,
          destWidth: width * qualtity / (deviceRadio * 10),
          destHeight: height * qualtity / (deviceRadio * 10),
          success: (res) => {
            console.log("getCropperImage::", res.tempFilePath)
            if (res.tempFilePath) {
              wx.previewImage({
                current: '',
                urls: [res.tempFilePath],
              });

              this.setData({
                avatarImg: res.tempFilePath
              })
            }
          }
        });
        break;
      case '[object Function]':
        wx.canvasToTempFilePath({
          canvasId: id,
          x: x,
          y: y,
          width: width,
          height: height,
          destWidth: width * qualtity / (deviceRadio * 10),
          destHeight: height * qualtity / (deviceRadio * 10),
          success: (res) => {
            console.log("getCropperImage::", res.tempFilePath)
            if (res.tempFilePath) {
              wx.previewImage({
                current: '',
                urls: [res.tempFilePath],
              });

              this.setData({
                avatarImg: res.tempFilePath
              })
            }
          }
        });
        break;
    }
  },

  /**
   * 选择图片
   */
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        wx.setStorageSync('imageUrl', tempFilePaths);
        this.setData({
          src: tempFilePaths
        });
        this.getImageInfo(tempFilePaths);
      }
    })
  },

  setTouchState(instance) {
    let arg = [],
      len = arguments.length - 1;
    while (len-- > 0) arg[len] = arguments[len + 1];

    TOUCH_STATE.forEach((key, i) => {
      if (arg[i] !== undefined) {
        instance[key] = arg[i];
      }
    });
  },

  getNewScale(oldScale, oldDistance, zoom, touch0, touch1) {
    let xMove, yMove, newDistance;
    xMove = Math.round(touch1.x - touch0.x);
    yMove = Math.round(touch1.y - touch0.y);
    newDistance = Math.round(Math.sqrt(xMove * xMove + yMove * yMove));

    return oldScale + 0.001 * zoom * (newDistance - oldDistance);
  },

  update() {
    if (!this.data.src) {
      return;
    }
  },

  touchStart(e) {
    let ref = e.touches;
    let touch0 = ref[0];
    let touch1 = ref[1];
    this.setTouchState(this, true, null, null);

    if (e.touches.length === 1) {
      this.__oneTouchStart(touch0);
    }

    if (e.touches.length >= 2) {
      this.__twoTouchStart(touch0, touch1);
    }
  },

  touchMove(e) {
    let ref = e.touches;
    let touch0 = ref[0];
    let touch1 = ref[1];
    this.setTouchState(this, null, true);

    if (e.touches.length === 1) {
      this.__oneTouchMove(touch0);
    }

    if (e.touches.length >= 2) {
      this.__twoTouchMove(touch0, touch1);
    }

  },

  touchEnd(e) {
    this.setTouchState(this, false, false, true);
    this.__xTouchEnd();
  },

  __oneTouchStart(touch) {
    this.touchX0 = Math.round(touch.x);
    this.touchY0 = Math.round(touch.y);
  },

  __oneTouchMove(touch) {
    let xMove, yMove;

    if (this.touchended) {
      return this.updateCanvas();
    }

    xMove = Math.round(touch.x - this.touchX0);
    yMove = Math.round(touch.y - this.touchY0);

    let imgLeft = Math.round(this.rectX + xMove);
    let imgTop = Math.round(this.rectY + yMove);

    this.outsideBound(imgLeft, imgTop);

    this.updateCanvas();
  },

  __twoTouchStart(touch0, touch1) {
    let xMove, yMove, oldDistance;
    this.touchX1 = Math.round(this.rectX + this.scaleWidth / 2);
    this.touchY1 = Math.round(this.rectY + this.scaleHeihgt / 2);

    xMove = Math.round(touch1.x - touch0.x);
    yMove = Math.round(touch1.y - touch0.y);
    oldDistance = Math.round(Math.sqrt(xMove * xMove + yMove * xMove));

    this.oldDistance = oldDistance;
    console.log("__twoTouchMove:::", this.oldDistance)

  },

  __twoTouchMove(touch0, touch1) {
    let oldScale = this.oldScale;
    let oldDistance = this.oldDistance;
    let scale = this.data.scale;
    let zoom = this.data.zoom;

    this.newScale = this.getNewScale(oldScale, oldDistance, zoom, touch0, touch1);

    this.newScale <= 1 && (this.newScale = 1);
    this.newScale >= scale && (this.newScale = scale);

    this.scaleWidth = Math.round(this.newScale * this.baseWidth);
    this.scaleHeihgt = Math.round(this.newScale * this.baseHeight);
    let imgLeft = Math.round(this.touchX1 - this.scaleWidth / 2);
    let imgTop = Math.round(this.touchY1 - this.scaleHeihgt / 2);
    this.outsideBound(imgLeft, imgTop);
    this.updateCanvas();
  },


  __xTouchEnd() {
    this.oldScale = this.newScale;
    this.rectX = this.imgLeft;
    this.rectY = this.imgTop;
  },

  isFunction(obj) {
    return typeof obj === 'function'
  },

  onCancel() {
    wx.navigateBack({
      delta: 1
    })
  }
})