// Wrap every letter in a span
var textWrapper = document.querySelector(".ml11 .letters");
var textWrapper1 = document.querySelector(".ml11 .letters1");
textWrapper.innerHTML = textWrapper.textContent.replace(
  /([^\x00-\x80]|\w|\W)/g,
  "<span class='letter'>$&</span>"
);
textWrapper1.innerHTML = textWrapper1.textContent.replace(
  /([^\x00-\x80]|\w|\W)/g,
  "<span class='letter'>$&</span>"
);

anime
  .timeline({ loop: false })
  .add({
    targets: ".ml11 .line",
    scaleY: [0, 1],
    opacity: [0.5, 1],
    easing: "easeOutExpo",
    duration: 700,
  })
  .add({
    targets: ".ml11 .line",
    translateX: [
      0,
      document.querySelector(".ml11 .letters").getBoundingClientRect().width +
        10,
    ],
    translateX: [
      0,
      document.querySelector(".ml11 .letters1").getBoundingClientRect().width +
        10,
    ],
    easing: "easeOutExpo",
    duration: 700,
    delay: 100,
  })
  .add({
    targets: ".ml11 .letter",
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 600,
    offset: "-=775",
    delay: function (el, i) {
      return 34 * (i + 1);
    },
  })
  .add({
    targets: ".ml11",
    /* opacity: 0, */
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000,
  });
