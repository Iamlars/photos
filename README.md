# photos
简单的图片查看器

### 用法示例

    $(function(){
       // 一般调用
      $('#photo').Photo(); 
       
        // 以下为全部默认设置
        $('#photo').Photo({
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
        });
    })
