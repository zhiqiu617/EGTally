// 参数type为 0 时输出"yyyy-MM-dd hh:mm:ss"格式的日期
// 参数type不为 0 时输出"yyyy-MM-dd"格式的日期
export const formatTime = (date, type=0) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  if(type === 0) {
    return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
  } else {
    return `${[year, month, day].map(formatNumber).join('-')}`
  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}


