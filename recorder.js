rec=Recorder(); // use the default format, mp3
date = new Date();
holder = 'Waiting';
timeout = false; // start/end button

albumBucketName = 'cc-b2';
bucketRegion = 'us-east-1';
IdentityPoolId ="us-east-1:78533925-8564-496a-b0c2-e3449bd1a6f5"; // good for unauthorized people

AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
    })
});

apigClient = null;
// Make the call to obtain credentials
AWS.config.credentials.get(function(){

    // Credentials will be available when this function is called.
    try {
        token = AWS.config.credentials.accessKeyId;

        apigClient = apigClientFactory.newClient({
            accessKey: AWS.config.credentials.accessKeyId,
            secretKey: AWS.config.credentials.secretAccessKey,
            sessionToken: AWS.config.credentials.sessionToken
        });
        console.log('token exchange success');
    }
    catch(e) {
        console.log('token exchange failed');
    }

});

s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: 'cc-b2'}
});

transcribeservice = new AWS.TranscribeService(
    {apiVersion: '2017-10-26'}
    );

function getSttResult() {
    // This function is used for set the input value as the stt result

    transcribeservice.getTranscriptionJob(
        {
            TranscriptionJobName: 'test',
        },
        function (err, data) {
            if (err) {
                console.log('fail to get task')
            }
            else {
                if (data['TranscriptionJob']['TranscriptionJobStatus'] === "COMPLETED") {
                    let result_url = data["TranscriptionJob"]["Transcript"]["TranscriptFileUri"];
                    $.getJSON(result_url,
                        function (data) {
                            let sentence = data['results']['transcripts'][0]['transcript'];
                            $('#searchValue').val(sentence);
                            console.log(sentence);
                            timeout = true;
                            holder = "Waiting";
                            $('#searchValue').attr('placeholder', "Search photo here");
                        });
                }
                else {
                    $('#searchValue').attr('placeholder', holder);
                    holder = holder + '.';
                    console.log('not finish job')
                }
            }
        });
}

function delay() {
    if(timeout){
        console.log('exit job')
    }
    else {
        console.log(timeout);
        getSttResult();
        setTimeout("delay()", 3000);
    }
}

function addAudio(blob) {
    let file = new File([blob], "input_audio.mp3");
    let fileName = file.name;
    let foldKey = encodeURIComponent('tmp_audio') + '/';

    let audioKey = foldKey + fileName;
    s3.upload({
        Key: audioKey,
        Body: file,

        ACL: 'public-read'
    }, function(err, data) {
        if (err) {
            return alert('There was an error uploading your audio');
        }
        else{
            alert('We are dealing with your speech, please wait!');
            $('#searchValue').attr('placeholder', holder);
            setTimeout("delay()", 5000)
        }

    });
}

function start_record(duration) {
    $('#searchValue').val('');
    rec.open(function(){ // open the recorder source
        rec.start();// begin to record
        setTimeout(function(){
            rec.stop(function(blob,duration){//到达指定条件停止录音
                console.log(URL.createObjectURL(blob),"时长:"+duration+"ms");
                rec.close();
            },function(msg){
                console.log("Recording Failed:"+msg);
            });
        }, duration * 30000);

    },function(msg,isUserNotAllow){ // failure case
        alert((isUserNotAllow?"UserNotAllow，":"")+"cannot record:"+msg);
    });
}


function stop_record() {
    timeout = false;
    rec.stop(function(blob,duration){
        rec.close();
        addAudio(blob); // add audio to S3
    },function(msg){
        console.log("Recording Failed:"+msg);
    });

}

function dealRecorder(duration) {
    let record = $('#record');
    if (record.hasClass('recording')){
        stop_record();
        record.removeClass('recording');
    }
    else{
        record.addClass('recording');
        start_record(duration);
    }
}