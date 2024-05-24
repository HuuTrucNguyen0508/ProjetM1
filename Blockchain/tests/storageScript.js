//ABI du smart contract. Nécessaire pour que le script puisse fonctionne 
const contractABI = [
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
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
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
			},
			{
				"internalType": "uint256",
				"name": "_time1",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_time2",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_time3",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_ID1",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ID2",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ID3",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_speed1",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_speed2",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_speed3",
				"type": "uint256"
			}
		],
		"name": "storeCoordinates",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

//Fonction qui va calculer la trilateration code pris de https://github.com/TBMSP/Trilateration 
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
    var scaledValue = value * 1e8;
    var intValue = Math.round(scaledValue);
	
    intValue = BigInt(intValue);
    return intValue;
}

//Fonction pour enregistrer les informations dans la blockchain
async function storeCoordinates(p1, p2, p3, time1, time2, time3, ID1, ID2, ID3, speed1, speed2, speed3, contractInstance) {
    const computedCoordinates = Compute(p1, p2, p3);

    var int1 = floatToInt256(computedCoordinates[0]);
    var int2 = floatToInt256(computedCoordinates[1]);

    const accounts = await web3.eth.getAccounts();
    
    try{
        contractInstance.methods.storeCoordinates(int1, int2, time1, time2, time3, ID1, ID2, ID3, speed1, speed2, speed3)
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
    } catch (error) {
        console.error('Transaction Error:', error);
    }
    
}

//Fonction pour recuperer les informations de la blockchain
async function getCoordinates(contractInstance) {
    try {
        const result = await contractInstance.methods.getCoordinates().call();

        const lat = result[0] / 1e8; 
        const lon = result[1] / 1e8; 
        const time1 = result[2]; 
        const time2 = result[3]; 
        const time3 = result[4]; 
        const ID1 = result[5]; 
        const ID2 = result[6]; 
        const ID3 = result[7]; 
        const speed1 = result[8]; 
        const speed2 = result[9]; 
        const speed3 = result[10]; 

        console.log("Retrieved coordinates:", lat, lon);
        console.log("Time1:", time1, "Time2:", time2, "Time3:", time3);
        console.log("ID1:", ID1, " ID2:", ID2, " ID3:", ID3);
        console.log("Speed1:", speed1, "Speed2:", speed2, "Speed3:", speed3);

        return [lat, lon, time1, time2, time3, ID1, ID2, ID3, speed1, speed2, speed3];
    } catch (error) {
        console.error("Error retrieving coordinates:", error);
        return null;
    }
}

//Fonction main
async function main() {
    const contractAddress = '0x0813d4a158d06784FDB48323344896B2B1aa0F85';

    var contractInstance = new web3.eth.Contract(contractABI, contractAddress);

    const point1 = [-19.6685, -69.1942, 84];
    const point2 = [-20.2705, -70.1311, 114];
    const point3 = [-20.5656, -70.1807, 120];
    
    const time1 = 1620352976; 
    const time2 = 1620352867; 
    const time3 = 1620303834; 
    const ID1 = "ABC123";
    const ID2 = "BCD234";
    const ID3 = "CDE345";
    const speed1 = 60; 
    const speed2 = 50;
    const speed3 = 45;

    await storeCoordinates(point1, point2, point3, time1, time2, time3, ID1, ID2, ID3, speed1, speed2, speed3, contractInstance);

    await getCoordinates(contractInstance); //La première instance sera vide car l'appel de cette fonction se termine avant le stockage des informations dans la blockchain et donc elle retournera toujours les dernières informations qui ont ete enregistrées 
}

main();
