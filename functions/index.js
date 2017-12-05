
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
var functions = require('firebase-functions');
var admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var wortedata;
var x;
var y;
var z;
var uid;
var kalman;
var sensorName;
var finger;
var number;
var sum_x, sum_y, sum_z, sum_kalman;
var avr_x,avr_y,avr_z, avr_kalman;
var count=0;
sum_x = sum_y = sum_z = sum_kalman = 0;
avr_x = avr_y = avr_z = avr_kalman = 0;

exports.firstDataTrigger = functions.database.ref('/sensor/{uid}/{finger}/{number}/{sensors}').onWrite((event)=>{

    wortedata = event.data.val();
    number = event.params.number;
    sensorName = event.params.sensors;
    finger = event.params.finger;
    console.log(wortedata);
    console.log(sensorName+" 가져온 센서");

    uid = event.params.uid;

    //다른 센서들은 x, y, z, kalman 가져오는데에 비해 구부림센서는 센서값만 가져오면됨
    if(sensorName == "flex"){
        event.data.forEach(function(data){
            x = data.val().x;
        })
    } else {
        event.data.forEach(function(data){
            x = data.val().x;
            y = data.val().y;
            z = data.val().z;
            kalman = data.val().kalman;
        })
    }
    console.log(uid+" "+x+" "+y+" "+z+" "+kalman+"  센서값들");

    admin.database().ref('/sensor/'+uid+'/'+finger+'/'+number+'/'+sensorName).once('value', function(data){
        console.log(data.val());
        if(sensorName == "flex"){
            data.forEach(function(snapshot){
                sum_x+=snapshot.val().x;
                count++;
            })
            avr_x = sum_x/count;
            console.log(avr_x+"    test1");
            var payload = {
                x:avr_x,
                y:avr_y,
                z:avr_z,
                kalman:avr_kalman
            }
            return pushData(payload);
        }else {
            data.forEach(function(snapshot){
                sum_x+=snapshot.val().x;
                sum_y+=snapshot.val().y;
                sum_z+=snapshot.val().z;
                sum_kalman+=snapshot.val().kalman;
                count++;
            })
            avr_x = sum_x/count;
            avr_y = sum_y/count;
            avr_z = sum_z/count;
            avr_kalman = sum_kalman/count;
            console.log(avr_x+' '+avr_y+' '+avr_z+' '+avr_kalman+"    test1");
            var payload = {
                x:avr_x,
                y:avr_y,
                z:avr_z,
                kalman:avr_kalman
            }
            return pushData(payload);
        }

    });

});
function pushData(payload) {
    admin.database().ref('/user/'+uid+'/'+finger+'/'+number+'/avr/avr_'+sensorName).set(payload);
}