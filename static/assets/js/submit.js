var recordingButton = document.getElementsByClassName(
  "recording-button-after"
)[0];
var submitReviewButton = document.getElementsByClassName("submit-button")[0];
var userReviewTextArea = document.getElementById("user-review-textarea");
var statusMessagePara = document.getElementById("status-message");

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

recordingButton.addEventListener("click", async function() {
  if (
    recordingButton.classList.contains("recording-button-after--active") ||
    recordingButton.classList.contains("recording-button-after--loading")
  ) {
    return;
  }

  recordingButton.classList.toggle("recording-button-after--active");

  const sleep = m => new Promise(r => setTimeout(r, m));
  await sleep(3000);

  recordingButton.classList.toggle("recording-button-after--active");

  /*
  navigator.mediaDevices
    .getUserMedia({
      audio: true
    })
    .then(async function(stream) {
      let recorder = RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        desiredSampRate: 16000
      });

      recorder.startRecording();

      const sleep = m => new Promise(r => setTimeout(r, m));
      await sleep(3000);

      recorder.stopRecording(function() {
        let blob = recorder.getBlob();

        let tracks = stream.getTracks();

        tracks.forEach(function(track) {
          track.stop();
        });

        recordingButton.classList.toggle("recording-button-after--active");
        recordingButtonBackground.classList.toggle(
          "recording-button-before--active"
        );
        tweetsContainer.classList.toggle("tweets-container--active");

        recordingButton.classList.toggle("recording-button-after--loading");

        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
              appendNewResponse(this.responseText);
            } else {
              appendNewResponse({
                isError: true
              });
            }
          }
        };

        xhttp.open("POST", "thought", true);
        xhttp.setRequestHeader("Content-type", "application/octet-stream");
        xhttp.send(blob);
      });
    });
    */
});
