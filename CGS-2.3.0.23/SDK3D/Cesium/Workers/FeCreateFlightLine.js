/**
 * Cesium - https://github.com/CesiumGS/cesium
 *
 * Copyright 2011-2020 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/master/LICENSE.md for full licensing details.
 */

define(['./when-54c2dc71', './createTaskProcessorWorker'], function (when, createTaskProcessorWorker) { 'use strict';

  function magnitude(cartesian) {
    return Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
  }

  function normalize(cartesian, result) {
    var mag = magnitude(cartesian);

    result.x = cartesian.x / mag;
    result.y = cartesian.y / mag;
    result.z = cartesian.z / mag;
  }

  function multiplyComponents(left, right, result) {
    result.x = left.x * right.x;
    result.y = left.y * right.y;
    result.z = left.z * right.z;
  }

  function dot(left, right) {
    return left.x * right.x + left.y * right.y + left.z * right.z;
  }

  function divideByScalar(cartesian, scalar, result) {
    result.x = cartesian.x / scalar;
    result.y = cartesian.y / scalar;
    result.z = cartesian.z / scalar;
    return result;
  }
  function multiplyByScalar(cartesian, scalar, result) {
    result.x = cartesian.x * scalar;
    result.y = cartesian.y * scalar;
    result.z = cartesian.z * scalar;
    return result;
  }
  function add(left, right, result) {
    result.x = left.x + right.x;
    result.y = left.y + right.y;
    result.z = left.z + right.z;
    return result;
  }
  function subtract(left, right, result) {
    result.x = left.x - right.x;
    result.y = left.y - right.y;
    result.z = left.z - right.z;
    return result;
  }

  function cross(left, right, result) {

    var leftX = left.x;
    var leftY = left.y;
    var leftZ = left.z;
    var rightX = right.x;
    var rightY = right.y;
    var rightZ = right.z;

    var x = leftY * rightZ - leftZ * rightY;
    var y = leftZ * rightX - leftX * rightZ;
    var z = leftX * rightY - leftY * rightX;

    result.x = x;
    result.y = y;
    result.z = z;
    return result;
  }
  function clone(left, result) {
    result.x = left.x;
    result.y = left.y;
    result.z = left.z;
    return result;
  }

  function negate(left, result) {
    result.x = -left.x;
    result.y = -left.y;
    result.z = -left.z;
    return result;
  }

  function LLHToCartesian(lon, lat, height) {
    var cartographic = new Object();
    cartographic.longitude = lon * Math.PI / 180.0;
    cartographic.latitude = lat * Math.PI / 180.0;
    cartographic.height = height;

    return cartographicToCartesian(cartographic);
  }

  function fromTranslation(cartesian, result) {
    result[0] = 1.0;
    result[1] = 0.0;
    result[2] = 0.0;
    result[3] = 0.0;
    result[4] = 0.0;
    result[5] = 1.0;
    result[6] = 0.0;
    result[7] = 0.0;
    result[8] = 0.0;
    result[9] = 0.0;
    result[10] = 1.0;
    result[11] = 0.0;
    result[12] = cartesian.x;
    result[13] = cartesian.y;
    result[14] = cartesian.z;
    result[15] = 1.0;
    return result;
  }

  function multiplyByVector(matrix, cartesian, result) {
    var vX = cartesian.x;
    var vY = cartesian.y;
    var vZ = cartesian.z;
    var vW = cartesian.w;

    var x = matrix[0] * vX + matrix[4] * vY + matrix[8] * vZ + matrix[12] * vW;
    var y = matrix[1] * vX + matrix[5] * vY + matrix[9] * vZ + matrix[13] * vW;
    var z = matrix[2] * vX + matrix[6] * vY + matrix[10] * vZ + matrix[14] * vW;
    var w = matrix[3] * vX + matrix[7] * vY + matrix[11] * vZ + matrix[15] * vW;

    result.x = x;
    result.y = y;
    result.z = z;
    result.w = w;
    return result;
  }

  function cartographicToCartesian(cartographic) {
    var result = new Object();

    var n = new Object();
    var k = new Object();

    var longitude = cartographic.longitude;
    var latitude = cartographic.latitude;
    var cosLatitude = Math.cos(latitude);

    var x = cosLatitude * Math.cos(longitude);
    var y = cosLatitude * Math.sin(longitude);
    var z = Math.sin(latitude);

    n.x = x;
    n.y = y;
    n.z = z;
    normalize(n, n);

    var radiiSquared = new Object();
    radiiSquared.x = 6378137.0 * 6378137.0;
    radiiSquared.y = 6378137.0 * 6378137.0;
    radiiSquared.z = 6356752.314145179 * 6356752.314145179;

    multiplyComponents(radiiSquared, n, k);
    var gamma = Math.sqrt(dot(n, k));
    divideByScalar(k, gamma, k);
    multiplyByScalar(n, cartographic.height, n);

    add(k, n, result);

    return result;
  }

  var scratchDir = { x: 0, y: 0, z: 0 };
  var scratchUp = { x: 0, y: 0, z: 0 };
  var scratchNorth = { x: 0, y: 0, z: 0 };
  var scratchRight = { x: 0, y: 0, z: 0, w: 0 };
  var scratchLeft = { x: 0, y: 0, z: 0, w: 0 };
  var scratchTranslationMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var left = { x: 0, y: 0, z: 0, w: 0 };
  var right = { x: 0, y: 0, z: 0, w: 0 };

  function FeCreateFlightLine(parameters, transferableObjects) {
    var primitive = parameters;
    var vertexPositions = primitive.positions;
    var flightWidth = primitive.flightWidth;
    var warningLineHeight = primitive.warningLineHeight;
    var dangerLineHeight = primitive.dangerLineHeight;
    var vertexIndexNum = 0;
    var lineVertexIndexNum = 0;

    //航线、剖面
    var posArr = primitive.vertexArray;
    var colorType = primitive.colorTypeArray;
    var indexArr = primitive.indexArray;
    var posIndex = 0;
    var colorIndex = 0;
    var index = 0;
    var allVertexNum = 0;

    //等高线
    var linePosArr = primitive.lineVertexArray;
    var lineIndexArr = primitive.lineIndexArray;
    var lineColorType = primitive.lineColorType;
    var linePosIndex = 0;
    var lineColorIndex = 0;
    var lineIndex = 0;
    var allLineVertexNum = 0;

    var positionArr = vertexPositions;
    var count = positionArr.length;
    for (var j = 0; j < count; ++j) {
      var positions = positionArr[j];
      var length = positions.length;
      //航线顶点
      var vertexFlightCount = 0;
      var vertexSlopeCount = 0;
      var lineVertexCount = 0;
      for (var i = 0; i < length; ++i) {
        var position = positions[i];
        //if( flightDataFlag ){
        var worldPos = LLHToCartesian(position[0], position[1], position[2]);
        scratchTranslationMatrix = fromTranslation(worldPos, scratchTranslationMatrix);
        normalize(worldPos, scratchUp);
        if (i < length - 1) {
          var nextPosition = positions[i + 1];
          scratchDir = LLHToCartesian(nextPosition[0], nextPosition[1], nextPosition[2]);
          subtract(scratchDir, worldPos, scratchDir);
        } else {
          var lastPosition = positions[i - 1];
          scratchDir = LLHToCartesian(lastPosition[0], lastPosition[1], lastPosition[2]);
          subtract(worldPos, scratchDir, scratchDir);
        }

        normalize(scratchDir, scratchDir);
        cross(scratchUp, scratchDir, scratchNorth);

        clone(scratchNorth, scratchRight);
        scratchRight.w = 1.0;
        negate(scratchRight, scratchLeft);
        scratchLeft.w = 1.0;

        multiplyByScalar(scratchLeft, flightWidth, scratchLeft);
        left = multiplyByVector(scratchTranslationMatrix, scratchLeft, left);

        multiplyByScalar(scratchRight, flightWidth, scratchRight);
        right = multiplyByVector(scratchTranslationMatrix, scratchRight, right);

        //航线
        posArr[posIndex++] = left.x;
        posArr[posIndex++] = left.y;
        posArr[posIndex++] = left.z;
        posArr[posIndex++] = right.x;
        posArr[posIndex++] = right.y;
        posArr[posIndex++] = right.z;


        colorType[colorIndex++] = 1.0;
        colorType[colorIndex++] = 0.0;
        colorType[colorIndex++] = 1.0;
        colorType[colorIndex++] = 0.0;
        vertexFlightCount += 2;
        //}

        //警戒线
        //if( warningDataFlag ){
        var posWarning = LLHToCartesian(position[0], position[1], warningLineHeight);
        linePosArr[linePosIndex++] = posWarning.x;
        linePosArr[linePosIndex++] = posWarning.y;
        linePosArr[linePosIndex++] = posWarning.z;
        lineColorType[lineColorIndex++] = 2.0;
        lineColorType[lineColorIndex++] = 0.0;

        lineVertexCount += 1;
        //}	
      }
      //剖面顶点
      for (var n = 0; n < length; ++n) {

        var slopePosition = positions[n];
        //if( flightDataFlag ){
        var worldUpPos = LLHToCartesian(slopePosition[0], slopePosition[1], Math.abs(slopePosition[2] - 0.5));
        var worldDownPos = LLHToCartesian(slopePosition[0], slopePosition[1], 0.0);

        //剖面
        posArr[posIndex++] = worldUpPos.x;
        posArr[posIndex++] = worldUpPos.y;
        posArr[posIndex++] = worldUpPos.z;
        posArr[posIndex++] = worldDownPos.x;
        posArr[posIndex++] = worldDownPos.y;
        posArr[posIndex++] = worldDownPos.z;

        colorType[colorIndex++] = 0.0;
        colorType[colorIndex++] = 1.0;
        colorType[colorIndex++] = 0.0;
        colorType[colorIndex++] = 1.0;
        vertexSlopeCount += 2;
        //}
        //危险线
        //if( warningDataFlag ){
        var posDanger = LLHToCartesian(slopePosition[0], slopePosition[1], dangerLineHeight);
        linePosArr[linePosIndex++] = posDanger.x;
        linePosArr[linePosIndex++] = posDanger.y;
        linePosArr[linePosIndex++] = posDanger.z;
        lineColorType[lineColorIndex++] = 3.0;
        lineColorType[lineColorIndex++] = 0.0;
        //}
      }
      //航线顶点索引
      //if( flightDataFlag ){
      var triFlightNum = vertexFlightCount - 2;
      for (var m = 0; m < triFlightNum; ++m) {
        if (m % 2 === 0) {
          indexArr[index++] = m + allVertexNum;
          indexArr[index++] = m + 1 + allVertexNum;
          indexArr[index++] = m + 2 + allVertexNum;
          vertexIndexNum += 3;
        } else {
          indexArr[index++] = m + 1 + allVertexNum;
          indexArr[index++] = m + allVertexNum;
          indexArr[index++] = m + 2 + allVertexNum;
          vertexIndexNum += 3;
        }
      }
      allVertexNum += vertexFlightCount;

      //剖面顶点索引
      var triSlopeNum = vertexSlopeCount - 2;
      for (var m = 0; m < triSlopeNum; ++m) {

        if (m % 2 === 0) {
          indexArr[index++] = m + allVertexNum;
          indexArr[index++] = m + 1 + allVertexNum;
          indexArr[index++] = m + 2 + allVertexNum;
          vertexIndexNum += 3;
        } else {
          indexArr[index++] = m + 1 + allVertexNum;
          indexArr[index++] = m + allVertexNum;
          indexArr[index++] = m + 2 + allVertexNum;
          vertexIndexNum += 3;
        }
      }
      allVertexNum += vertexSlopeCount;
      //}
      //线顶点索引
      //if( warningDataFlag ){
      for (var m = 0; m < lineVertexCount - 1; ++m) {
        lineIndexArr[lineIndex++] = m + allLineVertexNum;
        lineIndexArr[lineIndex++] = m + 1 + allLineVertexNum;
        lineVertexIndexNum += 2;
      }
      allLineVertexNum += lineVertexCount;

      for (var m = 0; m < lineVertexCount - 1; ++m) {
        lineIndexArr[lineIndex++] = m + allLineVertexNum;
        lineIndexArr[lineIndex++] = m + 1 + allLineVertexNum;
        lineVertexIndexNum += 2;
      }
      allLineVertexNum += lineVertexCount;
      //}
    }

    //航线信息
    var vertexNum = posArr.length / 3;
    var vertexInfo = new Object();

    //if( flightDataFlag ){
    /*vertexInfo.vertexArray = new Float32Array(posArr);
    vertexInfo.colorTypeArray = new Float32Array(colorType);
    vertexInfo.indexArray = new Uint32Array(indexArr);*/
    vertexInfo.vertexArray = posArr;
    vertexInfo.colorTypeArray = colorType;
    vertexInfo.indexArray = indexArr;
    vertexInfo.vertexIndexNum = vertexIndexNum;
    //}

    //线信息
    //if( warningDataFlag ){
    /*vertexInfo.lineVertexArray = new Float32Array(linePosArr);
    vertexInfo.lineColorType = new Float32Array(lineColorType);
    vertexInfo.lineIndexArray = new Uint32Array(lineIndexArr);*/
    vertexInfo.lineVertexArray = linePosArr;
    vertexInfo.lineColorType = lineColorType;
    vertexInfo.lineIndexArray = lineIndexArr;
    vertexInfo.lineVertexIndexNum = lineVertexIndexNum;
    //}

    return vertexInfo;
  }var FeCreateFlightLine$1 = createTaskProcessorWorker(FeCreateFlightLine);

  return FeCreateFlightLine$1;

});
//# sourceMappingURL=FeCreateFlightLine.js.map
