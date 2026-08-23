// ============================================================
// MotoSense AI - Rear Proximity + SOS System
// Arduino UNO + HC-SR04 + LEDs + Buzzer
// ============================================================

#include <Arduino.h>

// ---------------- PINS ----------------

const int trigPin = 2;
const int echoPin = 3;

// Green LEDs
const int greenLED1 = 4;
const int greenLED2 = 5;

// Yellow LEDs
const int yellowLED1 = 6;
const int yellowLED2 = 7;

// Red LEDs
const int redLED1 = 8;
const int redLED2 = 9;

// Buzzer
const int buzzerPin = 10;


// ---------------- SOS VARIABLES ----------------

bool stage3Active = false;

unsigned long stage3StartTime = 0;

bool sosPendingSent = false;
bool sosActiveSent = false;


// ---------------- SETUP ----------------

void setup() {

  Serial.begin(115200);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  pinMode(greenLED1, OUTPUT);
  pinMode(greenLED2, OUTPUT);

  pinMode(yellowLED1, OUTPUT);
  pinMode(yellowLED2, OUTPUT);

  pinMode(redLED1, OUTPUT);
  pinMode(redLED2, OUTPUT);

  pinMode(buzzerPin, OUTPUT);

  digitalWrite(greenLED1, LOW);
  digitalWrite(greenLED2, LOW);

  digitalWrite(yellowLED1, LOW);
  digitalWrite(yellowLED2, LOW);

  digitalWrite(redLED1, LOW);
  digitalWrite(redLED2, LOW);

  digitalWrite(buzzerPin, LOW);
}


// ---------------- LOOP ----------------

void loop() {

  // ==========================================================
  // CHECK FOR CANCEL COMMAND
  // ==========================================================

  if (Serial.available() > 0) {

    char command = Serial.read();

    if (command == 'C') {

      stage3Active = false;

      sosPendingSent = false;
      sosActiveSent = false;

      digitalWrite(redLED2, LOW);
      digitalWrite(buzzerPin, LOW);

      Serial.println("SOS_CANCELLED");
    }
  }


  // ==========================================================
  // ULTRASONIC MEASUREMENT
  // ==========================================================

  digitalWrite(trigPin, LOW);

  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);

  delayMicroseconds(10);

  digitalWrite(trigPin, LOW);


  long duration = pulseIn(
    echoPin,
    HIGH,
    30000
  );


  // ==========================================================
  // SENSOR ERROR
  // ==========================================================

  if (duration == 0) {

    Serial.println("SENSOR_ERROR");

    digitalWrite(greenLED1, LOW);
    digitalWrite(greenLED2, LOW);

    digitalWrite(yellowLED1, LOW);
    digitalWrite(yellowLED2, LOW);

    digitalWrite(redLED1, LOW);
    digitalWrite(redLED2, LOW);

    digitalWrite(buzzerPin, LOW);

    delay(100);

    return;
  }


  // ==========================================================
  // CALCULATE DISTANCE
  // ==========================================================

  int distance =
    duration * 0.034 / 2;


  // ==========================================================
  // DISTANCE > 30 CM
  // ==========================================================

  if (distance > 30) {

    digitalWrite(greenLED1, LOW);
    digitalWrite(greenLED2, LOW);

    digitalWrite(yellowLED1, LOW);
    digitalWrite(yellowLED2, LOW);

    digitalWrite(redLED1, LOW);
    digitalWrite(redLED2, LOW);

    digitalWrite(buzzerPin, LOW);

    stage3Active = false;

    sosPendingSent = false;
    sosActiveSent = false;
  }


  // ==========================================================
  // DISTANCE 30 CM → 5 CM
  // ==========================================================

  else if (
    distance <= 30 &&
    distance >= 5
  ) {

    // ---------------- GREEN ----------------

    if (distance <= 30) {

      digitalWrite(
        greenLED1,
        HIGH
      );
    }

    if (distance <= 25) {

      digitalWrite(
        greenLED2,
        HIGH
      );
    }


    // ---------------- YELLOW ----------------

    if (distance <= 20) {

      digitalWrite(
        yellowLED1,
        HIGH
      );
    }

    if (distance <= 15) {

      digitalWrite(
        yellowLED2,
        HIGH
      );
    }


    // ---------------- RED ----------------

    if (distance <= 10) {

      digitalWrite(
        redLED1,
        HIGH
      );
    }

    if (distance <= 5) {

      digitalWrite(
        redLED2,
        HIGH
      );
    }


    // ---------------- BUZZER OFF ----------------

    digitalWrite(
      buzzerPin,
      LOW
    );


    // ---------------- RESET SOS ----------------

    stage3Active = false;

    sosPendingSent = false;
    sosActiveSent = false;
  }


  // ==========================================================
  // DISTANCE < 5 CM
  // ==========================================================

  else {

    // ---------------- BOTH RED LEDs ----------------

    digitalWrite(
      redLED1,
      HIGH
    );

    digitalWrite(
      redLED2,
      HIGH
    );


    // ---------------- BUZZER ----------------

    digitalWrite(
      buzzerPin,
      HIGH
    );


    // ========================================================
    // START STAGE 3
    // ========================================================

    if (!stage3Active) {

      stage3Active = true;

      stage3StartTime =
        millis();

      sosPendingSent = false;

      sosActiveSent = false;
    }


    // ========================================================
    // CHECK SOS TIMER
    // ========================================================

    unsigned long elapsed =
      millis() - stage3StartTime;


    // ---------------- 5 SECONDS ----------------

    if (
      elapsed >= 5000 &&
      !sosPendingSent
    ) {

      Serial.println(
        "SOS_PENDING"
      );

      sosPendingSent = true;
    }


    // ---------------- 10 SECONDS ----------------

    if (
      elapsed >= 10000 &&
      !sosActiveSent
    ) {

      Serial.println(
        "SOS_ACTIVE"
      );

      sosActiveSent = true;
    }
  }


  // ==========================================================
  // SEND DISTANCE
  // ==========================================================

  Serial.print(
    "Distance: "
  );

  Serial.println(
    distance
  );


  delay(100);
}