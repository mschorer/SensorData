/*
*
*
*
*/

#include "SensorData.h"

SensorData::SensorData( uint8_t size) {
    buffer = (uint8_t*)malloc( size);
    eod = 0;
}

SensorData::~SensorData() {
    free( buffer);
}

LoraSensor *SensorData::addSensor( uint8_t tid, uint8_t size) {
    LoraSensor *sensor = (LoraSensor *) (buffer + eod);

    //Serial.printf( "add %i %i\n", pid, size);

    sensor->type_id = tid;
    sensor->meta = STS_NULL;
    eod += size;

    //Serial.printf( "  @%i + %i\n", buffer , eod);

    return sensor;
}

void SensorData::printBuffer() {
    uint8_t i;

    for( i=0; i < eod; i++) {
        Serial.printf( "%02x", buffer[i]);
        if ( i%4 == 3) Serial.println();
        else Serial.print( " ");
    }
    if ( i%4 != 3) Serial.println();
}