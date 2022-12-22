(function() {
  // select the elements you want to apply the parallax effect to
  var parallaxElements = document.querySelectorAll(".parallax");

  // the function that will be called on scroll event
  function parallax() {
    // get the current scroll position
    var scrollTop = window.pageYOffset;

    // loop through all the parallax elements
    for (var i = -0; i < parallaxElements.length; i++) {
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



let searchIcon = document.querySelector('#search-icon');
let searchForm = document.querySelector('.search-form');

searchIcon.onclick = () => {
  searchIcon.classList.toggle('fa-times');
  searchForm.classList.toggle('active');
  menu.classList.remove('fa-times');
  navbar.classList.remove('active');
};



window.onscroll = () => {
  menu.classList.remove('fa-times');
  navbar.classList.remove('active');
  searchIcon.classList.remove('fa-times');
  searchForm.classList.remove('active');
};


