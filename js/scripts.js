// References https://stackoverflow.com/questions/44704735/how-can-i-have-a-slot-machine-effect-using-jquery-and-css

let results = [
  'christine',
  'ian',
  'adrianne',
  'sean',
  'katherine',
  'bob',
  'maureen'
];

const groups = [
  'christine:ian',
  'adrianne:sean',
  'katherine:bob',
  'maureen'
];
const groupsByIndex = [
  [0,1],
  [2,3],
  [4,5]
];
const nameAtIndex = [
  'christine',
  'ian',
  'adrianne',
  'sean',
  'katherine',
  'bob',
  'maureen'
];

let allCombinations =[];
let allGroupSets =[];
let allowedMainGroupSets =[];

$(document).ready(function(){
  let firstRoll = false;
  let currentOptions = localStorage.getItem("current");
  let userList = localStorage.getItem("userList");
  let userRolledList = userList ? JSON.parse(userList) : [];

  if(!currentOptions || currentOptions === "[]"){
    populateAllCombinations();
    populateAllGroupSets();
    removeUnallowedGroups();
    currentOptions = allowedMainGroupSets;
    userRolledList = [];
    firstRoll = true;
    $("#resetbtn").hide();
  } else if (userRolledList.length === 7){
    $("#resetbtn").show();
    currentOptions = JSON.parse(currentOptions);
    allowedMainGroupSets = currentOptions;
  }else{
    currentOptions = JSON.parse(currentOptions);
    allowedMainGroupSets = currentOptions;
  }
  // populate dropdown
  results.forEach(el => {
    $("#name").after($("<option></option>").val(firstLetterToUpperCase(el)).html(firstLetterToUpperCase(el)));
  });

  $("#resetbtn").click(function(){

  });

  $("#user-info").submit(function(event){
    event.preventDefault();
    resetResultsArray();
    const user = $("#user-name").val().toLowerCase();
    const userIndex = nameAtIndex.indexOf(user);
    var selectionOptions;
    if(user !== "0"){
      var options = $("input:checkbox[name=add-options]:checked").toArray();
      if(firstRoll === true){
        firstRoll = false;
        if(options.length > 0){
          var optionValues = [];
          options.forEach(el => optionValues.push(el.value));

          if(optionValues.includes("sig-other")){
            removeAllSigOther();
            removeGroupedNames(user);
          }

          // TODO: Currently breaks logic when dynamically removing options
          //       Need to find a way to fix this.. If there is one

          // if(optionValues.includes("other")){
          //   var namesToRemoveArr = $("input:checkbox[name=removal-options]:checked").toArray();
          //   namesToRemoveArr.forEach(el => {
          //     removeName(el.value.toLowerCase());
          //     removeSpecificReceiver(user, el);
          //   });
          // }
        }
      }

        removeName(user);

      removeNamesIfNoRepresentativeIndex(userIndex);
      //spinWheel();
      getSpinValue(user);
      if(!userRolledList.includes(user))
      {
        userRolledList.push(user);
      }
      localStorage.setItem("userList", JSON.stringify(userRolledList));

    } else {
      alert("Please select your name from the dropdown.");
    }
  });
});

function resetResultsArray(){
  results = [
    'christine',
    'ian',
    'adrianne',
    'sean',
    'katherine',
    'bob',
    'maureen'
  ];
}

function removeNamesIfNoRepresentativeIndex(userIndex){
  let tempResults = [];
  results.forEach(receiver => {
    let receiverIndex = nameAtIndex.indexOf(receiver.toLowerCase());
    let canReceive = false;
    allowedMainGroupSets.forEach(groupSet => {
      if(groupSet[userIndex] && groupSet[userIndex][1] == receiverIndex){
        if(!tempResults.includes(receiver)){
          tempResults.push(receiver);
        }
      }
     });
  });
  results = tempResults;
}

async function getSpinValue(user){
  let spinValue = await spinWheel();
  removeChosenReceiver(user, spinValue);
  localStorage.setItem("current", JSON.stringify(allowedMainGroupSets));
}

function populateAllCombinations(){
  for(let i=0; i<results.length; i++){
    let group=[];
    for(let j=0; j<results.length; j++){
      if(i!=j){
        let subgroup = [i,j];
        group.push(subgroup);
      }
    }
    allCombinations.push(group);
  }
}

function populateAllGroupSets(){
  let temp1 = allCombinations[0];
  for(let i=1; i<allCombinations.length; i++){
    let temp2 = [];
    for(let j=0; j<temp1.length; j++){

      // maintain 2-length array elements
      let temp =[];
      if(typeof temp1[j][0] == "number"){
        temp.push(temp1[j]);
      } else {
        temp = temp.concat(temp1[j]);
      }
      for(let k=0; k<allCombinations[0].length; k++){
        tempArray = [];
        tempArray = tempArray.concat(temp);
        tempArray.push(allCombinations[i][k]);
        temp2.push(tempArray);
      }
    }
    temp1=temp2;
  }
  allGroupSets = temp1;
}

function removeUnallowedGroups(){
  // can not give to the same person twice
  allGroupSets.forEach(group => {
    let receivers = [];
    for(let i=0; i<group.length; i++){
      if(!receivers.includes(group[i][1])){
        receivers.push(group[i][1]);
      }
    }
    if(receivers.length == group.length){
      allowedMainGroupSets.push(group);
    }
  });
}

function firstLetterToUpperCase(string){
  const firstLetter = string.charAt(0).toUpperCase();
  return firstLetter + string.slice(1);
}

function removeName(name){
  results.forEach((current, index) => {
    if(current === name){
      results.splice(index, 1);
    }
  });
}

function removeSpecificReceiver(user, receiver){
  const userIndex = nameAtIndex.indexOf(user.toLowerCase());
  const receiverIndex = nameAtIndex.indexOf(receiver.toLowerCase());
  let tempArray = [];
  allowedMainGroupSets.forEach(group => {
    for(let i=0; i<group.length; i++){
      if(group[i][0] != userIndex && group[i][1] == receiverIndex){
        tempArray.push(group);
      }
    }
  });
  tempArray = allowedMainGroupSets;
}

function removeChosenReceiver(user, receiver){
    const userIndex = nameAtIndex.indexOf(user.toLowerCase());
  const receiverIndex = nameAtIndex.indexOf(receiver.toLowerCase());
  let tempArray = [];
  allowedMainGroupSets.forEach(group => {
    if(group[userIndex][0] == userIndex && group[userIndex][1] == receiverIndex){
      tempArray.push(group);
    }
  });
  allowedMainGroupSets=tempArray;
}

function removeGroupedNames(name){
  groups.forEach((current, index) => {
    var tempSoArray = current.split(":");
    // keep name values not in SO array on match
    if(tempSoArray.includes(name)){
      results = results.filter(resultName => !tempSoArray.includes(resultName));
      //removeGroupedNameIndices(tempSoArray);
    }
  });
}

function removeAllSigOther(){
  groups.forEach((current) => {
    var tempSoArray = current.split(":");
    if(tempSoArray.length > 1){
      removeGroupedNameIndices(tempSoArray);
    }
  });
}

function removeGroupedNameIndices(soGroup){
  const soIndex1 = nameAtIndex.indexOf(soGroup[0]);
  const soIndex2 = nameAtIndex.indexOf(soGroup[1]);
  let tempArray = [];
  allowedMainGroupSets.forEach(group => {
    const so1ReceiverIndex = group[soIndex1][1];
    const so2ReceiverIndex = group[soIndex2][1];
    if(so1ReceiverIndex !== soIndex2 && so2ReceiverIndex !== soIndex1){
      tempArray.push(group);
    }
  });
allowedMainGroupSets = tempArray;
}

function showRemovalOptions(){
  var significantOther = $("#add-options-0").prop("checked");
  var optionsCheckBox = $("#add-options-1").prop("checked");
  var user = $("#user-name").val().toLowerCase();

  if(user !== "0"){
    if(optionsCheckBox){
      if(significantOther){
        removeGroupedNames(user);
      } else {
        removeName(user);
      }

      results.forEach((name, index) => {
        var markup =
        `
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" name="removal-options" value="${firstLetterToUpperCase(name)}" id="removal-options-${index}">
            <label class="form-check-label" for="add-options-${index}">${firstLetterToUpperCase(name)}</label>
          </div>
        `
        $("#removal-options").append(markup);
      });
    }
    else {
      $("#removal-options").empty();
    }
  } else {
    alert("Please select your name from the dropdown.");
    $("#add-options-1").prop("checked", false);
  }


}

// Get a random symbol class
function getRandomIndex() {
  var upperCaseResults = [];
  results.forEach(el => upperCaseResults.push(firstLetterToUpperCase(el)));
  return jQuery.rand(upperCaseResults);
}

(function($) {
  $.rand = function(arg) {
    if ($.isArray(arg)) {
      return arg[$.rand(arg.length)];
    } else if (typeof arg === "number") {
      return Math.floor(Math.random() * arg);
    } else {
      return 4; // chosen by fair dice roll
    }
  };
})(jQuery);

// Listen for "hold"-button clicks
// $(document).on("click", ".wheel button", function() {
//   var button = $(this);
//   button.toggleClass("active");
//   button.parent().toggleClass("hold");
//   button.blur(); // get rid of the focus
// });

function spinWheel() {
  return new Promise(resolve => {
    // get a plain array of symbol elements
    var symbols = $(".wheel").not(".hold").get();

    if (symbols.length === 0) {
      alert("All wheels are held; there's nothing to spin");
      return; // stop here
    }

    var button = $(this);

    // get rid of the focus, and disable the button
    button.prop("disabled", true).blur();

    // counter for the number of spins
    var spins = 0;

    // inner function to do the spinning
    function update() {
      for (var i = 0, l = symbols.length; i < l; i++) {
        $('.wheel').html();

        $('.wheel').prepend('<div style="display: none;" class="new-link" name="link[]"><input type="text" value="' + getRandomIndex() + '" /></div>');
        //Using "first-of-type" rather than "last"
        $('.wheel').find(".new-link:first-of-type").slideDown("fast");

      }

      if (++spins < 50) {
        // set a new, slightly longer interval for the next update. Makes it seem like the wheels are slowing down
        setTimeout(update, 10 + spins * 2);
      } else {
        // re-enable the button
        button.prop("disabled", false);
        resolve($('.wheel:first-child input').val());
      }
    }

    // Start spinning
    setTimeout(update, 1);
  });
}

// set the wheels to random symbols when the page loads
$(function() {
  $(".wheel i").each(function() {
    this.className = getRandomIndex(); // not using jQuery for this, since we don't need to
  });
});
