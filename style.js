let menu = document.querySelector("#menu-btn");
let header = document.querySelector(".header");

menu.onclick = () => {
  console.log("Menu clicked");
  menu.classList.toggle("fa-times");
  header.classList.toggle("active");
  document.body.classList.toggle("active");
};

header.addEventListener("click", (event) => {
  if (event.currentTarget.matches("a, tag, anchor")) {
    menu.classList.remove("fa-times");
    header.classList.remove("active");
    document.body.classList.remove("active");
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth < 1200) {
    menu.classList.remove("fa-times");
    header.classList.remove("active");
    document.body.classList.remove("active");
  }
});

(function () {
  // select the elements you want to apply the parallax effect to
  var parallaxElements = document.querySelectorAll(".parallax");

  // the function that will be called on scroll event
  function parallax() {
    // get the current scroll position
    var scrollTop = window.pageYOffset;

    // loop through all the parallax elements
    for (var i = 0; i < parallaxElements.length; i++) {
      // get the current parallax element
      var element = parallaxElements[i];

      // get the element's speed
      var speed = element.getAttribute("data-parallax-speed");

      // set the element's background position using the scroll position and the speed
      element.style.backgroundPositionY = scrollTop * speed + "px";
    }
  }

  // listen for the scroll event
  window.addEventListener("scroll", parallax);
})();

