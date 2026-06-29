// pages/coupon/coupon.js

var app = getApp();

Page({
    data: {
      //用于显示页面中的加载中的效果
      isLoading: true,
      //定义的优惠券的数组  // available, received, used
      couponList: [],
      
    },
  
    //页面一加载就会执行的方法
    onLoad() {
      var that = this;
      //定时2s之后隐藏加载中的效果
      setTimeout(()=>{
         this.setData({
             isLoading :false
         })
         //往后端发送请求，获取所有的系统优惠券
         wx.request({
           url: app.globalData.baseUrl+'/wx/getAllCoupon',
           success(res){
              that.setData({
                  couponList : res.data.data
              })
           }
         })
      },2000)
     
    },
  
    
    // 领取优惠券
    handleGetCoupon(e) {
      //判断当前用户是否完成了登录效果
      //领取优惠券之前先要判断用户是否完成登录
      var isLogin = app.globalData.isLogin;
      if(isLogin == false){
        setTimeout(()=>{
            wx.showToast({
                title: '你还未登录',
                icon : 'none'
            })
        },500)
        //提示完毕之后，给与用户进行页面的通知，跳转到profile页面进行登录
        setTimeout(()=>{
            wx.switchTab({
                url: '/pages/profile/profile',
            })
        },2200)
       
        return;
      }

      //获取你领取到的优惠券对应的id
      const couponId = e.currentTarget.dataset.id
      console.log(couponId)
      //根据id去查询优惠券数组中有没有相同的id，返回对应的索引
      const couponIndex = this.data.couponList.findIndex(item => item.id === couponId)
      //如果为-1，则说明该优惠券压根不存在，可能是有人造假
      if (couponIndex === -1) return
      
      // 显示加载中
      wx.showLoading({
        title: '领取中...',
        mask: true
      })
      
      // 模拟API请求
      setTimeout(() => {
        // 更新优惠券状态：newCouponList就是更新之后的优惠券数组
        //const newCouponList = [...this.data.couponList]
        //将此优惠券的状态改成  received  已领取
        //newCouponList[couponIndex].status = 'received'
        //修改优惠券数组
        // this.setData({
        //   couponList: newCouponList
        // })
        //往后端发送请求，领取优惠券
        wx.request({
          url: app.globalData.baseUrl+'/wx/recevieCoupon',
          data:{
              openid : app.globalData.openid,
              couId : couponId
          },
          success(res){
             //隐藏 领取中... 的效果
             wx.hideLoading()
             wx.showToast({
               title: res.data.message,
               icon: 'success',
               //总时长：显示的时间为1.5秒
               duration: 1500
            })
          }
        })
      }, 1000)
    },
  
    // 下拉刷新---如果在手机上进行刷新，可以帮我们重新加载此页面
    onPullDownRefresh() {
      this.setData({ isLoading: true })
      this.loadCouponData()
      setTimeout(() => {
        wx.stopPullDownRefresh()
      }, 1500)
    }
  })