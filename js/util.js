const Marked = window.marked;
String.prototype.format = function(args) {
  var result = this;
  if (arguments.length < 1) {
      return result;
  }
  var data = arguments;        
  if (arguments.length == 1 && typeof (args) == "object") {
      data = args;
  }
  for (var key in data) {
      var value = data[key];
      if (undefined != value) {
          result = result.replace("{" + key + "}", value);
      }
  }
  return result;
}

// Marked.setOptions({
//   highlight: (code, lang) =>
//     Prism.highlight(code, Prism.languages[lang || "markup"], lang || "markup")
// });

const mdToHTML = content => Marked(content)

const getRealPath = (pathname, desc = false) => {
  if(!pathname) {
    pathname = window.location.pathname
  }
  let names = pathname.split("/")
  if(desc === false) {
    for(let i = names.length - 1; i >= 0; --i) {
      let name = names[i].trim()
      if(name.length > 0 && name !== "/" && name !== "index.html") {
        return name
      }
    }
  } else {
    for(let i = 0 ; i < names.length; ++i) {
      let name = names[i].trim()
      if(name.length > 0 && name !== "/" && name !== "index.html") {
        return name
      }
    }
  }
  return "/"
}

const generateToc = () => {
  if(document.body.clientWidth < 768) {
    return;
  }
  $("#sidebar-header").append("<span> Table of Contents </span>");
  let sidebar = $("#sidebar"),
    app = $("#app"),
    topBtn = $(".back-to-top"),
    sideIcon = $("#sidebar-icon");
  let srcs = {
    true:'/icon/outdent.svg',
    false:'/icon/indent.svg'
  }
  let isOpen = true;
  let line = 150;
  sideIcon.attr('src',srcs[isOpen]);
  app.addClass("sidebar-active");
  sidebar.addClass("sidebar-active");
  if (document.body.clientWidth <= 768) {
    topBtn.attr("style", "right: calc(2rem + {line}px);".format({line:line+50}));
    sideIcon.attr("style","right: calc(2rem + {line}px);".format({line:line-50}));
    line = 100;
  } else {
    topBtn.attr("style", "right: calc(2rem + {line}px);".format({line:line+100}));
    sideIcon.attr("style","right: calc(2rem + {line}px);".format({line:line}) );
  }
  topBtn.addClass("sidebar-active");
  sideIcon.on("click",function(){
    isOpen = !isOpen;
    if(isOpen){
      sidebar.attr("style","right: {line}px".format({line:0}))
      sideIcon.attr("style","right: calc(2rem + {line}px);".format({line:line}))
      app.attr("style","margin-right: {}px".format(line+100))
    }else{
      sidebar.attr("style","right: {line}px".format({line:-line-100}))
      sideIcon.attr("style","right: calc(2rem + {line}px);".format({line:20}))
      app.attr("style","margin-right: {line}px".format({line:50}))
    }
    sideIcon.attr('src',srcs[isOpen]);
  })
  
  $(".markdown-body")
    .find("h2,h3,h4,h5,h6")
    .each(function(i, item) {
      let tag = $(item).get(0).localName;
      let tagID = $(item)
        .text()
        .replace(/\s{2}/g, "");
      let idName = $(item).attr("id");
      $("#sidebar-toc").append(`
      <li class="toc-${tag}">
        <a data-id=#${idName}>
          ${tagID}
        </a>
      </li>
    `);
    });
  $("#sidebar-toc").on("click", "li", function() {
    let idName = $(this)
      .find("a")
      .data("id");
    $("html, body").animate(
      {
        scrollTop: $(idName).offset().top - $(".header-wrap").height()
      },
      { duration: 500, easing: "swing" }
    );
    return false;
  });
}

