'use strict'

var gregates = {
  toggleShown: function(selector, forceHide) {
    var nav = document.getElementsByClassName(selector);
    for ( var i = 0; i < nav.length; i++ ) {
      if ( nav[i].className === selector || forceHide === true ) {
        nav[i].className = selector + " hide";
      } else {
        nav[i].className = selector;
      };
    };
  },
  closeMenus: function() {
    gregates.toggleShown('nav', true);
    gregates.toggleShown('dropdown-menu', true);
  },
  setActiveNav: function() {
    var id = "nav-" + window.location.pathname.split('/')[1];
    var link = document.getElementById(id);
    if ( link === null ) { return; };
    link.className = link.className + " active";
  }
}

document.addEventListener("DOMContentLoaded", function(){
  var main = document.getElementsByTagName('main')[0];
  var sidebar = document.getElementsByTagName('sidebar')[0];
  var nav = document.getElementsByClassName('navbar-toggle')[0];
  var dropdown = document.querySelectorAll('.dropdown a')[0];
  main.addEventListener('click', function(){ gregates.closeMenus(); });
  if ( sidebar !== undefined ) {
    sidebar.addEventListener('click', function(){ gregates.closeMenus(); });
  };
  nav.addEventListener('click', function(evt){ gregates.toggleShown('nav'); });
  dropdown.addEventListener('click', function(evt){ gregates.toggleShown('dropdown-menu'); });
  gregates.setActiveNav();
});
