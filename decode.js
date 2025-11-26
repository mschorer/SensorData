/**
 * Decode helper functions
 * 
 */

const PID_STATUS   = 0x00;
const PID_ID       = 0x01;
const PID_NODE     = 0x02;

const PID_DS18B20  = 0x10;
const PID_BME280   = 0x11;
const PID_TOF      = 0x12;

const PID_GPS      = 0x20;

const PID_FILL     = 0xC0


function uint8( it) {
    var utemp = (it.buffer[ it.index] & 0xFF);
    it.index += 1;

    return utemp;
}
function int16( it) {
    var itemp = (((it.buffer[ it.index+1] & 0xFF) << 8) | (it.buffer[ it.index+0] & 0xFF));
    if ( it.buffer[ it.index+1] & 0x80) {
        itemp = 0xFFFF0000 | itemp;  // fill in most significant bits with 1's
    }
    it.index += 2;

    return itemp;
}
function uint16( it) {
    var utemp = (((it.buffer[ it.index+1] & 0xFF) << 8) | (it.buffer[ it.index+0] & 0xFF));
    it.index += 2;

    return utemp;
}

function uint32( it) {
    var utemp = ((( it.buffer[ it.index+3] & 0xFF) << 24) | ((it.buffer[ it.index+2] & 0xFF) << 16) | ((it.buffer[ it.index+1] & 0xFF) << 8) | (it.buffer[ it.index+0] & 0xFF));
    it.index += 4;

    return utemp;
}
function bytes2float32( it) {
    bytes = it.buffer[ it.index+3] << 24 | it.buffer[ it.index+2] << 16 | it.buffer[ it.index+1] << 8 | it.buffer[ it.index+0];

    var sign = (bytes & 0x80000000) ? -1 : 1;
    var exponent = ((bytes >> 23) & 0xFF) - 127;
    var significand = (bytes & ~(-1 << 23));

    if (exponent == 128) 
        return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);

    if (exponent == -127) {
        if (significand == 0) return sign * 0.0;
        exponent = -126;
        significand /= (1 << 22);
    } else significand = (significand | (1 << 23)) / (1 << 23);

    it.index += 4;

  return sign * significand * Math.pow(2, exponent);
}

function getSensor( it) {
  var data = {
		meta: uint8(it)
    };

    return data;
}

function getId( it) {
  var data = getSensor( it);
  var i=0;
  var id = "";

  for( i=0; i < 32; i++) {
    id += chr( uint8( it));
  }
    data.id = id;

    return data;
}

function getNode( it) {
  var data = getSensor( it);

    data.vbat = uint16( it) / 100;
    data.cputemp = int16( it) / 10;

    return data;
}

function getBME( it) {
  var data = getSensor( it);

    data.temp = int16( it) / 10.0;
    data.humidity = uint16( it) / 10.0;
    data.pressure = uint16( it) / 10.0;

    return data;
}

function getOnewire( it) {
  var data = getSensor( it);

    data.temp = int16(it) * 0.0625;

    return data;
}

function getTOF( it) {
  var data = getSensor( it);

    data.dist = int16(it);

    return data;
}

function getFill( it) {
  var data = getSensor( it);

    data.percent = uint16(it);

    return data;
}

function getGps( it) {
  var data = getSensor( it);

    data.sats = uint8(it);
    data.flags = uint8(it);

    data.date = uint32( it);
    data.time = uint32( it);

    data.latitude = bytes2float32( it);
    data.longitude = bytes2float32( it);
    data.altitude = bytes2float32( it);

    data.speed = bytes2float32( it);
    data.course = bytes2float32( it);
    data.hdop = bytes2float32( it);

    return data;
}

function getSensors( it) {
    var rc = {
        data: {}
    };

    while( it.index < it.buffer.length) {
        ptype =  uint8( it);

        switch( ptype) {
            case PID_STATUS:
                rc.data.status = getSensor( it);
            break;

            case PID_ID:
                rc.data.id = getId( it);
            break;
            case PID_NODE:
                rc.data.node = getNode( it);
            break;

            case PID_DS18B20:
                rc.data.onewire = getOnewire( it);
            break;
            case PID_BME280:
                rc.data.bme = getBME( it);
            break;
            case PID_TOF:
                rc.data.tof = getTOF( it);
            break;

            case PID_GPS:
                rc.data.gps = getGps( it);
            break;

            case PID_FILL:
                rc.data.level = getFill( it);
            break;

            default:
        }
    }

    return rc;
}

/**
 * Decode uplink function
 * 
 * @param {object} input
 * @param {number[]} input.bytes Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
 * @param {number} input.fPort Uplink fPort.
 * @param {Record<string, string>} input.variables Object containing the configured device variables.
 * 
 * @returns {{data: object}} Object representing the decoded payload.
 */
function decodeUplink(input) {

    var iterator = {
        buffer: input.bytes,
        index: 0
    };

    return getSensors( iterator);
}

/**
 * Encode downlink function.
 * 
 * @param {object} input
 * @param {object} input.data Object representing the payload that must be encoded.
 * @param {Record<string, string>} input.variables Object containing the configured device variables.
 * 
 * @returns {{bytes: number[]}} Byte array containing the downlink payload.
 */
function encodeDownlink(input) {
  

  return {
    bytes: [ 0x02, 0x00, 0x00, 0x01, 0x02, 0x03 ]
  };
}
