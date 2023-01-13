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

document.addEventListener("DOMContentLoaded", function() {
  let currentImg = null;
  const images = document.querySelectorAll("img");
  images.forEach(function(img) {
    img.addEventListener("click", function() {
      if (currentImg) {
        currentImg.style.filter = "none";
      }
      img.style.filter = "blur(3px)";
      currentImg = img;
    });
  });
  
  window.addEventListener("scroll", function() {
    if (currentImg) {
      currentImg.style.filter = "none";
      currentImg = null;
    }
  });
});

document.addEventListener("DOMContentLoaded", function() {
  let currentImg = null;
  let currentP = null;
  const images = document.querySelectorAll("img");
  images.forEach(function(img) {
    img.addEventListener("click", function() {
      if (currentImg) {
        currentP.style.display = "none";
        currentImg.style.filter = "none";
      }
      
      //create and append the paragraph element
      let p = document.createElement("p");
      p.innerHTML = img.dataset.text;
      p.style.position = "absolute";
      p.style.top = "50%";
      p.style.left = "50%";
      p.style.transform = "translate(-50%, -50%)";
      p.style.textAlign = "center";
      p.style.color = "white";
      img.parentNode.appendChild(p);
      
      img.style.filter = "blur(3px)";
      currentImg = img;
      currentP = p;
    });
  });
  
  window.addEventListener("scroll", function() {
    if (currentImg) {
      currentP.style.display = "none";
      currentImg.style.filter = "none";
      currentImg = null;
      currentP = null;
    }
  });
});
