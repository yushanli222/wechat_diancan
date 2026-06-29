var app = getApp();

Page({
    data: {
      //充值的金额数组
      amounts: [50.00, 100.00, 200.00, 500.00],
      selectedIndex: 0
    },
  
    //获取你选择的是哪一个充值金额对应的索引
    selectAmount(e) {
      this.setData({
        selectedIndex: e.currentTarget.dataset.index
      })
    },

    //模拟充值
    handleToRecharge(){
        //获取到你充值的金额
        var money = this.data.amounts[this.data.selectedIndex];
        
        //缓冲效果
        wx.showLoading({
            title:"充值中",
            mask:true 
        })

        //往后端发请求，执行钱包的充值操作
        wx.request({
          url: app.globalData.baseUrl+'/wx/recharge',
          data:{
              money : money,
              openid : app.globalData.openid
          },
          //success其实就是我们我们的成功回调函数
          //res:就是从controlelr控制层返回给你的结果
          success(res){
            //设置2秒之后隐藏 充值中 的效果
            setTimeout(()=>{
                wx.hideLoading();//隐藏  充值中  的效果
            },2000)

            //显示充值成功
            setTimeout(()=>{
                wx.showToast({
                    title: '充值成功',
                })
            },3000)

            //充值成功之后跳转到profile页面
            setTimeout(()=>{
                wx.navigateBack();//跳转到上一级页面
            },3500)
          }
        })
    }
  })