/**
 * Photo v0.0.1
 * require jquery 1.7+
 * date July 28, 2015,
 * MIT License
 */

;
(function($) {

    var pluginName = "Photo",
        defaults = {
            // 应用相册查看器的标签，可以是 ".img" 也可以是 "img"
            target: 'img',
            // 最大放大倍数
            maxScale: 3,
            // 最小缩小倍数
            minScale: 0.5,
            // 图片左右切换的按钮
            prevBtn: $('#J_prev_photo'),
            nextBtn: $('#J_next_photo'),
            // 是否加载字体图标库
            loadFont: true,
            // 是否允许图片拖动
            isDrag: true
        };

    function Photo(element, options) {
        this.version = 'v0.0.1';
        this.element = element;
        this.body = $('body');
        this.settings = $.extend({}, defaults, options);
        this.targetArray = $(element).find(this.settings.target);
        this.targetArrayLen = this.targetArray.length;
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        this._index = 0;
        this._max = this.WIDTH > 1000 ? 1000 : this.WIDTH;
        this._defaults = defaults;
        this._scale = 10;
        this._maxScale = 10 * this.settings.maxScale;
        this._minScale = 10 * this.settings.minScale;
        this._imgW = 0;
        this._imgH = 0;
        this._img = $('#J_content_photo').find('img');
        this._plusBtn = $('#J_scale_plus');
        this._minusBtn = $('#J_scale_minus');
        this._showNum = $('#J_index_photo');
        this._wrap = $('.photo-browser-wrap');
        this._name = pluginName;
        this._sizeStroe = [];
        this.init();
    }

    Photo.prototype = {
        init: function() {
            var that = this,
                target = that.settings.target;

            $(that.element).off('click.photo').on('click.photo', target, function(event) {
                event.preventDefault();

                var $element = $(this);
                that._index = that.targetArray.index($element);
                that.show(that._index);
                return;
            });

            that.body.off('click.photo').on('click.photo','#J_close_photo', function(event) {
                that.close();
            });

            that.change(that._index);
            that.loadSource();

        },
        drag: function(){
            var that = this,
                img = that._img;
            img.drag({
                ondragbefore: function(){
                    img.removeClass('not-drag');
                },
                ondragend: function(){
                    img.addClass('not-drag');
                }
            });
        },
        scale: function(){
            var that = this,
                img = that._img,
                w = that._imgW,
                h = that._imgH;
            that._plusBtn.removeClass('disable');
            that._minusBtn.removeClass('disable');

            if(that._scale > that._maxScale){
                that._scale = that._maxScale;
                that._plusBtn.addClass('disable');
            }

            if(that._scale < that._minScale){
                that._scale = that._minScale;
                that._minusBtn.addClass('disable');
            }

            img.css({
                width: w * that._scale/10,
                height: h * that._scale/10
            }).attr('scale',that._scale/10);

        },
        close: function(){
            var that = this;
            that._index = 0;
            that._scale = 10;
            that._img.css({
                width: 500,
                height: 100,
                top: 0,
                left: 0
            });
            that.scale();
            that._wrap.hide();
            that.body.css('overflow','auto');
        },
        showBigPic: function(src){
            var that = this,
                w = that._max,
                h = that.HEIGHT,
                contentImg = that._img[0];

            this.loadPic(src,function(imgW,imgH){
                var scale = imgW / imgH,
                    useW = 0,
                    useH = 0;

                if(imgW > w){
                    // 减去30px是因为图片有10px的边框，不减图片宽度会超出屏幕。
                    useW = w-30;
                    useH = w / scale;
                }else{
                    useW = imgW;
                    useH = imgW / scale;
                }
                contentImg.width = useW;
                contentImg.height = useH;
                that._imgW = useW;
                that._imgH = useH;

                contentImg.src = src;

                that._scale = 10;
                that._img.css({
                    top: 0,
                    left: 0
                });
                that.scale();
            });
        },

        show: function(index){
            var that = this,
                content = $('.content');

            that.showBigPic(that.targetArray[index].src);
            content.height(that.HEIGHT);
            that.thumb(that.targetArray);
            that.choose();
            that._wrap.show();
            that.body.css('overflow','hidden');

        },

        choose: function(){
            var that = this,
                thumb = $('.thumb'),
                spanWidth = 90,
                MidLen = Math.ceil((that._max / spanWidth)/2);

            that.settings.prevBtn.show();
            that.settings.nextBtn.show();

            if(that._index < 1){
                that.settings.prevBtn.hide();
            }
            if(that._index < 0){
                that._index = 0;
            }
            if(that._index > that.targetArrayLen-2){
                that.settings.nextBtn.hide()
            }
            if(that._index > that.targetArrayLen-1){
                that._index = that.targetArrayLen-1;
            }


            if(that._index > MidLen){
                thumb.stop().animate({'left':-100*(that._index-MidLen)+'px'},1000);
            }else{
                thumb.stop().animate({'left':0},1000);
            }

            thumb.find('span').eq(that._index).addClass('active').siblings().removeClass('active');

            that.showBigPic(that.targetArray[that._index].src);
            that._showNum.html((that._index+1)+'/'+that.targetArrayLen);

        },
        change: function(index){
            var that = this,
                body = that.body;

            body.on('click.photo','span',function(){
                that._index = $(this).data('index');
                that.choose();
            });

            body.on('click.photo','#J_prev_photo',function(){
                that._index--;
                that.choose();
            });
            body.on('click.photo','#J_next_photo',function(){
                that._index++;
                that.choose();
            });
            body.on('click.photo','#J_scale_plus',function(){
                that._scale += that.settings.maxScale;
                that.scale();
            });
            body.on('click.photo','#J_scale_minus',function(){
                that._scale -= that.settings.maxScale;
                that.scale();
            });
        },

        thumb: function(arr){
            var thumb = $('.thumb'),
                html = '',
                that = this;

            that.targetArrayLen = 0;
            arr.each(function(i,n){
                if(n.src){
                    html += '<span data-index='+i+' data-src='+ n.src+'><img src='+n.src+' /></span>';
                    that.targetArrayLen++;
                }
            });

            thumb.html(html);
        },
        loadPic: function(src,callback){
            var timer = null,
                img = new Image(),
                that = this,
                store = that._sizeStroe;

            if(src in store){
                callback && callback(store[src].width,store[src].height);
                return;
            }

            stop();
            img.src = src;

            function stop(){
                if(img.width && img.height){
                    clearInterval(timer);
                    store.width = img.width;
                    store.height = img.height;
                    callback && callback(img.width,img.height);
                    return;
                }
                timer = setTimeout(stop,50);
            }
        },
        loadSource: function(){
            // 加载字体图标库和用于图片拖拽的js
            var that = this;

            if(that.settings.loadFont){
                var fonts = document.createElement('link');
                fonts.href = '//cdn.bootcss.com/font-awesome/4.4.0/css/font-awesome.min.css';
                fonts.rel = 'stylesheet';
                fonts.type = 'text/css';
                document.head.appendChild(fonts);
            }

            if(that.settings.isDrag){
                var dragjs = document.createElement('script');
                dragjs.src = 'javascripts/drag.js';
                document.head.appendChild(dragjs);
                dragjs.onload = function(){
                    that.drag();
                };
            }

        }

    };

    $.fn[pluginName] = function(options) {
        this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Photo(this, options));
            }
        });

        return this;
    };

})(window.jQuery);
