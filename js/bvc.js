/**
 * 
 * bvc.js Encargada de manejar la visualizalizacion del treemap Manejo de cambios.
 * 20161203 AFP - Adicion formula de color a partir del percentil.
 *              - Cambio del header . Adicion wiki del proyecto 
 */


var customeAnimation;
var buffer = 0;
var cellpadding = 1;
var windowWidth = ((window.innerWidth - buffer) / 12) * 10;
var windowHeight = window.innerHeight - buffer - 30;
var transitioning = false;
var init = false;

/*
 * Atributo que guarda las acciones guardadas
 * @type Array
 */
var acciones = [];


if (init === false) {
    init = true;
    var acciones = [
        "BBVACOL_HIST.CSV", "BCOLOMBIA_HIST.CSV", "BIOMAX_HIST.CSV", "BMC_HIST.CSV", "BOGOTA_HIST.CSV", "BVC_HIST.CSV", "CARTON_HIST.CSV", "CELSIA_HIST.CSV"
                , "CEMARGOS_HIST.CSV", "CLH_HIST.CSV", "CNEC_HIST.CSV", "COLTEJER_HIST.CSV", "CONCONCRET_HIST.CSV", "CORFERIAS_HIST.CSV", "CORFICOLCF_HIST.CSV", "ECOPETROL_HIST.CSV", "EEB_HIST.CSV", "ELCONDOR_HIST.CSV"
                , "EMPAQUES_HIST.CSV", "ENKA_HIST.CSV", "ESTRA_HIST.CSV", "ETB_HIST.CSV", "EXITO_HIST.CSV", "FABRICATO_HIST.CSV"
                , "FAMILIA_HIST.CSV", "GRUBOLIVAR_HIST.CSV", "GRUPOARGOS_HIST.CSV", "GRUPOAVAL_HIST.CSV", "GRUPOSURA_HIST.CSV", "HCOLSEL_HIST.CSV"
                , "ICOLCAP_HIST.CSV", "ICOLRISK_HIST.CSV", "ISAGEN_HIST.CSV", "ISA_HIST.CSV", "MINEROS_HIST.CSV", "NUTRESA_HIST.CSV", "OCCIDENTE_HIST.CSV", "ODINSA_HIST.CSV"
                , "PAZRIO_HIST.CSV", "PFAVAL_HIST.CSV", "PFAVH_HIST.CSV", "PFBBVACOL_HIST.CSV", "PFBCOLOM_HIST.CSV", "PFCARPAK_HIST.CSV", "PFCEMARGOS_HIST.CSV"
                , "PFCORFICOL_HIST.CSV", "PFDAVVNDA_HIST.CSV", "PFGRUPOARG_HIST.CSV", "PFGRUPSURA_HIST.CSV"
                , "PFVILLASCA_HIST.CSV", "PFVILLAS_HIST.CSV", "PROMIGAS_HIST.CSV", "PROTECCION_HIST.CSV", "SOCBOLIVAR_HIST.CSV", "SUEEB_HIST.CSV", "TERPEL_HIST.CSV", "TGLSC_HIST.CSV"
                , "TITAN_HIST.CSV", "VALINDUSTR_HIST.CSV", "VALOREM_HIST.CSV", "VALSIMESA_HIST.CSV", "VILLAS_HIST.CSV"
    ];
    
    var i = 0;
    for (i = 0; i < acciones.length; i++) {
        d3.csv("data/hist/" + acciones[i], function (data) {
        });
    }
    acciones=[];
}

var margin = {top: 10, right: 0, bottom: 0, left: 10},
width = windowWidth - margin.left - margin.right,
        height = windowHeight - margin.top - margin.bottom;

//var color = d3.scale.category20b();
//var color = d3.scale.ordinal().range([ "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"]);   //colorbrewer purples

var modelTag = "cantidad";
var segmentTag = "variable";
var accionTag = "";
var accionColorTag = "";

var highlightColor = "red";

var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .padding(cellpadding)
        .mode("squarify") //default
        .value(function (d) {
            return 1;
        })
        .children(function (d) {
            return d.values;
        })
        //.ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        ;
var div = d3.select("#viz")
        .style("position", "relative")
        //.attr("class", "bdy_acciones")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) + "px")

// VARIABLES COLOR
var arrayAcciones = [];

// A menor nivel mayor contraste de color
var colorLevel_1;
var colorLevel_2;
var colorLevel_3;
var colorLevel_4;
var colorLevel_5;

// VARIABLES ZOOM
//var grandparent = document.getElementById("grandparent");
var grandparent = div.append("g")
        .attr("class", "grandparent");

grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);


var clickCount = 0;
var mouseClick = function (d) {
    // Revisa si la accion ya esta en la lista de guardadas
    if (acciones.indexOf(accionTag) == -1) {
        document.getElementById("btnGuardar").disabled = false;
    } else {
        document.getElementById("btnGuardar").disabled = true;
    }


    hideTooltip();
    var xPosition = d3.event.pageX;
    var yPosition = d3.event.pageY;

    accionTag = d.NEMO;
    accionColorTag = $("#" + accionTag).css("background-color");

    // stop tooltip going off the right or bottom side of screen
    if (xPosition > (width / 2)) {
        xPosition = xPosition - 242;
    } else
        xPosition = xPosition + 25;
    if (yPosition > (height / 2)) {
        yPosition = yPosition - 200;
    }
    ;

    clickCount++;
    d3.selectAll(".node-website").style("box-shadow", "none");
    d3.select(this).style("box-shadow", "inset 0 0 10px white");

    d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .style("z-index", 100);
    d3.select("#tooltip #website")
            .html('<a href="http://' + d.NEMO + '" target="_blank">' + d.NEMO + '</a>');
    d3.select("#tooltip #agency")
            .text(d.MONTO);
    d3.select("#tooltip #size")
            .text("$" + numeral(d.PRECIOCIERRE).format('0,0'));
    d3.select("#tooltip #fecha")
            .text(d.FECHA);
    d3.select("#tooltip").classed("hidden", false);

    if (clickCount === 1) {
        singleClickTimer = setTimeout(function () {
            clickCount = 0;
        }, 250);
    } else if (clickCount === 2) {
        clearTimeout(singleClickTimer);
        clickCount = 0;
        hideTooltip();
        d3.selectAll(".node-website").style("box-shadow", "none");
    }
    loadBrush();
};

// Se carga csv
d3.csv("acciones.csv", function (data) {
    var treeData = {"key": "Precio de acciones", "values": d3.nest()
                .key(function (d) {
                    return d.NEMO;
                })
                .entries(data)
    };
    var node = div.datum(treeData).selectAll(".node")
            .data(treemap.nodes)
            .enter().append("div")
            .attr("class", function (d) {
                //return d.children ? "node-agency" : "node-website";
                return d.children ? "node-agency" : "node-website";
            })
            .call(position)
            .style("border", "solid 2px black")
            .on("click", mouseClick);
    // Remove agency
    d3.selectAll(".node-agency").remove();
    d3.selectAll(".node-website")
            .attr("id", function (d) {  // Adicion id al nodo
                return d.parent.key;
            })
            .append("div")
            .attr("class", "agency-name")
            .text(function (d) {
                if (d.y - cellpadding === d.parent.y && d.x - cellpadding === d.parent.x) {
                    return d.parent.key;
                }
            }).style("z-index", function (d) {
        if (d.y - cellpadding === d.parent.y && d.x - cellpadding === d.parent.x) {
            return 99;
        }
    }).style("font-size", "12pt")
            .style("margin-top", "5px");

    customeAnimation = function (option) {

        //hideTooltip();
        var value = function () {
            return 1;
        }

        if (option === 'preciocierre') {
            value = function (d) {
                return d.PRECIOCIERRE;
            };
        } else if (option === 'cantidad') {
            value = function (d) {
                return d.CANTIDAD;
            };
        } else if (option === 'monto') {
            value = function (d) {
                return d.MONTO;
            };
        } else if (option === 'alfabeticamente') {
            value = function (d) {
                return 50;
            };
        } else {
            value = function (d) {
                return d.CANTIDAD;
            };
        }
        updateColor();
        node.data(treemap.value(value).nodes)
                .transition()
                .duration(3500)
                .call(position);
    };


    customeAnimation();

    // Zoom

    sectorAnimation = function (sector) {
        if (sector === 'Continuo') {
            value = function (d) {
                if (d.SECTOR === 'Continuo') {
                    return d.PRECIOCIERRE;
                }
            };
        } else if (sector === 'Subasta') {
            value = function (d) {
                if (d.SECTOR === 'Subasta') {
                    return d.PRECIOCIERRE;
                }
            };
        } else if (sector === 'Fijo') {
            value = function (d) {
                if (d.SECTOR === 'Fijo') {
                    return d.PRECIOCIERRE;
                }
            };
        }

        updateColor();
        node.data(treemap.value(value).nodes)
                .transition()
                .duration(3500)
                .call(position);
    }
});

///////////////////////////////

function hideTooltip() {
    d3.select("#tooltip").classed("hidden", true);
    d3.selectAll("svg").remove();
}

function position() {
    this.style("left", function (d) {
        return d.x + "px";
    }).style("top", function (d) {
        return d.y + "px";
    }).style("width", function (d) {
        return Math.max(0, d.dx - 1) + "px";
    }).style("height", function (d) {
        return Math.max(0, d.dy - 1) + "px";
    });
}

// ----------- Funciones propias afp

function setModel(tag) {
    modelTag = tag;
    customeAnimation(tag);
}

function sectorSelector(sector) {
    sectorAnimation(sector);
}

/**
 * Metodo que guarda la accion para luego ser comparada con otras
 * @returns {undefined}
 */
function guardarAccion() {
    console.log("push:" + accionTag);
    document.getElementById("btnGuardar").disabled = true;

    if (acciones.length === 0) {
        d3.selectAll(".txt_gray").remove();
    }

    acciones.push(accionTag);
    // cuando es vacio

    var dv = document.createElement("div");
    dv.setAttribute("class", "accionDiv");
    dv.setAttribute("style", "background:" + accionColorTag + ";float:left;margin-right:5px;");


    var p = document.createElement("p");
    var node = document.createTextNode(accionTag);
    p.setAttribute("class", "accionAdd");
    p.setAttribute("style", "color:white;vertical-align: middle;margin-top:5px");

    p.appendChild(node);
    dv.appendChild(p);

    document.getElementById("tablero_acciones").appendChild(dv);


}

function limpiarAcciones() {
    if (acciones.length > 0) {
        acciones = [];
        d3.selectAll(".accionDiv").remove();
        var h5 = document.createElement("h5");
        h5.setAttribute("class", "txt_gray");
        h5.innerHTML = "No hay acciones guardadas";
        document.getElementById("tablero_acciones").appendChild(h5);
    }
}

/**
 * Funcion que maneja los colores en el treemap dependiendo la variable global modeltag
 * @returns {undefined}
 */
function updateColor() {
    console.log("Entra update Color- - - - ");
    var srt = d3.selectAll('.node-website').sort(
            function (a, b) {
                if (modelTag === "cantidad") {
                    return b.CANTIDAD - a.CANTIDAD
                } else if (modelTag === "preciocierre") {
                    return b.PRECIOCIERRE - a.PRECIOCIERRE
                }
            });

    arrayAcciones = [];
    srt.each(function (d) {
        //console.log((modelTag))
        if (modelTag === "cantidad") {
            if (d.CANTIDAD > 0) {
                arrayAcciones.push(d.CANTIDAD);
            }
        } else if (modelTag === "preciocierre") {
            arrayAcciones.push(d.PRECIOCIERRE);
        }
    });

    // Saca los montos para los  colores
    colorLevel_5 = arrayAcciones[Math.round(arrayAcciones.length * 0.9)];
    colorLevel_4 = arrayAcciones[Math.round(arrayAcciones.length * 0.7)];
    colorLevel_3 = arrayAcciones[Math.round(arrayAcciones.length * 0.4)];
    colorLevel_2 = arrayAcciones[Math.round(arrayAcciones.length * 0.2)];
    colorLevel_1 = arrayAcciones[Math.round(arrayAcciones.length * 0.1)];


    d3.selectAll('.node-website')
            .style("background", function (d) {  // Adicion id al nodo
                if (modelTag === "cantidad") {
                    if (Number(d.CANTIDAD) > Number(colorLevel_1)) {
                        //console.log("entra 1 " + d.CANTIDAD + " " + colorLevel_1);
                        return  "#052840";
                    } else if (Number(d.CANTIDAD) > Number(colorLevel_2)) {
                        // console.log("entra 2 " + d.CANTIDAD + " " + colorLevel_2);
                        return  "#375366";
                    } else if (Number(d.CANTIDAD) > Number(colorLevel_3)) {
                        //console.log("entra 3 " + d.CANTIDAD + " " + colorLevel_3);
                        return  "#697E8C";
                    } else if (Number(d.CANTIDAD) > Number(colorLevel_4)) {
                        //console.log("entra 4 " + d.CANTIDAD + " " + colorLevel_4);
                        return  "#9BA9B2";
                    }
                    return "#B4BEC5";
                } else if (modelTag === "preciocierre") {
                    if (Number(d.PRECIOCIERRE) > Number(colorLevel_1) + 200000) {
                        //console.log("entra 1 " + d.PRECIOCIERRE + " " + colorLevel_1);
                        return  "#052840";
                    } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_2)) {
                        //console.log("entra 2 " + d.PRECIOCIERRE + " " + colorLevel_2);
                        return  "#375366";
                    } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_3)) {
                        //console.log("entra 3 " + d.PRECIOCIERRE + " " + colorLevel_3);
                        return  "#697E8C";
                    } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_4)) {
                        //console.log("entra 4 " + d.PRECIOCIERRE + " " + colorLevel_4);
                        return  "#9BA9B2";
                    }
                    return "#B4BEC5";
                } else if (modelTag === "alfabeticamente") {

                    return "#697E8C";
                }
            });
}



/**
 Funcion que carga cuando se selecciona cada acción
 */
function loadBrush() {

    var margin = {top: 10, right: 10, bottom: 100, left: 80},
    margin2 = {top: 430, right: 10, bottom: 20, left: 80},
    width = 600 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            height2 = 500 - margin2.top - margin2.bottom;

    //var parseDate = d3.time.format("%Y-%d-%m").parse;
    var parseDate = d3.time.format("%b %d %Y").parse;

    var x = d3.time.scale().range([0, width]),
            x2 = d3.time.scale().range([0, width]),
            y = d3.scale.linear().range([height, 0]),
            y2 = d3.scale.linear().range([height2, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
            xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
            yAxis = d3.svg.axis().scale(y).orient("left");


    var brush = d3.svg.brush()
            .x(x2)
            .on("brush", brushed);

    var area = d3.svg.area()
            .interpolate("monotone")
            .x(function (d) {
                return x(d.fecha);
            }).y0(height)
            .y1(function (d) {
                return y(d.Cantidad);
            });

    var area2 = d3.svg.area()
            .interpolate("monotone")
            .x(function (d) {
                return x2(d.fecha);
            }).y0(height2)
            .y1(function (d) {
                return y2(d.Cantidad);
            });

    var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

    var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    var zoom = d3.behavior.zoom()
            .on("zoom", draw);
// Add rect cover the zoomed graph and attach zoom event.
    var rect = svg.append("svg:rect")
            .attr("class", "pane")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);

    d3.csv("data/hist/" + accionTag + "_HIST.CSV", type, function (error, data) {
        x.domain(d3.extent(data.map(function (d) {
            return d.fecha;
        })));
        y.domain([0, d3.max(data.map(function (d) {
                return d.Cantidad;
            }))]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        // Set up zoom behavior
        zoom.x(x);

        focus.append("path")
                .datum(data)
                .attr("class", "area")
                .attr("id", function (d) {
                    return d.Nemotecnico;
                })
                .style("fill", accionColorTag)
                .attr("d", area);

        focus.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

        focus.append("g")
                .attr("class", "y axis")
                .call(yAxis);

        context.append("path")
                .datum(data)
                .attr("class", "area")
                .attr("d", area2);

        context.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height2 + ")")
                .call(xAxis2);

        context.append("g")
                .attr("class", "x brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", height2 + 7)
                ;
    });

    function brushed() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.select(".area").attr("d", area);
        focus.select(".x.axis").call(xAxis);
        // Reset zoom scale's domain
        zoom.x(x);
    }

    function draw() {
        focus.select(".area").attr("d", area);
        focus.select(".x.axis").call(xAxis);
        // Force changing brush range
        brush.extent(x.domain());
        svg.select(".brush").call(brush);
    }

    function type(d) {
        //d.fecha = parseDate(d.fecha);
        d.fecha = parseDate(d.fecha);
        d.Cantidad = +d.Cantidad;
        return d;
    }
}
