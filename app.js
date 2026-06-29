// app.js
App({
  onLaunch() {
    this.login()
  },

  login() {
    wx.login({
      success: res => {
        if (res.code) {
          console.log('获取code成功:', res.code)
          this.getOpenId(res.code)
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      },
      fail: err => {
        console.log('wx.login调用失败:', err)
      }
    })
  },

  getOpenId(code) {
    var that = this
    wx.request({
      url: that.globalData.baseUrl + '/wx/wxLogin',
      method: 'GET',
      data: {
        code: code
      },
      success: function(result) {
        console.log('获取openid响应:', result)
        if (result.data.code === 200) {
          try {
            var data = typeof result.data.data === 'string' ? JSON.parse(result.data.data) : result.data.data
            if (data.openid) {
              that.globalData.openid = data.openid
              that.globalData.isLogin = true
              console.log('openid获取成功:', data.openid)
            } else {
              console.log('openid为空，响应数据:', data)
              if (data.errcode) {
                console.log('微信API错误:', data.errcode, data.errmsg)
              }
            }
          } catch (e) {
            console.log('解析openid失败:', e)
          }
        } else {
          console.log('后端接口返回失败:', result.data.message)
        }
      },
      fail: function(err) {
        console.log('获取openid请求失败:', err)
      },
      complete: function() {
        console.log('获取openid请求完成')
      }
    })
  },

  globalData: {
    isLogin: false,
    openid: "",
    baseUrl: "http://localhost:8081"
  }
})
