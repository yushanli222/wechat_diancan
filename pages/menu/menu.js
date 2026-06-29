var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
     tabs : ["今日菜单"],
     activeIndex : 0,
     //左侧菜单栏的内容
     menu_list : [],
     //当前的导航栏对应索引值
     curNav : 0,
     //定义右侧的商品的数据
     foodList : [],
     //定义全局变量
     tableid : 0,
     keyWord : null,
     //定义一个购物车数组
     cartList : [],
     //定义总金额
     totalPrice : 0,
     //定义总件数
     totalCount : 0,
     //定义一个变量用来存储我们的菜单以及菜系的数据
      result : [],
      //控制购物车弹窗显示
      showCartPopup: false,
      //控制AI助手对话框显示
       showAiDialog: false,
       //AI输入内容
       aiInput: '',
       //AI消息列表
       aiMessages: [],
       //是否正在加载
       aiLoading: false
  },


  //点击切换左侧菜单项
  changeRightMenu(e){
      //获取你点击的那个菜单的内容（拿到索引）
      var index = e.currentTarget.dataset.id
      //将index的值赋值给data区域中的变量curNav
      this.setData({
          curNav : index
      })
      //根据你点击的菜单分类，获取到对应的索引，然后在根据索引获取到对应的菜系
      this.setData({
          foodList : this.data.result[index].foods
      })
  },

  //加号
  addCount(e){
      //获取到你点击的是哪一件具体的商品（拿到的也是索引）
      var foodIndex = e.currentTarget.dataset.index
      //将对应商品的quantity的属性值 +1
      var foodList = this.data.foodList  //quantity = 0 +1+1+1+1
      foodList[foodIndex].quantity = foodList[foodIndex].quantity + 1;
      //重新更新data区域中的foodList
      this.setData({
          foodList : foodList
      })
      //计算总金额和总件数 
      var totalPrice = this.data.totalPrice;
      var totalCount = this.data.totalCount;
      //先计算总金额
      totalPrice = totalPrice + foodList[foodIndex].price;
      //计算总件数(将每一件商品中的quantity的值相加求和)
      totalCount = totalCount + 1
      //最后将计算出来的总金额和总件数重新赋值给data区域中的totalPrice和totalCount
      this.setData({
          totalPrice : totalPrice,
          totalCount : totalCount
      })
      //与此同时我们还需要将添加的商品信息加入到购物车中
      //push方法，可以将数据追加到数组的末尾
      var cartList = this.data.cartList; //长度为0
      //思路：如果购物车里面已经存在了某一件商品，重复添加，只是修改其数量即可
      //而不应该将同一件商品重复添加一次
      //根据我们商品的名称去查询购物车中是否存在这样子的商品信息，返回一个索引
      //索引的值为-1，则说明没找到，说明该商品没有加入购物车
      var index = cartList.findIndex(item=>item.name == foodList[foodIndex].name);
      //如果索引为-1，则说明购物车中没有此商品信息
      if(index == -1){
          //cartList.push(foodList[foodIndex]);
          //[key:value]
          cartList.push(JSON.parse(JSON.stringify(foodList[foodIndex])))
      }else{
          //quantity的值+1
          cartList[index].quantity+=1;
      }
      console.log(cartList)
      
      //保存购物车数据到本地存储
      wx.setStorage({
          key: "cartList",
          data: cartList
      });
      wx.setStorage({
          key: "totalPrice",
          data: totalPrice
      });
      wx.setStorage({
          key: "totalCount",
          data: totalCount
      });
  },

  //点击购物车图标，显示或隐藏购物车弹窗
  cascadeToggle() {
      //每次打开弹窗时，强制刷新购物车数据
      if (!this.data.showCartPopup) {
          this.loadCartData();
      }
      this.setData({
          showCartPopup: !this.data.showCartPopup
      });
  },

  //切换AI助手对话框显示
  toggleAiDialog() {
      if (!this.data.showAiDialog) {
          //打开时初始化消息列表
          this.setData({
              aiMessages: [{
                  type: 'bot',
                  content: '您好！我是AI智能点餐助手 🤖\n有什么可以帮您的吗？您可以：\n• 询问今日推荐菜品\n• 了解菜品详情和价格\n• 获取优惠券信息\n• 查看订单状态'
              }]
          });
      }
      this.setData({
          showAiDialog: !this.data.showAiDialog
      });
  },

  //AI输入处理
  handleAiInput(e) {
      this.setData({
          aiInput: e.detail.value
      });
  },

  //发送AI消息（流式响应）
  sendAiMessage() {
      var input = this.data.aiInput;
      if (!input || input.trim() === '') {
          return;
      }

      //添加用户消息到列表
      var messages = this.data.aiMessages;
      messages.push({
          type: 'user',
          content: input
      });
      this.setData({
          aiMessages: messages,
          aiInput: '',
          aiLoading: true
      });

      //调用后端流式接口
      this.callAiStream(input);
  },

  //调用AI流式接口
  //调用AI流式接口
  callAiStream(question) {
    var that = this;
    var messages = this.data.aiMessages;
    var messageIndex = messages.length;

    //添加一个空的AI回复消息
    messages.push({
        type: 'bot',
        content: ''
    });
    this.setData({
        aiMessages: messages
    });

    //使用普通请求（非流式）
    wx.request({
        url: 'http://localhost:8081/ai/chat/sync',
        method: 'GET',
        data: {
            question: question
        },
        header: {
            'Content-Type': 'application/json'
        },
        success: function(res) {
            if (res.statusCode === 200 && res.data) {
                //模拟打字机效果，逐字显示
                that.typewriterEffect(res.data, messageIndex);
            } else {
                messages[messageIndex].content = '抱歉，服务暂时不可用，请稍后再试。';
                that.setData({
                    aiMessages: messages,
                    aiLoading: false
                });
            }
        },
        fail: function() {
            //降级处理：使用本地模拟回复
            var response = that.getAiResponse(question);
            that.typewriterEffect(response, messageIndex);
        }
    });
},
//模拟打字机效果 - 逐字显示
typewriterEffect(fullText, messageIndex) {
  var that = this;
  var currentIndex = 0;
  
  // 根据文本长度动态调整速度
  var speed = 30; // 基础速度
  if (fullText.length > 200) {
      speed = 20; // 长文本加快速度
  } else if (fullText.length < 50) {
      speed = 40; // 短文本放慢速度
  }
  
  // 清空定时器ID（如果有）
  if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
  }

  function type() {
      if (currentIndex < fullText.length) {
          // 获取当前消息数组
          var messages = that.data.aiMessages;
          
          // 逐字追加内容
          messages[messageIndex].content += fullText.charAt(currentIndex);
          currentIndex++;
          
          // 更新视图
          that.setData({
              aiMessages: messages
          });
          
          // 继续下一个字符
          that.typewriterTimer = setTimeout(type, speed);
      } else {
          // 打字完成
          that.setData({
              aiLoading: false
          });
          that.typewriterTimer = null;
      }
  }
  // 开始打字
  type();
},

  //关闭购物车弹窗
  closeCartPopup() {
      this.setData({
          showCartPopup: false
      });
  },

  //清空购物车
  clearCart() {
      this.setData({
          cartList: [],
          totalPrice: 0,
          totalCount: 0
      });
      wx.setStorage({ key: "cartList", data: [] });
      wx.setStorage({ key: "totalPrice", data: 0 });
      wx.setStorage({ key: "totalCount", data: 0 });
  },

  //购物车中减少数量
  minusCartItem(e) {
      var index = e.currentTarget.dataset.index;
      var cartList = this.data.cartList;
      if (cartList[index].quantity > 1) {
          cartList[index].quantity -= 1;
      } else {
          cartList.splice(index, 1);
      }
      this.setData({ cartList: cartList });
      
      //更新总金额和总件数
      var totalPrice = 0;
      var totalCount = 0;
      cartList.forEach(item => {
          totalPrice += item.price * item.quantity;
          totalCount += item.quantity;
      });
      this.setData({
          totalPrice: totalPrice,
          totalCount: totalCount
      });
      wx.setStorage({ key: "cartList", data: cartList });
      wx.setStorage({ key: "totalPrice", data: totalPrice });
      wx.setStorage({ key: "totalCount", data: totalCount });
  },

  //购物车中增加数量
  addCartItem(e) {
      var index = e.currentTarget.dataset.index;
      var cartList = this.data.cartList;
      cartList[index].quantity += 1;
      this.setData({ cartList: cartList });
      
      //更新总金额和总件数
      var totalPrice = 0;
      var totalCount = 0;
      cartList.forEach(item => {
          totalPrice += item.price * item.quantity;
          totalCount += item.quantity;
      });
      this.setData({
          totalPrice: totalPrice,
          totalCount: totalCount
      });
      wx.setStorage({ key: "cartList", data: cartList });
      wx.setStorage({ key: "totalPrice", data: totalPrice });
      wx.setStorage({ key: "totalCount", data: totalCount });
  },

  //减号
  minusCount(e){
     //获取到你点击的是哪一件具体的商品（拿到的也是索引）
     var foodIndex = e.currentTarget.dataset.index
     //将对应商品的quantity的属性值 -1
     var foodList = this.data.foodList  
     foodList[foodIndex].quantity = foodList[foodIndex].quantity - 1;
     //重新更新data区域中的foodList
     this.setData({
         foodList : foodList
     })
     //计算总金额和总件数 
     var totalPrice = this.data.totalPrice;
     var totalCount = this.data.totalCount;
     //先计算总金额
     totalPrice = totalPrice - foodList[foodIndex].price;
     //计算总件数(将每一件商品中的quantity的值相加求和)
     totalCount = totalCount - 1
     //最后将计算出来的总金额和总件数重新赋值给data区域中的totalPrice和totalCount
     this.setData({
         totalPrice : totalPrice,
         totalCount : totalCount
     })
     //如果购物车中商品数量为1，那么就会将该商品从购物车中移除
     //如果购物车中商品数量>1,那么我们将购物车中商品的数量-1即可
     var cartList = this.data.cartList;
     //判断我们点击的商品在购物车中是否存在
     var index = cartList.findIndex(item=>item.name == foodList[foodIndex].name);
     //index索引不可能为-1
     //获取该商品在购物车中的数量，如果为1，则直接将该商品移除购物车
     //如果不是1，则我们需要将该商品在购物车中的quantity的值-1
     if(cartList[index].quantity == 1){
        //需要移除此商品  第一个参数：表示从哪里开始移除，第二个参数：表示移除几个元素
        //调用完splice方法之后，会给我们返回一个新的数组
        cartList.splice(index,1);
     }else{
         //数量-1
         cartList[index].quantity -= 1;
     }
     console.log(cartList);
     
     //保存购物车数据到本地存储
     wx.setStorage({
         key: "cartList",
         data: cartList
     });
     wx.setStorage({
         key: "totalPrice",
         data: totalPrice
     });
     wx.setStorage({
         key: "totalCount",
         data: totalCount
     });
  },

  //选好了按钮
  handleToOrder(){
    //跳转页面之前，我们先确认用户是否点餐了
    //判断购物车数据是否为空
    var cartList = this.data.cartList;
    if(cartList.length == 0){
        //说明你还未点餐
        wx.showToast({
          title: '您还未点餐',
          mask : true
        })
        return;
    }
     //我们在跳转到comfirmOrder页面之前我们将总金额和总件数缓存起来
     wx.setStorage({
         key : "totalPrice",
         data : this.data.totalPrice
     })
     wx.setStorage({
         key: "totalCount",
         data : this.data.totalCount
     })
     //将购物车中的数据进行缓存
     wx.setStorage({
         key : "cartList",
         data : cartList
     })

     //跳转到准备提交订单的页面comfirmOrder
     wx.navigateTo({
       url: '/pages/confirmOrder/confirmOrder',
     })
  },


  /**
   * 生命周期函数--监听页面加载
   * options参数的主要作用：就是获取从其他页面传递过来的参数
   */
  onLoad(options) {
     //页面一加载，我们就需要获取从Index页面传递过来的关键字参数 kw
     var keyWord = options.kw;
     //如果我们正常扫码进来，那么就没有关键字keyWord = undefined
     //如果我们是通过模糊搜索进来的，那么就会存在关键字keyWord
     
      var that = this;
      //页面一加载进来我们就去获取所有的分类信息以及对应的菜系
      wx.showLoading({
        title: '加载中...',
        mask:true
      })
      wx.request({
        url: app.globalData.baseUrl+'/wx/findAllCategory',
        //携带我们搜索的关键字到后端
        data:{
           keyWord : keyWord
        },
        success(res){
            setTimeout(()=>{
              console.log(res)
              wx.hideLoading();//隐藏加载中
              //接收我们的结果---数组
              var result  = res.data.data;
              //menu_list
              var menu_list = [];
              for(var i = 0;i<result.length;i++){
                  //将菜单名称存入到menu_list中
                  menu_list.push({name:result[i].name});
              }
              //赋值给data区域中的menu_list
              that.setData({
                  menu_list : menu_list,
                  //这一步其实就是展示索引0所对应的菜系---特色菜
                  foodList : result[0].foods, 
                  //这一步其实就是将我们的结果存入到data区域中的result变量
                  result : result
              })
              //数据加载完成后，恢复购物车数据
              that.loadCartData();
            },800)
        }
      })
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
      //每次页面显示时，从本地存储恢复购物车数据
      this.loadCartData();
  },

  //从本地存储恢复购物车数据
  loadCartData() {
      var that = this;
      //同步获取购物车数据
      try {
          var cartData = wx.getStorageSync("cartList");
          var totalPrice = wx.getStorageSync("totalPrice");
          var totalCount = wx.getStorageSync("totalCount");

          if (cartData && cartData.length > 0) {
              that.setData({
                  cartList: cartData,
                  totalPrice: totalPrice || 0,
                  totalCount: totalCount || 0
              });
          } else {
              that.setData({
                  cartList: [],
                  totalPrice: 0,
                  totalCount: 0
              });
          }
      } catch (e) {
          console.log('读取购物车数据失败', e);
      }
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