//this file is solely to test some functions


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

let marker;
let actualLocation = { lat: 55.7558, lng: 37.6173 } ;
let userGuess;
let polyline;
let totalScore=0;
let currentRound=1;
let maxRounds = 5;


// const randomLocations = [
//   { lat: 48.8566, lng: 2.3522 },  // Paris, France
//   { lat: 40.7128, lng: -74.0060 }, // New York City, USA
//   { lat: 35.6895, lng: 139.6917 }, // Tokyo, Japan
//   { lat: -33.8688, lng: 151.2093 }, // Sydney, Australia
//   { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro, Brazil
//   { lat: 55.7558, lng: 37.6173 },  // Moscow, Russia
//   { lat: 51.5074, lng: -0.1278 },  // London, UK
//   { lat: 19.4326, lng: -99.1332 }, // Mexico City, Mexico
//   { lat: 34.0522, lng: -118.2437 }, // Los Angeles, USA
//   { lat: 39.9042, lng: 116.4074 }, // Beijing, China
// ];

// function getRandomLocation() {
//   return randomLocations[Math.floor(Math.random() * randomLocations.length)];
// }

function initMap() {
  const streetViewContainer = document.getElementById("street-view");
  const mapContainer = document.getElementById("map");
  const overlay = document.getElementById("overlay");
  const guessButton = document.getElementById("guessButton");

  // Initialize Street View
  const panorama = new google.maps.StreetViewPanorama(streetViewContainer, {
      position: { lat: 55.7558, lng: 37.6173 },
      pov: { heading: 34, pitch: 10 },
      zoom: 1,
      disableDefaultUI: true,
  });

  //map initialization
  const map = new google.maps.Map(mapContainer, {
    center: { lat: 0, lng: 0 },
    zoom:2,
    disableDefaultUI: true,
    cursor: 'crosshair',
  })

    // Create the marker but don't place it yet
    marker = new google.maps.Marker({
      map: map,
      draggable: true,
      visible: false,  // Initially hidden
  });

  // Add a click listener to place the marker
  map.addListener("click", function (e) {
      const position = e.latLng;
      marker.setPosition(position);  // Place the marker where the user clicks
      marker.setVisible(true);  // Show the marker

      userGuess = position;  // Store the user's guess
  });

  guessButton.addEventListener("click", () => {
    if(userGuess) {
      mapContainer.classList.add("expanded-map");
      overlay.classList.add("show");


      const bounds = new google.maps.LatLngBounds();
      bounds.extend(userGuess);
      bounds.extend(actualLocation);
      map.fitBounds(bounds);

      if(polyline) polyline.setMap(null);
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
      document.querySelector('.info-container .item p:first-child').textContent = `Score: ${totalScore}`;


      console.log(distance);
      console.log(points);

      marker.setVisible(false);

      currentRound++;
      
      overlay.addEventListener("click", resetMap);
      setTimeout(resetMap, 5000)
    }
  });

  function resetMap(){
    mapContainer.classList.remove("expanded-map");
    overlay.classList.remove("show");
    if (polyline) polyline.setMap(null);

    document.getElementById("distanceText").textContent = "Distance: ";
    document.getElementById("pointsText").textContent = "Points won: ";
    document.querySelector('.info-container .item p:nth-child(2)').textContent = `Rounds: ${currentRound}/${maxRounds}`;

    if(currentRound > maxRounds) {
      alert(`Game Over! Thank you for playing ^^ !! \nYour Total Score was ${totalScore} !!!`)
      resetGame();
    }

    const initalCenter = {lat: 0, lng: 0};
    map.setCenter(initalCenter);
    map.setZoom(2);
  }
}

  function resetGame(){
    totalScore = 0;
    currentRound = 1;
    document.querySelector('.info-container .item p:first-child').textContent = `Score: ${totalScore}`;
    document.querySelector('.info-container .item p:nth-child(2)').textContent = `Round: ${currentRound}/${maxRounds}`;
  }


