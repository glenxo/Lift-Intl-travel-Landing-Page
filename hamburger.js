const menuBtn = document.querySelector('#menu-btn');
const navbar = document.querySelector('.navbar');

menuBtn.addEventListener('click', () => {
  navbar.classList.toggle('show');
});

window.addEventListener('click', (e) => {
  if (
    e.target !== menuBtn &&
    !navbar.contains(e.target) &&
    navbar.classList.contains('show')
  ) {
    navbar.classList.remove('show');
  }
});