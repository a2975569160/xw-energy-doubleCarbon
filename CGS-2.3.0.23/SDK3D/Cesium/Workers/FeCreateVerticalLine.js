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

  function clone(left, result) {
    result.x = left.x;
    result.y = left.y;
    result.z = left.z;
    return result;
  }

  function LLHToCartesian(lon, lat, height) {
    var cartographic = new Object();
    cartographic.longitude = lon * Math.PI / 180.0;
    cartographic.latitude = lat * Math.PI / 180.0;
    cartographic.height = height;

    return cartographicToCartesian(cartographic);
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
  var scratchCartesian3 = { x: 0, y: 0, z: 0 };
  var scratchPosition = { x: 0, y: 0, z: 0 };
  var scratchPrevPosition = { x: 0, y: 0, z: 0 };
  var scratchNextPosition = { x: 0, y: 0, z: 0 };
  var tPos = { x: 0, y: 0, z: 0 };

  function FeCreateVerticalLine(parameters, transferableObjects) {
    var primitive = event.data;
    var vertexPositions = primitive.positions;
    var width = primitive.lineWidth;
    //垂线
    var finalPositions = primitive.finalPositions;
    var prevPositions = primitive.prevPositions;
    var nextPositions = primitive.nextPositions;
    var expandAndWidth = primitive.expandAndWidth;
    var expandAndWidthIndex = 0;
    var verticalVertexNum = 0;
    var verticalIndexArr = primitive.verticalIndexArray;
    var verticalIndex = 0;
    var verticalIndexNum = 0;
    var finalIndex = 0;
    var prevIndex = 0;
    var nextIndex = 0;

    var positionArr = vertexPositions;
    var count = positionArr.length;
    for (var j = 0; j < count; ++j) {
      var positions = positionArr[j];
      var length = positions.length;
      //剖面顶点
      for (var n = 0; n < length; ++n) {
        var slopePosition = positions[n];
        var worldUpPos = LLHToCartesian(slopePosition[0], slopePosition[1], slopePosition[2]);
        var worldDownPos = LLHToCartesian(slopePosition[0], slopePosition[1], 0.0);
        //垂线
        if (n === 0 || (n === length - 1) || (n % 100) === 0) {
          //var tPos;
          for (var h = 0; h < 2; ++h) {
            if (h === 0) {
              tPos = scratchCartesian3;
              subtract(worldUpPos, worldDownPos, tPos);
              add(worldUpPos, tPos, tPos);
            } else {
              tPos = worldUpPos;
            }

            clone(tPos, scratchPrevPosition);
            if (h === 0) {
              clone(worldUpPos, scratchPosition);
            } else {
              clone(worldDownPos, scratchPosition);
            }

            if (h === 1) {
              tPos = scratchCartesian3;
              subtract(worldDownPos, worldUpPos, tPos);
              add(worldDownPos, tPos, tPos);
            } else {
              tPos = worldDownPos;
            }
            clone(tPos, scratchNextPosition);

            var startK = h === 0 ? 2 : 0;
            var endK = h === 1 ? 2 : 4;
            for (var k = startK; k < endK; ++k) {
              finalPositions[finalIndex++] = scratchPosition.x;
              finalPositions[finalIndex++] = scratchPosition.y;
              finalPositions[finalIndex++] = scratchPosition.z;

              prevPositions[prevIndex++] = scratchPrevPosition.x;
              prevPositions[prevIndex++] = scratchPrevPosition.y;
              prevPositions[prevIndex++] = scratchPrevPosition.z;

              nextPositions[nextIndex++] = scratchNextPosition.x;
              nextPositions[nextIndex++] = scratchNextPosition.y;
              nextPositions[nextIndex++] = scratchNextPosition.z;

              var direction = (k - 2 < 0) ? -1.0 : 1.0;
              expandAndWidth[expandAndWidthIndex++] = 2 * (k % 2) - 1;
              expandAndWidth[expandAndWidthIndex++] = direction * width;
              verticalVertexNum++;
            }
          }
        }
      }
    }
    //航线信息
    var vertexInfo = new Object();
    //垂线
    var verticalNum = verticalVertexNum / 4;
    for (var v = 0; v < verticalNum; ++v) {
      verticalIndexArr[verticalIndex++] = v * 4 + 0;
      verticalIndexArr[verticalIndex++] = v * 4 + 2;
      verticalIndexArr[verticalIndex++] = v * 4 + 1;

      verticalIndexArr[verticalIndex++] = v * 4 + 1;
      verticalIndexArr[verticalIndex++] = v * 4 + 2;
      verticalIndexArr[verticalIndex++] = v * 4 + 3;
      verticalIndexNum += 6;
    }

    vertexInfo.finalPositions = finalPositions;
    vertexInfo.prevPositions = prevPositions;
    vertexInfo.nextPositions = nextPositions;
    vertexInfo.expandAndWidth = expandAndWidth;
    vertexInfo.verticalIndexArray = verticalIndexArr;
    vertexInfo.verticalIndexNum = verticalIndexNum;
    return vertexInfo;
  }var FeCreateVerticalLine$1 = createTaskProcessorWorker(FeCreateVerticalLine);

  return FeCreateVerticalLine$1;

});
//# sourceMappingURL=FeCreateVerticalLine.js.map
