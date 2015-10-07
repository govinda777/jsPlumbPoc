(function ($) {
    $.fn.jointjsHelper = function (selector, options) {
        // settings
        var defaults = {
            'diagramMain': {
                'width': 825,
                'height': 500
            },
            'diagramNewElments': {
                'width': 600,
                'height': 500
            },
        };

        this.settings = $.extend({}, defaults, options);

        //Variables
        var base = this;
        var obj = $(selector);
        this.graphMain = null;
        this.paperMain = null;
        var idDiagramMain = "diagramMain";
        var idDiagramNewElments = "diagramNewElments";
        var structure = '<div class="row"> \n' +
                            '<div id="' + idDiagramNewElments + '" class="col-xs-3" style="background-color:bisque"> \n' +
                            '</div> \n' +
                            '<div id="' + idDiagramMain + '" class="col-xs-9" style="background-color:azure"> \n' +
                            '</div> \n' +
                        '</div>'

        //Events
        $(document).ready(function () {
            base.Initiation();
        });
        
        //Functions
        this.Initiation = function () {
            this.CreateStructure(obj);
            this.InitiationDiagramMain();
        };

        this.CreateStructure = function (selector) {

            if (!selector.hasClass("container")) {
                selector.attr("class", selector.attr("class") + "container");
            }

            selector.append(structure);
        };

        this.InitiationDiagramMain = function () {

            this.graphMain = new joint.dia.Graph;

            this.paperMain = new joint.dia.Paper({
                el: $('#' + idDiagramMain),
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

            this.AddCircle(this.graphMain);
            this.AddRect(this.graphMain);
            this.AddDiamond(this.graphMain);

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

            if (settingsRect.rotate != 0)
            {
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
                        '.label': { text: settingsCircle.label , 'ref-y': 0.5, 'y-alignment': 'middle' },
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

    };
})(jQuery);