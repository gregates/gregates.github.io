function toggleShown(selector) {
  var nav = document.getElementsByClassName(selector)[0];
  if ( nav.className === selector ) {
    nav.className = selector + " hide";
  } else {
    nav.className = selector;
  }
}
