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

let prevScrollPos = window.pageYOffset;
const menuBar = document.querySelector('.bar-menu');

window.addEventListener('scroll', () => {
  const currentScrollPos = window.pageYOffset;
  
  if (prevScrollPos > currentScrollPos) {
    menuBar.classList.remove('hidden');
  } else {
    menuBar.classList.add('hidden');
  }
  
  prevScrollPos = currentScrollPos;
});


const links = document.querySelectorAll("a");

links.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("active");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const slideshowItems = document.querySelectorAll('#slideshow li');
  let currentItemIndex = 0;

  function showNextItem() {
    slideshowItems[currentItemIndex].classList.remove('active');
    currentItemIndex = (currentItemIndex + 1) % slideshowItems.length;
    slideshowItems[currentItemIndex].classList.add('active');
  }

  setInterval(showNextItem, 4000); // Change slide every 3 seconds (3000 milliseconds)

  window.addEventListener("scroll", function () {
    // No effects on destination section's image
  });
});
