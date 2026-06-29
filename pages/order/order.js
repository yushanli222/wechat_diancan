var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
     //导航栏的四个分类
     navbar : ["待支付","待上餐","已取消","待评论","已完成"],
     //定义一个变量用来表示当前切换到导航栏的索引为止
     currentIndex : 0,
     //支付弹窗
     maskFlag:true,
     //创建一个变量用于表示订单数组
     orderList : [],
     //定义一个status的变量用来表示订单的状态码---当前状态码
     status : 0,
     //定义一个状态码表示上一次的状态
     lastStatus : 0,
     //定义支付方式
     payWayList : [
        { value: 'balance', name: '余额支付', icon: '/assets/icons/balance.png'},
        { value: 'wechat', name: '微信支付', icon: '/assets/icons/wechat.png'},
        { value: 'alipay', name: '支付宝', icon: '/assets/icons/alipay.png'}
     ],
     //当前选中的支付方式
     selectedPayWay: '',
     //定义总金额的变量
     totalPrice : 0,
     //定义关于动画效果的两个变量
     animation:"",
     animationData:"",
     //定义oid参数用来接收订单id
     oid : "",
     //定义一个变量用来接收桌子号
     tableid : 0,
     //定义一个变量以用来控制评论框的显示和影藏
     isShowComment:false,
     //定义一个评分变量
     rating : 0,
     //定义一个变量表示评论内容
     comment : "",
     //定义一体个全局变量表示当前页码
     currentPage : 1,
     pageSize : 10,  //每页显示10条数据
     //定义变量表示订单数据总量
     totalCount : 0
  },

  //切换不同订单状态
  changeOrderStatus(e){
     wx.showLoading({
       title: '加载中',
     })
     //定义变量接收我们点击的是哪一种订单状态
     var index = e.currentTarget.dataset.idx;
     //赋值
     this.setData({
         currentIndex : index
     })
     //我们需要将你选中的这个状态 0  1  2  3  4传递给我们的后端
     //获取data区域中的staus的值
     var status = this.data.status;
     if(index == 0){
        status = 0;
     }else if(index == 1){
        status = 1;
     }else if(index == 2){
        status = 2
     }else if(index == 3){
        status = 3;
     }else if(index == 4){
        status = 4
     }
     //重新将status的值赋值给data
     this.setData({
         status : status,
         currentPage : 1
     })
     //调用方法
     this.getOrdersByStatus();
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      wx.showLoading({
        title: '数据加载中',
        mask :true
      })
      setTimeout(()=>{
        //调用方法查询订单详情数据
        this.getOrdersByStatus()
      },2000)
  },

  //根据订单状态来获取订单数据
  //需要知道当前状态和上一次的状态
  getOrdersByStatus(){
     var that = this;
     //往后端发请求查询我们的订单数据---默认加载的是status=0的订单(待支付)
     wx.request({
        url: app.globalData.baseUrl+'/wx/getOrderByStatus',
        data : {
            openid : app.globalData.openid,
            status : that.data.status,
            //分页页码
            currentPage : that.data.currentPage,
            //每页显示数据量
            pageSize : that.data.pageSize
        },
        success(res){
            console.log(res)
            //取消加载中效果
            wx.hideLoading();
            console.log(that.data.status);
            console.log(that.data.lastStatus)
            //判断当前状态和上一次的状态是否系统
            if(that.data.status != that.data.lastStatus){
              //说明不用追加，而且还需要把之前的orderList清空
              that.setData({
                orderList : res.data.list,
                totalCount : res.data.total,
                lastStatus : that.data.status //修改上一级的lastStatus
              })
            }else{
              //说明需要追加
              //将后面加载的订单数据追加到orderList中
              //var orderList = that.data.orderList;
              //遍历
              // for(var i = 0;i<res.data.list.length;i++){
              //   orderList.push(JSON.parse(JSON.stringify(res.data.list[i])))
              // }
              //赋值
              that.setData({
                  orderList : res.data.list,
                  totalCount : res.data.total
              })
            }
        }
     })
  },

  //取消订单
  cancleOrder(e){
    var that = this;
     //获取要取消的订单oid
     var oid = e.target.dataset.oid;
     //取消中
     wx.showLoading({
       title: '取消中...',
       mask:true
     })
     setTimeout(()=>{
        //往后端发请求来实现取消订单
        wx.request({
          url: app.globalData.baseUrl+'/wx/cancelOrder',
          data:{
              oid : oid
          },
          success(res){
              wx.showToast({
                title: res.data.message,
                icon: 'success',
                duration : 1500
              })
              //重新去加载我们的订单
              that.getOrdersByStatus();
          }
        })
     },1500)
  },

  //去支付
  clickGoPay(e){
    var oid = e.target.dataset.oid;
    var totalPrice = e.target.dataset.totalprice;
    //修改支付弹窗maskFlag=false
    this.setData({
        maskFlag :false,
        totalPrice : totalPrice,
        oid : oid
    })
    //动画效果
    // 支付方式打开动画
    var animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out',
        delay: 0
      });
      this.animation = animation;
      animation.translateY(0).step();
      this.setData({
        animationData: this.animation.export(),
        maskFlag: false
      });

  },

  //关闭支付窗口
  closePayWay(){
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in',
      delay: 0
    });
    this.animation = animation;
    animation.translateY(120).step();
    this.setData({
      animationData: this.animation.export()
    });
    setTimeout(() => {
      this.setData({
        maskFlag: true,
        selectedPayWay: ''
      });
    }, 200);
  },

  //选择支付方式
  selectPayWay(e){
    var payWay = e.currentTarget.dataset.value;
    this.setData({
        selectedPayWay: payWay
    })
  },

  //支付
  submitOrder(){
     var that = this;
     wx.showLoading({
        title:"支付中,请稍等...",
        mask :true 
     })
     setTimeout(()=>{
         //往后端发送请求
        wx.request({
            url: app.globalData.baseUrl+'/wx/toPayOrder',
            data:{
                oid : that.data.oid,
                money : that.data.totalPrice,
                openid : app.globalData.openid
            },
            success(res){
                wx.showToast({
                    title: res.data.message,
                    icon: 'success',
                    duration : 1500
                })
                //隐藏支付窗口
                that.setData({
                    maskFlag :true
                })
                //重新去加载我们的订单
                that.getOrdersByStatus();
            }
        })
     },1500)
  },

  //弹出评论框
  goComment(e){
     //获取item订单对象
     var item = e.target.dataset.item;

     //修改isShowComment的值为true,获取里面oid和tableid
     this.setData({
        isShowComment : true,
        oid : item.oid,
        tableid : item.tableId
     })
  },

  //取消评论
  cancelComment(){
      //修改isShowComment的值为false
      this.setData({
        isShowComment : false
     })
  },

  //设置评分
  setRating(e){
     //获取评论
     var score = e.target.dataset.rating;
     //将其值赋值给data区域中变量
     this.setData({
         rating : score
     })
  },

  //获取文本框中输入的评论内容
  getComment(e){
     //获取评论内容
     var comment = e.detail.value;
     //将评论的内容赋值给data区域中的变量
     this.setData({
         comment : comment
     })
  },

  //提交评价
  submitComment(){
     var that = this;
     wx.showLoading({
       title: '数据提交中',
       mask : true
     })
     //往后端发请求
     setTimeout(()=>{
        wx.request({
          url: app.globalData.baseUrl+'/wx/addComment',
          data:{
            orderId : that.data.oid,
            openid : app.globalData.openid,
            nickname : "",
            tableId : that.data.tableid,
            comment : that.data.comment,
            score : that.data.rating
          },
          success(res){
            //评价成功之后给与相关提示
            wx.showToast({
                title: res.data.data.message,
                icon: 'success',
                duration : 1500
            }),
            //隐藏评论框
            that.setData({
                isShowComment : false,
                rating : 0 //清空一下上一次的评分
            })
            //刷新我们页面数据
            that.getOrdersByStatus();
          }
        })
     },1500)
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
      //只要页面进行了切换过来，我们就去更新订单
    wx.showLoading({
        title: "加载中",
        mask :true
    })
    setTimeout(()=>{
        wx.hideLoading();
        //更新我们的订单
        this.getOrdersByStatus();
    },2000)
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
      wx.showLoading({
        title: '正在刷新中',
        mask :true
      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
     var that = this;
     //修改lastStatus = status
     this.setData({ //说明你没有切换状态
       lastStatus : this.data.status
     })
     //就告知用户，我们是有底线的
     if(this.data.orderList.length == this.data.totalCount){
        wx.showToast({
            title: '我是有底线的....',
            icon : 'none',
            duration : 2000
        })
        return;
      }
      //下面就可以正常进行查询其他的评论数据
      wx.showToast({
        title: '努力加载中....',
        icon : 'none',
        duration : 2000
      })
      //紧接着去查询下一页的数据
      var currentPage = this.data.currentPage; //获取当前页码
      this.setData({
          currentPage : currentPage +1
      })
      //当前页码就会改变,改变之后我们重新再往后端发送请求查询下一页的数据
      wx.request({
        url: app.globalData.baseUrl+'/wx/getOrderByStatus',
        data : {
            openid : app.globalData.openid,
            status : that.data.status,
            //分页页码
            currentPage : that.data.currentPage,
            //每页显示数据量
            pageSize : that.data.pageSize
        },
        success(res){
           //将后面加载的订单数据追加到orderList中
           var orderList = that.data.orderList;
           //遍历
           for(var i = 0;i<res.data.list.length;i++){
             orderList.push(JSON.parse(JSON.stringify(res.data.list[i])))
           }
           //赋值
           that.setData({
             orderList : orderList,
             totalCount : res.data.total
           })
        }
      })
    },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  //阻止事件冒泡
  stopPropagation() {
    // 什么都不做，只是阻止事件冒泡
  }
})