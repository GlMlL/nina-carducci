(function($) {
  $.fn.mauGallery = function(options) {
    // J'ai utilisé $.extend pour combiner les options par défaut avec celles fournies par l'utilisateur.
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function() {
      // J'ai ajouté un wrapper pour la rangée des éléments de la galerie.
      $.fn.mauGallery.methods.createRowWrapper($(this));

      if (options.lightBox) {
        // J'ai créé une boîte de lumière si l'option est activée.
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      // J'ai initialisé les écouteurs d'événements.
      $.fn.mauGallery.listeners(options);

      $(this).children(".gallery-item").each(function(index) {
        // J'ai rendu chaque élément d'image réactif.
        $.fn.mauGallery.methods.responsiveImageItem($(this));
        // J'ai déplacé l'élément dans le wrapper de la rangée.
        $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
        // J'ai enveloppé chaque élément dans une colonne en fonction du nombre de colonnes spécifié.
        $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

        var theTag = $(this).data("gallery-tag");
        // J'ai vérifié si les tags doivent être affichés et ajouté les nouveaux tags à la collection.
        if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
          tagsCollection.push(theTag);
        }
      });

      if (options.showTags) {
        // J'ai affiché les tags des éléments de la galerie.
        $.fn.mauGallery.methods.showItemTags($(this), options.tagsPosition, tagsCollection);
      }

      // J'ai ajouté une animation de fondu pour faire apparaître la galerie.
      $(this).fadeIn(500);
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
    // J'ai ajouté un écouteur d'événements pour les clics sur les éléments de la galerie.
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        // J'ouvre la boîte de lumière si l'image est cliquée.
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // J'ai ajouté des écouteurs pour les liens de navigation.
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    $(".gallery").on("click", ".mg-prev", () => 
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );

    $(".gallery").on("click", ".mg-next", () => 
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );

    // J'ai ajouté la navigation au clavier pour passer d'une image à l'autre.
    $(document).on("keydown", function(e) {
      if (e.key === "ArrowLeft") {
        $.fn.mauGallery.methods.prevImage(options.lightboxId);
      }
      if (e.key === "ArrowRight") {
        $.fn.mauGallery.methods.nextImage(options.lightboxId);
      }
    });
  };

  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      // J'ai vérifié si l'élément a déjà une classe "row" avant d'ajouter le wrapper.
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      // J'ai ajouté des vérifications pour savoir si le nombre de colonnes est un nombre ou un objet.
      if (columns.constructor === Number) {
        element.wrap(`<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`);
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        if (columns.sm) columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        if (columns.md) columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        if (columns.lg) columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        if (columns.xl) columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;

        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        // J'ai ajouté un message d'erreur pour informer que le type n'est pas supporté.
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },

    moveItemInRowWrapper(element) {
      // J'ai déplacé l'élément dans la rangée des éléments de la galerie.
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      // J'ai ajouté une classe pour rendre l'image fluide si c'est un élément IMG.
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      // J'ai mis à jour la source de l'image dans la boîte de lumière.
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", element.attr("src"));
      // J'ai utilisé "modal" pour afficher la boîte de lumière.
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
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      let index = 0, next = null;
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i - 1;
        }
      });

      next = imagesCollection[index] || imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
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
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      let index = 0, next = null;
      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i + 1;
        }
      });

      next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    createLightBox(gallery, lightboxId, navigation) {
      // J'ai construit la boîte de lumière et inclus les options de navigation.
      gallery.append(`
        <div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body" role="dialog" aria-hidden="true">
                <div class="mg-prev" role="button" aria-label="Image précédente" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;">
                  ${navigation ? '<' : '<span style="display:none;" />'}
                </div>
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale"/>
                <div class="mg-next" role="button" aria-label="Image suivante" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">
                  ${navigation ? '>' : '<span style="display:none;" />'}
                </div>
              </div>
            </div>
          </div>
        </div>
      `);
    },

    showItemTags(gallery, position, tags) {
      // J'ai construit une liste de tags à afficher dans la galerie.
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active"><span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });

      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        // J'ai ajouté un message d'erreur pour les positions de tags non reconnues.
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      // J'ai vérifié si le tag est déjà actif avant de le changer.
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active.active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag active");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this).parents(".item-column").hide();
        if (tag === "all") {
          $(this).parents(".item-column").show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show(300);
        }
      });
    }
  };
})(jQuery);
