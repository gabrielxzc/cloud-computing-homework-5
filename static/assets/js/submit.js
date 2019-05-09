var recordingButton = document.getElementsByClassName(
  "recording-button-after"
)[0];
var submitReviewButton = document.getElementsByClassName("submit-button")[0];
var userReviewTextArea = document.getElementById("user-review-textarea");
var statusMessagePara = document.getElementById("status-message");
var recorderGlobal;
var streamGlobal;

submitReviewButton.addEventListener("click", function() {
  statusMessagePara.innerText = "";

  var reviewText = userReviewTextArea.value;

  if (reviewText.length < 3) {
    statusMessagePara.innerText =
      "Your review can not be shorther than 3 characters!";
  }

  statusMessagePara.innerText = "Your review is beeing posted ...";

  var review = {
    text: reviewText
  };

  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 201) {
        statusMessagePara.innerText = "Your review was successfully posted!";
      } else {
        statusMessagePara.innerText =
          "Something went wrong and we could not post your review. Please try again later!";
      }
    }
  };

  xhttp.open("POST", "/api/review", true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(review));
});

recordingButton.addEventListener("click", function() {
  if (recordingButton.classList.contains("recording-button-after--loading")) {
    return;
  }

  if (recordingButton.classList.contains("recording-button-after--active")) {
    recorderGlobal.stopRecording(function() {
      let blob = recorderGlobal.getBlob();
      let tracks = streamGlobal.getTracks();

      tracks.forEach(function(track) {
        track.stop();
      });

      recordingButton.classList.toggle("recording-button-after--active");
      recordingButton.classList.toggle("recording-button-after--loading");

      var reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = function() {
        base64data = reader.result;

        review = {
          audio: base64data
        };

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 201) {
              statusMessagePara.innerText =
                "Your review was successfully posted!";
            } else {
              statusMessagePara.innerText =
                "Something went wrong and we could not post your review. Please try again later!";
            }
          }

          recordingButton.classList.toggle("recording-button-after--loading");
        };

        xhttp.open("POST", "/api/review", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(review));
      };
    });

    return;
  }

  recordingButton.classList.toggle("recording-button-after--active");
  navigator.mediaDevices
    .getUserMedia({
      audio: true
    })
    .then(function(stream) {
      streamGlobal = stream;

      recorder = RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000
      });

      recorderGlobal = recorder;
      recorder.startRecording();
    });
});
