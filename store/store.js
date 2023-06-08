import { observable, action } from 'mobx-miniprogram'
import { formatTime } from '../utils/util'

export const store = observable({
  userProfile: {},   // 用户信息
  isGetUserProfile: false,   // 是否已获取用户信息
  userBills: [],

  // 获取最近使用时间
  get lastUserDate() {
    return formatTime(new Date(this.userProfile.lastUseDate), 1)
  },

  // 获取使用天数
  get useDays() {
    let days = (this.userProfile.lastUseDate - this.userProfile.firstUseDate) / (24 * 3600 * 1000) + 1
    return days ? Math.ceil(days) : 1
  },
  
  // 获取记账天数
  get transRecordDays() {
    // 根据transDate日期去重，获得天数
    const res = new Map()
    let arr = this.userBills.filter((item) => !res.has(item.transDate) && res.set(item.transDate, 1))
    return arr ? arr.length : 0
  },
  
  // 获取记账笔数
  get transRecordCount() {
    return this.userBills.length
  },

  // 获取用户全部账单（使用slice()将其转为原生array）
  get userAllBills() {
    return this.userBills.slice()
  },
  // 获取用户收入账单
  get userIncomeBills() {
    return this.userBills.filter(item => item.transTypeName === '收入')
  },
  // 获取用户支出账单
  get userExpenditureBills() {
    return this.userBills.filter(item => item.transTypeName === '支出')
  },
  // 获取用户新增加的账单
  get userNewBills() {
    return this.userBills.filter(item => item.newFlag === true)
  },

  // 保存用户信息
  setUserProfile: action(function(userInfo) {
    this.userProfile = userInfo
    this.isGetUserProfile = true
    console.log('---userInfo(store)---', this.userProfile);
  }),

  // 保存新的交易记录
  setUserBill: action(function(bills, mode=0) {
    if(mode === 1) {
      // 根据transDate日期大小进行完成插入
      const insertIndex = this.userBills.findIndex(item => {
        const itemDate = new Date(item.transDate)
        const billsDate = new Date(bills.transDate)
        return itemDate > billsDate
      })

      if(insertIndex >= 0) {
        this.userBills.splice(insertIndex, 0, bills)
      } else {
        this.userBills.push(bills)
      }
    } else {
      // 默认直接添加到userBills
      // 升序排序
      bills.sort(function(a, b) {
        return new Date(a.transDate) - new Date(b.transDate)
      })
      this.userBills.push(...bills)
    }
    console.log('当前交易记录：', this.userBills.slice());
  }),

  // 修改已插入数据库的账单的newFlag标记
  updateNewFlag: action(function(recordList) {
    recordList.forEach(item => {
      this.userBills.find(bill => bill.createDateTime === item).newFlag = false
    })
    console.log(this.userBills.slice());
  })
})