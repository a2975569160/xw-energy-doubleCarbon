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

define(['./when-54c2dc71', './Check-6c0211bc', './Math-850675ea', './Cartesian2-ea28baad', './Transforms-2e98bea0', './RuntimeError-2109023a', './WebGLConstants-76bb35d1', './ComponentDatatype-a26dd044', './GeometryAttribute-90c5fe10', './GeometryAttributes-4fcfcf40', './VertexFormat-4d8b817a'], function (when, Check, _Math, Cartesian2, Transforms, RuntimeError, WebGLConstants, ComponentDatatype, GeometryAttribute, GeometryAttributes, VertexFormat) { 'use strict';

  /*
  	添加空中雷达几何体创建  刘雨  20170708
  */

  function FeGeometryCreator(options) {
    options = when.defaultValue(options, when.defaultValue.EMPTY_OBJECT);

    var feGeometry = options.feGeometry;
    if (!when.defined(feGeometry)) {
      return;
    }

    this._feGeometry = feGeometry;
    this._ellipsoid = Cartesian2.Ellipsoid.clone(when.defaultValue(options.ellipsoid, Cartesian2.Ellipsoid.WGS84));
    this._vertexFormat = VertexFormat.VertexFormat.clone(when.defaultValue(options.vertexFormat, VertexFormat.VertexFormat.DEFAULT));
    this._workerName = 'createFeGeometry';
    this._primitiveType = when.defaultValue(options.primitiveType, GeometryAttribute.PrimitiveType.TRIANGLES);
  }

  FeGeometryCreator.createGeometry = function (feGeometryCreator) {

    var vertexFormat = feGeometryCreator._vertexFormat;
    var ellipsoid = feGeometryCreator._ellipsoid;

    var geo = new GeometryAttribute.Geometry({
      attributes: new GeometryAttributes.GeometryAttributes(),
      primitiveType: feGeometryCreator._primitiveType
    });

    geo.attributes.position = new GeometryAttribute.GeometryAttribute({
      componentDatatype: ComponentDatatype.ComponentDatatype.DOUBLE,
      componentsPerAttribute: 3,
      values: feGeometryCreator._feGeometry._vertexArray
    });

    if (vertexFormat.st) {
      geo.attributes.st = new GeometryAttribute.GeometryAttribute({
        componentDatatype: ComponentDatatype.ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: feGeometryCreator._feGeometry._textureArray
      });
    }

    geo.indices = feGeometryCreator._feGeometry._indexArray;

    var boundingSphere = Transforms.BoundingSphere.fromVertices(geo.attributes.position.values, Cartesian2.Cartesian3.ZERO, 3);

    return new GeometryAttribute.Geometry({
      attributes: geo.attributes,
      indices: geo.indices,
      primitiveType: geo.primitiveType,
      boundingSphere: boundingSphere
    });
  };

  /*global define*/

  function createFeGeometry(feGeometry, offset) {
    return FeGeometryCreator.createGeometry(feGeometry);
  }

  return createFeGeometry;

});
//# sourceMappingURL=createFeGeometry.js.map
