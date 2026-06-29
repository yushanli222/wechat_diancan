// pages/mycoupon/mycoupon.js

var app = getApp();

Page({
    data: {
       //状态切换导航
       tabs: [
        { key: 'all', name: '全部' },
        { key: 'available', name: '新到' },
        { key: 'used', name: '已使用' },
        { key: 'expired', name: '已过期' }
       ],
       //当前选中的状态
       currentTab: 'all',
       //定义一个优惠券的数组
       mycoupon : [],
       //表示页面正在加载中
       isLoading : true
    },
  
    //页面一加载我们就去执行获取我的所有优惠券信息
    onLoad() {
       this.loadCoupons();
    },

    //切换状态
    switchTab(e) {
        var key = e.currentTarget.dataset.key;
        this.setData({
            currentTab: key,
            isLoading: true
        });
        this.loadCoupons();
    },

    //加载优惠券
    loadCoupons() {
        var that = this;
        setTimeout(() => {
            wx.request({
                url: app.globalData.baseUrl + '/wx/getMyCoupons',
                data: {
                    openid: app.globalData.openid,
                    status: that.data.currentTab
                },
                success(res) {
                    that.setData({
                        mycoupon: res.data.data,
                        isLoading: false
                    });
                },
                fail() {
                    that.setData({
                        isLoading: false
                    });
                }
            });
        }, 500);
    }

  })
