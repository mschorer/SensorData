#pragma once

/*
*   Lora Sensor Encoding and packaging
*
*
*/

#include <Arduino.h>

#define STS_VMASK   0x80
#define STS_VALID   0x80
#define STS_INVAL   0x00

#define STS_MMASK   0x60
#define STS_EMERG   0x60
#define STS_ALERT   0x40
#define STS_RELAX   0x20
#define STS_DCARE   0x00

#define STS_MSHIFT(B)  (( B & STS_MMASK) >> 5)

#define STS_UDDMASK 0x1f
#define STS_NULL    0x00

struct LoraSensor {
    uint8_t type_id;
    uint8_t meta;
};

struct LoraID : LoraSensor {
    int16_t id[32];
};

struct LoraNode : LoraSensor {
    uint16_t vbat;
    int16_t cputemp;
};

struct LoraGps : LoraSensor {
    uint8_t sats;
    uint8_t flags;

    uint32_t date;
    uint32_t time;

    float lat;
    float lon;
    float alt;

    float speed;
    float course;

    float hdop;
};

// bme_280
struct LoraBME280 : LoraSensor {
    int16_t temp;
    uint16_t hmd;
    uint16_t prs;
};

// DS18B20
struct LoraDS18B20 : LoraSensor {
    int16_t temp[1];
};

// Time-of-Flight sensor: VL53L0X or VL53L1X
struct LoraToF : LoraSensor {
    int16_t dist;
};

// Calculated types
struct LoraFill : LoraSensor {
    uint16_t percent;
};

class SensorData {
    public:

        enum SensorType:uint8_t {
            EOL      = 0x00,
            ID       = 0x01,
            NODE     = 0x02,

            DS18B20  = 0x10,
            BME280   = 0x11,
            TOF      = 0x12,

            GPS      = 0x20,

            // calculated values
            FILL     = 0xC0,
        };

        SensorData( uint8_t size);
        ~SensorData();

        LoraSensor *addSensor( uint8_t tid, uint8_t size);

        void printBuffer();

        uint8_t eod;
        uint8_t *buffer;
};

//--  