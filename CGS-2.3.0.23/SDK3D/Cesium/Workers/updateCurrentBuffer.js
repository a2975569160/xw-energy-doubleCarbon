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

  function clampBetween(v, min, max) {
    if (v <= min)
      v = min;

    if (v >= max)
      v = max;

    return v;
  }

  function equivalent(a, b) {
    if (Math.abs(a - b) < 0.00001)
      return true;
    else
      return false;
  }

  function magnitude(cartesian) {
    return Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
  }

  function normalize(cartesian, result) {
    var mag = magnitude(cartesian);

    result.x = cartesian.x / mag;
    result.y = cartesian.y / mag;
    result.z = cartesian.z / mag;
  }

  function dot(left, right) {
    return left.x * right.x + left.y * right.y + left.z * right.z;
  }

  function magnitudeSquared(cartesian) {
    return cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z;
  }
  function checkPointVisible(primitive, pos) {
    if (magnitudeSquared(pos) < 1)
      return false;

    var posDir = new Object();
    posDir.x = pos.x;
    posDir.y = pos.y;
    posDir.z = pos.z;
    normalize(posDir, posDir);

    var camDir = new Object();
    camDir.x = primitive._camPosition.x;
    camDir.y = primitive._camPosition.y;
    camDir.z = primitive._camPosition.z;
    normalize(camDir, camDir);

    var d = dot(posDir, camDir);
    d = clampBetween(d, -1, 1);

    var angle = Math.acos(d);

    if (angle > primitive._visibleAngle)
      return false;
    else
      return true;
  }

  //by start HGT:解决二维线跨180度问题   刘雨   20180904
  function isInViewRange(minLon, maxLon, minLat, maxLat, stepOver360Lon, position) {
    var longitude = position[0];
    var latitude = position[1];
    if (longitude < 0) {
      longitude += 360;
    } else if (longitude > 0 && stepOver360Lon) {
      longitude += 360;
    }
    var isFlagLong = (longitude >= minLon && longitude <= maxLon) ? true : false;
    var isFlagLat = (latitude >= minLat && latitude <= maxLat) ? true : false;
    return (isFlagLong && isFlagLat);
  }
  //end

  function updateCurrentBuffer(parameters, transferableObjects) {
    var primitive = parameters;
    //by start HGT:解决二维线跨180度问题   刘雨   20180904
    var viewMinLat = primitive._viewMinLat;
    var viewMaxLat = primitive._viewMaxLat;
    var viewMinLon = primitive._viewMinLon;
    var viewMaxLon = primitive._viewMaxLon;
    var stepOver360Lon = primitive._stepOver360Lon;
    //end
    for (var i = 0; i < primitive._currentParticleArr.length; ++i) {
      if (primitive._currentParticleArr[i].age < primitive._numCurrentPoint) {
        var visible = false;
        if (primitive._is3d) {
          visible = checkPointVisible(primitive, primitive._currentParticleArr[i].wPos);
        } else {
          //by start HGT:解决二维线跨180度问题   刘雨   20180904
          if (isInViewRange(viewMinLon, viewMaxLon, viewMinLat, viewMaxLat, stepOver360Lon, primitive._currentParticleCartographicArr[i])) {
            visible = true;
          }
          //end
        }
        var alphaIndex = i * primitive._numCurrentPoint;
        for (var j = 0; j < primitive._numCurrentPoint; ++j) {
          if (!visible) {
            primitive._alphaArr[alphaIndex + j] = 0;
          }
          else {
            if (j < primitive._currentParticleArr[i].age) {
              var curAlpha = primitive._alphaArr[alphaIndex + j];
              curAlpha -= primitive._currentFadeSpeed;
              curAlpha = clampBetween(curAlpha, 0, 255);

              primitive._alphaArr[alphaIndex + j] = curAlpha;
            }
            else if (j == primitive._currentParticleArr[i].age) {
              primitive._alphaArr[alphaIndex + j] = 255;
            }
            else {
              primitive._alphaArr[alphaIndex + j] = 0;
            }
          }
        }
      }
      else {
        var alphaIndex = i * primitive._numCurrentPoint;

        if (!equivalent(0, primitive._alphaArr[alphaIndex + primitive._numCurrentPoint - 1])) {
          var visible = false;
          if (primitive._is3d) {
            visible = checkPointVisible(primitive, primitive._currentParticleArr[i].wPos);
          } else {
            //by start HGT:解决二维线跨180度问题   刘雨   20180904
            if (isInViewRange(viewMaxLat, viewMaxLon, viewMinLat, viewMaxLat, stepOver360Lon, primitive._currentParticleCartographicArr[i])) {
              visible = true;
            }
            //end
          }

          for (var j = 0; j < primitive._numCurrentPoint; ++j) {
            if (j < primitive._currentParticleArr[i].age) {
              if (!visible) {
                primitive._alphaArr[alphaIndex + j] = 0;
              }
              else {
                var curAlpha = primitive._alphaArr[alphaIndex + j];
                curAlpha -= primitive._currentFadeSpeed;
                curAlpha = clampBetween(curAlpha, 0, 255);

                primitive._alphaArr[alphaIndex + j] = curAlpha;
              }
            }
          }
        }
      }
    }

    return primitive._alphaArr;
  }
  var updateCurrentBuffer$1 = createTaskProcessorWorker(updateCurrentBuffer);

  return updateCurrentBuffer$1;

});
//# sourceMappingURL=updateCurrentBuffer.js.map
