function updateUsername(){
  const username = localStorage.getItem("username");

  localStorage.setItem("username", username);

  const usernameDisplay = document.getElementById("usernameDisplay");
  if(usernameDisplay){
    usernameDisplay.textContent = username;
  }
}
updateUsername();

function calculateDistance(userGuess, actualLocation) {
  const userLatLng = new google.maps.LatLng(userGuess.lat(), userGuess.lng());
  const actualLatLng = new google.maps.LatLng(actualLocation.lat, actualLocation.lng);
  const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, actualLatLng);

  const distanceInKM = Math.ceil(distanceInMeters / 1000);
  return distanceInKM;

}

function calculatePointsWon(distance) {
  const maxPoints = 5000; // Maximum points for a perfect guess
  const pointsLostPerKM = 1; // Points lost per meter

  // Calculate points based on distance
  const pointsWon = Math.max(0, maxPoints - Math.floor(distance * pointsLostPerKM));
  return pointsWon;
}


import locations from './locations.js';

let marker;
let actualLocation;
let userGuess;
let polyline;
let totalScore = 0;
let currentRound = 1;
let maxRounds = 5;


function initMap() {
  const streetViewContainer = document.getElementById("street-view");
  const mapContainer = document.getElementById("map");
  const overlay = document.getElementById("overlay");
  const guessButton = document.getElementById("guessButton");

  // Initialize with a random location
  actualLocation = locations[Math.floor(Math.random() * locations.length)];

  // Initialize Street View
  const panorama = new google.maps.StreetViewPanorama(streetViewContainer, {
    position: actualLocation,
    pov: { heading: 34, pitch: 10 },
    zoom: 1,
    disableDefaultUI: true,
  });

  // Map initialization
  const map = new google.maps.Map(mapContainer, {
    center: { lat: 0, lng: 0 },
    zoom: 2,
    disableDefaultUI: true,
    cursor: "crosshair",
  });

  // Create the marker but don't place it yet
  marker = new google.maps.Marker({
    map: map,
    draggable: true,
    visible: false, // Initially hidden
  });

  // Add a click listener to place the marker
  map.addListener("click", function (e) {
    const position = e.latLng;
    marker.setPosition(position); // Place the marker where the user clicks
    marker.setVisible(true); // Show the marker

    userGuess = position; // Store the user's guess
  });

  guessButton.addEventListener("click", () => {
    if (userGuess) {
      mapContainer.classList.add("expanded-map");
      overlay.classList.add("show");

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(userGuess);
      bounds.extend(actualLocation);
      map.fitBounds(bounds);

      if (polyline) polyline.setMap(null);
      polyline = new google.maps.Polyline({
        path: [userGuess, actualLocation],
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map,
      });

      const distance = calculateDistance(userGuess, actualLocation);
      const points = calculatePointsWon(distance);

      totalScore += points;

      document.getElementById("distanceText").textContent = `Distance: ${distance} km`;
      document.getElementById("pointsText").textContent = `Points won: ${points}`;
      document.querySelector(".info-container .item p:first-child").textContent = `Score: ${totalScore}`;

      console.log(distance);
      console.log(points);

      marker.setVisible(false);

      currentRound++;

      overlay.addEventListener("click", resetMap);
      setTimeout(resetMap, 5000);
    }
  });

  function resetMap() {
    mapContainer.classList.remove("expanded-map");
    overlay.classList.remove("show");
    if (polyline) polyline.setMap(null);

    document.getElementById("distanceText").textContent = "Distance: ";
    document.getElementById("pointsText").textContent = "Points won: ";
    document.querySelector(".info-container .item p:nth-child(2)").textContent = `Rounds: ${currentRound}/${maxRounds}`;

    if (currentRound > maxRounds) {
      alert(`Game Over! Thank you for playing ^^ !! \nYour Total Score was ${totalScore} !!!`);
      resetGame();
    } else {
      // Set a new random location for the next round
      actualLocation = locations[Math.floor(Math.random() * locations.length)];
      panorama.setPosition(actualLocation);
      marker.setVisible(false);
      userGuess = null;
    }

    map.setCenter({ lat: 0, lng: 0 });
    map.setZoom(2);
  }
}
initMap();

function resetGame() {
  totalScore = 0;
  currentRound = 1;
  document.querySelector(".info-container .item p:first-child").textContent = `Score: ${totalScore}`;
  document.querySelector(".info-container .item p:nth-child(2)").textContent = `Round: ${currentRound}/${maxRounds}`;
  actualLocation = locations[Math.floor(Math.random() * locations.length)];
}
