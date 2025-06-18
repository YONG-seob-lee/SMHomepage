console.log("main.js loaded")

const header = document.querySelector("header");
const sections = document.querySelectorAll(".scroll-section");
let lastScrollTop = 0;

window.addEventListener("scroll", () => {
    const navLinks = document.querySelectorAll("nav a");
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const delta = currentScroll - lastScrollTop;

    if(delta > 0)
    {
        header.classList.add("hide");
    } else if(delta < 0)
    {
        header.classList.remove("hide");
    }

    lastScrollTop = currentScroll;;

    let current ="";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if(pageYOffset >= sectionTop - sectionHeight / 3)
        {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if(link.getAttribute("href") === `#${current}`)
        {
            link.classList.add("active");
        }
    })
});


let currentIndex = 0;
let isScrolling = false;
let readyToScrollNext = false;

function scrollToSection(index){
    if(index <0 || index >= sections.length) return;
    isScrolling = true;
    sections[index].scrollIntoView({ behavior: "smooth"});
    currentIndex = index;
    readyToScrollNext = false; // 초기화

    // 스크롤 락 해제 지연시간 (섹션 이동 후 잠시 후 해제)
    setTimeout(() => {
        isScrolling = false;
    }, 800); // 1초 정도 기다린 후 다시 스크롤 가능
}

window.addEventListener("wheel", (e) => {
    if(isScrolling) return;

    const currentSection = sections[currentIndex];
    const sectionBottom = currentSection.offsetTop + currentSection.offsetHeight;
    const viewportBottom = window.scrollY + window.innerHeight;

    // 유저가 섹션 바닥에 도달했는지 여부 판단
    const atBottom = viewportBottom >= sectionBottom - 10;

    if(e.deltaY > 0) {
        if(atBottom){
            if(readyToScrollNext){
                scrollToSection(currentIndex + 1);
            } else {
                readyToScrollNext = true;
                console.log(" 다음 스크롤 시 자동 이동 예정");
            }
        } else {
            readyToScrollNext = false;
        }
    } else if(e.deltaY < 0){
        if(readyToScrollNext && currentIndex > 0){
            scrollToSection(currentIndex - 1);
        } else {
            readyToScrollNext = true;
        }
    }
});