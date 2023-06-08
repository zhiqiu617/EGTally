// 账本
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { store } from '../../store/store'
import { dataUrl } from '../../utils/privateAtribute'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 绑定store
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['userProfile','userAllBills', 'userIncomeBills', 'userExpenditureBills', 'userNewBills'],
      actions: ['updateNewFlag']
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // store立即更新
    this.storeBindings.updateStoreBindings()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 将新帐单传回后台
    console.log('新帐单：', this.data.userNewBills);
    if(this.data.userNewBills.length > 0) {
      wx.request({
        url: dataUrl,
        data: {
          methodName: 'setUserTransRecord',
          bills: this.data.userNewBills,
          userId: this.data.userProfile.userId
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          console.log('上传成功', res)
          this.updateNewFlag(res.data)
        },
        fail: (err) => {
          console.log('上传失败', err)
        }
      })
    } 
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 与store解除绑定，清理内存
    this.storeBindings.destroyStoreBindings()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // store立即更新
    this.storeBindings.updateStoreBindings()
  },

  // van-tab切换
  onChange(e) {
    this.setData({
      currentIndex: e.detail.index
    })
  }
})