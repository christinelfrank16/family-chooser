// References https://stackoverflow.com/questions/44704735/how-can-i-have-a-slot-machine-effect-using-jquery-and-css

var results = [
  'Christine',
  'Ian',
  'Adrianne',
  'Sean',
  'Katherine',
  'Bob',
  'Maureen'
];

$(document).ready(function(){
  results.forEach(el => {
    console.log(el);
    console.log($("<option></option>").val(el).html(el));
    $("#name").after($("<option></option>").val(el).html(el));
  });
});


function removeSelfAndSo(){
  var user = $("#user-name").val().toLowerCase();
}


// Get a random symbol class
function getRandomIndex() {
  return jQuery.rand(results);
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
$(document).on("click", ".wheel button", function() {
  var button = $(this);
  button.toggleClass("active");
  button.parent().toggleClass("hold");
  button.blur(); // get rid of the focus
});

$(document).on("click", "#spin", function() {
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
    }
  }

  // Start spinning
  setTimeout(update, 1);
});

// set the wheels to random symbols when the page loads
$(function() {
  $(".wheel i").each(function() {
    this.className = getRandomIndex(); // not using jQuery for this, since we don't need to
  });
});
