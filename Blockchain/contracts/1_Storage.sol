// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

/**
 * @title CoordinateStorage
 * @dev Store latitude, longitude, time, ID, and speed coordinates
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract Storage {

    int256 constant LATITUDE_FACTOR = 1e8; // 10^8
    int256 constant LONGITUDE_FACTOR = 1e8; // 10^8

    struct Coordinates {
        int256 latitude;
        int256 longitude;
        uint256 time1;
        uint256 time2;
        uint256 time3;
        string ID1;
        string ID2;
        string ID3;
        uint256 speed1;
        uint256 speed2;
        uint256 speed3;
    }

    Coordinates private coordinates;

    /**
     * @dev Store latitude, longitude, time, ID, and speed coordinates
     * @param lat Latitude coordinate
     * @param lon Longitude coordinate
     * @param _time1 Time of recording
     * @param _time2 Time of recording
     * @param _time3 Time of recording
     * @param _ID1 Identifier
     * @param _ID2 Identifier
     * @param _ID3 Identifier
     * @param _speed1 Speed in km/h
     * @param _speed2 Speed in km/h
     * @param _speed3 Speed in km/h
     */
    function storeCoordinates(int256 lat, int256 lon, uint256 _time1, uint256 _time2, uint256 _time3, string memory _ID1, string memory _ID2, string memory _ID3, uint256 _speed1,  uint256 _speed2,  uint256 _speed3) public {
        coordinates.latitude = lat * LATITUDE_FACTOR;
        coordinates.longitude = lon * LONGITUDE_FACTOR;
        coordinates.time1 = _time1;
        coordinates.time2 = _time2;
        coordinates.time3 = _time3;
        coordinates.ID1 = _ID1;
        coordinates.ID2 = _ID2;
        coordinates.ID3 = _ID3;
        coordinates.speed1 = _speed1;
        coordinates.speed2 = _speed2;
        coordinates.speed3 = _speed3;
    }

    /**
     * @dev Return latitude, longitude, time, ID, and speed coordinates
     * @return Latitude, longitude, time, ID, and speed coordinates
     */
    function getCoordinates() public view returns (int256, int256, uint256, uint256, uint256, string memory, string memory, string memory, uint256, uint256, uint256) {
        int256 nlat = coordinates.latitude / LATITUDE_FACTOR;
        int256 nlong = coordinates.longitude / LONGITUDE_FACTOR;
        return (nlat, nlong, coordinates.time1, coordinates.time2, coordinates.time3, coordinates.ID1, coordinates.ID2, coordinates.ID3, coordinates.speed1, coordinates.speed2, coordinates.speed3);
    }
}
