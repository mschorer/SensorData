/**
 * Decode helper functions
 * 
 */

const PID_EOL      = 0x00;
const PID_ID       = 0x01;
const PID_NODE     = 0x02;

const PID_DS18B20  = 0x10;
const PID_BME280   = 0x11;
const PID_TOF      = 0x12;

const PID_GPS      = 0x20;



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

function getNode( it) {
    var data = {
        vbat: uint16( it) / 100,
        cputemp: int16( it) / 10
    };
    //it.index += 4;

    return data;
}

function getBME( it) {
    var data = {
        temp: int16( it) / 10.0,
        humidity: uint16( it) / 10.0,
        pressure: uint16( it) / 10.0
    };
    //it.index += 6;

    return data;
}

function getOnewire( it) {
    var data = {
        temp: int16(it) * 0.0625
    };
    //it.index += 2;

    return data;
}

function getTOF( it) {
    var data = {
        dist: int16(it)
    };
    //it.index += 2;

    return data;
}

function getGps( it) {
    var data = {
        sats: uint8(it),
        flags: uint8(it),

        date: uint32( it),
        time: uint32( it),

        latitude: bytes2float32( it),
        longitude: bytes2float32( it),
        altitude: bytes2float32( it),

        speed: bytes2float32( it),
        course: bytes2float32( it),
        hdop: bytes2float32( it)
    };
    //it.index += 34;

    return data;
}

function getSensors( it) {
    var rc = {
        data: {}
    };

    while( it.index < it.buffer.length) {
        ptype =  uint8( it);
        status =  uint8( it)
        //it.index += 2;

        switch( ptype) {
            case PID_EOL:
            break;
            case PID_ID:
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
    // bytes: [225, 230, 255, 0]
  };
}
