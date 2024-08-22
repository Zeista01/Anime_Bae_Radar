document.addEventListener("scroll", function() {
    var dropdownContent = document.querySelector(".dropdown-content");
    if (window.scrollY === 0) {
        dropdownContent.classList.add("show");
    } else {
        dropdownContent.classList.remove("show");
    }
});