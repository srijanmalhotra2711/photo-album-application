document.getElementById('displaytext').style.display = 'none';

function searchPhoto() {
  var apigClient = apigClientFactory.newClient();

  var user_message = document.getElementById('note-textarea').value;

  var body = {};
  var params = { 'q': user_message };
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
      if (length_of_response == 0) {
        document.getElementById('displaytext').innerHTML =
          'No Images Found !!!';
        document.getElementById('displaytext').style.display = 'block';
      }

      resp_data.forEach(function (obj) {
    
        var img = new Image();
        console.log(obj);
        img.src = obj;
        img.setAttribute('class', 'banner-img');
        img.setAttribute('alt', 'effy');
        document.getElementById('displaytext').innerHTML =
          'Images returned are : ';
        document.getElementById('img-container').appendChild(img);
        document.getElementById('displaytext').style.display = 'block';
      });
    })
    .catch(function (result) {});
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // reader.onload = () => resolve(reader.result)
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
  var file = document.getElementById('file_path').files[0];
  const reader = new FileReader();
      let config = {
                headers:{'Content-Type': file.type,'x-amz-meta-customlabels': custom_labels.value}
            };

            url = 'https://aouazqh4h0.execute-api.us-east-1.amazonaws.com/dev/upload/bass2/' + file.name
            console.log(url)
            axios.put(url,file,config).then(response=>{
                // console.log(response.data)
                alert("Upload successful!!");
            })

  // var file_data;
  // var encoded_image = getBase64(file).then((data) => {
  //   // console.log(data);
  //   var apigClient = apigClientFactory.newClient();

  //   var file_type = file.type + ';base64';
  //   //var file_type = file.type;


  //   console.log(file.type);
  //   console.log(custom_labels.value);

  //   var body = data;
  //   var params = {
  //     key: file.name,
  //     bucket: 'bass2',
  //     'x-amz-meta-customlabels': custom_labels.value,
  //     'Accept': 'image/*',
  //     'Content-Type': file.type,
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Headers': '*',
  //     'Access-Control-Allow-Methods': '*'
  //   };
  //   console.log(params);
  //   var additionalParams = {
  //   };
  //   apigClient
  //     .uploadBucketKeyPut(params, body, additionalParams)
  //     .then(function (res) {
  //       if (res.status == 200) {
  //         document.getElementById('uploadText').innerHTML =
  //           'Image Uploaded  !!!';
  //         document.getElementById('uploadText').style.display = 'block';
  //       }
  //     });
  // });
}