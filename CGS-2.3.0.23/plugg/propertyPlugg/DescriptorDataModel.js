DescriptorDataModel = function () {
  var state = {
    objectSelf: null,
    //		showAllFlag:true,
    imagePath: CGS_SDK_PATH + "plugg/propertyPlugg/",
    body: null,
  };
  this.state = state;
  init();

  this.setObject = function (objectSelf) {
    state.objectSelf = objectSelf;
  };

  this.getObject = function () {
    return state.objectSelf;
  };

  //	this.getShowAllFlag = function()
  //	{
  //		return state.showAllFlag;
  //	}

  this.clear = function () {
    //删除属相编辑框的内容
    var propertyEditContent = document.getElementsByClassName(
      "pc_cc_propertyEditContent"
    )[0];

    if (propertyEditContent.hasChildNodes()) {
      while (propertyEditContent.firstChild) {
        propertyEditContent.removeChild(propertyEditContent.firstChild);
      }
    }

    var propertyContainer = document.getElementsByClassName(
      "propertyContainer"
    )[0];
    propertyContainer.style.display = "block";
  };
  this.hide = function () {
    var propertyContainer = document.getElementsByClassName(
      "propertyContainer"
    )[0];
    propertyContainer.style.display = "none";
  };

  this.remove = function () {
    //删除属相编辑框的内容
    var propertyEditContent = document.getElementsByClassName(
      "pc_cc_propertyEditContent"
    )[0];
    propertyEditContent.style.display = "none";

    if (propertyEditContent.hasChildNodes()) {
      while (propertyEditContent.firstChild) {
        propertyEditContent.removeChild(propertyEditContent.firstChild);
      }
    }
  };

  this.add = function (options) {
    var type = options.type;
    var propertyEditContent = document.getElementsByClassName(
      "pc_cc_propertyEditContent"
    )[0];

    if (type == "title") {
      $$(propertyEditContent)
        .parents(".CgsToolBone")
        .find(".CgsLayerTool__titleText")
        .html("属性（" + options.label + "）");
    } else if (type == "header") {
      header(propertyEditContent, options);
    } else if (type == "hline") {
      hline(propertyEditContent, options);
    } else if (type == "input") {
      input(propertyEditContent, options);
    } else if (type == "slider") {
      slider(propertyEditContent, options);
    } else if (type == "dropdown") {
      dropdown(propertyEditContent, options);
    } else if (type == "checkbox") {
      checkbox(propertyEditContent, options);
    }
    //		else if(type == "cesiumPosition")
    //		{
    //			cesiumPosition(propertyEditContent,options);
    //		}
    else if (type == "cesiumOrientation") {
      cesiumOrientation(propertyEditContent, options);
    }
    //		else if(type == "inputMinValueZero")
    //		{
    //			inputMinValueZero(propertyEditContent,options);
    //		}
    //		else if(type == "inputNumber"){
    //			inputNumber(propertyEditContent,options);
    //		}
    //		else if(type == "cesiumColor")
    //		{
    //			cesiumColor(propertyEditContent,options);
    //		}
    else if (type == "cesiumVisibleHeight") {
      cesiumVisibleHeight(propertyEditContent, options);
    } else if (type == "cesiumPosition") {
      MyCesiumPosition(propertyEditContent, options);
    } else if (type == "inputTypeNum") {
      inputTypeNum(propertyEditContent, options);
    } else if (type == "cesiumColor") {
      cesiumColorHH(propertyEditContent, options);
    }
  };

  /**
   * type:cesiumColor
   * setProperty(name,value)
   * name == options.name
   */
  function cesiumColorHH(elements, options) {
    //颜色格式转换一下
    var colorArr = DescriptorDataModel.colorStrToHEX(options.data);

    var item = document.createElement("div");
    item.setAttribute("class", "cesium_color_HEX");

    var leftText = document.createElement("div");
    leftText.setAttribute("class", "cesium_color_leftLabel");
    leftText.innerHTML = options.label;

    var rightBox = document.createElement("div");
    rightBox.setAttribute("class", "cesium_color_rightBox");

    item.appendChild(leftText);
    item.appendChild(rightBox);
    elements.appendChild(item);

    //=================rgb  start==========
    var colorContent = document.createElement("div");
    colorContent.setAttribute("class", "cesium_color_rightContainer");

    var colorLabel = document.createElement("div");
    colorLabel.setAttribute("class", "cesium_color_rightContainer_leftLabel");
    colorLabel.setAttribute("name", options.name);
    colorLabel.innerHTML = "颜色";

    var rightColor = document.createElement("input");
    rightColor.setAttribute("type", "color");
    rightColor.setAttribute("class", "cesium_color_rightContainer_rgbColor");
    rightColor.setAttribute("value", colorArr[0]);
    rightColor.onchange = function (e) {
      var color = e.target.value;
      var type = e.target.previousSibling.getAttribute("name");
      var alpha = e.target.parentNode.nextSibling.childNodes[2].value;

      var result = DescriptorDataModel.colorHEXtoRGBA(color, alpha);
      state.objectSelf.setProperty(type, result);
    };

    colorContent.appendChild(colorLabel);
    colorContent.appendChild(rightColor);
    rightBox.appendChild(colorContent);
    //===============rgb end===================

    //===============alpha  start==================
    var rightContent = document.createElement("div");
    rightContent.setAttribute("class", "cesium_color_rightContainer");

    var leftLabel = document.createElement("div");
    leftLabel.setAttribute("class", "cesium_color_rightContainer_leftLabel");
    leftLabel.setAttribute("name", options.name);
    leftLabel.innerHTML = "透明度";

    var middleSlider = document.createElement("input");
    middleSlider.setAttribute(
      "class",
      "cesium_color_rightContainer_middleSlider"
    );
    middleSlider.setAttribute("type", "range");
    middleSlider.setAttribute("max", 100);
    var result = parseFloat(colorArr[1]) * 100;
    middleSlider.value = result.toFixed(2);

    //滑块监听
    middleSlider.oninput = function (e) {
      var rangeNumber = e.target.valueAsNumber;
      var content = e.target.nextSibling;
      var type = e.target.previousSibling.getAttribute("name");

      var color = e.target.parentNode.previousSibling.childNodes[1].value;

      var alpha = rangeNumber / 100;
      alpha = alpha.toFixed(2);
      content.value = alpha;

      var result = DescriptorDataModel.colorHEXtoRGBA(color, alpha);

      state.objectSelf.setProperty(type, result);
    };
    //右边输入框输入
    var rightPosition = document.createElement("input");
    rightPosition.setAttribute(
      "class",
      "cesium_color_rightContainer_rightValue"
    );
    rightPosition.value = colorArr[1];
    //按下回车键
    rightPosition.onkeypress = function (event) {
      if (event.keyCode == 13) {
        updateValue(event);
      }
    };
    //失去焦点
    rightPosition.onblur = function (event) {
      updateValue(event);
    };

    function updateValue(event) {
      if (isNaN(event.target.value)) {
        CgsTipsWindow.showLog("请输入数值！");
        return;
      }

      var type = event.target.parentNode.childNodes[0].getAttribute("name");
      var slide = event.target.previousSibling;
      var value = parseFloat(event.target.value);
      value = value.toFixed(2);
      event.target.value = value;
      value = parseFloat(value);

      if (value < 0) {
        value = 0;
        value = value.toFixed(2);
        event.target.value = value;
        slide.value = 0;
      } else if (value > 1) {
        value = 1;
        value = value.toFixed(2);
        event.target.value = value;
        slide.value = 100;
      } else {
        var vv = parseFloat(value);
        slide.value = vv * 100;
      }

      var color = event.target.parentNode.previousSibling.childNodes[1].value;
      var result = DescriptorDataModel.colorHEXtoRGBA(color, value);
      state.objectSelf.setProperty(type, result);
    }

    rightContent.appendChild(leftLabel);
    rightContent.appendChild(middleSlider);
    rightContent.appendChild(rightPosition);
    rightBox.appendChild(rightContent);
  }

  /**
   * setProperty(name,value)
   * name == options.name
   */

  function MyCesiumPosition(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "cesium_position");

    var leftText = document.createElement("div");
    leftText.setAttribute("class", "cesium_position_leftLabel");
    leftText.innerText = "位置";

    var rightBox = document.createElement("div");
    rightBox.setAttribute("class", "cesium_position_rightBox");
    rightBox.setAttribute("data-icon", options.name);

    var str = ["经度", "纬度", "高度"];
    var strIcon = ["lng", "lat", "height"];
    var range = [
      [-180, 180],
      [-90, 90],
    ];
    for (var i = 0; i < 3; i++) {
      var rightContent = document.createElement("div");
      rightContent.setAttribute("class", "cesium_position_rightContainer");
      if (i < 2) {
        rightContent.setAttribute("min", range[i][0]);
        rightContent.setAttribute("max", range[i][1]);
      }

      var leftLabel = document.createElement("div");
      leftLabel.setAttribute(
        "class",
        "cesium_position_rightContainer_leftLabel"
      );
      leftLabel.setAttribute("data-icon", strIcon[i]);
      leftLabel.innerText = str[i];

      var minusBt = document.createElement("div");
      minusBt.setAttribute("class", "cesium_position_rightContainer_minus");
      if (i < 2) {
        minusBt.setAttribute("stepLen", options.minusLngLatStepLen);
      } else {
        minusBt.setAttribute("stepLen", options.minusHeightStepLen);
      }

      minusBt.onclick = function (event) {
        var stepLen = parseFloat(event.target.getAttribute("stepLen"));
        var middleValue = event.target.nextSibling;
        var result = parseFloat(middleValue.value);
        result -= stepLen;

        updateValue(event, result);
      };

      var plusBt = document.createElement("div");
      plusBt.setAttribute("class", "cesium_position_rightContainer_plus");
      if (i < 2) {
        plusBt.setAttribute("stepLen", options.plusLngLatStepLen);
      } else {
        plusBt.setAttribute("stepLen", options.plusHeightStepLen);
      }
      plusBt.onclick = function (event) {
        var stepLen = parseFloat(event.target.getAttribute("stepLen"));
        var middleValue = event.target.previousSibling;

        var result = parseFloat(middleValue.value);
        result += stepLen;

        updateValue(event, result);
      };

      var middleValue = document.createElement("input");
      middleValue.setAttribute(
        "class",
        "cesium_position_rightContainer_middleValue"
      );
      if (options.data[i] == undefined && i == 2) {
        middleValue.value = 0;
      } else {
        middleValue.value = options.data[i].toFixed(4);
      }

      //按下回车键
      middleValue.onkeypress = function (event) {
        if (event.keyCode == 13) {
          if (isNaN(event.target.value)) {
            CgsTipsWindow.showLog("请输入数值！");
            return;
          }
          var result = parseFloat(event.target.value);
          updateValue(event, result);
        }
      };
      //失去焦点
      middleValue.onblur = function (event) {
        if (isNaN(event.target.value)) {
          CgsTipsWindow.showLog("请输入数值！");
          return;
        }
        var result = parseFloat(event.target.value);
        updateValue(event, result);
      };

      rightContent.appendChild(leftLabel);
      rightContent.appendChild(minusBt);
      rightContent.appendChild(middleValue);
      rightContent.appendChild(plusBt);

      rightBox.appendChild(rightContent);
    }

    item.appendChild(leftText);
    item.appendChild(rightBox);

    elements.appendChild(item);

    function updateValue(event, result) {
      var value = result.toFixed(4);

      if (isNaN(value)) {
        CgsTipsWindow.showLog("isNaN");
        return;
      }

      //			var name = event.target.parentNode.childNodes[0].innerText;
      var name = event.target.parentNode.childNodes[0].getAttribute(
        "data-icon"
      );
      var middleValue = event.target.parentNode.childNodes[2];
      if (name == "height") {
        middleValue.value = value;
      } else {
        var min = parseFloat(event.target.parentNode.getAttribute("min"));
        var max = parseFloat(event.target.parentNode.getAttribute("max"));

        if (value >= max) {
          middleValue.value = max;
        } else if (value <= min) {
          middleValue.value = min;
        } else {
          middleValue.value = value;
        }
      }

      var type = event.target.parentNode.parentNode.getAttribute("data-icon");
      var result = [];
      for (var i = 0; i < 3; i++) {
        var text =
          event.target.parentNode.parentNode.childNodes[i].childNodes[2].value;
        text = parseFloat(text);
        result.push(text);
      }

      state.objectSelf.setProperty(type, result);
    }
  }

  function cesiumVisibleHeight(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "cesium_visibleheight");

    var leftText = document.createElement("div");
    leftText.setAttribute("class", "cesium_visibleheight_leftLabel");
    leftText.innerHTML = "可见高度";

    var rightBox = document.createElement("div");
    rightBox.setAttribute("class", "cesium_visibleheight_rightBox");
    rightBox.setAttribute("data-type", options.name);

    var str = ["最小值", "最大值"];

    for (var i = 0; i < 2; i++) {
      var rightContent = document.createElement("div");
      rightContent.setAttribute("class", "cesium_position_rightContainer");

      var leftLabel = document.createElement("div");
      leftLabel.setAttribute(
        "class",
        "cesium_position_rightContainer_leftLabel"
      );
      leftLabel.innerHTML = str[i];

      var rightPosition = document.createElement("input");
      rightPosition.setAttribute(
        "class",
        "cesium_position_rightContainer_height_rightValue"
      );

      if (options.value[i] == undefined) {
        rightPosition.value = "";
      } else {
        rightPosition.value = options.value[i].toFixed(4);
      }

      //按下回车键
      rightPosition.onkeypress = function (event) {
        if (event.keyCode == 13) {
          updateValue(event);
        }
      };
      //失去焦点
      rightPosition.onblur = function (event) {
        updateValue(event);
      };
      rightContent.appendChild(leftLabel);
      rightContent.appendChild(rightPosition);
      rightBox.appendChild(rightContent);
    }
    item.appendChild(leftText);
    item.appendChild(rightBox);
    elements.appendChild(item);

    function updateValue(event) {
      if (isNaN(event.target.value)) {
        CgsTipsWindow.showLog("请输入数值！");
        return;
      }

      var rightBox = event.target.parentNode.parentNode;
      var type = rightBox.getAttribute("data-type");
      var minStr = rightBox.childNodes[0].childNodes[1].value;
      var maxStr = rightBox.childNodes[1].childNodes[1].value;
      if (isNaN(minStr) || isNaN(maxStr)) {
        CgsTipsWindow.showLog("可见高度为数值型，请重新输入！");
        return;
      }

      var min = parseFloat(minStr);
      var max = parseFloat(maxStr);
      if (minStr == "" && maxStr == "") {
        var str = [0];
        state.objectSelf.setProperty(type, str);
      } else if (minStr == "" && maxStr != "") {
        if (max < 0) {
          CgsTipsWindow.showLog("可见高度的最大值必须大于最小值，请修改！");
          return;
        }
        var str = [0, max];
        state.objectSelf.setProperty(type, str);
      } else if (minStr != "" && maxStr == "") {
        var str = [min];
        state.objectSelf.setProperty(type, str);
      } else {
        if (min > max) {
          CgsTipsWindow.showLog("可见高度的最小值必须小于最大值，请修改！");
          return;
        }
        var str = [min, max];
        state.objectSelf.setProperty(type, str);
      }
    }
  }

  function cesiumColor(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "cesium_color1");

    var leftText = document.createElement("div");
    leftText.setAttribute("class", "cesium_color_leftLabel");
    leftText.innerHTML = options.label;

    var rightBox = document.createElement("div");
    rightBox.setAttribute("class", "cesium_color_rightBox");

    var str = ["红", "绿", "蓝", "透明度"];
    var strIcon = ["red", "green", "blue", "alpha"];
    var range = [
      [0, 255],
      [0, 255],
      [0, 255],
      [0, 1],
    ];
    for (var i = 0; i < 4; i++) {
      var rightContent = document.createElement("div");
      rightContent.setAttribute("class", "cesium_color_rightContainer");

      var leftLabel = document.createElement("div");
      leftLabel.setAttribute("class", "cesium_color_rightContainer_leftLabel");
      leftLabel.setAttribute("name", options.name);
      leftLabel.setAttribute("data-icon", strIcon[i]);
      leftLabel.innerHTML = str[i];

      var middleSlider = document.createElement("input");
      middleSlider.setAttribute(
        "class",
        "cesium_color_rightContainer_middleSlider"
      );

      middleSlider.setAttribute("type", "range");
      middleSlider.setAttribute("max", 100);
      var dis = Math.abs(range[i][1] - range[i][0]);

      var result =
        (Math.abs(parseFloat(options.data[i]) - range[i][0]) / dis) * 100;
      if (i < 3) {
        middleSlider.value = parseInt(result);
      } else {
        middleSlider.value = result.toFixed(2);
      }

      middleSlider.oninput = function (e) {
        var rangeNumber = e.target.valueAsNumber;
        var content = e.target.nextSibling;
        //				var name = e.target.previousSibling.innerHTML;
        var name = e.target.previousSibling.getAttribute("data-icon");
        var type = e.target.previousSibling.getAttribute("name") + "_" + name;

        var min = parseInt(content.min);
        var max = parseInt(content.max);
        var dis = Math.abs(max - min);
        var result = (dis / 100) * rangeNumber + min;
        if (name != "alpha") {
          result = Math.round(result);
        } else {
          result = result.toFixed(2);
        }
        content.value = result;

        state.objectSelf.setProperty(type, result);
      };

      var rightPosition = document.createElement("input");
      rightPosition.setAttribute(
        "class",
        "cesium_color_rightContainer_rightValue"
      );
      rightPosition.setAttribute("min", range[i][0]);
      rightPosition.setAttribute("max", range[i][1]);
      rightPosition.value = options.data[i];
      //按下回车键
      rightPosition.onkeypress = function (event) {
        if (event.keyCode == 13) {
          updateValue(event);
        }
      };
      //失去焦点
      rightPosition.onblur = function (event) {
        updateValue(event);
      };

      function updateValue(event) {
        if (isNaN(event.target.value)) {
          CgsTipsWindow.showLog("请输入数值！");
          return;
        }

        //				var name = event.target.parentNode.childNodes[0].innerHTML;
        var name = event.target.parentNode.childNodes[0].getAttribute(
          "data-icon"
        );
        var type =
          event.target.parentNode.childNodes[0].getAttribute("name") +
          "_" +
          name;
        var value = parseFloat(event.target.value);

        if (name != "alpha") {
          value = Math.round(value);
        } else {
          value = value.toFixed(2);
        }
        event.target.value = value;
        var min = parseFloat(event.target.min);
        var max = parseFloat(event.target.max);
        var dis = Math.abs(max - min);
        var slide = event.target.previousSibling;

        if (value < min) {
          value = min;
          if (name == "alpha") {
            value = value.toFixed(2);
          }
          event.target.value = value;
          slide.value = 0;
        } else if (value > max) {
          value = max;
          if (name == "alpha") {
            value = value.toFixed(2);
          }
          event.target.value = value;
          slide.value = 100;
        } else {
          var vv = parseFloat(value) + Math.abs(min);
          slide.value = (vv / dis) * 100;
        }
        state.objectSelf.setProperty(type, value);
      }

      rightContent.appendChild(leftLabel);
      rightContent.appendChild(middleSlider);
      rightContent.appendChild(rightPosition);

      rightBox.appendChild(rightContent);
    }

    item.appendChild(leftText);
    item.appendChild(rightBox);

    elements.appendChild(item);
  }

  function cesiumOrientation(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "pc_cc_pec_typeCesiumOrientation");

    var leftText = document.createElement("div");
    leftText.setAttribute("class", "pc_cc_pec_tco_leftLabel");
    leftText.innerHTML = "方向";

    var rightBox = document.createElement("div");
    rightBox.setAttribute("class", "pc_cc_pec_tco_rightBox");

    //		var str = ['航向角','俯仰角','横滚角'];
    var str = ["绕X轴", "绕Y轴", "绕Z轴"];
    var strIcon = ["roll", "pitch", "heading"];
    var range = [
      [-180, 180],
      [-90, 90],
      [-180, 180],
    ];
    for (var i = 0; i < 3; i++) {
      var rightContent = document.createElement("div");
      rightContent.setAttribute("class", "pc_cc_pec_tco_ro_rightContainer");

      var leftLabel = document.createElement("div");
      leftLabel.setAttribute("class", "pc_cc_pec_tco_ro_rc_leftLabel");
      leftLabel.setAttribute("data-icon", strIcon[i]);
      leftLabel.innerHTML = str[i];

      var middleSlider = document.createElement("input");
      middleSlider.setAttribute("class", "pc_cc_pec_tco_ro_rc_middleSlider");

      middleSlider.setAttribute("type", "range");
      middleSlider.setAttribute("max", 100);

      var dis = Math.abs(range[i][1] - range[i][0]);
      var result =
        (Math.abs(parseFloat(options.data[i]) - range[i][0]) / dis) * 100;
      middleSlider.value = result;

      middleSlider.oninput = function (e) {
        var rangeNumber = e.target.valueAsNumber;
        //				var name = e.target.previousSibling.innerHTML;
        var name = e.target.previousSibling.getAttribute("data-icon");
        var content = e.target.nextSibling;

        var min = parseInt(content.min);
        var max = parseInt(content.max);
        var dis = Math.abs(max - min);
        var result = ((dis / 100) * rangeNumber + min).toFixed(2);
        content.value = result;
        state.objectSelf.setProperty(name, result);
      };

      var rightPosition = document.createElement("input");
      rightPosition.setAttribute("class", "pc_cc_pec_tco_ro_rc_rightValue");
      rightPosition.setAttribute("min", range[i][0]);
      rightPosition.setAttribute("max", range[i][1]);
      rightPosition.value = options.data[i].toFixed(2);

      //按下回车键
      rightPosition.onkeypress = function (event) {
        if (event.keyCode == 13) {
          updateValue(event);
        }
      };
      //失去焦点
      rightPosition.onblur = function (event) {
        updateValue(event);
      };

      rightContent.appendChild(leftLabel);
      rightContent.appendChild(middleSlider);
      rightContent.appendChild(rightPosition);

      rightBox.appendChild(rightContent);
    }

    item.appendChild(leftText);
    item.appendChild(rightBox);

    elements.appendChild(item);

    function updateValue(event) {
      if (isNaN(event.target.value)) {
        CgsTipsWindow.showLog("请输入数值!");
        return;
      }

      var value = parseFloat(event.target.value);
      value = value.toFixed(2);
      event.target.value = value;

      //			var name = event.target.parentNode.childNodes[0].innerHTML;
      var name = event.target.parentNode.childNodes[0].getAttribute(
        "data-icon"
      );
      var min = parseFloat(event.target.min);
      var max = parseFloat(event.target.max);
      var dis = Math.abs(max - min);

      var slide = event.target.previousSibling;

      if (value < min) {
        value = min;
        event.target.value = value;
        slide.value = 0;
      } else if (value > max) {
        value = max;
        event.target.value = value;
        slide.value = 100;
      } else {
        var vv = parseFloat(value) + Math.abs(min);
        slide.value = (vv / dis) * 100;
      }
      state.objectSelf.setProperty(name, value);
    }
  }

  //	function cesiumPosition(elements,options)
  //	{
  //		var item = document.createElement("div");
  //		item.setAttribute('class','cesium_position');
  //
  //		var leftText = document.createElement("div");
  //		leftText.setAttribute('class','cesium_position_leftLabel');
  //		leftText.innerHTML = "位置";
  //
  //		var rightBox = document.createElement("div");
  //		rightBox.setAttribute('class','cesium_position_rightBox');
  //
  //		var str = ['lng','lat','height'];
  //		var range = [[-180,180],[-90,90]];
  //		for(var i = 0;i < 3;i ++)
  //		{
  //			var rightContent = document.createElement("div");
  //			rightContent.setAttribute('class','cesium_position_rightContainer');
  //
  //			var leftLabel = document.createElement("div");
  //			leftLabel.setAttribute('class','cesium_position_rightContainer_leftLabel');
  //			leftLabel.innerHTML = str[i];
  //
  //			if(i<2)
  //			{
  //				var middleSlider = document.createElement("input");
  //				middleSlider.setAttribute('class','cesium_position_rightContainer_middleSlider');
  //
  //				middleSlider.setAttribute('type','range');
  //				middleSlider.setAttribute('max',100);
  //
  //				var dis = Math.abs(range[i][1]-range[i][0]);
  //				var result = Math.abs(parseFloat(options.data[i])-range[i][0])/dis*100;
  //				middleSlider.value = result;
  //
  //				middleSlider.oninput = function(e)
  //				{
  //					var rangeNumber = e.target.valueAsNumber;
  //					var name = e.target.previousSibling.innerHTML;
  //					var content = e.target.nextSibling;
  //
  //					var min =  parseInt(content.min);
  //					var max =  parseInt(content.max);
  //					var dis =  Math.abs(max-min);
  //					var result = (dis/100*rangeNumber + min).toFixed(4);
  //					content.value = result;
  //					state.objectSelf.setProperty(name,result);
  //				}
  //
  //
  //
  //				var rightPosition = document.createElement("input");
  //				rightPosition.setAttribute('class','cesium_position_rightContainer_rightValue');
  //				rightPosition.setAttribute('min',range[i][0]);
  //				rightPosition.setAttribute('max',range[i][1]);
  //				rightPosition.value = options.data[i].toFixed(4);
  //				//按下回车键
  //				rightPosition.onkeypress = function(event)
  //				{
  //					if(event.keyCode==13)
  //					{
  //						updateValue(event);
  //					}
  //				}
  //				//失去焦点
  //				rightPosition.onblur = function(event)
  //				{
  //					updateValue(event);
  //				}
  //
  //
  //
  //				rightContent.appendChild(leftLabel);
  //				rightContent.appendChild(middleSlider);
  //				rightContent.appendChild(rightPosition);
  //			}else
  //			{
  //				var rightPosition = document.createElement("input");
  //				rightPosition.setAttribute('class','cesium_position_rightContainer_height_rightValue');
  //				rightPosition.value = options.data[i].toFixed(4);
  //				//按下回车键
  //				rightPosition.onkeypress = function(event)
  //				{
  //					if(event.keyCode==13)
  //					{
  //						if(isNaN(event.target.value))
  //						{
  ////							console.log("isNaN");
  //							return;
  //						}
  //						var value = parseFloat(event.target.value);
  //						event.target.value = value.toFixed(4);
  //						state.objectSelf.setProperty("height",value);
  //					}
  //				}
  //				//失去焦点
  //				rightPosition.onblur = function(event)
  //				{
  //					if(isNaN(event.target.value))
  //					{
  ////						console.log("isNaN");
  //						return;
  //					}
  //
  //					var value = parseFloat(event.target.value);
  //					event.target.value = value.toFixed(4);
  //					state.objectSelf.setProperty("height",value);
  //				}
  //				rightContent.appendChild(leftLabel);
  //				rightContent.appendChild(rightPosition);
  //			}
  //
  //
  //			rightBox.appendChild(rightContent);
  //		}
  //
  //		item.appendChild(leftText);
  //		item.appendChild(rightBox);
  //
  //
  //		elements.appendChild(item);
  //
  //		function updateValue(event)
  //		{
  //			if(isNaN(event.target.value))
  //			{
  ////				console.log("isNaN");
  //				return;
  //			}
  //
  //			var value = parseFloat(event.target.value);
  //			value = value.toFixed(4);
  //			event.target.value = value;
  //
  //			var name = event.target.parentNode.childNodes[0].innerHTML;
  //			var min = parseFloat(event.target.min);
  //			var max = parseFloat(event.target.max);
  //			var dis = Math.abs(max -min);
  //
  //			var slide = event.target.previousSibling;
  //
  //			if(value<min)
  //			{
  //				value = min;
  //				event.target.value = value;
  //				slide.value = 0;
  //			}else if(value>max)
  //			{
  //				value = max;
  //				event.target.value = value;
  //				slide.value = 100;
  //			}else{
  //				var vv = parseFloat(value)+Math.abs(min);
  //				slide.value = vv/dis*100;
  //			}
  //			state.objectSelf.setProperty(name,value);
  //
  //		}
  //	}
  /**
	 * example:
	 * {
	 * type:'slider',//类型
		label:'旋转角度',//显示的名称
		name:'rotation',//对应getProperty的name
		max:360,//最大范围
		min:0,//最小范围
		defaultValue:self.getRotation(),//初始化的数值
		fixedNumber:0 //保留小数位数
		}
	 */

  function slider(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "pc_cc_pec_typeSlider");

    var name = document.createElement("div");
    name.setAttribute("class", "pc_cc_pec_ts_label");
    name.setAttribute("name", options.name);
    name.innerHTML = options.label;

    var slide = document.createElement("input");
    slide.setAttribute("class", "pc_cc_pec_ts_slider");
    slide.setAttribute("type", "range");
    slide.setAttribute("max", "100");

    if (options.fixedNumber == undefined) {
      slide.setAttribute("name", 0);
    } else {
      slide.setAttribute("name", options.fixedNumber);
    }

    var dis = Math.abs(parseFloat(options.max) - parseFloat(options.min));

    var result =
      (Math.abs(parseFloat(options.defaultValue) - parseFloat(options.min)) /
        dis) *
      100;
    if (options.fixedNumber == 0) {
      result = parseInt(result);
    } else {
      result = result.toFixed(options.fixedNumber);
    }
    slide.value = result;

    slide.oninput = function (e) {
      var rangeNumber = e.target.valueAsNumber;
      var fixedNumber = e.target.getAttribute("name");
      var content = e.target.nextSibling;
      var min = parseInt(content.min);
      var max = parseInt(content.max);
      var dis = Math.abs(max - min);

      var result = ((dis / 100) * rangeNumber + min).toFixed(4);

      content.value = solveValue(fixedNumber, result);
      var name = e.target.previousSibling.getAttribute("name");
      state.objectSelf.setProperty(name, result);
    };

    var content = document.createElement("input");
    content.setAttribute("class", "pc_cc_pec_ts_value");
    content.setAttribute("min", options.min);
    content.setAttribute("max", options.max);
    content.value = options.defaultValue;

    //按下回车键
    content.onkeypress = function (event) {
      if (event.keyCode == 13) {
        updateValue(event);
      }
    };
    //失去焦点
    content.onblur = function (event) {
      updateValue(event);
    };

    function solveValue(fn, value) {
      var fixedNumber = parseInt(fn);
      var value = parseFloat(value);
      var result = 0;
      if (fixedNumber == 0) {
        result = Math.round(value);
      } else {
        result = value.toFixed(fixedNumber);
      }
      return result;
    }
    function updateValue(event) {
      if (isNaN(event.target.value)) {
        CgsTipsWindow.showLog("请输入数值！");
        return;
      }

      var slide = event.target.previousSibling;
      var fixedNumber = slide.getAttribute("name");
      var value = parseFloat(event.target.value);

      event.target.value = solveValue(fixedNumber, value);
      var name = event.target.parentNode.childNodes[0].getAttribute("name");
      var min = parseFloat(event.target.min);
      var max = parseFloat(event.target.max);
      var dis = Math.abs(max - min);

      if (value < min) {
        value = min;
        event.target.value = solveValue(fixedNumber, value);
        slide.value = 0;
      } else if (value > max) {
        value = max;

        event.target.value = solveValue(fixedNumber, value);
        slide.value = 100;
      } else {
        var vv = parseFloat(value) + Math.abs(min);
        slide.value = (vv / dis) * 100;
      }

      state.objectSelf.setProperty(name, value);
    }

    item.appendChild(name);
    item.appendChild(slide);
    item.appendChild(content);

    elements.appendChild(item);
  }

  function dropdown(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "pc_cc_pec_typeDropdown");

    var title = document.createElement("div");
    title.setAttribute("class", "pc_cc_pec_td_label");
    title.setAttribute("readonly", "true");
    title.innerHTML = options.label;

    var content = document.createElement("div");
    content.setAttribute("class", "pc_cc_pec_td_content");
    content.setAttribute("name", options.name);

    var leftText = document.createElement("div");
    leftText.setAttribute("class", "pc_cc_pec_td_c_leftText");
    leftText.innerHTML = options.defaultValue;
    var rightTri = document.createElement("div");
    rightTri.setAttribute("class", "pc_cc_pec_td_c_rightTri");
    rightTri.onclick = function (e) {
      e.stopPropagation();
      var listItemBox = e.target.nextSibling;

      if (listItemBox.style.display == "none") {
        listItemBox.style.display = "block";
      } else {
        listItemBox.style.display = "none";
      }
    };
    content.appendChild(leftText);
    content.appendChild(rightTri);

    var listItemBox = document.createElement("div");
    listItemBox.setAttribute("class", "pc_cc_pec_td_c_listItemBox");
    listItemBox.style.display = "none";

    for (var i = 0; i < options.data.length; i++) {
      var listItem = document.createElement("div");
      listItem.setAttribute("class", "pc_cc_pec_td_listItem");
      listItem.innerHTML = options.data[i].label;
      listItemBox.appendChild(listItem);

      listItem.onclick = function (e) {
        e.stopPropagation();
        var leftText = e.target.parentNode.parentNode.childNodes[0];
        var value = e.target.innerHTML;
        leftText.innerHTML = value;

        var listItemBox = e.target.parentNode;
        listItemBox.style.display = "none";

        var name = e.target.parentNode.parentNode.getAttribute("name");
        state.objectSelf.setProperty(name, value);
      };
    }
    content.appendChild(listItemBox);

    item.appendChild(title);
    item.appendChild(content);

    elements.appendChild(item);
  }
  function checkbox(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "pc_cc_pec_typeCheckbox");

    var title = document.createElement("div");
    title.setAttribute("class", "pc_cc_pec_tcb_label");
    title.innerHTML = options.label;

    var content = document.createElement("input");
    content.setAttribute("class", "pc_cc_pec_tcb_box");
    content.setAttribute("type", "checkbox");
    content.setAttribute("name", options.name);
    content.checked = options.value;

    content.onclick = function (e) {
      var name = e.target.name;
      var value = e.target.checked;
      state.objectSelf.setProperty(name, value);
    };

    item.appendChild(title);
    item.appendChild(content);

    elements.appendChild(item);
  }

  //	/**
  //	 * type inputGeneral
  //	 *
  //	 *
  //	 */
  //	function inputGeneral(elements,options)
  //	{
  //
  //		var item = document.createElement("div");
  //		item.setAttribute('class','pc_cc_pec_typeInput');
  //
  //		var title = document.createElement("div");
  //		title.setAttribute('class','pc_cc_pec_ti_label');
  //		title.innerHTML = options.label;
  //
  //		item.appendChild(title);
  //
  //		var content = document.createElement("input");
  //		content.setAttribute('class','pc_cc_pec_ti_value');
  //		content.setAttribute("name",options.name);
  //		content.value = options.value;
  //		if(options.readonly)
  //		{
  //			content.setAttribute("readonly",options.readonly);
  //		}else
  //		{
  //			//按下回车键
  //			content.onkeypress = function(event)
  //			{
  //				if(event.keyCode==13)
  //				{
  //					var value = event.target.value;
  //					var name = event.target.name;
  //
  //					state.objectSelf.setProperty(name,value);
  //				}
  //			}
  //			//失去焦点
  //			content.onblur = function(event)
  //			{
  //				var value = event.target.value;
  //				var name = event.target.name;
  //
  //				state.objectSelf.setProperty(name,value);
  //			}
  //		}
  //
  //		item.appendChild(content);
  //
  //		elements.appendChild(item);
  //		// 24 36 52
  //		var disHeight = parseInt(item.clientHeight)-24;
  //		if(disHeight > 0)
  //		{
  //			content.style.marginTop = disHeight/2 +"px";
  //
  //		}else
  //		{
  //			title.style.marginTop = "4px";
  //		}
  //	}

  /**
   * type inputMinValueZero
   *
   * min value is 0
   */
  //	function inputMinValueZero(elements,options)
  //	{
  //
  //		var item = document.createElement("div");
  //		item.setAttribute('class','pc_cc_pec_typeInput');
  //
  //		var title = document.createElement("div");
  //		title.setAttribute('class','pc_cc_pec_ti_label');
  //		title.innerHTML = options.label;
  //
  //		item.appendChild(title);
  //
  //		var content = document.createElement("input");
  //		content.setAttribute('class','pc_cc_pec_ti_value');
  //		content.setAttribute("name",options.name);
  //		content.value = options.value;
  //		if(options.readonly)
  //		{
  //			content.setAttribute("readonly",options.readonly);
  //		}else
  //		{
  //			//按下回车键
  //			content.onkeypress = function(event)
  //			{
  //				if(event.keyCode==13)
  //				{
  //					var value = event.target.value;
  //					var name = event.target.name;
  //
  //					state.objectSelf.setProperty(name,value);
  //				}
  //				return (/[\d.]/.test(String.fromCharCode(event.keyCode)));
  //			}
  //			//失去焦点
  //			content.onblur = function(event)
  //			{
  //				var value = event.target.value;
  //				var name = event.target.name;
  //
  //				state.objectSelf.setProperty(name,value);
  //			}
  //		}
  //
  //		item.appendChild(content);
  //
  //		elements.appendChild(item);
  //		// 24 36 52
  //		var disHeight = parseInt(item.clientHeight)-24;
  //		if(disHeight > 0)
  //		{
  //			content.style.marginTop = disHeight/2 +"px";
  //
  //		}else
  //		{
  //			title.style.marginTop = "4px";
  //		}
  //	}

  //	function inputNumber(elements,options)
  //	{
  //
  //		var item = document.createElement("div");
  //		item.setAttribute('class','pc_cc_pec_typeInput');
  //
  //		var title = document.createElement("div");
  //		title.setAttribute('class','pc_cc_pec_ti_label');
  //		title.innerHTML = options.label;
  //
  //		item.appendChild(title);
  //
  //		var content = document.createElement("input");
  //		content.setAttribute('class','pc_cc_pec_ti_value');
  //		content.setAttribute("name",options.name);
  //		content.value = options.value;
  //		if(options.readonly)
  //		{
  //			content.setAttribute("readonly",options.readonly);
  //		}else
  //		{
  //			//按下回车键
  //			content.onkeypress = function(event)
  //			{
  //				if(event.keyCode==13)
  //				{
  //					var flag = isNaN(event.target.value);
  //					var value = event.target.value;
  //					var name = event.target.name;
  //
  //					if(!flag)
  //					{
  //						state.objectSelf.setProperty(name,value);
  //					}
  //
  //				}
  //			}
  //			//失去焦点
  //			content.onblur = function(event)
  //			{
  //				var flag = isNaN(event.target.value);
  //				var value = event.target.value;
  //				var name = event.target.name;
  //
  //				if(!flag)
  //				{
  //					state.objectSelf.setProperty(name,value);
  //				}
  //			}
  //		}
  //
  //		item.appendChild(content);
  //
  //		elements.appendChild(item);
  //		// 24 36 52
  //		var disHeight = parseInt(item.clientHeight)-24;
  //		if(disHeight > 0)
  //		{
  //			content.style.marginTop = disHeight/2 +"px";
  //
  //		}else
  //		{
  //			title.style.marginTop = "4px";
  //		}
  //	}

  function input(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "pc_cc_pec_typeInput");

    var title = document.createElement("div");
    title.setAttribute("class", "pc_cc_pec_ti_label");
    title.innerHTML = options.label;

    item.appendChild(title);

    var content = document.createElement("input");
    content.setAttribute("class", "pc_cc_pec_ti_value");
    content.setAttribute("name", options.name);
    content.value = options.value;
    if (options.readonly) {
      content.setAttribute("readonly", options.readonly);
    } else {
      //按下回车键
      content.onkeypress = function (event) {
        if (event.keyCode == 13) {
          var value = event.target.value;
          var name = event.target.name;

          state.objectSelf.setProperty(name, value);
        }
      };
      //失去焦点
      content.onblur = function (event) {
        var value = event.target.value;
        var name = event.target.name;

        state.objectSelf.setProperty(name, value);
      };
    }

    item.appendChild(content);

    elements.appendChild(item);
    // 24 36 52
    var disHeight = parseInt(item.clientHeight) - 24;
    if (disHeight > 0) {
      content.style.marginTop = disHeight / 2 + "px";
    } else {
      title.style.marginTop = "4px";
    }
  }

  function inputTypeNum(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "pc_cc_pec_typeInput");

    var title = document.createElement("div");
    title.setAttribute("class", "pc_cc_pec_ti_label");
    title.innerHTML = options.label;

    item.appendChild(title);

    var content = document.createElement("input");
    content.setAttribute("class", "pc_cc_pec_ti_value");
    content.setAttribute("name", options.name);
    content.setAttribute("data-label", options.label);
    content.value = options.value;

    //按下回车键
    content.onkeypress = function (event) {
      if (event.keyCode == 13) {
        var value = event.target.value;
        var name = event.target.name;
        var label = event.target.getAttribute("data-label");
        if (isNaN(value)) {
          CgsTipsWindow.showLog(label + "为数值型，请重新输入！");
          return;
        }

        state.objectSelf.setProperty(name, value);
      }
    };
    //失去焦点
    content.onblur = function (event) {
      var value = event.target.value;
      var name = event.target.name;
      var label = event.target.getAttribute("data-label");
      if (isNaN(value)) {
        CgsTipsWindow.showLog(label + "为数值型，请重新输入！");
        return;
      }

      state.objectSelf.setProperty(name, value);
    };

    item.appendChild(content);

    elements.appendChild(item);
    // 24 36 52
    var disHeight = parseInt(item.clientHeight) - 24;
    if (disHeight > 0) {
      content.style.marginTop = disHeight / 2 + "px";
    } else {
      title.style.marginTop = "4px";
    }
  }

  function header(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "pc_cc_pec_typeHeader");
    item.innerHTML = options.label;

    elements.appendChild(item);
  }

  function hline(elements, options) {
    var item = document.createElement("div");
    item.setAttribute("class", "pc_cc_pec_typeHline");

    elements.appendChild(item);
  }

  function init() {
    var propertyContainer = document.createElement("div");
    propertyContainer.setAttribute("class", "propertyContainer");
    propertyContainer.onclick = function (e) {
      var listBox = document.getElementsByClassName(
        "pc_cc_pec_td_c_listItemBox"
      );

      for (var i = 0; i < listBox.length; i++) {
        if (listBox[i].style.display != "none") {
          listBox[i].style.display = "none";
        }
      }
    };

    var property = document.createElement("div");
    property.setAttribute("class", "pc_cc_property");
    property.innerHTML = "属性";
    property.style.display = "none";
    propertyContainer.appendChild(property);

    //		var showAllFlag = document.createElement("div");
    //		showAllFlag.setAttribute("class",'pc_cc_showAllFlag');
    //		showAllFlag.style.backgroundImage = "url("+state.imagePath+"ding1.png)";
    //		showAllFlag.style.display = "none";
    //		showAllFlag.onclick = function(e)
    //		{
    //			if(state.showAllFlag)
    //			{
    //				e.target.style.backgroundImage = "url("+state.imagePath+"ding2.png)";
    //				state.showAllFlag = false;
    //			}else{
    //				e.target.style.backgroundImage = "url("+state.imagePath+"ding1.png)";
    //				state.showAllFlag = true;
    //			}
    //		}
    //		propertyContainer.appendChild(showAllFlag);

    var propertyEditContent = document.createElement("div");
    propertyEditContent.setAttribute("class", "pc_cc_propertyEditContent");
    propertyContainer.appendChild(propertyEditContent);

    state.body = propertyContainer;
    //		this.body = $$(propertyContainer);
  }
};

DescriptorDataModel.colorStrToHEX = function (str) {
  var color = Cesium.Color.fromCssColorString(str);

  var red = color.red * 255;
  var green = color.green * 255;
  var blue = color.blue * 255;
  var alpha = color.alpha;

  var rStr = numberToStr(parseInt(red / 16)) + numberToStr(parseInt(red % 16));
  var gStr =
    numberToStr(parseInt(green / 16)) + numberToStr(parseInt(green % 16));
  var bStr =
    numberToStr(parseInt(blue / 16)) + numberToStr(parseInt(blue % 16));

  var result = "#" + rStr + gStr + bStr;

  return [result, alpha];

  function numberToStr(number) {
    if (number < 10) {
      return number + "";
    } else {
      var re = String.fromCharCode(number + 55);
      return re;
    }
  }
};
//PropertyPluggColor.numberToStr(number){
//	if(number < 10){
//		return number+"";
//	}else{
//		var re = String.fromCharCode(number+55);
//		return re;
//	}
//}
//PropertyPluggColor.strToNumber(str){
//
//	if(isNaN(str)){
//		str = str.toUpperCase();
//		var re = str.charCodeAt() - 55;
//		return re;
//	}else{
//		var re = parseInt(str);
//		return re;
//	}
//}
DescriptorDataModel.colorHEXtoRGBA = function (rgb, alpha) {
  var color = rgb.substring(1, rgb.length);

  var red = strToNumber(color[0]) * 16 + strToNumber(color[1]);
  var green = strToNumber(color[2]) * 16 + strToNumber(color[3]);
  var blue = strToNumber(color[4]) * 16 + strToNumber(color[5]);

  if (alpha == "1.00") {
    alpha = 1;
  }
  var result = "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
  return result;

  function strToNumber(str) {
    if (isNaN(str)) {
      str = str.toUpperCase();
      var re = str.charCodeAt() - 55;
      return re;
    } else {
      var re = parseInt(str);
      return re;
    }
  }
};
