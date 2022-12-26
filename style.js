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
  if (window.innerWidth >= 1200) {
    menu.classList.remove("fa-times");
    header.classList.remove("active");
    document.body.classList.remove("active");
  }
}); 


const links = document.querySelectorAll("a");

links.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("active");
  });
});



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


