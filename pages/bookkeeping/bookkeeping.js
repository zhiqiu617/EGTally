// 记账
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { store } from '../../store/store'
import { formatTime } from '../../utils/util'
import { dataUrl } from '../../utils/privateAtribute'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    date: formatTime(new Date(), 1),
    transTypes: [
      {id: 'type001', name: '收入'},
      {id: 'type002', name: '支出'}
    ],
    transChannels: [
      {id: 'channel001', name: '微信'},
      {id: 'channel002', name: '支付宝'},
      {id: 'channel003', name: '银行卡'},
      {id: 'channel004', name: '交通卡'},
      {id: 'channel005', name: '现金'},
    ],
    transTags: [
      {id: 'tag001', name: '日常'},
      {id: 'tag002', name: '旅游'},
      {id: 'tag003', name: '节日'},
      {id: 'tag004', name: '其他费用'}
    ],
    transCategories: [
      {id: 'category001', name: '出行'},
      {id: 'category002', name: '饮食'},
      {id: 'category003', name: '生活用品'},
      {id: 'category004', name: '娱乐'},
    ],
    currentCategoryId: 'category001',
    transAbstracts: [],   // 根据当前选择的分类进行筛选得出的摘要数据
    transAbstractsAll: [
      {id: 'abstract001', name: '地铁', categoryId: 'category001'},
      {id: 'abstract002', name: '公交', categoryId: 'category001'},
      {id: 'abstract003', name: '火车', categoryId: 'category001'},
      {id: 'abstract004', name: '飞机', categoryId: 'category001'},
      {id: 'abstract005', name: '早餐', categoryId: 'category002'},
      {id: 'abstract006', name: '午餐', categoryId: 'category002'},
      {id: 'abstract007', name: '晚餐', categoryId: 'category002'},
      {id: 'abstract008', name: '其他饮食', categoryId: 'category002'},
      {id: 'abstract009', name: '鞋服', categoryId: 'category003'},
      {id: 'abstract010', name: '洗护', categoryId: 'category003'},
      {id: 'abstract011', name: '美妆', categoryId: 'category003'},
      {id: 'abstract012', name: '会员', categoryId: 'category004'},
      {id: 'abstract013', name: '游玩项目', categoryId: 'category004'},
    ],   // 所有摘要数据
    transAmount: 0,
    maxWordLength: 200,  // 文本输入限制最大字数
    contentLength: 0,   // 内容当前输入字数
    transContent: '',
    remarkLength: 0,   // 备注当前输入字数
    transRemark: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 交易类型 and 交易渠道 默认选择第一个
    this.data.transTypes[0].checked = true;
    this.data.transChannels[0].checked = true;
    this.setData({
      transTypes: this.data.transTypes,
      transChannels: this.data.transChannels
    })

    // 获取 标签 and 分类 and 摘要 数据
    wx.request({
      url: dataUrl,
      data: {
        methodName: 'getConfigList'
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('获取数据成功', res);
        let arrList = res.data
        // 设置默认项
        arrList[0][0].checked = true;
        arrList[1][0].checked = true;
        arrList[2][0].checked = true;
        // 保存数据
        this.setData({
          transTags: arrList[0],
          transCategories: arrList[1],
          transAbstractsAll: arrList[2],
          transAbstracts: arrList[2].filter(item => 
            item.categoryId == this.data.currentCategoryId
          )
        })
      },
      fail: (err) => {
        console.log('获取数据成功', err);
      }
    })

    // 绑定store
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['userBills'],
      actions: ['setUserBill']
    })
  },

    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.formReset()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 与store解除绑定，清理内存
    this.storeBindings.destroyStoreBindings()
  },

  /**
   * 页面事件
   */
  // 日期选择
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  // 交易类型选择
  transTypeTap(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id
    this.setData({
      transTypes: this.tapButtonChecked(this.data.transTypes, id)
    })
  },

  // 交易渠道选择
  transChannelTap(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id
    this.setData({
      transChannels: this.tapButtonChecked(this.data.transChannels, id)
    })
  },

  // 标签选择
  transTagTap(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id
    this.setData({
      transTags: this.tapButtonChecked(this.data.transTags, id)
    })
  },

  // 分类选择
  transCategoryTap(e) {
    console.log(e)
    this.setData({
      currentCategoryId: e.currentTarget.dataset.id,
      transCategories: this.tapButtonChecked(this.data.transCategories, e.currentTarget.dataset.id)
    })
    // 根据分类的id筛选对应的摘要数据
    let abstractList = this.data.transAbstractsAll.filter(item => 
      item.categoryId == this.data.currentCategoryId)
    abstractList[0].checked = true
    this.setData({
      transAbstracts: abstractList
    })
  },
  
  // 摘要选择
  transAbstractTap(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id
    this.setData({
      transAbstracts: this.tapButtonChecked(this.data.transAbstracts, id)
    })
  },

  // 金额修正
  priceEdit(e) {
    this.setData({
      transAmount: this.correctPrice(e.detail.value)  //money匹配金额输入规则，返回输入值
    });
  },
  // 内容字数检查
  getContentLength(e) {
    let len = e.detail.value.length
    if(len > this.data.maxWordLength) {
      return
    }
    this.setData({
      contentLength: parseInt(len)
    })
  },
  // 备注字数检查
  getRemarkLength(e) {
    let len = e.detail.value.length
    if(len > this.data.maxWordLength) {
      return
    }
    this.setData({
      remarkLength: parseInt(len)
    })
  },

  // 表单提交
  formSubmit(e) {
    // 整理提交内容
    const obj = {}
    obj.createDateTime = new Date().getTime()    // 时间戳作为该明细的唯一id
    obj.transDate = e.detail.value.pickerDate
    obj.transTypeId = this.data.transTypes.find((item) => item.checked) ? this.data.transTypes.find((item) => item.checked).id : this.data.transTypes[0].id
    obj.transTypeName = this.data.transTypes.find((item) => item.checked) ? this.data.transTypes.find((item) => item.checked).name : this.data.transTypes[0].name
    obj.transChannelId = this.data.transChannels.find((item) => item.checked) ? this.data.transChannels.find((item) => item.checked).id : this.data.transChannels[0].id
    obj.transChannelName = this.data.transChannels.find((item) => item.checked) ? this.data.transChannels.find((item) => item.checked).name : this.data.transChannels[0].name
    obj.transTagId = this.data.transTags.find((item) => item.checked) ? this.data.transTags.find((item) => item.checked).id : this.data.transTags[0].id
    obj.transTagName = this.data.transTags.find((item) => item.checked) ? this.data.transTags.find((item) => item.checked).name : this.data.transTags[0].name
    obj.transCategoryId = this.data.transCategories.find((item) => item.checked) ? this.data.transCategories.find((item) => item.checked).id : this.data.transCategories[0].id
    obj.transCategoryName = this.data.transCategories.find((item) => item.checked) ? this.data.transCategories.find((item) => item.checked).name : this.data.transCategories[0].name
    obj.transAbstractId = this.data.transAbstracts.find((item) => item.checked) ? this.data.transAbstracts.find((item) => item.checked).id : this.data.transAbstracts[0].id
    obj.transAbstractName = this.data.transAbstracts.find((item) => item.checked) ? this.data.transAbstracts.find((item) => item.checked).name : this.data.transAbstracts[0].name
    obj.transAmount = parseFloat(e.detail.value.inputPrice)
    obj.transContent = e.detail.value.textareaContent
    obj.transRemark = e.detail.value.textareaRemark
    obj.newFlag = true     // 标记为新数据
    // 保存至store
    this.setUserBill(obj, 1)

    wx.showToast({
      title: '保存成功!',
      icon: 'none'
    })

    // 重置表单
    this.formReset()
  },

  // 表单重置
  formReset() {
    this.setData({
      date: formatTime(new Date(), 1),
      transTypes: this.tapButtonChecked(this.data.transTypes, this.data.transTypes[0].id),
      transChannels: this.tapButtonChecked(this.data.transChannels, this.data.transChannels[0].id),
      transTags: this.tapButtonChecked(this.data.transTags, this.data.transTags[0].id),
      transCategories: this.tapButtonChecked(this.data.transCategories, this.data.transCategories[0].id),
      currentCategoryId: this.data.transCategories[0].id,
      remarkLength: 0,
      transAmount: 0,
      transContent: '',
      transRemark: ''
    })
    // 根据分类的id筛选对应的摘要数据
    let abstractList = this.data.transAbstractsAll.filter(item => 
      item.categoryId == this.data.currentCategoryId)
    abstractList[0].checked = true
    this.setData({
      transAbstracts: abstractList
    })
  },

  /**
   * 自定义函数
   */
  // 修改checked值
  tapButtonChecked(arrList, id) {
    for (let i = 0; i < arrList.length; i++) {
      if (arrList[i].id === id) {
        //当前点击的位置为true即选中
        arrList[i].checked = true;    
      }
      else {
        //其他的位置为false
        arrList[i].checked = false;
      }
    }
    return arrList
  },

  // 金额修正
  correctPrice(value) {
    let num = value.toString(); //先转换成字符串类型
    // 第一位就是"." ， 在前添加 0
    if (num.indexOf('.') == 0) { 
      num = '0' + num
    }
    num = num.replace(/[^\d.]/g, "");   // 清除 数字 和"."以外的字符
    num = num.replace(/\.{2,}/g, ".");   // 只保留第一个"."，清除多余的
    num = num.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    num = num.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');   // 只能输入两个小数
    if (num.indexOf(".") < 0 && num != "") {
      num = parseFloat(num);
    }
    return num
  }
})