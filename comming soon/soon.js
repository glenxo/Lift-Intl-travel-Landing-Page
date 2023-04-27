window.addEventListener("load", function () {
  const loader = document.querySelector(".preloader");
  const content = document.querySelector(".content");
  setTimeout(function () {
    loader.style.display = "none";
    content.style.display = "block";
  }, 2000); // Change this value to control how long the pre-loader displays for
});