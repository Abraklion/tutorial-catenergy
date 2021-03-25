
const buttonBurger = document.querySelector(".js-burger");

const buttonNav = document.querySelector(".js-nav");


// меню
buttonBurger.addEventListener("click", function (evt) {
  evt.preventDefault();

  if(buttonBurger.classList.contains("header_burger--close")){

    buttonBurger.classList.remove("header_burger--close");
    buttonNav.classList.remove("header__nav--active");

  }else {

    buttonBurger.classList.add("header_burger--close");
    buttonNav.classList.add("header__nav--active");

  }

})
