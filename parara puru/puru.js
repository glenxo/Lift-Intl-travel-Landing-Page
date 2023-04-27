window.addEventListener("resize", () => {
  if (window.innerWidth >= 1200) {
    menu.classList.remove("fa-times");
    header.classList.remove("active");
    document.body.classList.remove("active");
  }next
});

  window.addEventListener("load", function () {
  const loader = document.querySelector(".preloader");
  const content = document.querySelector(".content");
  setTimeout(function () {
    loader.style.display = "none";
    content.style.display = "block";
  }, 2000); // Change this value to control how long the pre-loader displays for
});

var initialTransforms = {};

// Loop through each image
for (var i = 1; i <= 6; i++) {
  var img = document.getElementById("image" + i);
  initialTransforms["image" + i] = img.style.transform;

  img.onclick = function() {
    this.style.transform = "scale(2)";

  };

  
  window.onscroll = function() {
    for (var j = 1; j <= 6; j++) {
      var img = document.getElementById("image" + j);
      img.style.transform = initialTransforms["image" + j];
      
    }
  };
}

(function () {
  const parallaxElements = document.querySelectorAll(".parallax");
  function parallax() {
    const scrollTop = window.pageYOffset;
    for (let i = 0; i < parallaxElements.length; i++) {
      const element = parallaxElements[i];
      const speed = element.getAttribute("data-parallax-speed");
      element.style.backgroundPositionY = scrollTop * speed + "px";
    }
  }

  window.addEventListener("scroll", parallax);
})();