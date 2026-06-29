// pages/confirmOrder/confirmOrder.js

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
     //支付窗口的弹窗状态
     maskFlag : true,
     //定义支付方式的数组
     paymentMethods: [
        { value: 'balance', name: '余额支付', icon: '/assets/icons/balance.png', checked: true },
        { value: 'wechat', name: '微信支付', icon: '/assets/icons/wechat.png' },
        { value: 'alipay', name: '支付宝', icon: '/assets/icons/alipay.png' }
     ],
     //定义变量用来接收桌子号
     tableid : 0,
     //定义两个变量那个用于接受总金额和总件数
     totalPrice : 0,
     //定义一个折扣之后的总金额变量
     priceCoupon : 0,
     //总件数
     totalCount : 0,
     //定义一个购物车数组的变量
     cartList : [],
     //定义一个变量用来接收吃饭的人数
     diner_num : 0,
     //定义数组用于表示用户的优惠券
     availableCoupons:[],
     //定义一个标记用来表示是否有优惠券
     flag : false, //false表示没有，true表示有
     //定义一个变量表示被选中的优惠券
     selectedCoupon : "",
     //定义一个备注的变量
     remark : "",
     //定义变量接收支付方式
     payMethod : "balance"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      //定义一个变量that用来接收this
      var that = this;
      //获取缓存中的桌子号数据
      wx.getStorage({
          key:"tableid",
          success(res){
             that.setData({
                 tableid : res.data
             })
          }
      });
      //获取总金额的缓存
      wx.getStorage({
          key : "totalPrice",
          success(res){
             that.setData({
                totalPrice :res.data 
             })
          }
      })
      //获取总件数的缓存
      wx.getStorage({
        key : "totalCount",
        success(res){
           that.setData({
              totalCount :res.data 
           })
        }
      })

      //获取购物车的缓存
      wx.getStorage({
        key: "cartList",
        success(res){
           that.setData({
               cartList : res.data
           })  
        }
      })

      //页面一加载我们就需要去获取当前用户可用的优惠券
      wx.request({
        url: app.globalData.baseUrl+'/wx/getAllAvailableCoupons',
        data:{
            openid : app.globalData.openid
        },
        success(res){
            //将优惠券的信息处理一下，存入一个数组中
            var coupons = that.data.availableCoupons;
            //判断数组的长度是否为0
            if(res.data.data.length != 0){
                //说明有可用优惠券
                that.setData({
                    flag : true
                })
            }
            //将查询到的结果存入到我们的优惠券数组中
            for(var i = 0;i<res.data.data.length;i++){
                coupons.push(res.data.data[i].coupon);
            }

            //赋值
            that.setData({
                availableCoupons : coupons
            })
        }
      })
      
  },


  //获取用餐人数
  getDinnerNUM(e){
      //获取用餐人数
      var dinnerNum = e.currentTarget.dataset.num;
      //赋值
      this.setData({
          diner_num : dinnerNum
      })
  },

  //动态获取文本输入框中输入的用餐人数
  handleToDinerNum(e){
      //获取到了文本输入框中用户输入的用餐人数
      var value = e.detail.value;
      //赋值
      this.setData({
          diner_num :value
      })
  },

  //获取备注信息
  getRemark(e){
     //获取文本输入框中输入的备注信息
     var remark = e.detail.value;
     //赋值
     this.setData({
         remark : remark
     })
  },

  //获取用户选中的支付方式
  radioChange(e){
      var payMethod = e.detail.value;//获取被选中的支付方式
      console.log(payMethod);
      //赋值
     this.setData({
         payMethod : payMethod
     })
  },

  //提交订单
  submitOrder(){
    //做一个衔接动作
    wx.showLoading({
      title: '正在支付',
      mask :true
    })

    //定义一个订单总金额
    var totalPrice = 0;
    //判断用户是否选择了优惠券
    if(this.data.selectedCoupon == ""){
        //说明没有选择优惠券
        totalPrice = this.data.totalPrice;//订单总金额--原价
    }else{
        totalPrice = this.data.priceCoupon;//订单总金额--折扣价
    }
    //获取用户选择是哪一个优惠券
    var selectedCoupon = this.data.selectedCoupon;
    //获取当前被选中的优惠券的id
    var couponId = selectedCoupon == ""? -1 : selectedCoupon.id;
    
     //先准备好参数
     var tableid = this.data.tableid; //桌子号
     var openid = app.globalData.openid; //openid
     var eatNumber = this.data.diner_num;//吃饭人数
     var remark = this.data.remark;//备注
     var payway = this.data.payMethod;//支付方式   
     console.log(payway);     
     //继续准备参数---购物车中的数据(插入到detail表中)
     var cartList = this.data.cartList;
     //创建一个空数组，用来接收我们购物车中封装的商品信息
     var goodsArr = [];
     //不可以直接将这个购物车数组直接往后端进行传递
     for(var i = 0;i<cartList.length;i++){
        //将我们的商品现保存起来---创建一个goods对象
        var goods = new Object();
        goods.foodQuantity = cartList[i].quantity; //数量
        goods.price = cartList[i].price; //单价
        goods.foodName = cartList[i].name;//商品名称
        goods.foodIcon = cartList[i].icon;//封面
        //然后将其存入集合
        goodsArr.push(goods);
     }
     //将goodsArr转换为字符串然后往后端进行传递
     var goodStr = JSON.stringify(goodsArr);
     //准备好参数之后，我们就可以来进行提交订单了
     wx.request({
       url: app.globalData.baseUrl+'/wx/createOrder',
       data:{
         tableId : tableid,
         totalPrice : totalPrice, //原价
         openid : openid,
         payway : payway,
         eatNumber : eatNumber,
         remark : remark,
         //传递订单详情参数
         orderDetail : goodStr,
         //优惠券的id值
         couId : couponId
       },
       success(res){
           setTimeout(()=>{
              //提示信息
              wx.showToast({
                title: res.data.message,
                icon : 'none',
                duration : 2000
              }) 
           },2500)
          
           setTimeout(()=>{
                //处理从后端响应到前端的结果
                wx.switchTab({
                    url: '/pages/index/index',
                })
                
                //当初我们为了下订单，我们的小程序中其实有很多的缓存
                //当我们的订单下单成功之后，我们需要将之前的缓存全部清空一下
                //桌子号
                wx.setStorage({
                    key : "tableid",
                    data : ""
                })
                //购物车
                wx.setStorage({
                    key : "cartList",
                    data : ""
                })
                //总金额
                wx.setStorage({
                    key : "totalPrice",
                    data : ""
                })
                //总件数
                wx.setStorage({
                    key : "totalCount",
                    data : ""
                })
           },5000)
       }
     })

  },


  //获取被选中的优惠券
  handleToSelectedCoupon(e){
     //清空你之前的选择的优惠券
     this.setData({
         selectedCoupon : ""
     })
     //获取被选中的优惠券数组对应的索引值
     var index = e.detail.value;
     
     //根据索引获取你选中的优惠券信息
     var selectedCoupon = this.data.availableCoupons[index];
     //判断我们应付的总金额是否已经达到了优惠券的使用条件condition
     var totalPrice = this.data.totalPrice;
     var condition = selectedCoupon.ccondition;
     if(totalPrice < condition){
        //说明该优惠券不可使用
        wx.showToast({
          title: `不满足使用条件(满${selectedCoupon.ccondition}减${selectedCoupon.cvalue})`,
          icon : 'none'
        })
     }else{
         //说明此优惠券可以使用
         //根据索引来获取你被选中的是哪一个优惠券
         this.setData({
            selectedCoupon : this.data.availableCoupons[index]
         })
         //计算优惠之后的总金额
         var priceCoupon = totalPrice - selectedCoupon.cvalue;
         //进行赋值
         this.setData({
             priceCoupon : priceCoupon
         })
     }
  },

  //打开支付方式弹窗
  choosePayWay: function() {
    this.setData({
      maskFlag: false,
    });
  },

  // 支付方式关闭方法
  closePayWay: function() {
    this.setData({
      maskFlag: true
    });
  },

  // 选择支付方式
  selectPaymentMethod(e) {
    this.setData({
      selectedPayment: e.detail.value,
      paymentMethods: this.data.paymentMethods.map(item => ({
        ...item,
        checked: item.value === e.detail.value
      }))
    });
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})