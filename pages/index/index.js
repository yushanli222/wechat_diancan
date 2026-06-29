var app = getApp();

Page({
    data: {
      shopInfo: {
        name: "美味餐厅"
      },
      keyWord: "",
      recommendFoods: [],
      latestFoods: []
    },

    //定义出扫码的方法
    handleToScan(){
        //扫码之前先要判断用户是否完成登录
        var isLogin = app.globalData.isLogin;
        if(isLogin == false){
            wx.showToast({
              title: '你还未登录',
              icon : 'none'
            })
            return;
        }
        //调用微信扫描的方法
        wx.scanCode({
            //扫码成功--结果e里面就包含了我们的二维码中的数据
            success(e){
                //判断我们的扫码结果是否为正确的内容
                var result = e.result; //hdsajhf123|德园早餐店|1 ---1就是我们的桌子号
            
                
                //扫码成功之后，我们可以将桌子号的信息缓存起来
                wx.setStorage({
                    key: "tableid",
                    data : result
                })
                //跳转到点餐页面
                wx.navigateTo({
                    url: '/pages/menu/menu',
                })
                            
            },
            //扫码失败--用户结束扫码
            fail(e){
                wx.showToast({
                  title: '取消扫码',
                })
            }
        })
    },

    //获取搜索框中输入的关键词
    getKeyWord(e){
        //动态获取输入的关键词
        var keyWord = e.detail.value;
        //将获取到的关键字赋值给data区域中的keyWord
        this.setData({
            keyWord :keyWord
        })
    },

    //点击搜索图标来完成搜索功能
    handleToMenu(){
        //设置默认桌子号为1
        wx.setStorage({
            key: "tableid",
            data: "1"
        })
        //跳转到menu页面，同时将我们的关键字一并携带到menu页面中
        wx.navigateTo({
          url: '/pages/menu/menu?kw='+this.data.keyWord,
        })
    },



    onLoad() {
        wx.getStorage({
            key: "isLogin",
            success(res) {
                console.log(res)
                app.globalData.isLogin = res.data
            }
        })
        this.getRecommendFoods()
        this.getLatestFoods()
    },

    //推荐菜品
    getRecommendFoods() {
        var that = this
        wx.request({
            url: app.globalData.baseUrl + '/wx/getRecommendFoods',
            method: 'GET',
            success: function (result) {
                if (result.data.code === 200) {
                    that.setData({
                        recommendFoods: result.data.data
                    })
                    console.log('推荐菜品:', result.data.data)
                }
            },
            fail: function (err) {
                console.log('获取推荐菜品失败:', err)
            }
        })
    },
    //最新菜品
    getLatestFoods() {
        var that = this
        wx.request({
            url: app.globalData.baseUrl + '/wx/getLatestFoods',
            method: 'GET',
            success: function (result) {
                if (result.data.code === 200) {
                    that.setData({
                        latestFoods: result.data.data
                    })
                    console.log('最新菜品:', result.data.data)
                }
            },
            fail: function (err) {
                console.log('获取最新菜品失败:', err)
            }
        })
    },

    goToMenu() {
        wx.navigateTo({
            url: '/pages/menu/menu'
        })
    }
  
})