(function () {
  // 获取SDK目录的服务路径
  function CgsPath() {
    var CGSINIT_PATH = "/CgsInit.js";
    var scriptTags = document.getElementsByTagName("script");
    for (var i = 0; i < scriptTags.length; i++) {
      if (scriptTags[i].src.indexOf(CGSINIT_PATH) > -1) {
        var sdkPath = scriptTags[i].src.replace(CGSINIT_PATH, "/");
        return sdkPath;
      }
    }
  }
  // 全局变量参数用来标识WebGIS启动模式，1:二三维一体，2:仅二维，3:仅三维
  window.WGMODEFLAG = 1;
  // 全局变量：SDK的绝对路径
  window.CGS_SDK_PATH = CgsPath();

  // 其它未打包的静态文件
  var otherFiles = [
    { name: "Cgs/uis/symbolClazz.riot", type: "riottag" },
    { name: "Cgs/uis/symbolLayer.riot", type: "riottag" },
    { name: "Cgs/uis/symbolProperty.riot", type: "riottag" },
    { name: "Cgs/uis/symbolTable.riot", type: "riottag" },
    { name: "Cgs/uis/symbolAnnotationAttr.riot", type: "riottag" },
    { name: "Cgs/uis/symbolDrawingAttr.riot", type: "riottag" },
    { name: "Cgs/uis/symbolGeometryAttr.riot", type: "riottag" },
    { name: "Cgs/uis/symbolSignAttr.riot", type: "riottag" },
    { name: "Cgs/uis/symbolAttr.riot", type: "riottag" },
    { name: "Cgs/uis/symbolTree.riot", type: "riottag" },
    { name: "Cgs/uis/uiComponents.riot", type: "riottag" },
    { name: "Cgs/uis/widgets.riot", type: "riottag" },

    { name: "Cgs/modelPage/mxclazz.riot", type: "riottag" },
    { name: "Cgs/modelPage/mxproperty.riot", type: "riottag" },
    { name: "Cgs/modelPage/mxtable.riot", type: "riottag" },
    { name: "Cgs/modelPage/mxprotractattr.riot", type: "riottag" },
    { name: "Cgs/modelPage/mxmodeltree.riot", type: "riottag" },
    { name: "Cgs/modelPage/uiComponents.riot", type: "riottag" },
    { name: "Cgs/modelPage/widgets.riot", type: "riottag" },
    { name: "Cgs/modelPage/mxEditLayer.riot", type: "riottag" },

    { name: "ThirdParty/color/spectrum.css", type: "css" },
    { name: "ThirdParty/layui/css/layui.css", type: "css" },
    { name: "dHtmlxTree/codebase/fonts/font_roboto/roboto.css", type: "css" },
    { name: "dHtmlxTree/codebase/dhtmlxtree.css", type: "css" },
    { name: "SDK3D/Cesium/Widgets/widgets.css", type: "css" },
    { name: "css/CgsEarth.css", type: "css" },
    { name: "ThirdParty/color/spectrum.js", type: "script" },
    { name: "dHtmlxTree/codebase/dhtmlxtree.js", type: "script" },
    { name: "SDK2D/v6.4.3-dist/ol.js", type: "script" },
    { name: "SDK2D/v6.4.3-dist/ol-ext.min.js", type: "script" },
    { name: "ThirdParty/echart/echarts.js", type: "script" },
    { name: "ThirdParty/d3.js", type: "script" },
    // {name: 'SDK2D/v4.6.4-dist/ol-debug.js', type: 'script'},
    { name: "SDK3D/Cesium/Cesium.js", type: "script" },
    { name: "ThirdParty/mapv.js", type: "script" },
    { name: "ThirdParty/netcdfjs.js", type: "script" },
    { name: "ThirdParty/kriging/kriging.min.js", type: "script" },
    { name: "ThirdParty/CesiumNavigation.umd.js", type: "script" },
  ];

  // 根据路径和类型依次加载js和css文件
  function writeFile(path, type) {
    if (type === "script") {
      document.write(
        '<script type="text/javascript" src="' + path + '"></script>'
      );
    }
    if (type === "css") {
      document.write('<link rel="stylesheet" href="' + path + '" />');
    }
    if (type === "riottag") {
      document.write('<script type="riot/tag" src="' + path + '"></script>');
    }
  }

  // 加载其它未打包的静态文件
  function loadOtherFiles(files) {
    files.forEach((item) => {
      writeFile(`${CGS_SDK_PATH}${item.name}`, item.type);
    });
  }
  
writeFile(CGS_SDK_PATH + "ThirdParty/thirdParty.js", "script");
    loadOtherFiles(otherFiles);
    writeFile(CGS_SDK_PATH + "CgsEarth.min.js", "script");

})();
