/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function(err){
    console.log("Error : ", err);
};

// Queries the container in which the remote feeds belong
let remoteContainer= document.getElementById("remote-container");
let canvasContainer =document.getElementById("canvas-container");
let resultContainer =document.getElementById("result-container");
let canvas, canvasPromise ,resolve, reject;
canvasPromise=new Promise(function (res, rej) {
    resolve=res;
    reject=rej;
});

/**
 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
function addVideoStream(streamId){
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=streamId;                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
    remoteContainer.appendChild(streamDiv);      // Add new div to container
}
/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream (evt) {
    let stream = evt.stream;
    stream.stop();
    let remDiv=document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);

    let remCanvas=document.getElementById('canvas'+stream.getId());
    remCanvas.parentNode.removeChild(remCanvas);

    canvasProps[stream.getId()]=undefined;

    console.log("Remote stream is removed " + stream.getId());
}
let canvasProps={};

function addCanvas(streamId){
    canvas=document.createElement("canvas");
    canvas.id='canvas'+streamId;
    canvasContainer.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    let video=document.getElementById(`video${streamId}`);

    video.addEventListener('loadedmetadata', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvasProps[streamId]={
            height:video.videoHeight,
            width:video.videoWidth
        }
    });

    video.addEventListener('play', function() {
        resolve();
        var $this = this; //cache
        if(canvasProps[streamId].width!==video.width){
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvasProps[streamId]={
                height:video.videoHeight,
                width:video.videoWidth
            }
        }
        (function loop() {
            if (!$this.paused && !$this.ended) {
                ctx.drawImage($this, 0, 0);
                setTimeout(loop, 1000 / 30); // drawing at 30fps
            }
        })();
    }, 0);

    /*let timer=30000;
    let inter=setInterval(()=>{
        console.log(canvas.toDataURL());
        timer-=3000;
        console.log(inter);
        (timer<=0)?clearInterval(inter):console.log(timer);
    },3000)*/
}

/*function analyseSentiment(){
    const socket = io('http://localhost');
}*/
// Client Setup
// Defines a client for RTC

const socket = io.connect('ws://localhost:8000/ml');

socket.on('connect',(d,e)=>{
    console.log("connected to socket !");
    canvasPromise.then(function () {
        let timer=30000;
        let inter=setInterval(()=>{
            console.log("canvas created");
            let img=canvas.toDataURL();
            img = img.split("data:image/png;base64,")[1];
            console.log("Send data", {'image': img});
            socket.emit("json",{'image': img});
            // timer-=3000;
            console.log(inter);
            (timer<=0)?clearInterval(inter):console.log(timer);
        },200);
    });
});
socket.on('message', function (message) {
    let newImg = document.createElement('img');
    newImg.src="data:image/png;base64,"+message.result;
    resultContainer.innerHTML="";
    resultContainer.appendChild(newImg);
    console.log(message);
});

let client = AgoraRTC.createClient({
    mode: 'live',
    codec: "h264"
});

// Client Setup
// Defines a client for Real Time Communication
client.init("APP_ID",() => console.log("AgoraRTC client initialized") ,handleFail);

// The client joins the channel
client.join(null,"any-channel",null, (uid)=>{

    // Stream object associated with your web cam is initialized
    let localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: false,
        video: true,
        screen: false
    });

    // Associates the stream to the client
    localStream.init(function() {

        //Plays the localVideo
        localStream.play('me');

        //Publishes the stream to the channel
        client.publish(localStream, handleFail);

    },handleFail);

},handleFail);
//When a stream is added to a channel
client.on('stream-added', function (evt) {
    client.subscribe(evt.stream, handleFail);
});
//When you subscribe to a stream
client.on('stream-subscribed', function (evt) {
    let stream = evt.stream;
    addVideoStream(stream.getId());
    stream.play(stream.getId());
    addCanvas(stream.getId());
});
//When a person is removed from the stream
client.on('stream-removed',removeVideoStream);
client.on('peer-leave',removeVideoStream);
