/*
  ============================================================
              MOTOSENSE AI - REAR SAFETY SYSTEM
  ============================================================

  Arduino UNO
  HC-SR04
  2 Green LEDs
  2 Yellow LEDs
  2 Red LEDs
  1 Buzzer

  CONNECTIONS
  ------------------------------------------------------------

  HC-SR04
    TRIG -> D2
    ECHO -> D3
    VCC  -> 5V
    GND  -> GND

  LEDs
    Green 1  -> D4
    Green 2  -> D5
    Yellow 1 -> D6
    Yellow 2 -> D7
    Red 1    -> D8
    Red 2    -> D9

  Buzzer
    + -> D10
    - -> GND

  WINDOWS ARDUINO IDE
    Board: Arduino Uno
    Port : COM10

  SERIAL
    115200 baud

  DISTANCE LOGIC
  ------------------------------------------------------------

    > 30 cm
      -> No LEDs

    30 cm -> 5 cm
      -> Progressive LED indication
      -> Green -> Yellow -> Red

    <= 5 cm
      -> Red 1 + Red 2
      -> Buzzer ON
      -> SOS timer starts

    5 seconds
      -> SOS_PENDING

    10 seconds
      -> SOS_ACTIVE

  ============================================================
*/


// ============================================================
// HC-SR04
// ============================================================

const int trigPin = 2;
const int echoPin = 3;


// ============================================================
// LEDs
// ============================================================

// Green
const int greenLED1 = 4;
const int greenLED2 = 5;

// Yellow
const int yellowLED1 = 6;
const int yellowLED2 = 7;

// Red
const int redLED1 = 8;
const int redLED2 = 9;


// ============================================================
// BUZZER
// ============================================================

const int buzzerPin = 10;


// ============================================================
// SOS STATE VARIABLES
// ============================================================

bool stage3Active = false;

bool sosPendingSent = false;

bool sosActiveSent = false;

unsigned long stage3StartTime = 0;


// ============================================================
// SOS TIMINGS
// ============================================================

const unsigned long SOS_PENDING_TIME = 5000UL;

const unsigned long SOS_ACTIVE_TIME = 10000UL;


// ============================================================
// RESET SOS
// ============================================================

void resetSOS()
{
  stage3Active = false;

  sosPendingSent = false;

  sosActiveSent = false;

  stage3StartTime = 0;

  digitalWrite(buzzerPin, LOW);

  digitalWrite(redLED2, LOW);
}


// ============================================================
// TURN OFF ALL LEDs
// ============================================================

void turnOffAllLEDs()
{
  digitalWrite(greenLED1, LOW);
  digitalWrite(greenLED2, LOW);

  digitalWrite(yellowLED1, LOW);
  digitalWrite(yellowLED2, LOW);

  digitalWrite(redLED1, LOW);
  digitalWrite(redLED2, LOW);
}


// ============================================================
// SETUP
// ============================================================

void setup()
{
  // HC-SR04
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);


  // Green LEDs
  pinMode(greenLED1, OUTPUT);
  pinMode(greenLED2, OUTPUT);


  // Yellow LEDs
  pinMode(yellowLED1, OUTPUT);
  pinMode(yellowLED2, OUTPUT);


  // Red LEDs
  pinMode(redLED1, OUTPUT);
  pinMode(redLED2, OUTPUT);


  // Buzzer
  pinMode(buzzerPin, OUTPUT);


  // Initial state
  turnOffAllLEDs();

  digitalWrite(buzzerPin, LOW);


  // Serial communication
  Serial.begin(115200);
}


// ============================================================
// MAIN LOOP
// ============================================================

void loop()
{
  // ==========================================================
  // CHECK FOR COMMAND FROM APP / RASPBERRY PI
  // ==========================================================

  if (Serial.available() > 0)
  {
    char incoming = Serial.read();

    if (incoming == 'C')
    {
      Serial.println("SOS_CANCELLED");

      resetSOS();
    }
  }


  // ==========================================================
  // ULTRASONIC MEASUREMENT
  // ==========================================================

  long duration;

  int distance;


  // Send trigger pulse

  digitalWrite(trigPin, LOW);

  delayMicroseconds(2);


  digitalWrite(trigPin, HIGH);

  delayMicroseconds(10);


  digitalWrite(trigPin, LOW);


  // Read echo

  duration = pulseIn(
    echoPin,
    HIGH,
    30000
  );


  // ==========================================================
  // NO ECHO
  // ==========================================================

  if (duration == 0)
  {
    Serial.println("SENSOR_ERROR");

    turnOffAllLEDs();

    digitalWrite(buzzerPin, LOW);

    delay(100);

    return;
  }


  // ==========================================================
  // CALCULATE DISTANCE
  // ==========================================================

  distance = duration * 0.034 / 2;


  // ==========================================================
  // SEND DISTANCE
  // ==========================================================

  Serial.print("Distance: ");

  Serial.println(distance);


  // ==========================================================
  // TURN OFF ALL LEDs FIRST
  // ==========================================================

  turnOffAllLEDs();


  // ==========================================================
  // NORMAL RANGE
  //
  // 30 cm = 0 LEDs
  // 5 cm  = 6 LEDs
  // ==========================================================

  if (
    distance <= 30 &&
    distance >= 5
  )
  {
    int level = map(
      distance,
      30,
      5,
      0,
      6
    );


    // Safety limits

    if (level > 6)
    {
      level = 6;
    }

    if (level < 0)
    {
      level = 0;
    }


    // ========================================================
    // GREEN LEDs
    // ========================================================

    if (level >= 1)
    {
      digitalWrite(
        greenLED1,
        HIGH
      );
    }


    if (level >= 2)
    {
      digitalWrite(
        greenLED2,
        HIGH
      );
    }


    // ========================================================
    // YELLOW LEDs
    // ========================================================

    if (level >= 3)
    {
      digitalWrite(
        yellowLED1,
        HIGH
      );
    }


    if (level >= 4)
    {
      digitalWrite(
        yellowLED2,
        HIGH
      );
    }


    // ========================================================
    // RED LEDs
    // ========================================================

    if (level >= 5)
    {
      digitalWrite(
        redLED1,
        HIGH
      );
    }


    if (level >= 6)
    {
      digitalWrite(
        redLED2,
        HIGH
      );
    }


    // Buzzer OFF during normal range

    digitalWrite(
      buzzerPin,
      LOW
    );


    // Make sure SOS is reset

    resetSOS();
  }


  // ==========================================================
  // STAGE 3
  //
  // VERY CLOSE OBJECT
  // <= 5 cm
  // ==========================================================

  else if (distance < 5)
  {
    // --------------------------------------------------------
    // First time entering Stage 3
    // --------------------------------------------------------

    if (!stage3Active)
    {
      stage3Active = true;

      stage3StartTime = millis();
    }


    // --------------------------------------------------------
    // Calculate elapsed time
    // --------------------------------------------------------

    unsigned long elapsed =
      millis() - stage3StartTime;


    // --------------------------------------------------------
    // BOTH RED LEDs
    // --------------------------------------------------------

    digitalWrite(
      redLED1,
      HIGH
    );

    digitalWrite(
      redLED2,
      HIGH
    );


    // --------------------------------------------------------
    // BUZZER
    // --------------------------------------------------------

    digitalWrite(
      buzzerPin,
      HIGH
    );


    // --------------------------------------------------------
    // 5 SECOND SOS PENDING
    // --------------------------------------------------------

    if (
      elapsed >= SOS_PENDING_TIME &&
      !sosPendingSent
    )
    {
      Serial.println(
        "SOS_PENDING"
      );

      sosPendingSent = true;
    }


    // --------------------------------------------------------
    // 10 SECOND SOS ACTIVE
    // --------------------------------------------------------

    if (
      elapsed >= SOS_ACTIVE_TIME &&
      !sosActiveSent
    )
    {
      Serial.println(
        "SOS_ACTIVE"
      );

      sosActiveSent = true;
    }
  }


  // ==========================================================
  // DISTANCE GREATER THAN 30 CM
  //
  // ALL LEDs OFF
  // ==========================================================

  else
  {
    turnOffAllLEDs();

    digitalWrite(
      buzzerPin,
      LOW
    );

    resetSOS();
  }


  // ==========================================================
  // LOOP DELAY
  // ==========================================================

  delay(100);
}