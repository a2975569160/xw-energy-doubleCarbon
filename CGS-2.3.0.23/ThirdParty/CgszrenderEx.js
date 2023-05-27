
//对zrender的扩展

var CgszrenderEx = (function (zrender) {

    //设置所有子元素的属性
    zrender.Group.prototype.setChildsAttr = function (key,value) {
        var self = this;

        function setEach(elGroup) {
            elGroup.eachChild(function (el) {
                if(el instanceof zrender.Group){
                    setEach(el);
                }
                else {
                    el.attr(key,value);
                }

            });
        }
        setEach(self);

    };

    //设置所有子元素的属性-带动画
    zrender.Group.prototype.setChildsAttrWithAnime = function (options) {
        var opts = {
            attr:{},
            animeTime:300,
            delayTime:0,
        };_.assign(opts,options);

        var animePromise = function (el) {
            return new Promise(function (ok) {
                el.animateTo(opts.attr,opts.animeTime,opts.delayTime,function () {
                    ok();
                });
            });
        };
        var animes = [];
        var self = this;

        function setEach(elGroup) {
            elGroup.eachChild(function (el) {
                if(el instanceof zrender.Group){
                    setEach(el);
                }
                else {
                    animes.push(animePromise(el))
                }
            });
        }
        setEach(self);
        return Promise.all(animes);
    }



})(Cgszrender);

