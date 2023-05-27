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

  const UNITS_NONE = 0; // not initialized
  const UNITS_AE = 1;
  const UNITS_KM = 2;

  // Line 1
  const TLE1_COL_SATNUM = 2; const TLE1_LEN_SATNUM = 5;
  const TLE1_COL_INTLDESC_A = 9; const TLE1_LEN_INTLDESC_A = 2;
   const TLE1_LEN_INTLDESC_B = 3;
   const TLE1_LEN_INTLDESC_C = 3;
  const TLE1_COL_EPOCH_A = 18; const TLE1_LEN_EPOCH_A = 2;
  const TLE1_COL_EPOCH_B = 20; const TLE1_LEN_EPOCH_B = 12;
  const TLE1_COL_MEANMOTIONDT = 33; const TLE1_LEN_MEANMOTIONDT = 10;
  const TLE1_COL_MEANMOTIONDT2 = 44; const TLE1_LEN_MEANMOTIONDT2 = 8;
  const TLE1_COL_BSTAR = 53; const TLE1_LEN_BSTAR = 8;
  const TLE1_COL_ELNUM = 64; const TLE1_LEN_ELNUM = 4;
  const TLE2_COL_INCLINATION = 8; const TLE2_LEN_INCLINATION = 8;
  const TLE2_COL_RAASCENDNODE = 17; const TLE2_LEN_RAASCENDNODE = 8;
  const TLE2_COL_ECCENTRICITY = 26; const TLE2_LEN_ECCENTRICITY = 7;
  const TLE2_COL_ARGPERIGEE = 34; const TLE2_LEN_ARGPERIGEE = 8;
  const TLE2_COL_MEANANOMALY = 43; const TLE2_LEN_MEANANOMALY = 8;
  const TLE2_COL_MEANMOTION = 52; const TLE2_LEN_MEANMOTION = 11;
  const TLE2_COL_REVATEPOCH = 63; const TLE2_LEN_REVATEPOCH = 5;


  const FLD_FIRST = 0;
  const FLD_NORADNUM = FLD_FIRST;
  const FLD_INTLDESC = 1;
  const FLD_SET = 2;       // TLE set number
  const FLD_EPOCHYEAR = 3; // Epoch: Last two digits of year
  const FLD_EPOCHDAY = 4;  // Epoch: Fractional Julian Day of year
  const FLD_ORBITNUM = 5;  // Orbit at epoch
  const FLD_I = 6;         // Inclination
  const FLD_RAAN = 7;      // R.A. ascending node
  const FLD_E = 8;         // Eccentricity
  const FLD_ARGPER = 9;    // Argument of perigee
  const FLD_M = 10;         // Mean anomaly
  const FLD_MMOTION = 11;   // Mean motion
  const FLD_MMOTIONDT = 12; // First time derivative of mean motion
  const FLD_MMOTIONDT2 = 13;// Second time derivative of mean motion
  const FLD_BSTAR = 14;     // BSTAR Drag


  const U_FIRST = 0;
  const U_RAD = U_FIRST;  	// radians
  const U_NATIVE = 2;         // TLE format native units (no conversion)

  const PI = Math.PI;
  const TWOPI = 2.0 * Math.PI;
  const RADS_PER_DEG = Math.PI / 180.0;
  const GEOSYNC_ALT = 42241.892;  // km

  const AE = 1.0;
  const TWOTHRD = 2.0 / 3.0;
  const XKMPER_WGS72 = 6378.135;     // Earth equatorial radius - km (WGS '72)
  const F = 1.0 / 298.26; // Earth flattening (WGS '72)
  const GE = 398600.8;     // Earth gravitational constant (WGS '72)
  const J2 = 1.0826158E-3; // J2 harmonic (WGS '72)
  const J3 = -2.53881E-6;  // J3 harmonic (WGS '72)
  const J4 = -1.65597E-6;  // J4 harmonic (WGS '72)
  const CK2 = J2 / 2.0;
  const CK4 = -3.0 * J4 / 8.0;
  const XJ3 = J3;
  const E6A = 1.0e-06;
  const QO = AE + 120.0 / XKMPER_WGS72;
  const S = AE + 78.0 / XKMPER_WGS72;
  const MIN_PER_DAY = 1440.0;        // Minutes per day (solar)
  const SEC_PER_DAY = 86400.0;       // Seconds per day (solar)
  const OMEGA_E = 1.00273790934; // earth rotation per sideral day
  const XKE = Math.sqrt(3600.0 * GE /           //sqrt(ge) ER^3/min^2
    (XKMPER_WGS72 * XKMPER_WGS72 * XKMPER_WGS72));
  const QOMS2T = Math.pow((QO - S), 4);            //(QO - S)^4 ER^4
  const EPOCH_JAN1_12H_1900 = 2415020.0; // Jan 1.5 1900 = Jan 1 1900 12h UTC
  const EPOCH_JAN1_12H_2000 = 2451545.0; // Jan 1.5 2000 = Jan 1 2000 12h UTC


  function FeEci(pos, vel, date, IsAeUnits) {
    if (IsAeUnits === undefined) {
      IsAeUnits = true;
    }

    this.m_pos = pos;
    this.m_vel = vel;
    this.m_date = date;
    this.m_VecUnits = (IsAeUnits ? UNITS_AE : UNITS_NONE);
  }

  FeEci.prototype.MulPos = function (factor) {
    this.m_pos.x *= factor;
    this.m_pos.y *= factor;
    this.m_pos.z *= factor;
  };

  //===================================
  //两行根数 TLE
  //===================================
  function TLE(id, line1, line2) {
    this.satID = id;
    this.satLine1 = line1;
    this.satLine2 = line2;

    this.m_Field = new Array();
    this.m_mapCache = new Map();
  }

  TLE.prototype.initTLE = function () {

    this.m_Field[FLD_NORADNUM] = this.satLine1.substr(TLE1_COL_SATNUM, TLE1_LEN_SATNUM);
    this.m_Field[FLD_INTLDESC] = this.satLine1.substr(TLE1_COL_INTLDESC_A, TLE1_LEN_INTLDESC_A + TLE1_LEN_INTLDESC_B + TLE1_LEN_INTLDESC_C);
    this.m_Field[FLD_EPOCHYEAR] = this.satLine1.substr(TLE1_COL_EPOCH_A, TLE1_LEN_EPOCH_A);
    this.m_Field[FLD_EPOCHYEAR] = parseFloat(this.m_Field[FLD_EPOCHYEAR]);

    this.m_Field[FLD_EPOCHDAY] = parseFloat(this.satLine1.substr(TLE1_COL_EPOCH_B, TLE1_LEN_EPOCH_B));

    if (this.satLine1[TLE1_COL_MEANMOTIONDT] == '-') {
      // value is negative
      this.m_Field[FLD_MMOTIONDT] = "-0";
    }
    else
      this.m_Field[FLD_MMOTIONDT] = "0";

    this.m_Field[FLD_MMOTIONDT] += this.satLine1.substr(TLE1_COL_MEANMOTIONDT + 1, TLE1_LEN_MEANMOTIONDT);
    this.m_Field[FLD_MMOTIONDT] = parseFloat(this.m_Field[FLD_MMOTIONDT]);

    // decimal point assumed; exponential notation
    this.m_Field[FLD_MMOTIONDT2] = ExpToDecimal(this.satLine1.substr(TLE1_COL_MEANMOTIONDT2, TLE1_LEN_MEANMOTIONDT2));
    this.m_Field[FLD_MMOTIONDT2] = parseFloat(this.m_Field[FLD_MMOTIONDT2]);
    // decimal point assumed; exponential notation
    this.m_Field[FLD_BSTAR] = ExpToDecimal(this.satLine1.substr(TLE1_COL_BSTAR, TLE1_LEN_BSTAR));
    this.m_Field[FLD_BSTAR] = parseFloat(this.m_Field[FLD_BSTAR]);

    //TLE1_COL_EPHEMTYPE      
    //TLE1_LEN_EPHEMTYPE   
    this.m_Field[FLD_SET] = this.satLine1.substr(TLE1_COL_ELNUM, TLE1_LEN_ELNUM);

    this.m_Field[FLD_SET] = parseFloat(this.m_Field[FLD_SET]);



    //TLE2_COL_SATNUM         
    //TLE2_LEN_SATNUM         

    this.m_Field[FLD_I] = this.satLine2.substr(TLE2_COL_INCLINATION, TLE2_LEN_INCLINATION);
    this.m_Field[FLD_I] = parseFloat(this.m_Field[FLD_I]);

    this.m_Field[FLD_RAAN] = this.satLine2.substr(TLE2_COL_RAASCENDNODE, TLE2_LEN_RAASCENDNODE);
    this.m_Field[FLD_RAAN] = parseFloat(this.m_Field[FLD_RAAN]);

    // decimal point is assumed
    this.m_Field[FLD_E] = "0.";
    this.m_Field[FLD_E] += this.satLine2.substr(TLE2_COL_ECCENTRICITY, TLE2_LEN_ECCENTRICITY);
    this.m_Field[FLD_E] = parseFloat(this.m_Field[FLD_E]);

    this.m_Field[FLD_ARGPER] = this.satLine2.substr(TLE2_COL_ARGPERIGEE, TLE2_LEN_ARGPERIGEE);
    this.m_Field[FLD_ARGPER] = parseFloat(this.m_Field[FLD_ARGPER]);

    this.m_Field[FLD_M] = this.satLine2.substr(TLE2_COL_MEANANOMALY, TLE2_LEN_MEANANOMALY);
    this.m_Field[FLD_M] = parseFloat(this.m_Field[FLD_M]);

    this.m_Field[FLD_MMOTION] = this.satLine2.substr(TLE2_COL_MEANMOTION, TLE2_LEN_MEANMOTION);
    this.m_Field[FLD_MMOTION] = parseFloat(this.m_Field[FLD_MMOTION]);

    this.m_Field[FLD_ORBITNUM] = this.satLine2.substr(TLE2_COL_REVATEPOCH, TLE2_LEN_REVATEPOCH);
    this.m_Field[FLD_ORBITNUM] = parseFloat(this.m_Field[FLD_ORBITNUM]);
  };

  function ExpToDecimal(str) {
    var COL_EXP_SIGN = 6;
    var LEN_EXP = 2;

    var nMan = parseInt(str);
    var nExp;


    var dblMan = nMan * 1.0;
    var bNeg = (nMan < 0);

    if (bNeg)
      dblMan *= -1.0;

    // Move decimal place to left of first digit
    while (dblMan >= 1.0)
      dblMan /= 10.0;

    if (bNeg)
      dblMan *= -1.0;

    // now read exponent
    var sub = str.substr(COL_EXP_SIGN, LEN_EXP);
    nExp = parseInt(sub);

    var dblVal = dblMan * Math.pow(10.0, nExp);

    var strVal = dblVal.toFixed(9);

    return strVal;
  }

  TLE.prototype.getField = function (fld, units) {

    if (units === undefined) {
      units = U_NATIVE;
    }

    // Return requested field in floating-point form.
    // Return cache contents if it exists, else populate cache

    var key = parseInt(units * 100 + fld);

    if (!this.m_mapCache.has(key)) {
      // Value not in cache; add it
      var valNative = this.m_Field[fld];
      var valConv = ConvertUnits(valNative, fld, units);
      this.m_mapCache.set(key, valConv);

      return valConv;
    }
    else {
      // return cached value
      return this.m_mapCache.get(key);
    }
  };

  function ConvertUnits(valNative, fld, units) {
    switch (fld) {
      case FLD_I:
      case FLD_RAAN:
      case FLD_ARGPER:
      case FLD_M:
        {
          // The native TLE format is DEGREES
          if (units == U_RAD)
            return valNative * RADS_PER_DEG;
        }
    }

    return valNative; // return value in unconverted native format
  }


  function FeOrbit(tle) {

    this.m_tle = tle;

    this.m_tle.initTLE();

    var epochYear = parseInt(this.m_tle.getField(FLD_EPOCHYEAR));
    var epochDay = parseFloat(this.m_tle.getField(FLD_EPOCHDAY));

    if (epochYear < 57)
      epochYear += 2000;
    else
      epochYear += 1900;

    //获取总天数	  
    this.m_jdEpoch = getJulian(epochYear, epochDay);

    this.m_secPeriod = -1.0;

    // Recover the original mean motion and semimajor axis from the
    // input elements.
    var mm = this.m_tle.getField(FLD_MMOTION);
    var rpmin = mm * TWOPI / MIN_PER_DAY;   // rads per minute

    var a1 = Math.pow(XKE / rpmin, TWOTHRD);
    var e = this.m_tle.getField(FLD_E);
    var i = this.m_tle.getField(FLD_I, U_RAD);
    var temp = (1.5 * CK2 * (3.0 * Math.cos(i) * Math.cos(i) - 1.0) / Math.pow(1.0 - e * e, 1.5));
    var delta1 = temp / (a1 * a1);
    var a0 = a1 *
      (1.0 - delta1 *
        ((1.0 / 3.0) + delta1 *
          (1.0 + 134.0 / 81.0 * delta1)));

    var delta0 = temp / (a0 * a0);

    this.m_rmMeanMotionRec = rpmin / (1.0 + delta0);
    this.m_aeAxisSemiMajorRec = a0 / (1.0 - delta0);
    this.m_aeAxisSemiMinorRec = this.m_aeAxisSemiMajorRec * Math.sqrt(1.0 - (e * e));
    this.m_kmPerigeeRec = XKMPER_WGS72 * (this.m_aeAxisSemiMajorRec * (1.0 - e) - AE);
    this.m_kmApogeeRec = XKMPER_WGS72 * (this.m_aeAxisSemiMajorRec * (1.0 + e) - AE);

    if (TWOPI / this.m_rmMeanMotionRec >= 225.0) {
      //debugger;
      // SDP4 - period >= 225 minutes.
      this.m_pNoradModel = new FeNoradSDP4(this);
    }
    else {
      // SGP4 - period < 225 minutes
      this.m_pNoradModel = new FeNoradSGP4(this);
    }

  }

  FeOrbit.prototype.TPlusEpoch = function (gmt) {
    return (gmt - this.m_jdEpoch) * SEC_PER_DAY;
  };

  FeOrbit.prototype.Period = function () {
    if (this.m_secPeriod < 0.0) {
      // Calculate the period using the recovered mean motion.
      //if (m_rmMeanMotionRec == 0)
      if (Math.abs(this.m_rmMeanMotionRec) < 0.000001)
        this.m_secPeriod = 0.0;
      else
        this.m_secPeriod = TWOPI / this.m_rmMeanMotionRec * 60.0;
    }

    return this.m_secPeriod;
  };

  FeOrbit.prototype.mnAnomaly = function (gmt) {
    var span = this.TPlusEpoch(gmt);
    var P = this.Period();

    //==========================??????????================================
    //assert(!(fabs(P)<0.000001));//(P != 0.0);

    return (this.m_tle.getField(FLD_M, U_RAD) + (TWOPI * (span / P))) % TWOPI;
  };

  //获取卫星实时位置
  FeOrbit.prototype.getPosition = function (tsince) {

    var lonLatAlt = this.m_pNoradModel.getPosition(tsince);

    return lonLatAlt;
  };

  function getJulian(year, day) {

    year--;

    // Centuries are not leap years unless they divide by 400
    var A = parseInt((year / 100));
    var B = parseInt(2 - A + (A / 4));

    //double NewYears = (int)(365.25 * year) +
    //                  (int)(30.6001 * 14)  + 
    //                  1720994.5 + B;  // 1720994.5 = Oct 30, year -1
    var NewYears = (365.25 * year) + (30.6001 * 14.0) + 1720994.5 + B;  // 1720994.5 = Oct 30, year -1

    var days = NewYears + day;
    return days;
  }

  function FeSatelliteService() {

  }

  //获取卫星实时数据 beginTime ： 当前时间（天数）
  FeSatelliteService.prototype.request_real_time_orbit = function (noradnum, tleLine1, tleLine2, beginTime, timeSpan) {
    var tle1 = new TLE(noradnum, tleLine1, tleLine2);

    var orbit = new FeOrbit(tle1);

    //时间分钟
    var mpe = beginTime * 24.0 * 60.0;
    var epoch = (orbit.m_jdEpoch - EPOCH_JAN1_12H_2000) * 24.0 * 60.0;

    mpe += timeSpan;

    var addMinutes = (mpe - epoch);

    //经纬高（弧度、千米）
    var lonLatAlt = orbit.getPosition(addMinutes);

    /*var option = {
      lon : lonLatAlt[0],
      lat : lonLatAlt[1],
      alt : lonLatAlt[2],
      days : mpe / 24.0 / 60.0
    };*/

    if (lonLatAlt == undefined) {
      return undefined;
    }

    return [lonLatAlt[0], lonLatAlt[1], lonLatAlt[2]];
  };

  //获取某一时间段的卫星轨道
  FeSatelliteService.prototype.request_orbit = function (noradnum, tleLine1, tleLine2, beginTime, endTime, timeSpan) {
    var tempnoradnum = noradnum;
    var temptleLine1 = tleLine1;
    var temptleLine2 = tleLine2;

    var tle1 = new TLE(tempnoradnum, temptleLine1, temptleLine2);

    var orbit = new FeOrbit(tle1);

    var mpe = beginTime * 24.0 * 60.0;
    var endT = endTime * 24.0 * 60.0;
    var epoch = (orbit.m_jdEpoch - EPOCH_JAN1_12H_2000) * 24.0 * 60.0;

    var size = 0;
    if (mpe <= endT) {
      size = parseInt((endT - mpe) / timeSpan) + 1;
    }
    else {
      return undefined;
    }

    var outOrbit = new Array(size * 3);
    //by start HGT:  马桂杰  20190930
    var num = 0;
    //end
    for (var i = 0; i < size; ++i) {
      var addMinutes = mpe - epoch;
      //addMinutes = addMinutes.toPrecision(3);
      //经纬高（弧度、千米）
      var lonLatAlt = orbit.getPosition(addMinutes);

      if (lonLatAlt === undefined) {
        //by start HGT:  马桂杰  20190930
        num++;
        //end
        continue;
      }

      /*var optOrbit = new Object();
      
      optOrbit.lon = lonLatAlt[0];
      optOrbit.lat = lonLatAlt[1];
      optOrbit.alt = lonLatAlt[2];
      optOrbit.days = mpe / 24.0 / 60.0;*/

      //====================????????==================================
      /*if(mTest.m_Lon > 180.0)
      {
        x = mTest.m_Lon - 360.0;
      }*/

      //outOrbit[i] = optOrbit;
      outOrbit[i * 3 + 0] = lonLatAlt[0];
      outOrbit[i * 3 + 1] = lonLatAlt[1];
      outOrbit[i * 3 + 2] = lonLatAlt[2];

      mpe += timeSpan;
    }
    //by start HGT:  马桂杰  20190930
    if (num == size) {
      return undefined;
    }
    //end
    return outOrbit;
  };

  //获取某一时间点一个周期轨道
  FeSatelliteService.prototype.request_onecycle_orbit = function (noradnum, tleLine1, tleLine2, beginTime, timeSpan, ratio) {

    var tempnoradnum = noradnum;
    var temptleLine1 = tleLine1;
    var temptleLine2 = tleLine2;

    var tle1 = new TLE(tempnoradnum, temptleLine1, temptleLine2);

    var orbit = new FeOrbit(tle1);



    //获取轨道周期
    var motion = orbit.Period();
    motion = motion / 60.0 / 60.0 / 24.0;

    //历史轨迹点
    var historyPosArr = this.request_orbit(noradnum, tleLine1, tleLine2, beginTime - motion * ratio, beginTime, timeSpan);

    //预测轨迹点
    var futurePosArr = this.request_orbit(noradnum, tleLine1, tleLine2, beginTime, beginTime + motion * (1.0 - ratio), timeSpan);
    //console.info("****",historyPosArr.length/3,futurePosArr.length/3);
    var opt = {
      historyPositionArr: historyPosArr,
      futurePositionArr: futurePosArr
    };


    return opt;
  };

  //卫星轨迹点
  FeSatelliteService.prototype.fillSatellitePoints = function (noradnum, tleLine1, tleLine2, realTime) {
    var tempSpan = 0.1;//单位分钟
    var orbitPositions = this.request_onecycle_orbit(noradnum, tleLine1, tleLine2, realTime, tempSpan, 9.8 / 10.0);
    return orbitPositions;
  };

  FeEci.prototype.MulVel = function (factor) {
    this.m_vel.x *= factor;
    this.m_vel.y *= factor;
    this.m_vel.z *= factor;
  };

  FeEci.prototype.ae2km = function () {
    if (this.m_VecUnits === UNITS_AE) {
      this.MulPos(XKMPER_WGS72 / AE);                       // km
      this.MulVel((XKMPER_WGS72 / AE) * (MIN_PER_DAY / 86400.0));  // km/sec
      this.m_VecUnits = UNITS_KM;
    }
  };

  FeEci.prototype.toGeo = function () {
    this.ae2km(); // Vectors must be in kilometer-based units

    var theta = AcTan(this.m_pos.y, this.m_pos.x);

    //====================????????????????????????=========================
    var lon = (theta - toGMST(this.m_date)) % TWOPI;
    //debugger;
    if (lon < 0.0)
      lon += TWOPI;  // "wrap" negative modulo

    var r = Math.sqrt(this.m_pos.x * this.m_pos.x + this.m_pos.y * this.m_pos.y);
    var e2 = F * (2.0 - F);
    var lat = AcTan(this.m_pos.z, r);

    var delta = 1.0e-07;
    var phi;
    var c;
    //debugger;
    do {
      phi = lat;
      c = 1.0 / Math.sqrt(1.0 - e2 * Math.sin(phi) * Math.sin(phi));
      lat = AcTan(this.m_pos.z + XKMPER_WGS72 * c * e2 * Math.sin(phi), r);
    }
    while (Math.abs(lat - phi) > delta);

    var alt = r / Math.cos(lat) - XKMPER_WGS72 * c;

    return [lon, lat, alt * 1000.0]; // radians, radians, kilometers
  };

  function toGMST(date) {
    var UT = (date + 0.5) % 1.0;
    var TU = (date - EPOCH_JAN1_12H_2000 - UT) / 36525.0;

    var GMST = 24110.54841 + TU *
      (8640184.812866 + TU * (0.093104 - TU * 6.2e-06));

    GMST = (GMST + SEC_PER_DAY * OMEGA_E * UT) % (SEC_PER_DAY);

    if (GMST < 0.0)
      GMST += SEC_PER_DAY;  // "wrap" negative modulo value

    return (TWOPI * (GMST / SEC_PER_DAY));
  }

  //=========================================================================
  // FeNoradBase
  //=========================================================================
  function FeNoradBase(orbit) {

    this.m_Orbit = orbit;

    this.m_a3ovk2 = 0.0;
    this.m_c2 = 0.0;
    // Initialize any variables which are time-independent when
    // calculating the ECI coordinates of the satellite.
    this.m_satInc = this.m_Orbit.m_tle.getField(FLD_I, U_RAD);
    this.m_satEcc = this.m_Orbit.m_tle.getField(FLD_E);

    this.m_cosio = Math.cos(this.m_satInc);
    this.m_theta2 = this.m_cosio * this.m_cosio;
    this.m_x3thm1 = 3.0 * this.m_theta2 - 1.0;
    this.m_eosq = this.m_satEcc * this.m_satEcc;
    this.m_betao2 = 1.0 - this.m_eosq;
    this.m_betao = Math.sqrt(this.m_betao2);

    // The "recovered" semimajor axis and mean motion.
    this.m_aodp = this.m_Orbit.m_aeAxisSemiMajorRec;
    this.m_xnodp = this.m_Orbit.m_rmMeanMotionRec;

    // For perigee below 156 km, the values of S and QOMS2T are altered.
    this.m_perigee = XKMPER_WGS72 * (this.m_aodp * (1.0 - this.m_satEcc) - AE);

    this.m_s4 = S;
    this.m_qoms24 = QOMS2T;

    if (this.m_perigee < 156.0) {
      this.m_s4 = this.m_perigee - 78.0;

      if (this.m_perigee <= 98.0) {
        this.m_s4 = 20.0;
      }

      this.m_qoms24 = Math.pow((120.0 - this.m_s4) * AE / XKMPER_WGS72, 4.0);
      this.m_s4 = this.m_s4 / XKMPER_WGS72 + AE;
    }

    var pinvsq = 1.0 / (this.m_aodp * this.m_aodp * this.m_betao2 * this.m_betao2);

    this.m_tsi = 1.0 / (this.m_aodp - this.m_s4);
    this.m_eta = this.m_aodp * this.m_satEcc * this.m_tsi;
    this.m_etasq = this.m_eta * this.m_eta;
    this.m_eeta = this.m_satEcc * this.m_eta;

    var psisq = Math.abs(1.0 - this.m_etasq);

    this.m_coef = this.m_qoms24 * Math.pow(this.m_tsi, 4.0);
    this.m_coef1 = this.m_coef / Math.pow(psisq, 3.5);

    var c2 = this.m_coef1 * this.m_xnodp *
      (this.m_aodp * (1.0 + 1.5 * this.m_etasq + this.m_eeta * (4.0 + this.m_etasq)) +
        0.75 * CK2 * this.m_tsi / psisq * this.m_x3thm1 *
        (8.0 + 3.0 * this.m_etasq * (8.0 + this.m_etasq)));

    this.m_c1 = this.m_Orbit.m_tle.getField(FLD_BSTAR) / AE * c2;
    this.m_sinio = Math.sin(this.m_satInc);

    var a3ovk2 = -XJ3 / CK2 * Math.pow(AE, 3.0);

    this.m_c3 = this.m_coef * this.m_tsi * a3ovk2 * this.m_xnodp * AE * this.m_sinio / this.m_satEcc;
    this.m_x1mth2 = 1.0 - this.m_theta2;
    this.m_c4 = 2.0 * this.m_xnodp * this.m_coef1 * this.m_aodp * this.m_betao2 *
      (this.m_eta * (2.0 + 0.5 * this.m_etasq) + this.m_satEcc * (0.5 + 2.0 * this.m_etasq) -
        2.0 * CK2 * this.m_tsi / (this.m_aodp * psisq) *
        (-3.0 * this.m_x3thm1 * (1.0 - 2.0 * this.m_eeta + this.m_etasq * (1.5 - 0.5 * this.m_eeta)) +
          0.75 * this.m_x1mth2 * (2.0 * this.m_etasq - this.m_eeta * (1.0 + this.m_etasq)) *
          Math.cos(2.0 * this.m_Orbit.m_tle.getField(FLD_ARGPER, U_RAD))));

    var theta4 = this.m_theta2 * this.m_theta2;
    var temp1 = 3.0 * CK2 * pinvsq * this.m_xnodp;
    var temp2 = temp1 * CK2 * pinvsq;
    var temp3 = 1.25 * CK4 * pinvsq * pinvsq * this.m_xnodp;

    this.m_xmdot = this.m_xnodp + 0.5 * temp1 * this.m_betao * this.m_x3thm1 +
      0.0625 * temp2 * this.m_betao * (13.0 - 78.0 * this.m_theta2 + 137.0 * theta4);

    var x1m5th = 1.0 - 5.0 * this.m_theta2;

    this.m_omgdot = -0.5 * temp1 * x1m5th + 0.0625 * temp2 * (7.0 - 114.0 * this.m_theta2 + 395.0 * theta4) +
      temp3 * (3.0 - 36.0 * this.m_theta2 + 49.0 * theta4);

    var xhdot1 = -temp1 * this.m_cosio;

    this.m_xnodot = xhdot1 + (0.5 * temp2 * (4.0 - 19.0 * this.m_theta2) + 2.0 * temp3 * (3.0 - 7.0 * this.m_theta2)) * this.m_cosio;
    this.m_xnodcf = 3.5 * this.m_betao2 * xhdot1 * this.m_c1;
    this.m_t2cof = 1.5 * this.m_c1;
    this.m_xlcof = 0.125 * a3ovk2 * this.m_sinio * (3.0 + 5.0 * this.m_cosio) / (1.0 + this.m_cosio);
    this.m_aycof = 0.25 * a3ovk2 * this.m_sinio;
    this.m_x7thm1 = 7.0 * this.m_theta2 - 1.0;
  }

  function Fmod2p(arg) {
    var modu = arg % TWOPI;
    if (modu < 0.0)
      modu += TWOPI;
    return modu;
  }

  function AcTan(sinx, cosx) {
    var ret;

    //if (cosx == 0.0)
    if (Math.abs(cosx) < 0.000001) {
      if (sinx > 0.0)
        ret = PI / 2.0;
      else
        ret = 3.0 * PI / 2.0;
    }
    else {
      if (cosx > 0.0)
        ret = Math.atan(sinx / cosx);
      else
        ret = PI + Math.atan(sinx / cosx);
    }

    return ret;
  }

  function magnitude(x, y, z) {
    return Math.sqrt(x * x + y * y + z * z);
  }

  FeNoradBase.prototype.FinalPosition = function (incl, omega, e, a, xl, xnode, xn, tsince) {
    if ((e * e) > 1.0) {
      return undefined;
    }
    var beta = Math.sqrt(1.0 - e * e);

    // Long period periodics 
    var axn = e * Math.cos(omega);
    var temp = 1.0 / (a * beta * beta);
    var xll = temp * this.m_xlcof * axn;
    var aynl = temp * this.m_aycof;
    var xlt = xl + xll;
    var ayn = e * Math.sin(omega) + aynl;

    // Solve Kepler's Equation 

    var capu = Fmod2p(xlt - xnode);

    var temp2 = capu;
    var temp3 = 0.0;
    var temp4 = 0.0;
    var temp5 = 0.0;
    var temp6 = 0.0;
    var sinepw = 0.0;
    var cosepw = 0.0;
    var fDone = false;

    for (var i = 1; (i <= 10) && !fDone; i++) {
      sinepw = Math.sin(temp2);
      cosepw = Math.cos(temp2);
      temp3 = axn * sinepw;
      temp4 = ayn * cosepw;
      temp5 = axn * cosepw;
      temp6 = ayn * sinepw;

      var epw = (capu - temp4 + temp3 - temp2) /
        (1.0 - temp5 - temp6) + temp2;

      if (Math.abs(epw - temp2) <= E6A)
        fDone = true;
      else
        temp2 = epw;
    }

    // Short period preliminary quantities 
    var ecose = temp5 + temp6;
    var esine = temp3 - temp4;
    var elsq = axn * axn + ayn * ayn;
    temp = 1.0 - elsq;
    var pl = a * temp;
    var r = a * (1.0 - ecose);
    var temp1 = 1.0 / r;
    var rdot = XKE * Math.sqrt(a) * esine * temp1;
    var rfdot = XKE * Math.sqrt(pl) * temp1;
    temp2 = a * temp1;
    var betal = Math.sqrt(temp);
    temp3 = 1.0 / (1.0 + betal);
    var cosu = temp2 * (cosepw - axn + ayn * esine * temp3);
    var sinu = temp2 * (sinepw - ayn - axn * esine * temp3);
    var u = AcTan(sinu, cosu);
    var sin2u = 2.0 * sinu * cosu;
    var cos2u = 2.0 * cosu * cosu - 1.0;

    temp = 1.0 / pl;
    temp1 = CK2 * temp;
    temp2 = temp1 * temp;

    // Update for short periodics 
    var rk = r * (1.0 - 1.5 * temp2 * betal * this.m_x3thm1) + 0.5 * temp1 * this.m_x1mth2 * cos2u;
    var uk = u - 0.25 * temp2 * this.m_x7thm1 * sin2u;
    var xnodek = xnode + 1.5 * temp2 * this.m_cosio * sin2u;
    var xinck = incl + 1.5 * temp2 * this.m_cosio * this.m_sinio * cos2u;
    var rdotk = rdot - xn * temp1 * this.m_x1mth2 * sin2u;
    var rfdotk = rfdot + xn * temp1 * (this.m_x1mth2 * cos2u + 1.5 * this.m_x3thm1);

    // Orientation vectors 
    var sinuk = Math.sin(uk);
    var cosuk = Math.cos(uk);
    var sinik = Math.sin(xinck);
    var cosik = Math.cos(xinck);
    var sinnok = Math.sin(xnodek);
    var cosnok = Math.cos(xnodek);
    var xmx = -sinnok * cosik;
    var xmy = cosnok * cosik;
    var ux = xmx * sinuk + cosnok * cosuk;
    var uy = xmy * sinuk + sinnok * cosuk;
    var uz = sinik * sinuk;
    var vx = xmx * cosuk - cosnok * sinuk;
    var vy = xmy * cosuk - sinnok * sinuk;
    var vz = sinik * cosuk;

    // Position
    var x = rk * ux;
    var y = rk * uy;
    var z = rk * uz;

    var vecPos = { x: x, y: y, z: z };
    var mag = magnitude(x, y, z);
    // Validate on altitude
    var altKm = (mag * (XKMPER_WGS72 / AE));

    if (altKm < XKMPER_WGS72 || altKm > 2 * GEOSYNC_ALT) {
      return undefined;
    }
    // Velocity
    var xdot = rdotk * ux + rfdotk * vx;
    var ydot = rdotk * uy + rfdotk * vy;
    var zdot = rdotk * uz + rfdotk * vz;

    var vecVel = { x: xdot, y: ydot, z: zdot };

    var gmt = this.m_Orbit.m_jdEpoch;
    gmt += (tsince / MIN_PER_DAY);
    //debugger;
    //卫星实时数据
    var eci = new FeEci(vecPos, vecVel, gmt);
    var lonLatAlt = eci.toGeo();
    //经度、纬度、高度	
    return lonLatAlt;
  };

  const zns = 1.19459E-5; const c1ss = 2.9864797E-6;
  const zes = 0.01675; const znl = 1.5835218E-4;
  const c1l = 4.7968065E-7; const zel = 0.05490;
  const zcosis = 0.91744867; const zsinis = 0.39785416;
  const zsings = -0.98088458; const zcosgs = 0.1945905;
  const q22 = 1.7891679E-6; const q31 = 2.1460748E-6;
  const q33 = 2.2123015E-7; const g22 = 5.7686396;
  const g32 = 0.95240898; const g44 = 1.8014998;
  const g52 = 1.0508330; const g54 = 4.4108898;
  const root22 = 1.7891679E-6; const root32 = 3.7393792E-7;
  const root44 = 7.3636953E-9; const root52 = 1.1428639E-7;
  const root54 = 2.1765803E-9; const thdt = 4.3752691E-3;

  function FeNoradSDP4(orbit) {

    FeNoradBase.call(this, orbit);

    this.m_Orbit = orbit;

    this.m_sing = Math.sin(this.m_Orbit.m_tle.getField(FLD_ARGPER, U_RAD));
    this.m_cosg = Math.cos(this.m_Orbit.m_tle.getField(FLD_ARGPER, U_RAD));

    var eqsq = 0.0;
    var siniq = 0.0;
    var cosiq = 0.0;
    var rteqsq = 0.0;
    var ao = 0.0;
    var cosq2 = 0.0;
    var sinomo = 0.0;
    var cosomo = 0.0;
    var bsq = 0.0;
    var xlldot = 0.0;
    var omgdt = 0.0;
    var xnodot = 0.0;
    var xll = 0.0;
    var omgasm = 0.0;
    var xnodes = 0.0;
    var _em = 0.0;
    var xinc = 0.0;
    var xn = 0.0;
    var t = 0.0;

    var dp_savtsn = 0.0;
    var dp_zmos = 0.0;
    var dp_se2 = 0.0;
    var dp_se3 = 0.0;
    var dp_si2 = 0.0;
    var dp_si3 = 0.0;
    var dp_sl2 = 0.0;
    var dp_sl3 = 0.0;
    var dp_sl4 = 0.0;
    var dp_sgh2 = 0.0;
    var dp_sgh3 = 0.0;
    var dp_sgh4 = 0.0;
    var dp_sh2 = 0.0;
    var dp_sh3 = 0.0;
    var dp_zmol = 0.0;
    var dp_ee2 = 0.0;
    var dp_e3 = 0.0;
    var dp_xi2 = 0.0;
    var dp_xi3 = 0.0;
    var dp_xl2 = 0.0;
    var dp_xl3 = 0.0;
    var dp_xl4 = 0.0;
    var dp_xgh2 = 0.0;
    var dp_xgh3 = 0.0;
    var dp_xgh4 = 0.0;
    var dp_xh2 = 0.0;
    var dp_xh3 = 0.0;
    var dp_xqncl = 0.0;

    var dp_thgr = 0.0;
    var dp_omegaq = 0.0;
    var dp_sse = 0.0;
    var dp_ssi = 0.0;
    var dp_ssl = 0.0;
    var dp_ssh = 0.0;
    var dp_ssg = 0.0;
    var dp_d2201 = 0.0;
    var dp_d2211 = 0.0;
    var dp_d3210 = 0.0;
    var dp_d3222 = 0.0;
    var dp_d4410 = 0.0;
    var dp_d4422 = 0.0;
    var dp_d5220 = 0.0;
    var dp_d5232 = 0.0;
    var dp_d5421 = 0.0;
    var dp_d5433 = 0.0;
    var dp_xlamo = 0.0;
    var dp_del1 = 0.0;
    var dp_del2 = 0.0;
    var dp_del3 = 0.0;
    var dp_fasx2 = 0.0;
    var dp_fasx4 = 0.0;
    var dp_fasx6 = 0.0;
    var dp_xfact = 0.0;
    var dp_xli = 0.0;
    var dp_xni = 0.0;
    var dp_atime = 0.0;
    var dp_stepp = 0.0;
    var dp_stepn = 0.0;
    var dp_step2 = 0.0;

    var dp_iresfl = false;
    var dp_isynfl = false;

    var dpi_c = 0.0;
    var dpi_stem = 0.0;
    var dpi_zcosil = 0.0;
    var dpi_zx = 0.0;
    var dpi_ctem = 0.0;
    var dpi_xnodce = 0.0;
    var dpi_zsingl = 0.0;
    var dpi_zy = 0.0;
    var dpi_day = 0.0;
    var dpi_zcosgl = 0.0;
    var dpi_zsinhl = 0.0;
    var dpi_gam = 0.0;
    var dpi_zcoshl = 0.0;
    var dpi_zsinil = 0.0;


    //////////////////////////////////////////////////////////////////////////////
    function DeepInit(that, eoso, sinio, cosio, betao, aodp, theta2, sing, cosg, betao2, xmdot, omgdot, xnodott) {

      eqsq = eoso;
      siniq = sinio;
      cosiq = cosio;
      rteqsq = betao;
      ao = aodp;
      cosq2 = theta2;
      sinomo = sing;
      cosomo = cosg;
      bsq = betao2;
      xlldot = xmdot;
      omgdt = omgdot;
      xnodot = xnodott;

      // Deep space initialization 
      var jd = that.m_Orbit.m_jdEpoch;

      dp_thgr = toGMST(jd);

      var eq = that.m_Orbit.m_tle.getField(FLD_E);
      var aqnv = 1.0 / ao;

      dp_xqncl = that.m_Orbit.m_tle.getField(FLD_I, U_RAD);

      var xmao = that.m_Orbit.m_tle.getField(FLD_M, U_RAD);
      var xpidot = omgdt + xnodot;
      var sinq = Math.sin(that.m_Orbit.m_tle.getField(FLD_RAAN, U_RAD));
      var cosq = Math.cos(that.m_Orbit.m_tle.getField(FLD_RAAN, U_RAD));

      dp_omegaq = that.m_Orbit.m_tle.getField(FLD_ARGPER, U_RAD);

      // Initialize lunar solar terms 
      var day = jd - EPOCH_JAN1_12H_1900;

      //if (day != dpi_day)
      if (Math.abs(day - dpi_day) > 0.000001) {
        dpi_day = day;
        dpi_xnodce = 4.5236020 - 9.2422029E-4 * day;
        dpi_stem = Math.sin(dpi_xnodce);
        dpi_ctem = Math.cos(dpi_xnodce);
        dpi_zcosil = 0.91375164 - 0.03568096 * dpi_ctem;
        dpi_zsinil = Math.sqrt(1.0 - dpi_zcosil * dpi_zcosil);
        dpi_zsinhl = 0.089683511 * dpi_stem / dpi_zsinil;
        dpi_zcoshl = Math.sqrt(1.0 - dpi_zsinhl * dpi_zsinhl);
        dpi_c = 4.7199672 + 0.22997150 * day;
        dpi_gam = 5.8351514 + 0.0019443680 * day;
        dp_zmol = Fmod2p(dpi_c - dpi_gam);
        dpi_zx = 0.39785416 * dpi_stem / dpi_zsinil;
        dpi_zy = dpi_zcoshl * dpi_ctem + 0.91744867 * dpi_zsinhl * dpi_stem;
        dpi_zx = AcTan(dpi_zx, dpi_zy) + dpi_gam - dpi_xnodce;
        dpi_zcosgl = Math.cos(dpi_zx);
        dpi_zsingl = Math.sin(dpi_zx);
        dp_zmos = 6.2565837 + 0.017201977 * day;
        dp_zmos = Fmod2p(dp_zmos);
      }

      dp_savtsn = 1.0e20;

      var zcosg = zcosgs;
      var zsing = zsings;
      var zcosi = zcosis;
      var zsini = zsinis;
      var zcosh = cosq;
      var zsinh = sinq;
      var cc = c1ss;
      var zn = zns;
      var ze = zes;
      var xnoi = 1.0 / that.m_xnodp;

      var a1; var a3; var a7; var a8; var a9; var a10;
      var a2; var a4; var a5; var a6; var x1; var x2;
      var x3; var x4; var x5; var x6; var x7; var x8;
      var z31; var z32; var z33; var z1; var z2; var z3;
      var z11; var z12; var z13; var z21; var z22; var z23;
      var s3; var s2; var s4; var s1; var s5; var s6;
      var s7;
      var se = 0.0; var si = 0.0; var sl = 0.0;
      var sgh = 0.0; var sh = 0.0;

      // Apply the solar and lunar terms on the first pass, then re-apply the
      // solar terms again on the second pass.

      for (var pass = 1; pass <= 2; pass++) {
        // Do solar terms 
        a1 = zcosg * zcosh + zsing * zcosi * zsinh;
        a3 = -zsing * zcosh + zcosg * zcosi * zsinh;
        a7 = -zcosg * zsinh + zsing * zcosi * zcosh;
        a8 = zsing * zsini;
        a9 = zsing * zsinh + zcosg * zcosi * zcosh;
        a10 = zcosg * zsini;
        a2 = cosiq * a7 + siniq * a8;
        a4 = cosiq * a9 + siniq * a10;
        a5 = -siniq * a7 + cosiq * a8;
        a6 = -siniq * a9 + cosiq * a10;
        x1 = a1 * cosomo + a2 * sinomo;
        x2 = a3 * cosomo + a4 * sinomo;
        x3 = -a1 * sinomo + a2 * cosomo;
        x4 = -a3 * sinomo + a4 * cosomo;
        x5 = a5 * sinomo;
        x6 = a6 * sinomo;
        x7 = a5 * cosomo;
        x8 = a6 * cosomo;
        z31 = 12.0 * x1 * x1 - 3.0 * x3 * x3;
        z32 = 24.0 * x1 * x2 - 6.0 * x3 * x4;
        z33 = 12.0 * x2 * x2 - 3.0 * x4 * x4;
        z1 = 3.0 * (a1 * a1 + a2 * a2) + z31 * eqsq;
        z2 = 6.0 * (a1 * a3 + a2 * a4) + z32 * eqsq;
        z3 = 3.0 * (a3 * a3 + a4 * a4) + z33 * eqsq;
        z11 = -6.0 * a1 * a5 + eqsq * (-24.0 * x1 * x7 - 6.0 * x3 * x5);
        z12 = -6.0 * (a1 * a6 + a3 * a5) +
          eqsq * (-24.0 * (x2 * x7 + x1 * x8) - 6.0 * (x3 * x6 + x4 * x5));
        z13 = -6.0 * a3 * a6 + eqsq * (-24.0 * x2 * x8 - 6.0 * x4 * x6);
        z21 = 6.0 * a2 * a5 + eqsq * (24.0 * x1 * x5 - 6.0 * x3 * x7);
        z22 = 6.0 * (a4 * a5 + a2 * a6) +
          eqsq * (24.0 * (x2 * x5 + x1 * x6) - 6.0 * (x4 * x7 + x3 * x8));
        z23 = 6.0 * a4 * a6 + eqsq * (24.0 * x2 * x6 - 6.0 * x4 * x8);
        z1 = z1 + z1 + bsq * z31;
        z2 = z2 + z2 + bsq * z32;
        z3 = z3 + z3 + bsq * z33;
        s3 = cc * xnoi;
        s2 = -0.5 * s3 / rteqsq;
        s4 = s3 * rteqsq;
        s1 = -15.0 * eq * s4;
        s5 = x1 * x3 + x2 * x4;
        s6 = x2 * x3 + x1 * x4;
        s7 = x2 * x4 - x1 * x3;
        se = s1 * zn * s5;
        si = s2 * zn * (z11 + z13);
        sl = -zn * s3 * (z1 + z3 - 14.0 - 6.0 * eqsq);
        sgh = s4 * zn * (z31 + z33 - 6.0);
        sh = -zn * s2 * (z21 + z23);

        if (dp_xqncl < 5.2359877E-2)
          sh = 0.0;

        dp_ee2 = 2.0 * s1 * s6;
        dp_e3 = 2.0 * s1 * s7;
        dp_xi2 = 2.0 * s2 * z12;
        dp_xi3 = 2.0 * s2 * (z13 - z11);
        dp_xl2 = -2.0 * s3 * z2;
        dp_xl3 = -2.0 * s3 * (z3 - z1);
        dp_xl4 = -2.0 * s3 * (-21.0 - 9.0 * eqsq) * ze;
        dp_xgh2 = 2.0 * s4 * z32;
        dp_xgh3 = 2.0 * s4 * (z33 - z31);
        dp_xgh4 = -18.0 * s4 * ze;
        dp_xh2 = -2.0 * s2 * z22;
        dp_xh3 = -2.0 * s2 * (z23 - z21);

        if (pass == 1) {
          // Do lunar terms 
          dp_sse = se;
          dp_ssi = si;
          dp_ssl = sl;
          dp_ssh = sh / siniq;
          dp_ssg = sgh - cosiq * dp_ssh;
          dp_se2 = dp_ee2;
          dp_si2 = dp_xi2;
          dp_sl2 = dp_xl2;
          dp_sgh2 = dp_xgh2;
          dp_sh2 = dp_xh2;
          dp_se3 = dp_e3;
          dp_si3 = dp_xi3;
          dp_sl3 = dp_xl3;
          dp_sgh3 = dp_xgh3;
          dp_sh3 = dp_xh3;
          dp_sl4 = dp_xl4;
          dp_sgh4 = dp_xgh4;
          zcosg = dpi_zcosgl;
          zsing = dpi_zsingl;
          zcosi = dpi_zcosil;
          zsini = dpi_zsinil;
          zcosh = dpi_zcoshl * cosq + dpi_zsinhl * sinq;
          zsinh = sinq * dpi_zcoshl - cosq * dpi_zsinhl;
          zn = znl;
          cc = c1l;
          ze = zel;
        }
      }

      dp_sse = dp_sse + se;
      dp_ssi = dp_ssi + si;
      dp_ssl = dp_ssl + sl;
      dp_ssg = dp_ssg + sgh - cosiq / siniq * sh;
      dp_ssh = dp_ssh + sh / siniq;

      // Geopotential resonance initialization for 12 hour orbits 
      dp_iresfl = false;
      dp_isynfl = false;

      var bInitOnExit = true;
      var g310;
      var f220;
      var bfact = 0.0;

      if ((that.m_xnodp >= 0.0052359877) || (that.m_xnodp <= 0.0034906585)) {
        if ((that.m_xnodp < 8.26E-3) || (that.m_xnodp > 9.24E-3) || (eq < 0.5)) {
          bInitOnExit = false;
        }
        else {
          dp_iresfl = true;

          var eoc = eq * eqsq;
          var g201 = -0.306 - (eq - 0.64) * 0.440;

          var g211; var g322;
          var g410; var g422;
          var g520;

          if (eq <= 0.65) {
            g211 = 3.616 - 13.247 * eq + 16.290 * eqsq;
            g310 = -19.302 + 117.390 * eq - 228.419 * eqsq + 156.591 * eoc;
            g322 = -18.9068 + 109.7927 * eq - 214.6334 * eqsq + 146.5816 * eoc;
            g410 = -41.122 + 242.694 * eq - 471.094 * eqsq + 313.953 * eoc;
            g422 = -146.407 + 841.880 * eq - 1629.014 * eqsq + 1083.435 * eoc;
            g520 = -532.114 + 3017.977 * eq - 5740.0 * eqsq + 3708.276 * eoc;
          }
          else {
            g211 = -72.099 + 331.819 * eq - 508.738 * eqsq + 266.724 * eoc;
            g310 = -346.844 + 1582.851 * eq - 2415.925 * eqsq + 1246.113 * eoc;
            g322 = -342.585 + 1554.908 * eq - 2366.899 * eqsq + 1215.972 * eoc;
            g410 = -1052.797 + 4758.686 * eq - 7193.992 * eqsq + 3651.957 * eoc;
            g422 = -3581.69 + 16178.11 * eq - 24462.77 * eqsq + 12422.52 * eoc;

            if (eq <= 0.715)
              g520 = 1464.74 - 4664.75 * eq + 3763.64 * eqsq;
            else
              g520 = -5149.66 + 29936.92 * eq - 54087.36 * eqsq + 31324.56 * eoc;
          }

          var g533;
          var g521;
          var g532;

          if (eq < 0.7) {
            g533 = -919.2277 + 4988.61 * eq - 9064.77 * eqsq + 5542.21 * eoc;
            g521 = -822.71072 + 4568.6173 * eq - 8491.4146 * eqsq + 5337.524 * eoc;
            g532 = -853.666 + 4690.25 * eq - 8624.77 * eqsq + 5341.4 * eoc;
          }
          else {
            g533 = -37995.78 + 161616.52 * eq - 229838.2 * eqsq + 109377.94 * eoc;
            g521 = -51752.104 + 218913.95 * eq - 309468.16 * eqsq + 146349.42 * eoc;
            g532 = -40023.88 + 170470.89 * eq - 242699.48 * eqsq + 115605.82 * eoc;
          }

          var sini2 = siniq * siniq;
          f220 = 0.75 * (1.0 + 2.0 * cosiq + cosq2);
          var f221 = 1.5 * sini2;
          var f321 = 1.875 * siniq * (1.0 - 2.0 * cosiq - 3.0 * cosq2);
          var f322 = -1.875 * siniq * (1.0 + 2.0 * cosiq - 3.0 * cosq2);
          var f441 = 35.0 * sini2 * f220;
          var f442 = 39.3750 * sini2 * sini2;
          var f522 = 9.84375 * siniq * (sini2 * (1.0 - 2.0 * cosiq - 5.0 * cosq2) +
            0.33333333 * (-2.0 + 4.0 * cosiq + 6.0 * cosq2));
          var f523 = siniq * (4.92187512 * sini2 * (-2.0 - 4.0 * cosiq + 10.0 * cosq2) +
            6.56250012 * (1.0 + 2.0 * cosiq - 3.0 * cosq2));
          var f542 = 29.53125 * siniq * (2.0 - 8.0 * cosiq + cosq2 * (-12.0 + 8.0 * cosiq + 10.0 * cosq2));
          var f543 = 29.53125 * siniq * (-2.0 - 8.0 * cosiq + cosq2 * (12.0 + 8.0 * cosiq - 10.0 * cosq2));
          var xno2 = that.m_xnodp * that.m_xnodp;
          var ainv2 = aqnv * aqnv;
          var temp1 = 3.0 * xno2 * ainv2;
          var temp = temp1 * root22;

          dp_d2201 = temp * f220 * g201;
          dp_d2211 = temp * f221 * g211;
          temp1 = temp1 * aqnv;
          temp = temp1 * root32;
          dp_d3210 = temp * f321 * g310;
          dp_d3222 = temp * f322 * g322;
          temp1 = temp1 * aqnv;
          temp = 2.0 * temp1 * root44;
          dp_d4410 = temp * f441 * g410;
          dp_d4422 = temp * f442 * g422;
          temp1 = temp1 * aqnv;
          temp = temp1 * root52;
          dp_d5220 = temp * f522 * g520;
          dp_d5232 = temp * f523 * g532;
          temp = 2.0 * temp1 * root54;
          dp_d5421 = temp * f542 * g521;
          dp_d5433 = temp * f543 * g533;
          dp_xlamo = xmao + that.m_Orbit.m_tle.getField(FLD_RAAN, U_RAD) + that.m_Orbit.m_tle.getField(FLD_RAAN, U_RAD) - dp_thgr - dp_thgr;
          bfact = xlldot + xnodot + xnodot - thdt - thdt;
          bfact = bfact + dp_ssl + dp_ssh + dp_ssh;
        }
      }
      else {
        // Synchronous resonance terms initialization 
        dp_iresfl = true;
        dp_isynfl = true;
        var g200 = 1.0 + eqsq * (-2.5 + 0.8125 * eqsq);
        g310 = 1.0 + 2.0 * eqsq;
        var g300 = 1.0 + eqsq * (-6.0 + 6.60937 * eqsq);
        f220 = 0.75 * (1.0 + cosiq) * (1.0 + cosiq);
        var f311 = 0.9375 * siniq * siniq * (1.0 + 3.0 * cosiq) - 0.75 * (1.0 + cosiq);
        var f330 = 1.0 + cosiq;
        f330 = 1.875 * f330 * f330 * f330;
        dp_del1 = 3.0 * that.m_xnodp * that.m_xnodp * aqnv * aqnv;
        dp_del2 = 2.0 * dp_del1 * f220 * g200 * q22;
        dp_del3 = 3.0 * dp_del1 * f330 * g300 * q33 * aqnv;
        dp_del1 = dp_del1 * f311 * g310 * q31 * aqnv;
        dp_fasx2 = 0.13130908;
        dp_fasx4 = 2.8843198;
        dp_fasx6 = 0.37448087;
        dp_xlamo = xmao + that.m_Orbit.m_tle.getField(FLD_RAAN, U_RAD) + that.m_Orbit.m_tle.getField(FLD_ARGPER, U_RAD) - dp_thgr;
        bfact = xlldot + xpidot - thdt;
        bfact = bfact + dp_ssl + dp_ssg + dp_ssh;
      }

      if (bInitOnExit) {
        dp_xfact = bfact - that.m_xnodp;

        // Initialize integrator 
        dp_xli = dp_xlamo;
        dp_xni = that.m_xnodp;
        dp_atime = 0.0;
        dp_stepp = 720.0;
        dp_stepn = -720.0;
        dp_step2 = 259200.0;
      }

      var opt = {
        eosq: eqsq,
        sinio: siniq,
        cosio: cosiq,
        betao: rteqsq,
        aodp: ao,
        theta2: cosq2,
        sing: sinomo,
        cosg: cosomo,
        betao2: bsq,
        xmdot: xlldot,
        omgdot: omgdt,
        xnodott: xnodot
      };
      return opt;
    }


    function DeepCalcDotTerms(pxndot, pxnddt, pxldot) {
      // Dot terms calculated 
      if (dp_isynfl) {
        pxndot = dp_del1 * Math.sin(dp_xli - dp_fasx2) +
          dp_del2 * Math.sin(2.0 * (dp_xli - dp_fasx4)) +
          dp_del3 * Math.sin(3.0 * (dp_xli - dp_fasx6));
        pxnddt = dp_del1 * Math.cos(dp_xli - dp_fasx2) +
          2.0 * dp_del2 * Math.cos(2.0 * (dp_xli - dp_fasx4)) +
          3.0 * dp_del3 * Math.cos(3.0 * (dp_xli - dp_fasx6));
      }
      else {
        var xomi = dp_omegaq + omgdt * dp_atime;
        var x2omi = xomi + xomi;
        var x2li = dp_xli + dp_xli;

        pxndot = dp_d2201 * Math.sin(x2omi + dp_xli - g22) +
          dp_d2211 * Math.sin(dp_xli - g22) +
          dp_d3210 * Math.sin(xomi + dp_xli - g32) +
          dp_d3222 * Math.sin(-xomi + dp_xli - g32) +
          dp_d4410 * Math.sin(x2omi + x2li - g44) +
          dp_d4422 * Math.sin(x2li - g44) +
          dp_d5220 * Math.sin(xomi + dp_xli - g52) +
          dp_d5232 * Math.sin(-xomi + dp_xli - g52) +
          dp_d5421 * Math.sin(xomi + x2li - g54) +
          dp_d5433 * Math.sin(-xomi + x2li - g54);

        pxnddt = dp_d2201 * Math.cos(x2omi + dp_xli - g22) +
          dp_d2211 * Math.cos(dp_xli - g22) +
          dp_d3210 * Math.cos(xomi + dp_xli - g32) +
          dp_d3222 * Math.cos(-xomi + dp_xli - g32) +
          dp_d5220 * Math.cos(xomi + dp_xli - g52) +
          dp_d5232 * Math.cos(-xomi + dp_xli - g52) +
          2.0 * (dp_d4410 * Math.cos(x2omi + x2li - g44) +
            dp_d4422 * Math.cos(x2li - g44) +
            dp_d5421 * Math.cos(xomi + x2li - g54) +
            dp_d5433 * Math.cos(-xomi + x2li - g54));
      }

      pxldot = dp_xni + dp_xfact;
      pxnddt = pxnddt * pxldot;

      var opt = {
        pxndot: pxndot,
        pxnddt: pxnddt,
        pxldot: pxldot
      };
      return opt;
    }

    function DeepCalcIntegrator(pxndot, pxnddt, pxldot, delt) {
      var opt = DeepCalcDotTerms(pxndot, pxnddt, pxldot);

      dp_xli = dp_xli + opt.pxldot * delt + opt.pxndot * dp_step2;
      dp_xni = dp_xni + opt.pxndot * delt + opt.pxnddt * dp_step2;
      dp_atime = dp_atime + delt;
    }

    function DeepSecular(that, xmdf, omgadf, xnode, emm, xincc, xnn, tsince) {
      xll = xmdf;
      omgasm = omgadf;
      xnodes = xnode;
      xn = xnn;
      t = tsince;

      // Deep space secular effects 
      xll = xll + dp_ssl * t;
      omgasm = omgasm + dp_ssg * t;
      xnodes = xnodes + dp_ssh * t;
      _em = that.m_Orbit.m_tle.getField(FLD_E) + dp_sse * t;
      xinc = that.m_Orbit.m_tle.getField(FLD_I, U_RAD) + dp_ssi * t;

      if (xinc < 0.0) {
        xinc = -xinc;
        xnodes = xnodes + PI;
        omgasm = omgasm - PI;
      }

      var xnddt = 0.0;
      var xndot = 0.0;
      var xldot = 0.0;
      var ft = 0.0;
      var delt = 0.0;

      var fDone = false;

      if (dp_iresfl) {
        while (!fDone) {
          //if ((dp_atime == 0.0)                ||
          //   ((t >= 0.0) && (dp_atime <  0.0)) ||
          //   ((t <  0.0) && (dp_atime >= 0.0)))
          if ((Math.abs(dp_atime) < 0.000001) ||
            ((t >= 0.0) && (dp_atime < 0.0)) ||
            ((t < 0.0) && (dp_atime >= 0.0))) {
            if (t < 0.0)
              delt = dp_stepn;
            else
              delt = dp_stepp;

            // Epoch restart 
            dp_atime = 0.0;
            dp_xni = that.m_xnodp;
            dp_xli = dp_xlamo;

            fDone = true;
          }
          else {
            if (Math.abs(t) < Math.abs(dp_atime)) {
              delt = dp_stepp;

              if (t >= 0.0)
                delt = dp_stepn;

              DeepCalcIntegrator(xndot, xnddt, xldot, delt);
            }
            else {
              delt = dp_stepn;

              if (t > 0.0)
                delt = dp_stepp;

              fDone = true;
            }
          }
        }

        while (Math.abs(t - dp_atime) >= dp_stepp) {
          DeepCalcIntegrator(xndot, xnddt, xldot, delt);
        }

        ft = t - dp_atime;

        var opt = DeepCalcDotTerms(xndot, xnddt, xldot);

        xn = dp_xni + opt.pxndot * ft + opt.pxnddt * ft * ft * 0.5;

        var xl = dp_xli + opt.pxldot * ft + opt.pxndot * ft * ft * 0.5;
        var temp = -xnodes + dp_thgr + t * thdt;

        xll = xl - omgasm + temp;

        if (!dp_isynfl)
          xll = xl + temp + temp;
      }
      var option = {
        xmdf: xll,
        omgadf: omgasm,
        xnode: xnodes,
        emm: _em,
        xincc: xinc,
        xnn: xn,
        tsince: t
      };
      return option;
    }

    function DeepPeriodics(e, xincc, omgadf, xnode, xmam) {
      _em = e;
      xinc = xincc;
      omgasm = omgadf;
      xnodes = xnode;
      xll = xmam;

      // Lunar-solar periodics 
      var sinis = Math.sin(xinc);
      var cosis = Math.cos(xinc);

      var sghs = 0.0;
      var shs = 0.0;
      var sh1 = 0.0;
      var pe = 0.0;
      var pinc = 0.0;
      var pl = 0.0;
      var sghl = 0.0;

      if (Math.abs(dp_savtsn - t) >= 30.0) {
        dp_savtsn = t;

        var zm = dp_zmos + zns * t;
        var zf = zm + 2.0 * zes * Math.sin(zm);
        var sinzf = Math.sin(zf);
        var f2 = 0.5 * sinzf * sinzf - 0.25;
        var f3 = -0.5 * sinzf * Math.cos(zf);
        var ses = dp_se2 * f2 + dp_se3 * f3;
        var sis = dp_si2 * f2 + dp_si3 * f3;
        var sls = dp_sl2 * f2 + dp_sl3 * f3 + dp_sl4 * sinzf;

        sghs = dp_sgh2 * f2 + dp_sgh3 * f3 + dp_sgh4 * sinzf;
        shs = dp_sh2 * f2 + dp_sh3 * f3;
        zm = dp_zmol + znl * t;
        zf = zm + 2.0 * zel * Math.sin(zm);
        sinzf = Math.sin(zf);
        f2 = 0.5 * sinzf * sinzf - 0.25;
        f3 = -0.5 * sinzf * Math.cos(zf);

        var sel = dp_ee2 * f2 + dp_e3 * f3;
        var sil = dp_xi2 * f2 + dp_xi3 * f3;
        var sll = dp_xl2 * f2 + dp_xl3 * f3 + dp_xl4 * sinzf;

        sghl = dp_xgh2 * f2 + dp_xgh3 * f3 + dp_xgh4 * sinzf;
        sh1 = dp_xh2 * f2 + dp_xh3 * f3;
        pe = ses + sel;
        pinc = sis + sil;
        pl = sls + sll;
      }

      var pgh = sghs + sghl;
      var ph = shs + sh1;
      xinc = xinc + pinc;
      _em = _em + pe;

      if (dp_xqncl >= 0.2) {
        // Apply periodics directly 
        ph = ph / siniq;
        pgh = pgh - cosiq * ph;
        omgasm = omgasm + pgh;
        xnodes = xnodes + ph;
        xll = xll + pl;
      }
      else {
        // Apply periodics with Lyddane modification 
        var sinok = Math.sin(xnodes);
        var cosok = Math.cos(xnodes);
        var alfdp = sinis * sinok;
        var betdp = sinis * cosok;
        var dalf = ph * cosok + pinc * cosis * sinok;
        var dbet = -ph * sinok + pinc * cosis * cosok;

        alfdp = alfdp + dalf;
        betdp = betdp + dbet;

        var xls = xll + omgasm + cosis * xnodes;
        var dls = pl + pgh - pinc * xnodes * sinis;

        xls = xls + dls;
        xnodes = AcTan(alfdp, betdp);
        xll = xll + pl;
        omgasm = xls - xll - Math.cos(xinc) * xnodes;
      }
      var opt = {
        e: _em,
        xincc: xinc,
        omgadf: omgasm,
        xnode: xnodes,
        xmam: xll
      };
      return opt;
    }

    this.getPosition = function (tsince) {

      var opt = DeepInit(this, this.m_eosq, this.m_sinio, this.m_cosio, this.m_betao, this.m_aodp, this.m_theta2,
        this.m_sing, this.m_cosg, this.m_betao2, this.m_xmdot, this.m_omgdot, this.m_xnodot);


      this.m_eosq = opt.eosq;
      this.m_sinio = opt.sinio;
      this.m_cosio = opt.cosio;
      this.m_betao = opt.betao;
      this.m_aodp = opt.aodp;
      this.m_theta2 = opt.theta2;
      this.m_sing = opt.sing;
      this.m_cosg = opt.cosg;
      this.m_betao2 = opt.betao2;
      this.m_xmdot = opt.xmdot;
      this.m_omgdot = opt.omgdot;
      this.m_xnodot = opt.xnodott;


      // Update for secular gravity and atmospheric drag 
      var xmdf = this.m_Orbit.m_tle.getField(FLD_M, U_RAD) + this.m_xmdot * tsince;
      var omgadf = this.m_Orbit.m_tle.getField(FLD_ARGPER, U_RAD) + this.m_omgdot * tsince;
      var xnoddf = this.m_Orbit.m_tle.getField(FLD_RAAN, U_RAD) + this.m_xnodot * tsince;
      var tsq = tsince * tsince;
      var xnode = xnoddf + this.m_xnodcf * tsq;
      var tempa = 1.0 - this.m_c1 * tsince;
      var tempe = this.m_Orbit.m_tle.getField(FLD_BSTAR) / AE * this.m_c4 * tsince;
      var templ = this.m_t2cof * tsq;
      var xn = this.m_xnodp;
      var em;
      var xinc;

      var deep = DeepSecular(this, xmdf, omgadf, xnode, em, xinc, xn, tsince);
      xmdf = deep.xmdf;
      omgadf = deep.omgadf;
      xnode = deep.xnode;
      em = deep.emm;
      xinc = deep.xincc;
      xn = deep.xnn;
      tsince = deep.tsince;

      var a = Math.pow(XKE / xn, TWOTHRD) * (tempa * tempa);
      var e = em - tempe;
      var xmam = xmdf + this.m_xnodp * templ;

      var periodics = DeepPeriodics(e, xinc, omgadf, xnode, xmam);
      e = periodics.e;
      xinc = periodics.xincc,
        omgadf = periodics.omgadf,
        xnode = periodics.xnode,
        xmam = periodics.xmam;
      var xl = xmam + omgadf + xnode;

      xn = XKE / Math.pow(a, 1.5);

      return this.FinalPosition(xinc, omgadf, e, a, xl, xnode, xn, tsince);
    };

  }
  FeNoradSDP4.prototype = FeNoradBase.prototype;
  // (function () {
  //   var Super = function () { };
  //   Super.prototype = FeNoradBase.prototype;
  //   FeNoradSDP4.prototype = new Super();
  // })();


  function FeNoradSGP4(orbit) {

    FeNoradBase.call(this, orbit);

    this.m_Orbit = orbit;

    this.m_c5 = 2.0 * this.m_coef1 * this.m_aodp * this.m_betao2 *
      (1.0 + 2.75 * (this.m_etasq + this.m_eeta) + this.m_eeta * this.m_etasq);
    this.m_omgcof = this.m_Orbit.m_tle.getField(FLD_BSTAR) / AE * this.m_c3 * Math.cos(this.m_Orbit.m_tle.getField(FLD_ARGPER, U_RAD));
    this.m_xmcof = -TWOTHRD * this.m_coef * this.m_Orbit.m_tle.getField(FLD_BSTAR) / AE * AE / this.m_eeta;
    this.m_delmo = Math.pow(1.0 + this.m_eta * Math.cos(this.m_Orbit.m_tle.getField(FLD_M, U_RAD)), 3.0);
    this.m_sinmo = Math.sin(this.m_Orbit.m_tle.getField(FLD_M, U_RAD));

    this.getPosition = function (tsince) {
      // For m_perigee less than 220 kilometers, the isimp flag is set and
      // the equations are truncated to linear variation in sqrt a and
      // quadratic variation in mean anomaly.  Also, the m_c3 term, the
      // delta omega term, and the delta m term are dropped.
      var isimp = false;
      if ((this.m_aodp * (1.0 - this.m_satEcc) / AE) < (220.0 / XKMPER_WGS72 + AE)) {
        isimp = true;
      }

      var d2 = 0.0;
      var d3 = 0.0;
      var d4 = 0.0;

      var t3cof = 0.0;
      var t4cof = 0.0;
      var t5cof = 0.0;

      if (!isimp) {
        var c1sq = this.m_c1 * this.m_c1;

        d2 = 4.0 * this.m_aodp * this.m_tsi * c1sq;

        var temp = d2 * this.m_tsi * this.m_c1 / 3.0;

        d3 = (17.0 * this.m_aodp + this.m_s4) * temp;
        d4 = 0.5 * temp * this.m_aodp * this.m_tsi *
          (221.0 * this.m_aodp + 31.0 * this.m_s4) * this.m_c1;
        t3cof = d2 + 2.0 * c1sq;
        t4cof = 0.25 * (3.0 * d3 + this.m_c1 * (12.0 * d2 + 10.0 * c1sq));
        t5cof = 0.2 * (3.0 * d4 + 12.0 * this.m_c1 * d3 + 6.0 *
          d2 * d2 + 15.0 * c1sq * (2.0 * d2 + c1sq));
      }

      // Update for secular gravity and atmospheric drag. 
      var xmdf = this.m_Orbit.m_tle.getField(FLD_M, U_RAD) + this.m_xmdot * tsince;
      var omgadf = this.m_Orbit.m_tle.getField(FLD_ARGPER, U_RAD) + this.m_omgdot * tsince;
      var xnoddf = this.m_Orbit.m_tle.getField(FLD_RAAN, U_RAD) + this.m_xnodot * tsince;
      var omega = omgadf;
      var xmp = xmdf;
      var tsq = tsince * tsince;
      var xnode = xnoddf + this.m_xnodcf * tsq;
      var tempa = 1.0 - this.m_c1 * tsince;
      var tempe = this.m_Orbit.m_tle.getField(FLD_BSTAR) / AE * this.m_c4 * tsince;
      var templ = this.m_t2cof * tsq;

      if (!isimp) {
        var delomg = this.m_omgcof * tsince;
        var delm = this.m_xmcof * (Math.pow(1.0 + this.m_eta * Math.cos(xmdf), 3.0) - this.m_delmo);
        var temp = delomg + delm;

        xmp = xmdf + temp;
        omega = omgadf - temp;

        var tcube = (tsq * tsince).toPrecision(19);
        var tfour = (tsince * tcube).toPrecision(26);
        //console.info("****",tcube,tfour);
        tempa = tempa - d2 * tsq - d3 * tcube - d4 * tfour;
        tempe = tempe + this.m_Orbit.m_tle.getField(FLD_BSTAR) / AE * this.m_c5 * (Math.sin(xmp) - this.m_sinmo);
        templ = templ + t3cof * tcube + tfour * (t4cof + tsince * t5cof);
      }

      var a = this.m_aodp * (tempa * tempa);
      var e = this.m_satEcc - tempe;


      var xl = xmp + omega + xnode + this.m_xnodp * templ;
      var xn = XKE / Math.pow(a, 1.5);

      return this.FinalPosition(this.m_satInc, omgadf, e, a, xl, xnode, xn, tsince);
    };
  }
  FeNoradSGP4.prototype = FeNoradBase.prototype;
  // (function () {
  //   var Super = function () { };
  //   Super.prototype = FeNoradBase.prototype;
  //   FeNoradSGP4.prototype = new Super();
  // })();

  var satelliteService = undefined;

  function updateSateliteRealPosition(parameters, transferableObjects) {
    var satelineInfo = parameters;
    if (satelineInfo === undefined) {
      return;
    }
    if (satelliteService === undefined) {
      satelliteService = new FeSatelliteService();
    }

    var speed = satelineInfo.speed;
    var realTime = satelineInfo.realTime;
    var satelineInfoArr = satelineInfo.satelineInfoArr;
    var length = satelineInfoArr.length;
    var processSatelineCnt = 0;
    for (var i = 0; i < length; ++i) {
      var item = satelineInfoArr[i];
      var name = item.name;
      var line1 = item.line1;
      var line2 = item.line2;
      //计算卫星实时位置
      var geoPosition = satelliteService.request_real_time_orbit(name, line1, line2, realTime, 0.0);

      //by start HGT:异常卫星数据   刘雨  20181129
      if (geoPosition == undefined) {
        item.geoPosition = undefined;
        item.satelinePosArr = undefined;
        item.historyOrbitLength = 0;
        processSatelineCnt++;
        continue;
      }
      //end

      item.geoPosition = geoPosition;
      //卫星轨道数据
      var posArr = satelliteService.fillSatellitePoints(name, line1, line2, realTime);
      item.historyOrbitLength = posArr.historyPositionArr.length / 3;
      var positions = posArr.historyPositionArr.slice(0);
      positions = positions.concat(posArr.futurePositionArr);
      item.satelinePosArr = positions;

      //姿态角
      item.rotate = [0.0, 0.0, 0.0];

      processSatelineCnt++;
    }

    if (processSatelineCnt === length) {
      return satelineInfo;
    }
  }
  var updateSateliteRealPosition$1 = createTaskProcessorWorker(updateSateliteRealPosition);

  return updateSateliteRealPosition$1;

});
//# sourceMappingURL=updateSateliteRealPosition.js.map
