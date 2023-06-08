// components/content/userProfile/UserProfile.js
import { storeBindingsBehavior } from 'mobx-miniprogram-bindings'
import { store } from '../../../store/store'
import { secretCode, idCode, dataUrl } from '../../../utils/privateAtribute'

Component({
  behaviors: [storeBindingsBehavior],   // 自动绑定store
  storeBindings: {
    store,
    fields: {
      userProfile: 'userProfile',
      isGetUserProfile: 'isGetUserProfile',
      lastUserDate: 'lastUserDate'
    },
    actions: {
      setUserProfile: 'setUserProfile',
      setUserBill: 'setUserBill'
    }
  },

  /**
   * 组件的属性列表
   */
  properties: {
    viewType: {
      type: String,
      value: 'bottom'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    canIUseGetUserProfile: false   // 是否可以获取用户信息
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取用户信息
    getUserProfile() {
      const that = this
      wx.getUserProfile({
        desc: '用于登录小程序获取历史数据',
        success: (res) => {
          const {avatarUrl, nickName} = res.userInfo
          const userInfo = {avatarUrl, nickName}
          wx.login({
            success: (res) => {
              const code = res.code
              wx.request({
                url: `https://api.weixin.qq.com/sns/jscode2session?appid=${idCode}&secret=${secretCode}&js_code=${code}&grant_type=authorization_code`,
                success: (res) => {
                  userInfo.userId = res.data.openid
                  userInfo.lastUseDate = new Date().getTime()
                  that.requestUserProfile(userInfo)
                },
                fail: (err) => {
                  console.log('requestSession:', err);
                }
              })
            },
            fail: (err) => {
              console.log('login:', err);
            }
          })
        },
        fail: (err) => {
          wx.showToast({
            title: '登录失败!',
            icon: 'none'
          })
        }
      })
    },

    // 向后台请求检查当前用户数据，并返回更多信息
    requestUserProfile(userInfo) {
      const that = this
      wx.request({
        url: dataUrl,
        data: {
          methodName: 'getUserInfo',
          userInfo: userInfo
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          console.log('***请求数据成功***', res);
          userInfo.firstUseDate = res.data[0].firstUseDate
          userInfo.lastUseDate = res.data[0].lastUseDate
          // 将用户信息保存至store
          that.setUserProfile(userInfo)
          if(res.data.length > 1 && res.data[1].length !== 0) {
            that.setUserBill(res.data[1])
          }
        },
        fail: (err) => {
          console.log('***请求数据失败***', err);
        }
      })
    }
  },

  /**
   * 生命周期函数
   */
  lifetimes: {
    attached() {
      if (wx.getUserProfile) {
        this.setData({
          canIUseGetUserProfile: true
        })
      }
    }
  }
})
