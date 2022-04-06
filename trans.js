var name = '';
var encoded = null;
var fileExt = null;
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
const icon = document.querySelector('i.fa.fa-microphone')

function previewFile(input) {
  var reader = new FileReader();
  name = input.files[0].name;
  fileExt = name.split(".").pop();
  var onlyname = name.replace(/\.[^/.]+$/, "");
  var finalName = onlyname + "_" + Date.now() + "." + fileExt;
  name = finalName;

  reader.onload = function (e) {
    var src = e.target.result;
    var newImage = document.createElement("img");
    newImage.src = src;
    encoded = newImage.outerHTML;
  }
  reader.readAsDataURL(input.files[0]);
}

function upload() {
  last_index_quote = encoded.lastIndexOf('"');
  if (fileExt == 'jpg' || fileExt == 'jpeg') {
    encodedStr = encoded.substring(33, last_index_quote);
  }
  else {
    encodedStr = encoded.substring(32, last_index_quote);
  }
  var apigClient = apigClientFactory.newClient({ apiKey: "apikey" });

  var params = {
    "key": name,
    "bucket": "photobuket",
    "Content-Type": "image/jpg;base64"

  };

  var additionalParams = {
    headers: {
      "Content-Type": "image/jpg;base64"
    }
  };
  console.log(encodedStr);

  apigClient.uploadBucketKeyPut(params, encodedStr, additionalParams)
    .then(function (result) {
      console.log('success OK');
      console.log(result);
      alert("Photo uploaded successfully!");
    }).catch(function (result) {
      console.log(result);
    });
}


function searchFromVoice() {
  console.log("i am here 1")
  recognition.start();
  console.log("i am here 2")
  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    console.log(speechToText)
    console.log("i am here 3")

    var apigClient = apigClientFactory.newClient({ apiKey: "apikey" });
    var params = {
      "q": speechToText
    };
    var body = {
      "q": speechToText
    };

    var additionalParams = {
      queryParams: {
        q: speechToText
      }
    };

    apigClient.searchGet(params, body, additionalParams)
      .then(function (result) {
        console.log(result);
        console.log(result.data);
        console.log(result.data.body);
        showImages(result.data.body.results);
        //console.log(result.data.body.results);
      }).catch(function (result) {
        console.log(result);
        console.log(speechToText);
      });

    // console.log(speechToText);
  }//
}


function search() {
  var searchTerm = document.getElementById("search").value;
  var apigClient = apigClientFactory.newClient({ apiKey: "apikey" });
  console.log('hello***')
  console.log(searchTerm)
  var params = {
    "q": searchTerm
  };
  var body = {
    "q": searchTerm
  };

  var additionalParams = {
    queryParams: {
      q: searchTerm
    }
  };
  console.log(searchTerm);
  apigClient.searchGet(params, body, additionalParams)
    .then(function (result) {
      console.log('success OK');
      console.log(result);
     console.log(result.data);
    console.log(result.data.body);
     showImages(result.data.body.results);
    }).catch(function (result) {
      console.log("Success not OK");
      console.log(result);
    });
}

function showImages(res) {
  var newDiv = document.getElementById("div");
  if(typeof(newDiv) != 'undefined' && newDiv != null){
  while (newDiv.firstChild) {
    newDiv.removeChild(newDiv.firstChild);
  }
}
  console.log("hello from image");
  console.log(res);
  if (res.length == 0) {
      console.log("Inside if");
    var newContent = document.createTextNode("No image to display");
    newDiv.appendChild(newContent);
    var currentDiv = document.getElementById("div1");
    document.body.insertBefore(newDiv, currentDiv);
  }
  else {
    console.log("inside else");
    for (var i = 0; i < res.length; i++) {
      console.log(res[i]);
      var newDiv = document.getElementById("div");
      newDiv.style.display = 'inline'
      var newContent = document.createElement("img");
      newContent.src = res[i];
      newContent.style.padding = "20px";
      newContent.style.height = "200px";
      newContent.style.width = "200px";
      newDiv.appendChild(newContent);
      var currentDiv = document.getElementById("div1");
      document.body.insertBefore(newDiv, currentDiv);
    }
  }
}