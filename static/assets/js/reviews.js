console.log("reviews.js");
const audioData = [];

let makeRequest = function(url, method) {
  let request = new XMLHttpRequest();

  return new Promise(function(resolve, reject) {
    request.onreadystatechange = function() {
      if (request.readyState !== 4) return;
      if (request.status >= 200 && request.status < 300) {
        resolve(JSON.parse(request.response));
      } else {
        reject({
          status: request.status,
          statusText: request.statusText
        });
      }
    };

    request.open(method || "GET", url, true);
    request.send();
  });
};

let displayReviews = function(reviews) {
  if (reviews.length === 0) {
    let message = document.createElement("span");
    message.appendChild(document.createTextNode("No reviews found"));
    return message;
  } else {
    let table = document.createElement("table");

    let header = document.createElement("thead");
    let headerRow = document.createElement("tr");

    let textCol = document.createElement("td");
    textCol.appendChild(document.createTextNode("Review"));

    let analysis = document.createElement("td");
    analysis.appendChild(document.createTextNode("Analysis"));

    let audioSection = document.createElement("td");
    audioSection.appendChild(document.createTextNode("Audio"));

    headerRow.appendChild(textCol);
    headerRow.appendChild(analysis);
    headerRow.appendChild(audioSection);

    header.appendChild(headerRow);

    table.appendChild(header);

    let tableBody = document.createElement("tbody");

    for (let i = 0; i < reviews.length; i++) {
      let element = JSON.parse(reviews[i]);
      console.log(element);
      let reviewRow = document.createElement("tr");

      let reviewText = document.createElement("td");
      reviewText.appendChild(document.createTextNode(element.text));

      let reviewAnalysis = document.createElement("td");
      reviewAnalysis.appendChild(
        document.createTextNode(element.analysis ? element.analysis : "-")
      );
      console.log(element.analysis);

      let reviewAudio = document.createElement("td");

      if (element.audio) {
        let reviewAudioPlayButton = document.createElement("audio");
        reviewAudioPlayButton.setAttribute("src", element.audio);
        reviewAudioPlayButton.setAttribute("controls", true);

        reviewAudio.appendChild(reviewAudioPlayButton);
      } else {
        reviewAudio.appendChild(document.createTextNode("-"));
      }

      reviewRow.appendChild(reviewText);
      reviewRow.appendChild(reviewAnalysis);
      reviewRow.appendChild(reviewAudio);

      tableBody.appendChild(reviewRow);
    }

    table.appendChild(tableBody);
    return table;
  }
};

let displayError = function() {
  let errorMessage = document.createElement("span");
  errorMessage.appendChild(document.createTextNode("Error"));

  return errorMessage;
};

function initApplication() {
  const modal = document.getElementById("reviews-module");

  const title = document.createElement("h1");
  title.appendChild(document.createTextNode("Reviews:"));

  modal.appendChild(title);

  makeRequest(window.location.origin + "/api/reviews")
    .then(reviews => {
      let reviewsTable = displayReviews(reviews);

      modal.appendChild(reviewsTable);
    })
    .catch(err => {
      console.log(err);
      modal.appendChild(displayError());
    });
}

document.onreadystatechange = function() {
  if (document.readyState === "complete") {
    initApplication();
  }
};
