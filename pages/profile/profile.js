// 个人中心
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { store } from '../../store/store'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menuList: [
      {
        name: '我的帐本',
        navUrl: '/pages/billingRecord/billingRecord',
        navUrlType: 'tab'
      },
      {
        name: '年度总览',
        navUrl: '/profilePackage/pages/annual/annual',
        navUrlType: 'page'
      },
      {
        name: '分类管理',
        navUrl: '/profilePackage/pages/tagsManage/tagsManage',
        navUrlType: 'page'
      },
      {
        name: '账单导出',
        navUrl: '/profilePackage/pages/billExport/billExport',
        navUrlType: 'page'
      },
      {
        name: '关于',
        navUrl: '/profilePackage/pages/about/about',
        navUrlType: 'page'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['userProfile', 'useDays', 'transRecordDays', 'transRecordCount'],
      actions: ['setUserProfile']
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 与store解除绑定，清理内存
    this.storeBindings.destroyStoreBindings()
  },
  
  // 菜单点击跳转
  menuTap(e) {
    // 根据路径类型区分跳转
    if(this.data.menuList[e.target.dataset.index].navUrlType === 'tab') {
      wx.switchTab({
        url: this.data.menuList[e.target.dataset.index].navUrl,
      })
    } else {
      wx.navigateTo({
        url: this.data.menuList[e.target.dataset.index].navUrl,
      })
    }
  }
})