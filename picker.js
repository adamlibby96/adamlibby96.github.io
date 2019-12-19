var family = [
  {
    name: "mom",
    id: 1,
    choosen_id: 999
  },
  {
    name: "dad",
    id: 2,
    choosen_id: 999
  },
  {
    name: "luke",
    id: 3,
    choosen_id: 999
  },
  {
    name: "adam",
    id: 4,
    choosen_id: 999
  },
  {
    name: "jacob",
    id: 5,
    choosen_id: 999
  }
];

function timedRefresh(timeoutPeriod) {
  setTimeout("location.reload(true);", timeoutPeriod);
}
// window.onload = timedRefresh(5000);

var database = firebase.database();
if (database) {
  // console.dir(database);
  onLoadInitiated();
}
var registeredPeeps = [];
var choosenPeeps = [];
function onLoadInitiated() {
  database.ref("family/").set(family);
  database
    .ref("registered/")
    .once("value")
    .then(dat => {
      var counter = 0;
      registeredPeeps = [];
      choosenPeeps = [];
      dat.forEach(person => {
        counter++;
        registeredPeeps = [
          ...registeredPeeps,
          {
            name: person.val().name,
            id: counter,
            choosen_id: 999
          }
        ];
        //console.log(person.val().name);
      });
      console.log(counter);
      if (counter >= 5) {
        console.log("No more slots. Deliver the list");
        hatPicker();
      }
    });
}

function onRegisterClicked() {
  var x = document.getElementById("familylist").value;
  database
    .ref("registered/" + x)
    .once("value")
    .then(function(data) {
      if (data.val() != null) {
        if (data.val().name == x) {
          console.log(x + " is already registered");
          document.getElementById("chosenList").innerHTML =
            x + " is already registered";
          timedRefresh(30000);
        }
      } else {
        console.log("Adding " + x + " to the registered list");
        document.getElementById("chosenList").innerHTML =
          "Adding " + x + " to the registered list";
        database.ref("registered/" + x).set({ name: x });
        timedRefresh(5000);
      }
    });
}
var choosenIDs = [];
function hatPicker() {
  database
    .ref("choosen/")
    .once("value")
    .then(data => {
      choosenIDs = [];
      if (data.val()) {
        console.log("We already generated the data");
        displayResults(data.val());
      } else {
        console.log("we have not generated data. So generate it now!");
        for (var i = 0; i < registeredPeeps.length; i++) {
          // if the current person doesn't have a choosen id, choose one
          if (registeredPeeps[i].choosen_id > 6) {
            // get an id that is not equal to our own id and not in the list already
            var idToChoose = Math.floor(Math.random() * 5) + 1;
            while (
              idToChoose == registeredPeeps[i].id ||
              choosenIDs.includes(idToChoose)
            ) {
              idToChoose = Math.floor(Math.random() * 5) + 1;
            }
            registeredPeeps[i].choosen_id = idToChoose;
            choosenIDs = [...choosenIDs, idToChoose];
          }
        }
        database.ref("choosen/").set(registeredPeeps);
        displayResults(registeredPeeps);
      }
    });
}

function displayResults(arrlist) {
  var txt = "";
  for (var i = 0; i < arrlist.length; i++) {
    var person = arrlist[i];
    for (var j = 0; j < arrlist.length; j++) {
      if (person.choosen_id == arrlist[j].id) {
        txt += person.name + " has " + arrlist[j].name + "<br/>";
      }
    }
  }
  document.getElementById("chosenList").innerHTML = txt;
}
