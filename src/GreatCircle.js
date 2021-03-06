/**
 * Created by mabouali on 5/19/2017.
 */

// checking if Math.sign exist; if not creating one.
Math.sign = Math.sign || function(x) {
        if (typeof(x) !== "number") {
            throw new TypeError("GreatCircle: Math.sign accepts only numbers.");
        }
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    };

/**
 * This is the constructor to Great Circle Module. This constructor provides routines to calculate points
 * along great circle.
 * @param {number} [EarthRadius=6378137.0] Determines EarthRadius. Despite called EarthRadius, this can be
 * used to simulate any size sphere. The default Earth Radius is based on the WGS84.
 * @param {string} [unit=meter] The unit of the EarthRadius. All distances if not provided in Radians are
 * considered to be the same unit as that of the EarthRadius. Note that there is no check on whether the
 * EarthRadius and the provided unit are actually matching.
 * @param {number} [inverseFlattening=298.257223563] This is inverse flattening (1/f) as defined for ellipsoids.
 * It defines the deviation of the Earth shape from a perfect sphere. The default value is based on WGS84. Some
 * function use this value.
 * @author Mohammad Abouali <maboualidev@gmail.com>
 * @version 0.0.2
 * @class GreatCircle
 * @constructor
 */
function GreatCircle(EarthRadius, unit, inverseFlattening) {
    if (typeof(EarthRadius)==="number" &&
        !isNaN(EarthRadius) &&
        EarthRadius > 0 )
        this._EarthRadius = EarthRadius;
    if (typeof(unit)==="string")
        this._unit = unit;
    if (typeof(inverseFlattening)==='number' &&
        !isNaN(inverseFlattening) &&
        inverseFlattening>=1) {
        this._inverseFlattening = inverseFlattening;
    }

    Object.defineProperty(this,'EarthRadius',{
        get: function() {return this._EarthRadius;},
        set: function(newEarthRadius) {
            if (typeof(newEarthRadius)!=="number" ||
                isNaN(newEarthRadius) ||
                newEarthRadius<=0)
                throw new TypeError('GreatCircle: [EarthRadius set property] EarthRadius must be a non-NaN positive number');
            this._EarthRadius = newEarthRadius;
        }
    });
    Object.defineProperty(this,'unit',{
        get: function() {return this._unit;},
        set: function(newUnit) {
            if (typeof(newUnit)!=="string")
                throw new TypeError('GreatCircle: [unit set property] unit must be a string');
            this._unit = newUnit;}
    });

    Object.defineProperty(this,'inverseFlattening',{
        get: function() {return this._inverseFlattening;},
        set: function(newInverseFlattening) {
            if (typeof(newInverseFlattening)!=="number" ||
                isNaN(newInverseFlattening) ||
                newInverseFlattening<1)
                throw new TypeError('GreatCircle: [inverseFlattening set property] inverseFlattenning must be a number greater than or equal to 1.');
            this._inverseFlattening = newInverseFlattening;
        }
    });

    Object.defineProperty(this,'f',{
        get: function() {return (1.0/this._inverseFlattening);},
        set: function(newF) {
            if (typeof(newF)!=="number" ||
                isNaN(newF) ||
                newF<0 || newF>1)
                throw new TypeError('GreatCircle: [f set property] f must be a number between 0 and 1');
            this._inverseFlattening = 1.0/newF;
        }
    });
}

// Setting default values for the properties
GreatCircle.prototype._EarthRadius = 6378137.0;
GreatCircle.prototype._unit = 'meter';
GreatCircle.prototype._inverseFlattening = 298.257223563;

/**
 * deg2rad converts degree to radian.
 * @param {number} deg
 * @returns {number}
 * @memberof GreatCircle.prototype
 * @global
 * @since 0.0.0
 */
GreatCircle.prototype.deg2rad = function(deg) {
    if (typeof(deg)!=="number")
        throw new TypeError('GreatCircle: deg2rad: deg must be a number');
    return deg/180*Math.PI
};
/**
 * rad2deg converts radian to degree.
 * @param rad
 * @returns {number}
 * @memberof GreatCircle.prototype
 * @global
 * @since 0.0.0
 */
GreatCircle.prototype.rad2deg = function(rad) {
    if (typeof(rad)!=='number')
        throw new TypeError('GreatCircle: rad2deg: rad must be a number');
    return rad/Math.PI*180
};

/**
 * decimalDeg2DMS converts decimal degree to an object with separate component for degree/minute/second/reminder
 * @param {number} dDeg decimal degree
 * @returns {Object} an object {Degree, Minute, Seconds, reminder} holding degree/minute/second/reminder
 * @memberof GreatCircle.prototype
 * @global
 * @since 0.0.0
 */
GreatCircle.prototype.decimalDeg2DMS = function (dDeg) {
    if (typeof(dDeg)!=='number')
        throw new TypeError("GreatCircle: decimalDeg2DMS: dDeg must be a number.");
    var dDegSign = Math.sign(dDeg);
    var positiveDDeg=Math.abs(dDeg);
    var DMS={};
    DMS.Degree = Math.floor(positiveDDeg);
    DMS.Minute = Math.floor((positiveDDeg -DMS.Degree)*60);
    DMS.Seconds = Math.floor((positiveDDeg - DMS.Degree - DMS.Minute/60)*3600);
    DMS.reminder = positiveDDeg - DMS.Degree - DMS.Minute/60 - DMS.Seconds/3600;
    DMS.Degree = dDegSign * DMS.Degree;

    return DMS;
};

/**
 *  DMS2DecimalDeg converts a separately provided degree/minute/second/[reminder] to decimal degree.
 * @param {number} Deg
 * @param {number} Min
 * @param {number} Sec
 * @param {number} [reminder]
 * @returns {number} decimal degree
 * @memberof GreatCircle.prototype
 * @global
 * @since 0.0.0
 */
GreatCircle.prototype.DMS2DecimalDeg = function (Deg,Min,Sec, reminder) {
    if (typeof(Deg)!=='number' || Number.isNaN(Deg) ||
        typeof(Min)!=='number' || Number.isNaN(Min) ||
        typeof(Sec)!=='number' || Number.isNaN(Sec) ||
        !(typeof(reminder)==='number' || typeof(reminder)==='undefined'))
        throw new TypeError('GreatCircle: DMS2DecimalDeg: Only numeric non-NaN values are accepted.');
    var DegSign = Math.sign(Deg);
    var decimalDegPositive = DegSign*Deg + Min/60 + Sec/3600;
    if ((typeof reminder)!== 'undefined' && !Number.isNaN(reminder)) {
        decimalDegPositive += reminder;
    }
    return ( (Math.sign(Deg)>=0)?decimalDegPositive:-decimalDegPositive);
};

/**
 * distance calculates the distance along the great circle between two points. (note: Does not take into account the
 * flattening of the Earth).
 * @param {number} sLat The latitude of the starting point
 * @param {number} sLon The longitude of the starting point
 * @param {number} eLat The latitude of the ending point
 * @param {number} eLon The longitude of the ending point
 * @param {string} [formulaToUse=shortform] Determines which formula to use. Currently supported values are {shortform|greatcircle|haversine}
 * @param {boolean} [returnRadian=false] if set to true, the distance is provided in radians. Otherwise,
 * the distance would have the same unit as that of the value set for EarthRadius.
 * @param {boolean} [inputIsInDegree=true] If set to true, the code assumes that the input Lat/Lon are provided
 * in Decimal Degree. Otherwise, it assumes they are in radians.
 * @returns {number} Distance between the points.
 * @memberof GreatCircle.prototype
 * @global
 * @since 0.0.0
 */
GreatCircle.prototype.distance = function (sLat,sLon,eLat,eLon, formulaToUse, returnRadian,inputIsInDegree) {
    if (typeof(sLat)!=='number' ||
        typeof(sLon)!=='number' ||
        typeof(eLat)!=='number' ||
        typeof(eLon)!=='number' ||
        !(typeof(formulaToUse)==='string' || typeof(formulaToUse)==='undefined' || !isNaN(formulaToUse)) ||
        !(typeof(returnRadian)==='boolean' || typeof(returnRadian)==='undefined' || !isNaN(returnRadian)) ||
        !(typeof(inputIsInDegree)==='boolean' || typeof(inputIsInDegree)==='undefined' || !isNaN(inputIsInDegree)))
        throw new TypeError('GreatCircle: distance: input parameters do not have proper type.');
    // setting default values
    formulaToUse = formulaToUse || 'shortform';
    if (typeof(returnRadian)==="undefined")
        returnRadian = false;
    if (typeof(inputIsInDegree)==="undefined")
        inputIsInDegree = true;

    /*
     * Converting from Radian to Degree.
     * Assumes that the input [(s/e)(Lat/Lon)] is in Degree unless inputIsInDegree is set to false
     */
    if (inputIsInDegree) {
        sLat = this.deg2rad(sLat);
        sLon = this.deg2rad(sLon);
        eLat = this.deg2rad(eLat);
        eLon = this.deg2rad(eLon);
    }

    var distance;
    switch (formulaToUse.toLowerCase()) {
        case 'shortform':
            distance=2*Math.asin(Math.sqrt(Math.pow(Math.sin((sLat-eLat)/2),2) + Math.cos(sLat)*Math.cos(eLat)*Math.pow(Math.sin((sLon-eLon)/2),2)));
            break;
        case 'greatcircle':
            distance=Math.acos(Math.sin(sLat)*Math.sin(eLat)+Math.cos(sLat)*Math.cos(eLat)*Math.cos(sLon-eLon));
            break;
        case 'haversine':
            var deltaTheta = eLat-sLat;
            var deltaLambda = eLon - sLon;
            var a = Math.sin(deltaTheta/2)*Math.sin(deltaTheta/2)+Math.cos(sLat)*Math.cos(eLat)*Math.sin(deltaLambda/2)*Math.sin(deltaLambda/2);
            distance = 2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
            break;
        default:
            var ErrMSG = 'GreatCircle: Requested formula is not recognized';
            console.error(ErrMSG);
            throw new Error(ErrMSG);
    }

    return (returnRadian?distance:(distance*this._EarthRadius));
};

/**
 * geoDistance uses Inverse Vincenty Equation to calculate the distance on ellipsoid (takes into account the flattening
 * effect of the Earth)
 * @param {number} sLat The latitude of the starting point
 * @param {number} sLon The longitude of the starting point
 * @param {number} eLat The latitude of the ending point
 * @param {number} eLon The longitude of the ending point
 * @param {number} [eps=1e-12] Defines the tolerance of the iterative methods, the accuracy.
 * @param {number} [maxIterations=1000] Defines the maximum number of iteration that the program should perform before stopping.
 * @param {boolean} [isInDegree=true] If set to true, the code assumes that the input Lat/Lon are provided
 * in Decimal Degree. Otherwise, it assumes they are in radians.
 * @global
 * @returns {number}
 */
GreatCircle.prototype.geoDistance = function (sLat,sLon,eLat,eLon,eps,maxIterations,isInDegree) {
    // setting default values
    if (typeof(isInDegree)==="undefined")
        isInDegree = true;

    // Checking inputs
    if (typeof(sLat)!=='number' || isNaN(sLat) ||
        typeof(sLon)!=='number' || isNaN(sLon) ||
        typeof(eLat)!=='number' || isNaN(eLat) ||
        typeof(eLon)!=='number' || isNaN(eLon) ||
        !(typeof(eps)==='number' || typeof(eps)==="undefined" || !isNaN(eps)) ||
        !(typeof(maxIterations)==='number' || typeof(maxIterations)==="undefined" || !isNaN(maxIterations))) {
        var errMSG = 'Great Circle.geoDistance: input parameters do not have proper type.';
        console.error(errMSG);
        throw new TypeError(errMSG)
    }
    // setting default values
    eps = eps || 1e-12;
    maxIterations = maxIterations || 500;

    // converting to radian if needed.
    if (isInDegree) {
        sLat = this.deg2rad(sLat);
        sLon = this.deg2rad(sLon);
        eLat = this.deg2rad(eLat);
        eLon = this.deg2rad(eLon);
    }

    // Calculating inverse Vincenty equation
    var a = this.EarthRadius;
    var f = this.f;
    var b = (1-f)*a;
    var U1 = Math.atan((1-f)*Math.tan(sLat));
    var U2 = Math.atan((1-f)*Math.tan(eLat));
    var cosU1 = Math.cos(U1); var sinU1 = Math.sin(U1);
    var cosU2 = Math.cos(U2); var sinU2 = Math.sin(U2);
    var L = eLon - sLon;

    var Lambda = L;
    var GeoDistance = 0;
    var oldGeoDistance = 2*eps;
    var counter = 0;
    while ( (Math.abs(GeoDistance-oldGeoDistance)>eps) && (counter<maxIterations) ){
        oldGeoDistance = GeoDistance;
        //console.log('Before')
        //console.log({sinDelta,cosDelta,delta,sinAlpha,cos2Alpha,cosDeltam,C,Lambda,counter})

        var sinDelta = Math.sqrt( Math.pow(cosU2*Math.sin(Lambda),2) + Math.pow(cosU1*sinU2-sinU1*cosU2*Math.cos(Lambda),2));
        var cosDelta = sinU1*sinU2+cosU1*cosU2*Math.cos(Lambda);
        var delta = Math.atan2(sinDelta,cosDelta);
        var sinAlpha = (cosU1*cosU2*Math.sin(Lambda))/Math.sin(delta);
        var cos2Alpha = 1 - sinAlpha*sinAlpha;
        var cosDeltam = 0;
        var C = 0;
        if (cos2Alpha===0) {
            cosDeltam = -1.0;
            C=0.0;
        } else {
            cosDeltam = Math.cos(delta) - (2*sinU1*sinU2)/ cos2Alpha;
            C = f/16.0*cos2Alpha*(4.0+f*(4.0-3.0*cos2Alpha));
        }

        Lambda = L + (1-C)*f*sinAlpha*(delta+C*Math.sin(delta)*(cosDeltam+C*Math.cos(delta)*(-1.0+2.0*cosDeltam*cosDeltam)));
        counter++;

        //console.log('After')
        //console.log({sinDelta,cosDelta,delta,sinAlpha,cos2Alpha,cosDeltam,C,Lambda,counter})
        var u2 = cos2Alpha * (a*a-b*b)/(b*b);
        var k1 =  (Math.sqrt(1+u2)-1)/(Math.sqrt(1+u2)+1);
        var A = (1+0.25*(k1*k1))/(1-k1);
        var B = k1*(1-(3.0/8.0)*(k1*k1));
        var cos2Deltam = cosDeltam*cosDeltam;
        var deltaDelta = B * Math.sin(delta) * (cosDeltam+0.25*B*(Math.cos(delta)*(-1.0+2.0*cos2Deltam)-(B/6.0)*cosDeltam*(-3.0+4.0*Math.pow(Math.sin(delta),2))*(-3+4*cos2Deltam)));

        GeoDistance = b * A * (delta - deltaDelta);
        //console.log("Counter: " + counter + ", dGeoDistance: " + Math.abs(GeoDistance-oldGeoDistance)+', GeoDistance: ' + GeoDistance);
    }
    return GeoDistance;
};

/**
 * Calculates an intermediate point along the great circle between the starting and ending points.
 * @param {number} sLat The latitude of the starting point
 * @param {number} sLon The longitude of the starting point
 * @param {number} eLat The latitude of the ending point
 * @param {number} eLon The longitude of the ending point
 * @param {number} fraction a number between 0 and 1. for example f=0.5 results in an intermediate point halfway
 * between the starting and ending point.
 * @param {boolean} isInDegree If set to true, the code assumes that the input Lat/Lon are provided
 * in Decimal Degree. Otherwise, it assumes they are in radians. The output has the same unit as the input.
 * @returns {Object} An Object {lat,lon} containing the lat/lon of the intermediate point either in radian or
 * degree depending on the input and isInDegree.
 * @memberof GreatCircle.prototype
 * @global
 * @since 0.0.0
 */
GreatCircle.prototype.intermediatePoint = function (sLat,sLon,eLat,eLon,fraction,isInDegree) {
    // setting default values
    if (typeof(isInDegree)==="undefined")
        isInDegree = true;

    // Checking f \in [0,1]
    if (fraction<0 || fraction>1) {
        var ErrMSG = 'GreatCircle: f must be between zero and one.';
        console.error(ErrMSG);
        throw new Error(ErrMSG);
    }

    if (fraction===0)
        return ({lat: sLat, lon:sLon});
    else if (fraction===1)
        return ({lat: eLat, lon:eLon});
    else {
        /*
         * Converting from Degree to Radian.
         * Assumes that the input [(s/e)(Lat/Lon)] is in Degree unless isInDegree is set to false
         */
        if (isInDegree) {
            sLat = this.deg2rad(sLat);
            sLon = this.deg2rad(sLon);
            eLat = this.deg2rad(eLat);
            eLon = this.deg2rad(eLon);
        }
        var d = this.distance(sLat, sLon, eLat, eLon, 'haversine', true, false);
        console.log("d: " + d);
        var A = Math.sin((1 - fraction) * d) / Math.sin(d);
        var B = Math.sin(fraction * d) / Math.sin(d);
        var x = A * Math.cos(sLat) * Math.cos(sLon) + B * Math.cos(eLat) * Math.cos(eLon);
        var y = A * Math.cos(sLat) * Math.sin(sLon) + B * Math.cos(eLat) * Math.sin(eLon);
        var z = A * Math.sin(sLat) + B * Math.sin(eLat);
        return isInDegree ? {lat: this.rad2deg(Math.atan2(z,Math.sqrt(x*x+y*y))), lon: this.rad2deg(Math.atan2(y,x))} :
            {lat: Math.atan2(z,Math.sqrt(x*x+y*y)), lon: Math.atan2(y,x)} ;
    }
};

/**
 * generates an array of nPoints+2 point where the first and last elements are the starting and ending points,
 * and the rest are the nPoints point distributed with equal intervals between the starting and ending points.
 * @param {number} sLat The latitude of the starting point
 * @param {number} sLon The longitude of the starting point
 * @param {number} eLat The latitude of the ending point
 * @param {number} eLon The longitude of the ending point
 * @param {number} nPoints number of points to generate between the starting and ending point.
 * @param {boolean} isInDegree If set to true, the code assumes that the input Lat/Lon are provided
 * in Decimal Degree. Otherwise, it assumes they are in radians. The output has the same unit as the input.
 * @returns {Object[]} an array of objects of the form {lat,lon} the first element is the starting point, the
 * last element is the ending point and all the intermediate points are in the middle. For example if nPoints is
 * set to 1, the function returns an array with three object including the starting, middle, and ending points.
 * @memberof GreatCircle.prototype
 * @global
 * @since 0.0.0
 */
GreatCircle.prototype.intermediatePoints = function (sLat,sLon,eLat,eLon,nPoints,isInDegree) {
    nPoints = nPoints || 1;
    if (nPoints<1) {
        var ErrMSG='GreatCircle: nPoints must be greater than or equal to 1.';
        console.error(ErrMSG);
        throw new Error(ErrMSG);
    }
    var f;
    var points=[{lat: sLat, lon: sLon}];
    for (var idx=1; idx<=nPoints;idx++) {
        f = idx/(nPoints+1);
        points[idx]=this.intermediatePoint(sLat,sLon,eLat,eLon,f,isInDegree);
    }
    points[nPoints+1]={lat: eLat, lon: eLon};

    return points;
};

/**
 *
 * @param {number} sLat The latitude of the starting point
 * @param {number} sLon The longitude of the starting point
 * @param {number} eLat The latitude of the ending point
 * @param {number} eLon The longitude of the ending point
 * @param {number} [maxHeight] The maximum height that the project can reach. If not provided it would defaults
 * to half the distance between the starting and ending point.
 * @param {number} [nPoints] number of points in between the starting and end point to construct the projectile.
 * if not provided it defaults to 100 points or one point every 20km, which ever is bigger.
 * @param {string} [equationToUse=parabola] defines the equation that determines the height. Currently available
 * options are: (1) parabola, i.r. H = - maxHeight * (f-0.5)*(f+0.5), where f \in [0,1]; (2) constant, where
 * maxHeight is used as the height for all points.
 * @param {boolean} isInDegree If set to true, the code assumes that the input Lat/Lon are provided
 * in Decimal Degree. Otherwise, it assumes they are in radians. The output has the same unit as the input.
 * @returns {Object[]} an array of objects of the form {lat,lon,height} the unit of height depends on the unit
 * of maxHeight.
 * @memberof GreatCircle.prototype
 * @global
 * @since 0.0.0
 */
GreatCircle.prototype.getProjectileLine = function (sLat,sLon,eLat,eLon,maxHeight,nPoints,equationToUse, isInDegree) {
    if (typeof(isInDegree)==="undefined")
        isInDegree = true;

    var ErrMSG;

    // Setting default max Height to the half of the distance between the two points
    var totalDistance = this.distance(sLat,sLon,eLat,eLon,'shortform', false, isInDegree);
    maxHeight = maxHeight || (0.5*totalDistance);

    if (maxHeight<0) {
        ErrMSG = 'greatCircle: maxHeight must be positive.';
        console.error(ErrMSG);
        throw new Error(ErrMSG);
    }

    // Setting default nPoints to the maximum of 100 points in total or
    // a point on average about every 20000 meter (20km);
    // NOTE: if _EarthRadius is in any unit other than meter this would every 20000 of that unit.
    nPoints = nPoints || Math.max(100,Math.round(totalDistance/20000)-1);

    // setting default equation
    equationToUse = equationToUse || 'Parabola';

    // getting Lat, Lon of each intermediate points
    var points = this.intermediatePoints(sLat,sLon,eLat,eLon,nPoints,isInDegree);

    // Setting the height of each intermediate points
    switch (equationToUse.toLowerCase()) {
        case 'parabola':
            // Using H = -maxHeight*(d-0.5)*(d+0.5); where d \in [-0.5,0.5]
            points[0].height=0;
            for (var idx=1; idx<=nPoints; idx++) {
                var d = idx/(nPoints+1)-0.5;
                points[idx].height = -maxHeight*(d-0.5)*(d+0.5);
            }
            points[nPoints+1].height=0;

            break;
        case 'constant':
            for (idx=0;idx<points.length;idx++) {
                points[idx].height = maxHeight;
            }
            break;
        default:
            ErrMSG='greatCircle: Requested equation is not found.';
            console.error(ErrMSG);
            throw new Error(ErrMSG);
    }
    return points;
};