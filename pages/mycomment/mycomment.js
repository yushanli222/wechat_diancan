// pages/my-comments/my-comments.js

var app = getApp();

Page({
    data: {
      //定义一个变量用来表示是否有评论
      showComment : true,
      //定义一个数组，用来表示用户的评论信息
      comments :[],
      //定义当前页码，默认是第一页
      currentPage : 1,
      //定义变量表示我们评论的总量
      totalCount : 0
    },
  
    // 模拟加载数据
    onLoad() {
      wx.showLoading({
          title:"加载中",
          mask:true
      })
      //调用查看我的所有评论的方法getAllCommnets
      this.getAllComments();
    },

    //查询我的所有评论信息
    getAllComments(){
      var that = this;
        //页面一加载我们就去查询我的所有评论信息
      wx.request({
        url: app.globalData.baseUrl+'/wx/findMyComments',
        data:{
            openid : app.globalData.openid,
            currentPage : that.data.currentPage, //当前页码
            pageSize : 5  //每页显示多少条数据
        },
        success(res){
           console.log(res)
           //所有的评论加载出来之后我们再隐藏  记载中 的效果
           //将查询到的所有评论数据赋值给data区域中comments数组
           //将我们查询到的评论数据追加到data区域中的comments数组里面
           var comments = that.data.comments;
           //循环遍历追加
           for(var i = 0;i<res.data.data.list.length;i++){
              comments.push(JSON.parse(JSON.stringify(res.data.data.list[i])))
           }
           that.setData({
               comments : comments,
               //给数据总量赋值
               totalCount : res.data.data.total
           })
           setTimeout(()=>{
              //隐藏我们的  加载中 的效果
              wx.hideLoading();
           },1500)
        }
      })
    },



    //上拉触底刷新
    onReachBottom(){
        //判断评论数组comments的长度如果和我们总的评论总量是一样的，则我们可以得知已经到最后
        //就告知用户，我们是有底线的
        if(this.data.comments.length == this.data.totalCount){
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
        this.getAllComments();

    }
  })