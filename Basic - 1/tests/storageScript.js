const contractABI = [
	{
		"inputs": [
			{
				"internalType": "int256",
				"name": "lat",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "lon",
				"type": "int256"
			}
		],
		"name": "storeCoordinates",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCoordinates",
		"outputs": [
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = '0xb5465ED8EcD4F79dD4BE10A7C8e7a50664e5eeEB'; 
var contractInstance = new web3.eth.Contract(contractABI, contractAddress);

/*function computeResult() {
    var p1=[-20.6685,-69.1942,84];
    var p2=[-20.2705,-70.1311,114];
    var p3=[-20.5656,-70.1807,120];
    var result = Compute(p1, p2, p3);
    console.log("Computed result:", result);
}*/

function Compute(p1,p2,p3){
    var a;
    var b;
    var c;
    var d;
    var f;
    var g;
    var h;
    var i;
    var j=3.14159265359;
    var k;
    c=p2[0]-p1[0];
    d=p2[1]-p1[1];
    f=(180/j)*Math.acos(Math.abs(c)/Math.abs(Math.sqrt(Math.pow(c,2)+Math.pow(d,2))));
    if((c>0&&d>0)){
        f=360-f;
    }else if((c<0&&d>0)){
        f=180+f;
    }else if((c<0&&d<0)){
        f=180-f;
    }
    a=C(c,d,B(A(D(p2[2]))),f);
    b=C(p3[0]-p1[0],p3[1]-p1[1],B(A(D(p3[2]))),f);
    g=(Math.pow(B(A(D(p1[2]))),2)-Math.pow(a[2],2)+Math.pow(a[0],2))/(2*a[0]);
    h=(Math.pow(B(A(D(p1[2]))),2)-Math.pow(b[2],2)-Math.pow(g,2)+Math.pow(g-b[0],2)+Math.pow(b[1],2))/(2*b[1]);
    i=C(g,h,0,-f);
    i[0]=(i[0]+p1[0])-0.086;
    i[1]=(i[1]+p1[1])-0.004; 
    k=E(i[0],i[1],p1[0],p1[1]);
    if(k>p1[2]*2){
        i=null;
    }else{
        if(i[0]<-90||i[0]>90||i[1]<-180||i[1]>180){
            i=null;
        }
    }
    //i[0] *= Math.pow(10, 15);
    //i[1] *= Math.pow(10, 15);
    return [i[0],i[1]];
}

function A(a){
    return a*7.2;
}

function B(a){
    return a/900000;
}

function C(a,b,c,d){
    e=3.14159265359;
    return [a*Math.cos((e/180)*d)-b*Math.sin((e/180)*d),a*Math.sin((e/180)*d)+b*Math.cos((e/180)*d),c];
}

function D(a){
    return 730.24198315+52.33325511*a+1.35152407*Math.pow(a,2)+0.01481265*Math.pow(a,3)+0.00005900*Math.pow(a,4)+0.00541703*180;
}

function E(a,b,c,d){
    var e=3.14159265359;
    var f=e*a/180;
    var g=e*c/180;
    var h=b-d;
    var i=e*h/180;
    var j=Math.sin(f)*Math.sin(g)+Math.cos(f)*Math.cos(g)*Math.cos(i);
    if(j>1){
        j=1;
    }
    j=Math.acos(j);
    j=j*180/e;
    j=j*60*1.1515;
    j=j*1.609344;
    return j;
}

function floatToInt256(value) {
    // Scale the floating-point value to keep up to 5 decimal places
    var scaledValue = value * 1e8;

    // Round the scaled value to the nearest integer
    var intValue = Math.round(scaledValue);

    // Convert the rounded integer value to a BigInt
    intValue = BigInt(intValue);

    return intValue;
}

async function storeCoordinates() {
    const computedCoordinates = Compute([-19.6685, -69.1942, 84], [-20.2705, -70.1311, 114], [-20.5656, -70.1807, 120]);

    var int1 = floatToInt256(computedCoordinates[0]);
    var int2 = floatToInt256(computedCoordinates[1]);

    const accounts = await web3.eth.getAccounts();
    
    contractInstance.methods.storeCoordinates(int1, int2)
    .send({ from: accounts[0] }) 
    .on('transactionHash', function(hash){
        console.log('Transaction Hash: ' + hash);
    })
    .on('receipt', function(receipt){
        console.log('Transaction Receipt:', receipt);
    })
    .on('error', function(error) {
        console.error('Transaction Error:', error);
    });
}

async function getCoordinates() {
    try {
        const result = await contractInstance.methods.getCoordinates().call();
        const lat = result[0] / 1e8; // Convert to float
        const lon = result[1] / 1e8; // Convert to float
        console.log("Retrieved coordinates:", lat, lon);
        return [lat, lon];
    } catch (error) {
        console.error("Error retrieving coordinates:", error);
        return null;
    }
}

storeCoordinates();
getCoordinates();
