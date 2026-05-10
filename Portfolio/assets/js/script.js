'use strict';

// element toggle function
const elementToggleFunc = function (elem) {
  elem.classList.toggle("active"); 
};

// SIDEBAR
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

if (sidebarBtn) {
  sidebarBtn.addEventListener("click", function () {
    elementToggleFunc(sidebar);
  });
}

// TESTIMONIALS MODAL
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

const testimonialsModalFunc = function () {
  if (modalContainer && overlay) {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  }
};

testimonialsItem.forEach(item => {
  item.addEventListener("click", function () {

    if (modalImg && modalTitle && modalText) {
      modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
      modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
      modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
      modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
    }

    testimonialsModalFunc();
  });
});

if (modalCloseBtn) modalCloseBtn.addEventListener("click", testimonialsModalFunc);
if (overlay) overlay.addEventListener("click", testimonialsModalFunc);

// CUSTOM SELECT
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) {
  select.addEventListener("click", function () {
    elementToggleFunc(this);
  });
}

selectItems.forEach(item => {
  item.addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();

    if (selectValue) selectValue.innerText = this.innerText;

    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
});

// FILTER
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  filterItems.forEach(item => {

    if (selectedValue === "all") {
      item.classList.add("active");
    } else if (selectedValue === item.dataset.category) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }

  });

};

// FILTER BUTTONS
let lastClickedBtn = filterBtn[0];

filterBtn.forEach(btn => {

  btn.addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();

    if (selectValue) selectValue.innerText = this.innerText;

    filterFunc(selectedValue);

    if (lastClickedBtn) lastClickedBtn.classList.remove("active");

    this.classList.add("active");

    lastClickedBtn = this;

  });

});

// CONTACT FORM VALIDATION
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

formInputs.forEach(input => {

  input.addEventListener("input", function () {

    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });

});

// PAGE NAVIGATION
const navLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navLinks.forEach(link => {

  link.addEventListener("click", function () {

    const targetPage = this.getAttribute("data-nav-link");

    navLinks.forEach(l => l.classList.remove("active"));
    pages.forEach(p => p.classList.remove("active"));

    this.classList.add("active");

    const page = document.querySelector(`[data-page="${targetPage}"]`);
    if (page) page.classList.add("active");

  });

});