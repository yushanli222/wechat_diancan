// pages/foodDetail/foodDetail.js
var app = getApp();

Page({
    data: {
        food: {},
        quantity: 1,
        isLoading: true
    },

    onLoad(options) {
        var fid = options.fid;
        this.getFoodDetail(fid);
    },

    //获取菜品详情
    getFoodDetail(fid) {
        var that = this;
        wx.request({
            url: app.globalData.baseUrl + '/wx/getFoodById',
            data: {
                fid: fid
            },
            success(res) {
                if (res.data.code === 200) {
                    that.setData({
                        food: res.data.data,
                        isLoading: false
                    });
                }
            },
            fail() {
                that.setData({
                    isLoading: false
                });
            }
        });
    },

    //减少数量
    decreaseQty() {
        if (this.data.quantity > 1) {
            this.setData({
                quantity: this.data.quantity - 1
            });
        }
    },

    //增加数量
    increaseQty() {
        if (this.data.quantity < this.data.food.storage) {
            this.setData({
                quantity: this.data.quantity + 1
            });
        }
    },

    //加入购物车
    addToCart() {
        var that = this;
        
        //设置默认桌子号为1
        wx.setStorage({
            key: "tableid",
            data: "1"
        });

        //获取当前菜品信息
        var food = this.data.food;
        var quantity = this.data.quantity;

        //构建购物车商品对象
        var cartItem = {
            id: food.fid,
            name: food.fname,
            price: food.price,
            icon: food.imgPath,
            desc: food.intro,
            stock: food.storage,
            quantity: quantity
        };

        //获取现有购物车数据
        wx.getStorage({
            key: "cartList",
            success(res) {
                var cartList = res.data || [];
                
                //检查购物车中是否已有该商品
                var index = cartList.findIndex(item => item.id == food.fid);
                if (index == -1) {
                    //添加新商品
                    cartList.push(cartItem);
                } else {
                    //更新数量
                    cartList[index].quantity += quantity;
                }

                //保存购物车
                wx.setStorage({
                    key: "cartList",
                    data: cartList,
                    success() {
                        wx.showToast({
                            title: '已加入购物车',
                            icon: 'success'
                        });
                        
                        //计算并保存总金额和总件数
                        var totalPrice = 0;
                        var totalCount = 0;
                        cartList.forEach(item => {
                            totalPrice += item.price * item.quantity;
                            totalCount += item.quantity;
                        });
                        
                        wx.setStorage({ key: "totalPrice", data: totalPrice });
                        wx.setStorage({ key: "totalCount", data: totalCount });
                        
                        //跳转到点餐页面
                        setTimeout(() => {
                            wx.navigateTo({
                                url: '/pages/menu/menu',
                            });
                        }, 1000);
                    }
                });
            },
            fail() {
                //购物车不存在，创建新购物车
                var cartList = [cartItem];
                
                wx.setStorage({
                    key: "cartList",
                    data: cartList,
                    success() {
                        wx.showToast({
                            title: '已加入购物车',
                            icon: 'success'
                        });
                        
                        //保存总金额和总件数
                        wx.setStorage({ key: "totalPrice", data: food.price * quantity });
                        wx.setStorage({ key: "totalCount", data: quantity });
                        
                        setTimeout(() => {
                            wx.navigateTo({
                                url: '/pages/menu/menu',
                            });
                        }, 1000);
                    }
                });
            }
        });
    },

    //立即购买
    buyNow() {
        var that = this;
        
        //设置默认桌子号为1
        wx.setStorage({
            key: "tableid",
            data: "1"
        });

        //获取当前菜品信息
        var food = this.data.food;
        var quantity = this.data.quantity;

        //构建购物车商品对象
        var cartItem = {
            id: food.fid,
            name: food.fname,
            price: food.price,
            icon: food.imgPath,
            desc: food.intro,
            stock: food.storage,
            quantity: quantity
        };

        //获取现有购物车数据
        wx.getStorage({
            key: "cartList",
            success(res) {
                var cartList = res.data || [];
                
                //检查购物车中是否已有该商品
                var index = cartList.findIndex(item => item.id == food.fid);
                if (index == -1) {
                    //添加新商品
                    cartList.push(cartItem);
                } else {
                    //更新数量
                    cartList[index].quantity += quantity;
                }

                //保存购物车
                wx.setStorage({
                    key: "cartList",
                    data: cartList,
                    success() {
                        //计算并保存总金额和总件数
                        var totalPrice = 0;
                        var totalCount = 0;
                        cartList.forEach(item => {
                            totalPrice += item.price * item.quantity;
                            totalCount += item.quantity;
                        });
                        
                        wx.setStorage({ key: "totalPrice", data: totalPrice });
                        wx.setStorage({ key: "totalCount", data: totalCount });
                        
                        //跳转到确认订单页面
                        wx.navigateTo({
                            url: '/pages/confirmOrder/confirmOrder',
                        });
                    }
                });
            },
            fail() {
                //购物车不存在，创建新购物车
                var cartList = [cartItem];
                
                wx.setStorage({
                    key: "cartList",
                    data: cartList,
                    success() {
                        //保存总金额和总件数
                        wx.setStorage({ key: "totalPrice", data: food.price * quantity });
                        wx.setStorage({ key: "totalCount", data: quantity });
                        
                        //跳转到确认订单页面
                        wx.navigateTo({
                            url: '/pages/confirmOrder/confirmOrder',
                        });
                    }
                });
            }
        });
    },

    //返回上一页
    goBack() {
        wx.navigateBack();
    }
})
