const Marked = window.marked;
String.prototype.format = function (args) {
  let result = this;
  if (arguments.length < 1) {
    return result;
  }
  let data = arguments;
  if (arguments.length == 1 && typeof (args) == "object") {
    data = args;
  }
  for (let key in data) {
    let value = data[key];
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
  if (!pathname) {
    pathname = window.location.pathname
  }
  let names = pathname.split("/")
  if (desc === false) {
    for (let i = names.length - 1; i >= 0; --i) {
      let name = names[i].trim()
      if (name.length > 0 && name !== "/" && name !== "index.html") {
        return name
      }
    }
  } else {
    for (let i = 0; i < names.length; ++i) {
      let name = names[i].trim()
      if (name.length > 0 && name !== "/" && name !== "index.html") {
        return name
      }
    }
  }
  return "/"
}

const generateToc = () => {
  if (document.body.clientWidth < 768) {
    return;
  }
  $("#sidebar-header").append("<span> Table of Contents </span>");
  let sidebar = $("#sidebar"),
    app = $("#app"),
    topBtn = $(".back-to-top"),
    sideIcon = $("#sidebar-icon");
  let srcs = {
    true: '/icon/outdent.svg',
    false: '/icon/indent.svg'
  }
  let isOpen = true;
  let line = 150;
  sideIcon.attr('src', srcs[isOpen]);
  app.addClass("sidebar-active");
  sidebar.addClass("sidebar-active");
  if (document.body.clientWidth <= 768) {
    topBtn.attr("style", "right: calc(2rem + {line}px);".format({
      line: line + 50
    }));
    sideIcon.attr("style", "right: calc(2rem + {line}px);".format({
      line: line - 50
    }));
    line = 100;
  } else {
    topBtn.attr("style", "right: calc(2rem + {line}px);".format({
      line: line + 100
    }));
    sideIcon.attr("style", "right: calc(2rem + {line}px);".format({
      line: line
    }));
  }
  topBtn.addClass("sidebar-active");
  sideIcon.on("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      sidebar.attr("style", "right: {line}px".format({
        line: 0
      }))
      sideIcon.attr("style", "right: calc(2rem + {line}px);".format({
        line: line
      }))
      app.attr("style", "margin-right: {}px".format(line + 100))
    } else {
      sidebar.attr("style", "right: {line}px".format({
        line: -line - 100
      }))
      sideIcon.attr("style", "right: calc(2rem + {line}px);".format({
        line: 20
      }))
      app.attr("style", "margin-right: {line}px".format({
        line: 50
      }))
    }
    sideIcon.attr('src', srcs[isOpen]);
  })

  $(".markdown-body")
    .find("h2,h3,h4,h5,h6")
    .each(function (i, item) {
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
  $("#sidebar-toc").on("click", "li", function () {
    let idName = $(this)
      .find("a")
      .data("id");
    $("html, body").animate({
      scrollTop: $(idName).offset().top - $(".header-wrap").height()
    }, {
      duration: 500,
      easing: "swing"
    });
    return false;
  });
}

window.onload = function () {

  let searchWrapper = document.getElementById("search-wrapper");
  let searchResult = document.getElementById("search-result");
  searchWrapper.onmouseover = () => {
    document.getElementById("search-result-list").classList.remove("nav-menu--dropdown")
  }
  searchWrapper.onmouseout = () => {
    searchResult.classList.remove("nav-menu--dropdown");
  }


  // xhr加载数据
  function loadData(callback) {
    $.ajax({
      url: "/content.json",
      success: callback
    });
  }
  // 匹配文章内容返回结果
  function matcher(post, regExp) {
    // 匹配优先级：title > tags > text
    return regExp.test(post.title) || post.tags.some(function (tag) {
      return regExp.test(tag.name);
    }) || regExp.test(post.text);
  }
  // 渲染到页面
  function render(data) {
    searchResult.style.visibility = "visible"

    let result = '\
    <li class="item"> \
      <a href="{path}" class="waves-block waves-effect"> \
        <div class="flex-title ellipsis" >{title}</div> \
        <div class="flex-time">{date} </div>\
      </a> \
    </li> \
    '

    let resultList = []

    for (let key in data) {
      let item = data[key]

      let date = item.date.substring(0, 10)

      resultList.push(
        result.format({
          path: item.path,
          title: item.title,
          date: date
        })
      )
    }
    $("#search-result-list").html(
      resultList.join("")
    )
    $("search-result-list").removeClass("nav-menu--dropdown")

  }
  // 查询
  function search(key) {
    if (key == "") {
      render(null);
      return;
    }
    let regExp = new RegExp(key.replace(/[ ]/g, '|'), 'gmi');
    loadData(function (data) {
      let result = data.posts.filter(function (post) {
        return matcher(post, regExp);
      });
      render(result);
    });
  }

  let serchInput = document.getElementById("nav-search-btn");
  serchInput.onchange = () => {
    search(serchInput.value)
  }

}