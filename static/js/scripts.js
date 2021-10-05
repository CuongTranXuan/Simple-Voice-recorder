//Get the button
// When the user scrolls down 20px from the top of the document, show the button

var firstSubMenuOffsetTop = 0;
var lastScrollTop = 0;
var myTimeout;

window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  var backToTop = document.getElementById("backToTop");

  if (backToTop) {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      backToTop.style.display = "block";
    } else {
      backToTop.style.display = "none";
    }
  }

  var leftSection = document.getElementById("leftSection");
  var parentLeftSection = document.getElementById("parentLeftSection");
  var footer = document.getElementsByClassName("footer-site")[0];
  if (leftSection && window.innerWidth >= 768) {
    var sticky = leftSection.offsetHeight - window.innerHeight + 100;

    if (window.pageYOffset > sticky) {
      leftSection.classList.add("sticky-bottom");
      leftSection.style.width = `${parentLeftSection.clientWidth - 15}px`;

      if (window.pageYOffset + window.innerHeight > footer.offsetTop) {
        leftSection.style.bottom = `${footer.offsetHeight + 70}px`;
      } else {
        leftSection.style.bottom = `10px`;
      }
    } else {
      leftSection.classList.remove("sticky-bottom");
      leftSection.style.width = `auto`;
    }
  }

  var st = window.pageYOffset || document.documentElement.scrollTop;

  // Sub MENU Sticky
  var listIcons = document.getElementById("listIcons");
  var listIconsSticky = document.getElementById("listIconsSticky");
  var bigBoxs = document.getElementsByClassName("list-boxs-big")[0];

  var subMenu = document.getElementById("sub-menu");
  var subMenuContent = document.getElementById("sub-menu-content");

  var subMenuOffsetTop = subMenuContent && subMenuContent.offsetTop - 66;

  if (window.pageYOffset > subMenuOffsetTop - 66) {
    if (subMenu) {
      subMenu.classList.add("sticky");
      // subMenu.style.width =
      //   document.getElementsByClassName("tab-boxs")[0].width + "px";
      // console.log(document.getElementsByClassName("tab-boxs")[0].width + "px");
    }
    if (listIcons) listIcons.style.display = "none";
    if (listIconsSticky) listIconsSticky.style.display = "block";
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      if (bigBoxs) bigBoxs.style.paddingTop = "185px";
    }

    myTimeout && clearTimeout(myTimeout);

    if (st > lastScrollTop) {
      // downscroll code
      if (listIconsSticky) listIconsSticky.style.display = "none";
    } else {
      // upscroll code
      myTimeout = setTimeout(function() {
        if (listIconsSticky) listIconsSticky.style.display = "none";
      }, 5000);
    }
  } else {
    subMenu && subMenu.classList.remove("sticky");
    if (listIcons) listIcons.style.display = "block";
    if (listIconsSticky) listIconsSticky.style.display = "none";
    if (bigBoxs) bigBoxs.style.paddingTop = "0px";
  }

  lastScrollTop = st <= 0 ? 0 : st;
}
