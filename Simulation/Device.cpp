#include <omnetpp.h>
#include <cstring>
#include <ctime>
#include <openssl/rsa.h>
#include <openssl/pem.h>
#include <openssl/err.h>
#include <openssl/rand.h>

using namespace omnetpp;

class Device : public cSimpleModule {
  protected:
    virtual void initialize() override;
    virtual void handleMessage(cMessage *msg) override;
    virtual void broadcastMessage();
    virtual std::string signMessage(const std::string& message);
    virtual std::string getPublicKey();
    virtual void processReceivedMessage(cMessage *msg);

  private:
    RSA *rsa;
    std::string privateKey;
    std::string publicKey;
    int deviceId;
};

Define_Module(Device);

void Device::initialize() {
    deviceId = getParentModule()->getIndex();

    // Generate RSA key pair
    rsa = RSA_generate_key(2048, RSA_F4, nullptr, nullptr);

    // Convert RSA keys to strings
    BIO *bioPrivate = BIO_new(BIO_s_mem());
    PEM_write_bio_RSAPrivateKey(bioPrivate, rsa, nullptr, nullptr, 0, nullptr, nullptr);
    char *privateKeyBuffer;
    size_t privateKeyLen = BIO_get_mem_data(bioPrivate, &privateKeyBuffer);
    privateKey = std::string(privateKeyBuffer, privateKeyLen);
    BIO_free(bioPrivate);

    BIO *bioPublic = BIO_new(BIO_s_mem());
    PEM_write_bio_RSAPublicKey(bioPublic, rsa);
    char *publicKeyBuffer;
    size_t publicKeyLen = BIO_get_mem_data(bioPublic, &publicKeyBuffer);
    publicKey = std::string(publicKeyBuffer, publicKeyLen);
    BIO_free(bioPublic);

    // Broadcast message periodically
    scheduleAt(simTime() + exponential(1), new cMessage("BroadcastMessage"));
}

void Device::handleMessage(cMessage *msg) {
    if (strcmp(msg->getName(), "BroadcastMessage") == 0) {
        broadcastMessage();
        scheduleAt(simTime() + exponential(1), new cMessage("BroadcastMessage"));
    }
    else {
        processReceivedMessage(msg);
    }
    delete msg;
}

void Device::broadcastMessage() {
    // Get current time
    std::time_t currentTime = std::time(nullptr);
    std::string message = std::to_string(deviceId) + "-" + std::to_string(currentTime);
    
    // Sign the message with private key
    std::string signedMessage = signMessage(message);

    // Create a new message
    cMessage *broadcastMsg = new cMessage("BroadcastedMessage");
    broadcastMsg->addPar("signedMessage");
    broadcastMsg->par("signedMessage").setStringValue(signedMessage);
    broadcastMsg->addPar("publicKey");
    broadcastMsg->par("publicKey").setStringValue(publicKey);

    // Send the message to all connected gates (broadcast)
    send(broadcastMsg, "out");
}

std::string Device::signMessage(const std::string& message) {
    // Hash the message using SHA-256
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, message.c_str(), message.length());
    SHA256_Final(hash, &sha256);

    // Convert hash to hexadecimal string
    std::stringstream ss;
    for(int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }

    // Encrypt the hash with private key
    unsigned char* encryptedHash = new unsigned char[RSA_size(rsa)];
    RSA_private_encrypt(ss.str().length(), (const unsigned char*)ss.str().c_str(), encryptedHash, rsa, RSA_PKCS1_PADDING);

    // Convert encrypted hash to hexadecimal string
    std::string signedMessage((char*)encryptedHash, RSA_size(rsa));
    delete[] encryptedHash;
    return signedMessage;
}

std::string Device::getPublicKey() {
    // Return the public key
    return publicKey;
}

void Device::processReceivedMessage(cMessage *msg) {
    std::string signedMessage = msg->par("signedMessage").stringValue();

    // Decrypt the message with private key
    unsigned char* decryptedHash = new unsigned char[RSA_size(rsa)];
    RSA_private_decrypt(signedMessage.length(), (const unsigned char*)signedMessage.c_str(), decryptedHash, rsa, RSA_PKCS1_PADDING);

    // Convert decrypted hash to string
    std::string decryptedMessage((char*)decryptedHash, RSA_size(rsa));
    delete[] decryptedHash;

    // Extract position from decrypted message
    std::size_t pos = decryptedMessage.find_last_of("-");
    if (pos != std::string::npos) {
        std::string posXStr = decryptedMessage.substr(0, pos);
        std::string posYStr = decryptedMessage.substr(pos + 1);
        double posX = std::stod(posXStr);
        double posY = std::stod(posYStr);

        EV_INFO << "Device received position: (" << posX << ", " << posY << ")" << endl;
    }
    else {
        EV_WARN << "Invalid message format received." << endl;
    }
}