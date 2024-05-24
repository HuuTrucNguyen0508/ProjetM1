// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

/**
 * @title CoordinateStorage
 * @dev Store latitude and longitude coordinates
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract Storage {

    int256 constant LATITUDE_FACTOR = 1e8; // 10^8
    int256 constant LONGITUDE_FACTOR = 1e8; // 10^8

    int256 private latitude;
    int256 private longitude;

    /**
     * @dev Store latitude and longitude
     * @param lat Latitude coordinate
     * @param lon Longitude coordinate
     */
    function storeCoordinates(int256 lat, int256 lon) public {
        latitude  = lat * LATITUDE_FACTOR;
        longitude = lon * LONGITUDE_FACTOR;
    }

    /**
     * @dev Return latitude and longitude 
     * @return Latitude and longitude coordinates
     */
    function getCoordinates() public view returns (int256, int256) {
        int256 nlat = latitude / 1e8;
        int256 nlong = longitude / 1e8;
        return (nlat, nlong);
    }
}
