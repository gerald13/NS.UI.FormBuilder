/**
 * @fileOverview router.js
 *
 * Create Backbone router for the application
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(
    ['jquery', 'underscore', 'backbone', 'views/main/mainView', 'models/collection', 'backbone.radio', 'fancytree', 'sweetalert'],
    function($, _, Backbone, MainView, collection, Radio, fancytree) {

        var AppRouter = Backbone.Router.extend({

            routes: {
                ""             : 'home',
                'saveprotocol' : 'saveProtocol',
                'setting/:id'  : 'modelSetting',
                'import'       : 'import',
                'show'         : 'show',
                "copy/:id"     : "copy"
            },

            initialize: function(options) {

                i18n.init({ resGetPath: 'ressources/locales/__lng__/__ns__.json', getAsync : false, lng : 'fr'});

                window.location.hash = '#';

                this.URLOptions = options['URLOptions'];
                this.el = options['el'];

                $("body").i18n();


                this.initFormChannel();
                this.initMainChannel();
            },

            /**
             * Initialize a radio channel for "form" channel and create all callbacks for each events
             * This channel is form functionnalities like save and export
             */
            initFormChannel : function() {
                this.formChannel = Backbone.Radio.channel('form');

                //  This event is sent from the main view when export modal view is closed
                //  and where the model view data are corrects, event sent with the collection
                this.formChannel.on('export:return', _.bind(function(collectionExport) {
                    require(['blobjs', 'filesaver'], _.bind(function() {

                        try {

                            var isFileSaverSupported = !!new Blob();
                            var blob = new Blob([JSON.stringify(collectionExport, null, 2)], {
                                type: "application/json;charset=utf-8"
                            });
                            saveAs(blob, $('#exportProtocolFileName').val() + '.json');

                            $('#exportModal').modal('hide').removeData();
                            swal("Export réussi !", "", "success")
                        } catch (e) {
                            $('#exportModal').modal('hide').removeData();
                            swal("Echec de l'export !", "Une erreur est survenue lors de l'export", "error")
                        }

                        window.location.hash = '#';

                    }, this));  //  End require
                }, this));

                //  Event received when user wants to save his form on the server
                this.formChannel.on('save', _.bind(function(formAsJSON) {
                    $.ajax({
                        data        : formAsJSON,
                        type        : 'POST',
                        url         : this.URLOptions['saveURL'],
                        contentType : 'application/json',

                        //  Trigger event with ajax result on the formView
                        success: _.bind(function(res) {
                            this.formChannel.trigger('save:return', true);
                        }, this),
                        error: _.bind(function(jqXHR, textStatus, errorThrown) {
                            this.formChannel.trigger('save:return', false);
                        }, this)
                    });
                }, this));

                //  Event sent from setting view vhen form properties are changed
                //  see settingView.js
                this.formChannel.on('edition', _.bind(function(formValues) {
                    $('.dropArea').switchClass('col-md-7', 'col-md-8', 500);
                    $('.widgetsPanel').switchClass('hide', 'col-md-4', 500);
                }, this))
            },

            /**
             * Initialize a radio channel for "main" channel and create all callbacks for each events
             */
            initMainChannel : function() {

                this.mainChannel = Backbone.Radio.channel('global');

                //  Event sent from setting view when backbone forms generation is finished
                //  Run an nimation for hide panel view and display setting view, I love jQuery !
                this.mainChannel.on('formCreated', _.bind(function() {

                    $('.dropArea').switchClass('col-md-9', 'col-md-7', 500);
                    $('.widgetsPanel').switchClass('col-md-3', 'hide', 500);

                }, this));

                //  Event sent from setting view when field changed are saved
                //  and the data are correct
                //  Run an animation for hide setting view and display panel view
                this.mainChannel.on('formCommit', _.bind(function() {
                    $('.dropArea').switchClass('col-md-7', 'col-md-8', 500);
                    $('.widgetsPanel').switchClass('hide', 'col-md-4', 500);
                    window.location.hash = "#";
                }, this))

                //  Event sent from setting view when modifications are cancelled
                //  Run an animation for hide setting view and display panel view
                this.mainChannel.on('formCancel', _.bind(function() {
                    $('.dropArea').switchClass('col-md-7', 'col-md-8', 500);
                    $('.widgetsPanel').switchClass('hide', 'col-md-4', 500);
                    window.location.hash = "#";
                }, this))

                /*this.mainChannel.on('fieldConfiguration', _.bind(function(configuration) {
                    $('.dropArea').switchClass('col-md-7', 'col-md-9', 500);
                    $('.widgetsPanel').switchClass('hide', 'col-md-3', 500);
                    window.location.hash = "#";
                }, this))*/
            },

            /**
             * Initiale route
             */
            home: function() {
                //  Awesome function !!!
            },

            /**
             * This function is run when user wants to duplicate a field
             * Trigger an event with the field ID to the formbuilder object (see formbuilder.js)
             *
             * @param  {integer} ID of the field to duplicate
             */
            copy : function(modelID) {
                this.mainChannel.trigger('copy', modelID);
                window.location.hash = '#';
            },

            /**
             * This function is run when user wants to configure a field
             * Trigger an event with field ID to the formbuilder object (see formbuilder.js)
             *
             * @param  {integer} ID of the field to duplicate
             */
            modelSetting: function(modelID) {
                this.mainChannel.trigger('getModel', modelID);
            },

            show: function() {
                require(['views/modals/diffProtocol', 'utilities/utilities'], _.bind(function(diffModal, Utilities) {
                    $(this.el).append('<div class="modal  fade" id="compareModal" ></div>');
                    var modal = new diffModal({
                        el : '#compareModal'
                    });
                    modal.render();

                    $('#compareModal').on('hidden.bs.modal', _.bind(function () {
                        var datas = modal.getData();

                        Utilities.ReadFile(datas['source'], _.bind(function(result) {
                            if (result !== false) {
                                var source = result;

                                Utilities.ReadFile(datas['update'], _.bind(function(resultUpdate) {
                                    if (resultUpdate !== false) {
                                        var update = resultUpdate;

                                        //  Now we have all we need !
                                        $('.widgetsPanel').switchClass('col-md-3', 'hide', 250, _.bind(function() {
                                            console.log ("diff : ", Utilities.GetXMLDiff(source, update, datas['srcName'], datas['updName']))
                                            $('.dropArea').append(
                                                Utilities.GetXMLDiff(source, update, datas['srcName'], datas['updName'])
                                            ).switchClass('col-md-9', 'col-md-12', 250).find('.diff').addClass('col-md-10 col-md-offset-1');
                                            var acts = {
                                                quit: new NS.UI.NavBar.Action({
                                                    handler: _.bind(function() {
                                                        $('.widgetsPanel').switchClass('hide', 'col-md-3', 250, _.bind(function() {
                                                            $('.dropArea').switchClass('col-md-12', 'col-md-9', 250).find('table').remove();
                                                            window.location.hash = "#";
                                                            this.navbar.setActions(this.mainActions)
                                                        }, this));
                                                    }, this),
                                                    allowedRoles: ["reader"],
                                                    title: "Quit"
                                                })
                                            };
                                            this.navbar.setActions(acts);
                                        }, this))

                                    } else {
                                        console.log (resultUpdate);
                                    }
                                }, this));

                            } else {
                                console.log (result);
                            }
                        }, this));
                    }, this));

                }, this));
            }
        });

        return AppRouter;
    });