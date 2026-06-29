var app = getApp();

Page({

    //data是我们数据区域，所有的变量，数据都需要在此处进行定义出来
    data: {
      isLogin : false, //主要就是用来控制页面显示的，我们不做判断依据
      //余额
      balance: 0.00,
      //单独定义两个变量用来表示昵称和头像
      nickName :"",
      avatarUrl : ""
    },

    //点击登录
    handleToLogin(){  
        //this表示当前对象，在哪里使用就代表谁
        //我们在使用wx.xxxxx方法的里面不可以直接使用this
        var that = this;
        //调用wx.login方法---拿不到用户的昵称和头像
        //调用wx.getUserProfile
        wx.getUserProfile({
          desc: '模拟登录',
          success(res){
              console.log(res)
              //设置全局变量app.json中的isLogin的值为true,全局可用的变量
              app.globalData.isLogin = true;
              //将获取到的用户昵称和头像信息赋值给我们data区域中的变量userInfo
              that.setData({
                  nickName :res.userInfo.nickName,
                  avatarUrl : res.userInfo.avatarUrl,
                  isLogin : app.globalData.isLogin
              })
              
              //将用户的信息注册到数据库中
              wx.request({
                url: app.globalData.baseUrl+'/wx/customerRegister',
                data:{
                    openid : app.globalData.openid,
                    nickname : that.data.nickName,
                    phoneNumber: '19912345678',
                    avatarUrl: that.data.avatarUrl
                },
                //请求成功的函数
                success(res){
                    //注册成功之后我们需要获取当前用户的余额
                    that.getBanlance();
                },
                //失败 --- 程序在运行的过程中出现了异常
                fail(res){

                }
              })
          }
        })
    },

    //获取用户的余额信息
    getBanlance(){
        var that= this;
        //往后端发布请求，查询用户的余额
        wx.request({
          url: app.globalData.baseUrl+'/wx/getBanlance',
          data:{
              openid : app.globalData.openid
          },
          success(res){
             //将余额赋值给data区域里面banlance
             that.setData({
                 balance : res.data.data
             })
          }
        })
    },


    //联系客服
    handleToPhone(){
        //微信小程序中，拨打电话的函数wx.makePhoneCall
        wx.makePhoneCall({
          phoneNumber: '18888888888',
        })
    },

    //跳转到我的评论页面去
    handleToMyComment(){
        /*
        微信小程序中跳转页面的方式包含很多种
        a. wx.navigateTo : 表示跳转到非底部tab页面---会保留当前页面
           wx.navigateBack : 表示跳转到上一个页面区域
        b. wx.switchTab : 表示只能跳转到某个底部tab页面
        c. wx.redirectTo : 表示跳转到某个非底部tab页面---不会保留当前页面
        */
        //判断你是否完成了登录，如果没有登录，则提示，不能跳转
        if(this.data.isLogin == false){
            wx.showToast({
              title: '请先完成登录',
              icon: 'none'
            })
            return; //不允许程序继续往下面执行了
        }
        wx.navigateTo({
          url: '/pages/mycomment/mycomment',
        })
    },

    //跳转到充值页面
    handleToRecharge(){
        //判断你是否完成了登录，如果没有登录，则提示，不能跳转
        if(this.data.isLogin == false){
            wx.showToast({
              title: '请先完成登录',
              icon: 'none'
            })
            return; //不允许程序继续往下面执行了
        }
        wx.navigateTo({
          url: '/pages/recharge/recharge',
        })
    },

    //跳转到我的优惠券页面
    handleToMyCoupon(){
         //判断你是否完成了登录，如果没有登录，则提示，不能跳转
        if(this.data.isLogin == false){
            wx.showToast({
              title: '请先完成登录',
              icon: 'none'
            })
            return; //不允许程序继续往下面执行了
        }
        wx.navigateTo({
          url: '/pages/mycoupon/mycoupon',
        })
    },




    // 页面第一次加载进来的时候就会触发，但是只能触发一次，表示页面一加载就会执行的位置
    onLoad() {
        // //获取缓存
        // wx.getStorage({
        //     key:"userInfo",
        //     //成功函数表示获取到了我们的数据，res里面就包含了我们缓存的数据
        //     success(res){
        //         console.log(res)
        //         //从缓存中获取到的用户信息赋值给data区域中定义的userInfo变量
        //         that.setData({
        //             userInfo : res.data,
        //             isLogin :true
        //         })
        //         //页面一加载进来我们要更新用户的余额
        //         that.getBanlance();
        //     }
        // })
    },

    //定义方法获取用户的信息
    getUserInfo(){
        var that = this;
        wx.request({
            url: app.globalData.baseUrl+"/wx/getUserInfo",
            data:{
                openid : app.globalData.openid
            },
            success(res){
               //赋值给data区域中
               that.setData({
                   nickName :res.data.data.nickname,
                   avatarUrl :res.data.data.avatarUrl,
                   isLogin :true
               })
            }
        })
    },
  
    //页面改变将会触发
    onShow(){
      if(app.globalData.isLogin == true){
        //只要页面进行了切换过来，我们就去更新余额
        wx.showLoading({
            title: "加载中",
            mask :true
        })
        setTimeout(()=>{
            wx.hideLoading();
            //获取用户的信息
            this.getUserInfo();
            //更新我们的余额
            this.getBanlance();
        },2000)
      }
    }
  })