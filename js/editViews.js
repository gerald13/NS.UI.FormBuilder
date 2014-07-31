var formBuilder = (function(app) {

	/**
     * Basic edition view for all field edition view
     */
    app.views.BaseEditView = Backbone.View.extend({

        /**
         * Evenet intercepted by the view
         */
        events : {
            'click h2 > span:not(.selected)'   : 'displayOptions',
            'change .property'                 : 'updateModelAttribute'
        },

        /**
         * Constructor
         */
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'updateModelAttribute', 'changeModel');
            this.model.bind('change', this.render);
            this.subView = null;
        },

        /**
         * Display options by section level (simple or advanced)
         *
         * @param {object} e jQuery event
         */
        displayOptions: function(e) {
            $(".settings h2 > span").toggleClass('selected');
            if ($(e.target).prop('id') === "simple") {
                $('.advanced').addClass('hide', 500);
            } else {
                $('.advanced').removeClass('hide', 500);
            }
        },

        /**
         * Update model property when input value has changed
         *
         * @param {object} e jQuery event
         */
        updateModelAttribute: function(e) {
            if ($(e.target).prop("type") === "checkbox") {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).is(':checked'));
            } else {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).val());
            }
        },


        /**
         * Render view
         *
         * @returns {app.views.BaseView} view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);

            this.subView = new app.views[this.model.constructor.type + 'FieldEditView']({
               el : $('#subView') ,
               model : this.model
            });
            this.subView.render();
            $(this.el).i18n();

            //  Animate panel
            $('.dropArea').switchClass('span9', 'span7', 500);
            $('.widgetsPanel').switchClass('span3', 'span0', 500);

            return this;
        },

        changeModel : function(newModel) {
            $(this.el).unbind();
            $(this.subView.el).unbind();;

            this.model = newModel;
            this.model.bind('change', this.render);
            this.model.trigger('change');
        },

        /**
         * [getActions description]
         * @return {[type]}
         */
        getActions : function() {
            return {
                'save' : new NS.UI.NavBar.Action({
                    handler : function() {
                        if ($('.dropArea').hasClass('span7')) {
                            $('.dropArea').switchClass('span7', 'span9', 100);
                            $('.widgetsPanel').switchClass('span0', 'span3', 200);
                            app.instances.router.navigate("#", {
                                trigger : true
                            });
                        }
                    },
                    allowedRoles: ["reader"],
                    title: '<i class="fa fa-bars"></i> Save changes'
                })
            };
        }

    }, {
        templateSrc : '<div>'+
                        '   <h1 data-i18n="label.settings">Settings</h1>'+
                        '   <div>'+
                        '       <h2>'+
                        '           <span id="simple" class="selected" data-i18n="label.options.simple">Simple options</span> / '+
                        '           <span href="#" id="advanced" data-i18n="label.options.advanced" >Advanced options</span>'+
                        '       </h2>'+
                        //  Edition of common attribute like name (label and displayLabel)
                        '   <div class="hide advanced">' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">ID</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="number" data-attr="id" placeholder="Id" value="<%= id %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Label</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="label" placeholder="Label" value="<%= label %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Name label</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="name[label][value]" placeholder="Name label" value="<%= name["label"]["value"] %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Name label lang</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="name[label][lang]" placeholder="Name label lang" value="<%= name["label"]["lang"] %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div class="row-fluid">&nbsp;</div><div class="row-fluid">' +
                        '       <label class="span4 offset1">Required</label>' +
                        '           <input class="span2 property" data-attr="required" type="checkbox" <% if (required) { %> checked <% } %> />' +
                        '   </div>' +
                        '   <div class="row-fluid lastRow">&nbsp;</div><div class="row-fluid">' +
                        '       <label class="span4 offset1">Read only</label>' +
                        '           <input class="span2 property" data-attr="readOnly" type="checkbox" <% if (readOnly) { %> checked <% } %> />' +
                        '   </div>' +
                        //  end
                        '       <div id="subView"></div>' +
                        '       <div class="row-fluid">&nbsp;</div>'+
                        '   </div>' +
                        '   <div class="row-fluid">&nbsp;</div>'+
                        '</div>'
    });

	app.views.AutocompleteFieldEditView = Backbone.View.extend({

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },

        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },

    }, {
        templateSrc :   '<% _.each(["defaultValue", "hint", "url"], function(el) { %>' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1"><%= el %></label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="<%= el %>" placeholder="<%= el %>" value="<%= eval(el) %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '<% }) %>'
    });

    app.views.TextFieldEditView = Backbone.View.extend({

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },

        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },

    }, {
        templateSrc :   '<% _.each(["defaultValue", "hint", "size"], function(el) { %>' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1"><%= el %></label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="<%= el %>" placeholder="<%= el %>" value="<%= eval(el) %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '<% }) %>'
    });


    app.views.PatternFieldEditView = Backbone.View.extend({

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },

        /**
         * Render Pattern field edition view, the view contains an text field edition view
         *
         * @returns {PatternFieldEditView} current view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);

            var textView = new app.views.TextFieldEditView({
                el      : $('#subTextView'),
                model   : this.model
            });
            textView.render();

            return this;
        }

    }, {
        templateSrc :   '   <div id="subTextView"></div>' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Pattern</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="pattern" placeholder="Pattern" value="<%= pattern %>" />' +
                        '       </div>' +
                        '   </div>'
    });

    /**
     * File field edition view
     */
    app.views.FileFieldEditView = Backbone.View.extend({

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },

        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        }

    }, {
        templateSrc :   '   <% _.each(["defaultValue", "file", "mimeType"], function(el) {%> '+
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1"><%= el %></label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="text" data-attr="<%= el %>" placeholder="<%= el %>" value="<%= eval(el) %>" />' +
                        '           </div>' +
                        '       </div>' +
                        '   <% }); %>' +
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1">File max size</label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="number" data-attr="size" placeholder="Max file size" value="<%= size %>" />' +
                        '           </div>' +
                        '       </div>'
    });

    /**
     * Numeric field edition view
     */
    app.views.NumericFieldEditView = Backbone.View.extend({

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },

        /**
         * Render Pattern field edition view, the view contains an text field edition view
         *
         * @returns {PatternFieldEditView} current view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);

            var textView = new app.views.TextFieldEditView({
                el      : $('#subTextView'),
                model   : this.model
            });
            textView.render();

            return this;
        }

    }, {
        templateSrc :   '   <div id="subTextView"></div>' +
                        '   <% _.each(["minValue", "maxValue", "precision", "unity"], function(idx) { %>' +
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1"><%= idx %></label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="text" data-attr="<%= idx %>" placeholder="<%= idx %>" value="<%= eval(idx) %>" />' +
                        '           </div>' +
                        '       </div>'+
                        '   <% }) %>'
    });

    /**
     * Date field edition view
     */
    app.views.DateFieldEditView = Backbone.View.extend({

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },

        /**
         * Render Pattern field edition view, the view contains an text field edition view
         *
         * @returns {PatternFieldEditView} current view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);

            var textView = new app.views.TextFieldEditView({
                el      : $('#subTextView'),
                model   : this.model
            });
            textView.render();

            return this;
        }

    }, {
        templateSrc :   '   <div id="subTextView"></div>' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Format</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="format" placeholder="Date format" value="<%= format %>" />' +
                        '       </div>' +
                        '   </div>'
    });

    /**
     * Long text field edition view
     */
    app.views.LongTextFieldEditView = app.views.TextFieldEditView.extend({});

    /**
     * Tree view field edition view
     */
    app.views.TreeViewFieldEditView = Backbone.View.extend({

        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
        },

        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        }

    }, {
        templateSrc : ''
    });

    /**
     * Common edition view for enumeration field
     */
    app.views.RadioFieldEditView = app.views.CheckBoxFieldEditView = app.views.SelectFieldEditView = Backbone.View.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'click .listEdit' : 'editList'
            });
        },
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'editList');
        },

        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },

        copyeItemList  : function() {
            return _.pick(this.model.get('itemList'), "items", "defaultValue");
        },

        editList : function(e) {
            var modal = new app.views.EditListModal({
                el      : '#editListModal',
                model   : this.copyeItemList()
            });
            modal.render();

            modal.bind('saved', _.bind(function() {
                this.model.set('itemList', modal.model);
                modal.unbind();
                delete modal;
                this.model.trigger('change');
            }, this));
        }

    }, {
        templateSrc:    '   <div class="row-fluid"><div class="block span10 offset1">' +
                        '       <table class=" table table-striped">' +
                        '           <caption><h2>'+
                        '               Item list / Default value : <b><%= itemList["defaultValue"] %>  <i class="fa fa-wrench listEdit"></i>'+
                        '           </h2></caption>'+
                        '           <thead>' +
                        '               <tr>'+
                        '                   <th>Id</th>'+
                        '                   <th>Label en</th>'+
                        '                   <th>Label fr</th>'+
                        '                   <th>Value</th>'+
                        '               </tr>'+
                        '           </thead>' +
                        '           <tbody>' +
                        '               <% _.each( itemList["items"], function(item, idx) { %>' +
                        '                   <tr>' +
                        '                       <td><%= item["id"] %></td>'+
                        '                       <td><%= item["en"] %></td>'+
                        '                       <td><%= item["fr"] %></td>'+
                        '                       <td><%= item["value"] %></td>' +
                        '                   </tr>' +
                        '               <% }); %>' +
                        '           </tbody>'+
                        '       </table>' +
                        '   </div></div>'+
                        '   <div class="row-fluid">' +
                        '       <label class="span10 offset1"></label>' +
                        '   </div>'
    });


    app.views.TableFieldEditView = Backbone.View.extend({
        events : function() {

        },

        initialize : function() {
            this.template = _.template(this.constructor.templateSrc);
        },

        render : function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        }
    }, {
        templateSrc : '   <div id="subTextView"></div>' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">SubView position</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '' +
                        '       </div>' +
                        '   </div>'
    });


	return app;
})(formBuilder);