#include <omnetpp.h>
#include <cstring>
#include <openssl/rsa.h>
#include <openssl/pem.h>
#include <openssl/err.h>

using namespace omnetpp;

class Sensor : public cSimpleModule {
  protected:
    virtual void initialize() override;
    virtual void handleMessage(cMessage *msg) override;
    virtual void sendToAccessPoint(int deviceId, double distance, double posX, double posY, const std::string& publicKey);
    virtual std::string decryptMessage(const std::string& encryptedMessage, const std::string& publicKey);

  private:
    double posX;
    double posY;
    double speedOfSignal;
    int sensorId;
};

Define_Module(Sensor);

void Sensor::initialize() {
    posX = par("posX");
    posY = par("posY");
    speedOfSignal = par("speedOfSignal");
    sensorId = getParentModule()->getIndex();
}

void Sensor::handleMessage(cMessage *msg) {
    if (msg->hasPar("signedMessage") && msg->hasPar("publicKey")) {
        std::string signedMessage = msg->par("signedMessage").stringValue();
        std::string publicKey = msg->par("publicKey").stringValue();

        // Decrypt the message with public key
        std::string decryptedMessage = decryptMessage(signedMessage, publicKey);

        // Extract device ID and time from decrypted message
        std::size_t pos = decryptedMessage.find_last_of("-");
        if (pos != std::string::npos) {
            std::string deviceIdStr = decryptedMessage.substr(0, pos);
            std::string timeStr = decryptedMessage.substr(pos + 1);
            int deviceId = std::stoi(deviceIdStr);
           double messageTime = std::stod(timeStr);

            // Calculate elapsed time since message was sent
            double currentTime = simTime().dbl();
            double elapsedTime = currentTime - messageTime;
            // Calculate distance between sensor and device
            double distance = elapsedTime * speedOfSignal;
            EV_INFO << "Sensor " << sensorId << " calculated distance to Device " << deviceId << ": " << distance << endl;

            // Send message to Access Point
            sendToAccessPoint(deviceId, distance, posX, posY, publicKey);
        }
        else {
            EV_WARN << "Invalid message format received." << endl;
        }
    }
    else {
        EV_WARN << "Invalid message received." << endl;
    }
    delete msg;
}

std::string Sensor::decryptMessage(const std::string& encryptedMessage, const std::string& publicKey) {
    std::string decryptedMessage;

    // Convert public key string to RSA structure
    RSA *rsa = createRSA((unsigned char *)publicKey.c_str(), false);
    if (!rsa) {
        EV_ERROR << "Failed to create RSA key from public key string." << endl;
        return decryptedMessage;
    }

    // Decrypt the message
    unsigned char *decrypted = (unsigned char *)malloc(RSA_size(rsa));
    int decryptedLength = RSA_public_decrypt(encryptedMessage.length(), (const unsigned char *)encryptedMessage.c_str(), decrypted, rsa, RSA_PKCS1_PADDING);
    if (decryptedLength == -1) {
        EV_ERROR << "Failed to decrypt message with RSA." << endl;
        RSA_free(rsa);
        free(decrypted);
        return decryptedMessage;
    }

    decryptedMessage.assign((char *)decrypted, decryptedLength);

    RSA_free(rsa);
    free(decrypted);
    return decryptedMessage;
}

void Sensor::sendToAccessPoint(int deviceId, double distance, double posX, double posY, const std::string& publicKey) {
    cMessage *message = new cMessage("SensorToAPMessage");
    message->addPar("deviceId");
    message->par("deviceId").setIntValue(deviceId);
    message->addPar("distance");
    message->par("distance").setDoubleValue(distance);
    message->addPar("posX");
    message->par("posX").setDoubleValue(posX);
    message->addPar("posY");
    message->par("posY").setDoubleValue(posY);
    message->addPar("publicKey");
    message->par("publicKey").setStringValue(publicKey);

    send(message, "out");
}