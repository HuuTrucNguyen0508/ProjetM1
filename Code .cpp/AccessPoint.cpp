#include <omnetpp.h>
#include <cstring>
#include <cmath>
#include <openssl/rsa.h>
#include <openssl/pem.h>
#include <openssl/err.h>

using namespace omnetpp;

class AccessPoint : public cSimpleModule {
  protected:
    virtual void initialize() override;
    virtual void handleMessage(cMessage *msg) override;
    virtual void processSensorMessage(cMessage *msg);
    virtual void calculateDevicePosition();
    virtual void sendPositionToDevice(double posX, double posY, const std::string& publicKey);
    virtual std::string encryptPosition(double posX, double posY, const std::string& publicKey);

  private:
    int receivedSensorMessages;
    std::map<int, std::pair<double, double>> sensorPositions;
    std::map<int, double> sensorDistances;
    std::string devicePublicKey;
};

Define_Module(AccessPoint);

void AccessPoint::initialize() {
    receivedSensorMessages = 0;
}

void AccessPoint::handleMessage(cMessage *msg) {
    processSensorMessage(msg);
    delete msg;
}

void AccessPoint::processSensorMessage(cMessage *msg) {
    int deviceId = msg->par("deviceId").intValue();
    double distance = msg->par("distance").doubleValue();
    double posX = msg->par("posX").doubleValue();
    double posY = msg->par("posY").doubleValue();
    std::string publicKey = msg->par("publicKey").stringValue();

    sensorPositions[deviceId] = std::make_pair(posX, posY);
    sensorDistances[deviceId] = distance;

    receivedSensorMessages++;

    if (receivedSensorMessages == 3) {
        calculateDevicePosition();
    }
}

void AccessPoint::calculateDevicePosition() {
    // Check if we have received messages from at least 3 sensors
    if (receivedSensorMessages < 3) {
        EV_WARN << "Insufficient sensor messages to perform trilateration." << endl;
        return;
    }

    // Perform trilateration to estimate device position
    double sumX = 0, sumY = 0;
    double sumWeights = 0;
    for (auto& entry : sensorPositions) {
        int deviceId = entry.first;
        double posX = entry.second.first;
        double posY = entry.second.second;
        double distance = sensorDistances[deviceId];

        // Calculate weight (inverse of distance) for weighted average
        double weight = 1 / distance;
        sumWeights += weight;

        sumX += posX * weight;
        sumY += posY * weight;
    }
    double devicePosX = sumX / sumWeights;
    double devicePosY = sumY / sumWeights;

    // Encrypt device position with one of the sensor's public key
    std::string encryptedPosition = encryptPosition(devicePosX, devicePosY, devicePublicKey);

    // Send encrypted position to device
    sendPositionToDevice(devicePosX, devicePosY, encryptedPosition);
}

std::string AccessPoint::encryptPosition(double posX, double posY, const std::string& publicKey) {
    // Convert position to string
    std::string positionStr = std::to_string(posX) + "-" + std::to_string(posY);

    // Convert public key string to RSA structure
    RSA *rsa = createRSA((unsigned char *)publicKey.c_str(), false);
    if (!rsa) {
        EV_ERROR << "Failed to create RSA key from public key string." << endl;
        return "";
    }

    // Encrypt the position
    unsigned char *encrypted = (unsigned char *)malloc(RSA_size(rsa));
    int encryptedLength = RSA_public_encrypt(positionStr.length(), (const unsigned char *)positionStr.c_str(), encrypted, rsa, RSA_PKCS1_PADDING);
    if (encryptedLength == -1) {
        EV_ERROR << "Failed to encrypt position with RSA." << endl;
        RSA_free(rsa);
        free(encrypted);
        return "";
    }

    std::string encryptedPosition((char *)encrypted, encryptedLength);

    RSA_free(rsa);
    free(encrypted);
    return encryptedPosition;
}

void AccessPoint::sendPositionToDevice(double posX, double posY, const std::string& encryptedPosition) {
    // Create message with encrypted position
    cMessage *message = new cMessage("APToDeviceMessage");
    message->addPar("posX");
    message->par("posX").setDoubleValue(posX);
    message->addPar("posY");
    message->par("posY").setDoubleValue(posY);
    message->addPar("encryptedPosition");
    message->par("encryptedPosition").setStringValue(encryptedPosition);

    // Send message to device
    send(message, "out");
}