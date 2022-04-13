function searchPhoto() {
  var apigClient = apigClientFactory.newClient();

  var user_message = document.getElementById('note-textarea').value;

  var body = {};
  var params = { 'q': user_message };

  if(params['q']=="")
  {
    alert("No Search Query Found. Enter keyword to Search!");
  }
  console.log(params['q']);

  var additionalParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  apigClient
    .searchGet(params, body, additionalParams)
    .then(function (res) {
      var data = {};
      var data_array = [];
      resp_data = res.data;
      length_of_response = resp_data.length;

      console.log("LEN RES", length_of_response);

      console.log("Result : ", res);

      var photosDiv = document.getElementById("img-container");
      photosDiv.innerHTML = "";

      if (length_of_response == 0) {
        photosDiv.innerHTML = '<h2 style="text-align: center;font-size: 25px;font-style: bold;margin-top:30px;">No Images Found !!!</h2>';
      }

      else {

      photosDiv.innerHTML = '<h2 style="text-align: center;font-size: 25px;font-style: bold;margin-top:30px;margin-bottom:30px;">Here are your images: </h2>';

      image_paths = res["data"];
      console.log(image_paths);
        console.log(photosDiv);
        for (n = 0; n < image_paths.length; n++) {
            images_list = image_paths[n].split('/');
            imageName = images_list[images_list.length - 1];
            photosDiv.innerHTML += '<figure><img src="' + image_paths[n] + '" style="width:25%"><figcaption>' + imageName + '</figcaption></figure>';

         } 
        
        console.log(photosDiv);
    }
    })
    .catch(function (result) {});
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
      if (encoded.length % 4 > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });
}

function uploadPhoto() {
  var filePath = (document.getElementById('file_path').value).split("\\");
  console.log(filePath);
  var file = document.getElementById('file_path').files[0];
  const reader = new FileReader();
  console.log(filePath);
  if ((filePath == "") || (!['png', 'jpg', 'jpeg'].includes(filePath.toString().split(".")[1]))) {
        alert("Please upload a valid .png/.jpg/.jpeg file!");
    } else {
      let config = {
                headers:{'Content-Type': file.type,'x-amz-meta-customlabels': custom_labels.value}
            };

            url = 'https://aouazqh4h0.execute-api.us-east-1.amazonaws.com/dev/upload/bass2/' + file.name
            console.log(url)
            axios.put(url,file,config).then(response=>{
                alert("Upload successful!!");
            })
          }
}