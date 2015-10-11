(function ($) {
    $.fn.jointjsHelper = function (options) {
        // settings
        var defaults = {
            'idDiagramMain': 'diagramMain',
            'idNewElments': 'newElments',
            'idModal': 'modalElement',
            'detailElement': {
                'idHeader': 'hederDetailElement',
                'idLabel' : 'txtLabelDetailElement',
                'idElement' : 'hdnIdElement'
            },
            'diagramMain': {
                'width': 825,
                'height': 500
            }
        };

        this.settings = $.extend({}, defaults, options);

        //Variables
        var base = this;
        var mensageErro = {
            diagramNotFound: { id: 1, msg: "Driagrama principal não encontrado" },
            areaNewElementsNotFound: { id: 2, msg: "Area de novos elementos não encontrados" },
            modalNotFound: { id: 3, msg: "Modal não encontrada" }
        };
        this.graphMain = null;
        this.paperMain = null;
        var selection;
        var selectionView;

        //Events
        $(document).ready(function () {
            base.Initiation();

            $('#' + base.settings.idModal).on('hidden', function () {
                base.SaveDetail(model);
            });
        });

        this.SetEventDblClick = function (paper, callFunction) {
            paper.on('cell:pointerdblclick',
                    function (cellView, evt, x, y) {
                        callFunction(cellView, evt, x, y);
                    });
        };

        //Functions
        this.Initiation = function () {
            this.ValidationParameters();
            this.InitiationDiagramMain();
        };

        this.ValidationParameters = function () {

            if ($(this.settings.idDiagramMain).size == 0) {
                throw GetMsgError(mensageErro.diagramNotFound)
            }

            if ($(this.settings.idNewElments).size == 0) {
                throw GetMsgError(mensageErro.areaNewElementsNotFound)
            }

            if ($(this.settings.idModal).size == 0) {
                throw GetMsgError(mensageErro.areaNewElementsNotFound)
            }

            
        };

        this.InitiationDiagramMain = function () {

            selection = new Backbone.Collection;
            this.graphMain = new joint.dia.Graph;

            this.paperMain = new joint.dia.Paper({
                el: $('#' + this.settings.idDiagramMain),
                width: this.settings.diagramMain.width,
                height: this.settings.diagramMain.height,
                gridSize: 1,
                model: this.graphMain,
                defaultLink: new joint.dia.Link({
                    attrs: { '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' } }
                }),
                // Enable marking available cells & magnets
                markAvailable: true
            });
                        
            selectionView = new joint.ui.SelectionView({ paper: this.paperMain, graph: this.graphMain, model: selection });

            this.paperMain.on('blank:pointerdown', selectionView.startSelecting);

            this.paperMain.on('cell:pointerup', function (cellView, evt) {
                alert('cell:pointerup');
                if ((evt.ctrlKey || evt.metaKey) && !(cellView.model instanceof joint.dia.Link)) {
                    selection.add(cellView.model);
                    selectionView.createSelectionBox(cellView);
                }
            });

            selectionView.on('selection-box:pointerdown', function (evt) {
                alert('selection-box:pointerdown');
                if (evt.ctrlKey || evt.metaKey) {
                    var cell = selection.get($(evt.target).data('model'));
                    selection.reset(selection.without(cell));
                    selectionView.destroySelectionBox(this.paperMain.findViewByModel(cell));
                }
            });


            this.SetEventDblClick(this.paperMain, this.DblClick);



        };

        this.AddRect = function (graph, optionsRect) {

            var defaultsRect = {
                'width': 90,
                'height': 90,
                'label': 'Rect',
                'rotate': 0,
                'color': '#2ECC71',
                'inPorts': ["in1", "in2"],
                'outPorts': ['out']
            };

            var settingsRect = $.extend({}, defaultsRect, optionsRect);

            var rect = new joint.shapes.devs.Model({
                position: { x: 50, y: 50 },
                size: { width: settingsRect.width, height: settingsRect.height },
                inPorts: settingsRect.inPorts,
                outPorts: settingsRect.outPorts,
                attrs: {
                    '.label': { text: settingsRect.label, 'ref-x': .4, 'ref-y': .5, 'y-alignment': 'middle' },
                    rect: { fill: settingsRect.color },
                    '.inPorts circle': { fill: '#16A085', magnet: 'passive', type: 'input' },
                    '.outPorts circle': { fill: '#E74C3C', type: 'output' }
                }
            });

            if (settingsRect.rotate != 0) {
                rect.rotate(settingsRect.rotate);
                rect.attr('.label/transform', 'rotate(' + (settingsRect.rotate * -1) + ')');
                rect.attr('.label/ref-y', .6);
            }

            rect.addTo(graph);

            return rect;

        };

        this.AddDiamond = function (graph, optionsDiamond) {

            var defaultsDiamond = {
                'width': 100,
                'height': 100,
                'label': 'Diamond',
                'inPorts': ["in"],
                'outPorts': ['Sim', 'Não']
            };

            var settingsDiamond = $.extend({}, defaultsDiamond, optionsDiamond);

            settingsDiamond.rotate = 45;
            settingsDiamond.color = '#00';

            this.AddRect(graph, settingsDiamond)
        };

        this.AddCircle = function (graph, optionsCircle) {

            var defaultsCircle = {
                'width': 100,
                'height': 50,
                'label': 'Circle',
                'inPorts': null,
                'outPorts': ['out']
            };

            var settingsCircle = $.extend({}, defaultsCircle, optionsCircle);

            joint.shapes.devs.CircleModel = joint.shapes.devs.Model.extend({

                markup: '<g class="rotatable"><g class="scalable"><circle class="body"/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

                defaults: joint.util.deepSupplement({

                    type: 'devs.CircleModel',
                    attrs: {
                        '.body': { r: 50, cx: 50, stroke: 'blue', fill: 'lightblue' },
                        '.label': { text: settingsCircle.label, 'ref-y': 0.5, 'y-alignment': 'middle' },
                        '.port-body': { width: 10, height: 10, x: -5, stroke: 'gray', fill: 'lightgray', magnet: 'active' }
                    }

                }, joint.shapes.devs.Model.prototype.defaults)
            });

            joint.shapes.devs.CircleModelView = joint.shapes.devs.ModelView;

            var circleModel = new joint.shapes.devs.CircleModel({
                position: { x: 50, y: 50 },
                size: { width: settingsCircle.width, height: settingsCircle.height },
                inPorts: settingsCircle.inPorts,
                outPorts: settingsCircle.outPorts
            });

            graph.addCell(circleModel);

            return circleModel;
        };

        this.DblClick = function (cellView, evt, x, y) {
            base.CreateElementDetail(cellView.model);
            base.LoadDetail(cellView);
        };

        this.CreateElementDetail = function (model) {
            
            var modal = $('#' + this.settings.idModal);

            modal.modal('show');
        };

        this.LoadDetail = function (cellView) {
            $("#" + this.settings.detailElement.idElement).val(cellView.model.id);
            $("#" + this.settings.detailElement.idHeader)[0].innerText = cellView.model.attr('.label/text');
            $("#" + this.settings.detailElement.idLabel).val(cellView.model.attr('.label/text'));
        };

        this.SaveDetail = function (model) {

            debugger;

            cellView.model.attr('.label/text', $("#" + this.settings.detailElement.idLabel).val());

        }

        this.GetMsgError = function (objMsg) {
            return "Menssage :" + objMsg.msg + " | Id :" + objMsg.id;
        };

    };
})(jQuery);