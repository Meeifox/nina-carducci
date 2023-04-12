(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
          );
        }
        $.fn.mauGallery.listeners(options);
        
        $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
            ) {
              tagsCollection.push(theTag);
            }
          });
          
          if (options.showTags) {
            $.fn.mauGallery.methods.showItemTags(
              $(this),
              options.tagsPosition,
              tagsCollection
              );
            }
          });
        };
        $.fn.mauGallery.defaults = {
          columns: 3,
          lightBox: true,
          lightboxId: null,
          showTags: true,
          tagsPosition: "bottom",
          navigation: true
        };


        $.fn.mauGallery.listeners = function(options) {
          const $gallery = $(".gallery");
        
          $gallery.on("click keydown", ".gallery-item", function(event) {
            const $this = $(this);
        
            if (options.lightBox && $this.prop("tagName") === "IMG") {
              if (event.type === "click" || (event.type === "keydown" && event.which === 13)) {
                $.fn.mauGallery.methods.openLightBox($this, options.lightboxId);
              }
            } else {
              return;
            }
          });
        
          $gallery.on("keydown", function(event) {
            const keyCode = event.which;
            if (keyCode === 37 || keyCode === 39) {
              const isPrev = keyCode === 37;
              const method = isPrev ? "prevImage" : "nextImage";
              $.fn.mauGallery.methods[method](options.lightboxId);
            }
          });
        
          $gallery.on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
        
          $gallery.on("keypress", ".nav-link", function(event) {
            if (event.which === 13) {
              event.preventDefault();
              $(this).click();
            }
          });
        
          $gallery.on("click keydown", ".mg-prev, .mg-next", function(event) {
            const $this = $(this);
            const isPrev = $this.hasClass("mg-prev");
            const isNext = $this.hasClass("mg-next");
        
            if ((isPrev || isNext) && (event.type === "click" || (event.type === "keydown" && (event.which === 37 || event.which === 39)))) {
              const method = isPrev ? "prevImage" : "nextImage";
              $.fn.mauGallery.methods[method](options.lightboxId);
            }
          });
        };
        
        
        $.fn.mauGallery.methods = {
          createRowWrapper(element) {
            if (
              !element
              .children()
              .first()
              .hasClass("row")
              ) {
                element.append('<div class="gallery-items-row row"></div>');
              }
            },
            wrapItemInColumn(element, columns) {
              if (columns.constructor === Number) {
                element.wrap(
                  `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
                  );
                } else if (columns.constructor === Object) {
                  var columnClasses = "";
                  if (columns.xs) {
                    columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
                  }
                  if (columns.sm) {
                    columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
                  }
                  if (columns.md) {
                    columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
                  }
                  if (columns.lg) {
                    columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
                  }
                  if (columns.xl) {
                    columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
                  }
                  element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
                } else {
                  console.error(
                    `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
                    );
                  }
                },
                moveItemInRowWrapper(element) {
                  element.appendTo(".gallery-items-row");
                },
                responsiveImageItem(element) {
                  if (element.prop("tagName") === "IMG") {
                    element.addClass("img-fluid");
                  }
                },
                openLightBox(element, lightboxId) {
                  $(`#${lightboxId}`)
                  .find(".lightboxImage")
                  .attr("src", element.attr("src"))
                  .attr("alt", element.attr("alt"));
                  $(`#${lightboxId}`).modal("toggle");
                },
                prevImage() {
                  let activeImage = null;
                  $("img.gallery-item").each(function() {
                    if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
                      activeImage = $(this);
                    }
                  });
                  let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
                  let imagesCollection = [];
                  if (activeTag === "all") {
                    $(".item-column").each(function() {
                      if ($(this).children("img").length) {
                        imagesCollection.push($(this).children("img"));
                      }
                    });
                  } else {
                    $(".item-column").each(function() {
                      if (
                        $(this)
                        .children("img")
                        .data("gallery-tag") === activeTag
                        ) {
                          imagesCollection.push($(this).children("img"));
                        }
                      });
                    }
                    let index = 0,
                    next = null;
                    
                    $(imagesCollection).each(function(i) {
                      if ($(activeImage).attr("src") === $(this).attr("src")) {
                        index = i ;
                      }
                    });
                    next =
                    imagesCollection[index-1] ||
                    imagesCollection[imagesCollection.length - 1];
                    $(".lightboxImage").attr("src", $(next).attr("src")).attr("alt", $(next).attr("alt"));
                  },
                  nextImage() {
                    let activeImage = null;
                    $("img.gallery-item").each(function() {
                      if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
                        activeImage = $(this);
                      }
                    });
                    let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
                    let imagesCollection = [];
                    if (activeTag === "all") {
                      $(".item-column").each(function() {
                        if ($(this).children("img").length) {
                          imagesCollection.push($(this).children("img"));
                        }
                      });
                    } else {
                      $(".item-column").each(function() {
                        if (
                          $(this)
                          .children("img")
                          .data("gallery-tag") === activeTag
                          ) {
                            imagesCollection.push($(this).children("img"));
                          }
                        });
                      }
                      let index = 0,
                      next = null;
                      
                      $(imagesCollection).each(function(i) {
                        if ($(activeImage).attr("src") === $(this).attr("src")) {
                          index = i;
                        }
                      });
                      next = imagesCollection[index+1] || imagesCollection[0];
                      $(".lightboxImage").attr("src", $(next).attr("src")).attr("alt", $(next).attr("alt"));
                    },
                    
                    createLightBox(gallery, lightboxId, navigation) {
                      gallery.append(`<div class="modal fade" id="${ lightboxId ? lightboxId : "galleryLightbox"}"tabindex="-1" role="dialog" aria-hidden="true">
                      <div class="modal-dialog" role="document">
                      <div class="modal-content">
                      <div class="modal-body">
                      ${
                        navigation
                        ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;" role="button" aria-label="Previous"><</div>'
                        : '<span style="display:none;" />'
                      }
                      <div class="tab-content" role="tabpanel"><img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                      </div>
                      ${
                        navigation
                        ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;" role="button" aria-label="Next">></div>'
                        : '<span style="display:none;" />'
                      }
                      </div>
                      </div>
                      </div>
                      </div>`);
                      
                    },
                   
                    showItemTags(gallery, position, tags) {
                      var tagsRow = $(`<ul class="my-4 tags-bar nav nav-pills"></ul>`);
                      if (position === "bottom") {
                        gallery.append(tagsRow);
                      } else if (position === "top") {
                        gallery.prepend(tagsRow);
                      } else {
                        console.error(`Unknown tags position: ${position}`);
                      }
                      tagsRow.append('<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all"tabindex="0">Tous</span></li>');
                      $.each(tags, function(index, value) {
                        tagsRow.append('<li class="nav-item active"><span class="nav-link" data-images-toggle="' + value + '" tabindex="0">' + value + '</span></li>');
                    });
                      
                    }, 

                    filterByTag() {
                      if ($(this).hasClass("active-tag")) {
                        return;
                      }
                      $(".active-tag").removeClass("active active-tag");
                      $(this).addClass("active-tag");
                      
                      var tag = $(this).data("images-toggle");
                      
                      $(".gallery-item").each(function() {
                        $(this)
                        .parents(".item-column")
                        .hide();
                        if (tag === "all") {
                          $(this)
                          .parents(".item-column")
                          .show(300);
                        } else if ($(this).data("gallery-tag") === tag) {
                          $(this)
                          .parents(".item-column")
                          .show(300);
                        }
                        
                      });
                    }                         
                    
                  };
                })(jQuery);