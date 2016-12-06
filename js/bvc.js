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
var dataset = "";
/*
 * Atributo que guarda las acciones guardadas
 * @type Array
 */
var acciones = [];
document.getElementById("btnBack").style.visibility = "hidden";
document.getElementById("line").style.visibility = "hidden";
if (init === false) {
    init = true;
    var acciones = [
        "data.csv", "AAPL_HIST.CSV", "AMZN_HIST.CSV", "BAC_HIST.CSV", "BBH_HIST.CSV", "BBVACOL_HIST.CSV", "BCOLOMBIA_HIST.CSV", "BIOMAX_HIST.CSV",
        "BMC_HIST.CSV", "BOGOTA_HIST.CSV", "BVC_HIST.CSV", "CARTON_HIST.CSV", "CELSIA_HIST.CSV", "CEMARGOS_HIST.CSV", "CLH_HIST.CSV", "CNEC_HIST.CSV",
        "COLTEJER_HIST.CSV", "CONCONCRET_HIST.CSV", "CORFERIAS_HIST.CSV", "CORFICOLCF_HIST.CSV", "C_HIST.CSV", "ECOPETROL_HIST.CSV", "EDATEL_HIST.CSV",
        "EEB_HIST.CSV", "ELCONDOR_HIST.CSV", "ENKA_HIST.CSV", "EPSA_HIST.CSV", "ESTRA_HIST.CSV", "ETB_HIST.CSV", "EXITO_HIST.CSV", "FABRICATO_HIST.CSV",
        "FAMILIA_HIST.CSV", "GOOGL_HIST.CSV", "GRUBOLIVAR_HIST.CSV", "GRUPOARGOS_HIST.CSV", "GRUPOAVAL_HIST.CSV", "GRUPOSURA_HIST.CSV", "GURU_HIST.CSV",
        "HCOLSEL_HIST.CSV", "ICOLCAP_HIST.CSV", "ISAGEN_HIST.CSV", "ISA_HIST.CSV", "JPM_HIST.CSV", "MANCEMENTO_HIST.CSV", "MINEROS_HIST.CSV", "NUTRESA_HIST.CSV",
        "OCCIDENTE_HIST.CSV", "ODINSA_HIST.CSV", "PAZRIO_HIST.CSV", "PFAVAL_HIST.CSV", "PFAVH_HIST.CSV", "PFBBVACOL_HIST.CSV", "PFBCOLOM_HIST.CSV", "PFCARPAK_HIST.CSV",
        "PFCEMARGOS_HIST.CSV", "PFCORFICOL_HIST.CSV", "PFDAVVNDA_HIST.CSV", "PFE_HIST.CSV", "PFGRUPOARG_HIST.CSV", "PFGRUPSURA_HIST.CSV", "PFVILLASCA_HIST.CSV",
        "PFVILLAS_HIST.CSV", "POPULAR_HIST.CSV", "PPH_HIST.CSV", "PREC_HIST.CSV", "PROMIGAS_HIST.CSV", "PROTECCION_HIST.CSV", "RSX_HIST.CSV", "SDIV_HIST.CSV",
        "SOCBOLIVAR_HIST.CSV", "TABLEMAC_HIST.CSV", "TERPEL_HIST.CSV", "TGLSC_HIST.CSV", "TITAN_HIST.CSV", "VALINDUSTR_HIST.CSV", "VALOREM_HIST.CSV",
        "VALSIMESA_HIST.CSV", "VILLAS_HIST.CSV", "COLCAP_HIST.CSV"
    ];
    var i = 0;
    for (i = 0; i < acciones.length; i++) {
        d3.csv("data/hist/" + acciones[i], function (data) {});
    }
    acciones = [];
}

var margin = {
        top: 10,
        right: 0,
        bottom: 0,
        left: 10
    },
    width = windowWidth - margin.left - margin.right,
    height = windowHeight - margin.top - margin.bottom;
//var color = d3.scale.category20b();
//var color = d3.scale.ordinal().range([ "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"]);   //colorbrewer purples

/*
 * Variables globales de los modelos
 */
var modelTag = "cantidad";
var sectorTag = "continuo";
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
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px");

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
/**
 * Funcion que establece las opciones del tooltip
 * @param {type} d
 * @returns {undefined}
 */
var mouseClick = function (d) {
    // Revisa si la accion ya esta en la lista de guardadas
    hideTooltip();
    accionTag = d.NEMO;
    var find = false;

    for (i = 0; i < acciones.length; i++) {
        if (acciones[i].accion === d.NEMO) {
            find = true;
            break;
        }
    }

    if (!find) {
        document.getElementById("btnGuardar").disabled = false;
    } else {
        document.getElementById("btnGuardar").disabled = true;
    }

    var xPosition = d3.event.pageX;
    var yPosition = d3.event.pageY;

    accionColorTag = $("#" + accionTag).css("background-color");
    // stop tooltip going off the right or bottom side of screen
    if (xPosition > (width / 2)) {
        xPosition = xPosition - 242;
    } else
        xPosition = xPosition + 25;

    if (yPosition > (height / 2)) {
        yPosition = yPosition - 200;
    }

    clickCount++;
    d3.selectAll(".node-website").style("box-shadow", "none");
    d3.select(this).style("box-shadow", "inset 0 0 10px white");

    if (modelTag === "alfabeticamente") {
        d3.select("#tooltipB")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .style("z-index", 100);
        d3.select("#tooltipB #website")
            .html('<a href="http://' + d.NEMO + '" target="_blank">' + d.NEMO + '</a>');
        d3.select("#tooltipB #agency")
            .text(d.MONTO);
        d3.select("#tooltipB").classed("hidden", false);
    } else {
        d3.select("#tooltipA")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .style("z-index", 100);
        d3.select("#tooltipA #website")
            .html('<a href="http://' + d.NEMO + '" target="_blank">' + d.NEMO + '</a>');
        d3.select("#tooltipA #agency")
            .text(d.MONTO);
        d3.select("#tooltipA #size")
            .text("$" + numeral(d.PRECIOCIERRE).format('0,0'));
        d3.select("#tooltipA #fecha")
            .text(d.FECHA);
        d3.select("#tooltipA").classed("hidden", false);
    }

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
    var treeData = {
        "key": "Precio de acciones",
        "values": d3.nest()
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
        .attr("id", function (d) { // Adicion id al nodo
            return d.parent.key;
        }).style("z-index", function (d) {
            if (d.y - cellpadding === d.parent.y && d.x - cellpadding === d.parent.x) {
                return 99;
            }
        }).style("font-size", "12pt")
        .style("margin-top", "5px")
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

        var value = function () {
            return 1;
        }

        // Paso 1. A que segmento pertenece: fijo | continuo | subasta
        if (modelTag === 'preciocierre') {
            value = function (d) {
                if (sectorTag === "continuo" && d.SECTOR === "continuo") {
                    return d.PRECIOCIERRE;
                } else if (sectorTag === "fijo" && d.SECTOR === "fijo") {
                    return d.PRECIOCIERRE;
                } else if (sectorTag === "subasta" && d.SECTOR === "subasta") {
                    return d.PRECIOCIERRE;
                } else {
                    return 0;
                }
            };
        } else if (modelTag === 'cantidad') {
            value = function (d) {
                if (sectorTag === "continuo" && d.SECTOR === "continuo") {
                    return d.CANTIDAD;
                } else if (sectorTag === "fijo" && d.SECTOR === "fijo") {
                    return d.CANTIDAD;
                } else if (sectorTag === "subasta" && d.SECTOR === "subasta") {
                    return d.CANTIDAD;
                } else {
                    return 0;
                }
            };
        } else if (modelTag === 'monto') {
            value = function (d) {
                if (sectorTag === "continuo" && d.SECTOR === "continuo") {
                    return d.MONTO;
                } else if (sectorTag === "fijo" && d.SECTOR === "fijo") {
                    return d.MONTO;
                } else if (sectorTag === "subasta" && d.SECTOR === "subasta") {
                    return d.MONTO;
                } else {
                    return 0;
                }
            };
        } else if (modelTag === 'variacion') {
            value = function (d) {
                if (sectorTag === "continuo" && d.SECTOR === "continuo") {
                    return Math.abs(d.VAR);
                } else if (sectorTag === "fijo" && d.SECTOR === "fijo") {
                    return Math.abs(d.VAR);
                } else if (sectorTag === "subasta" && d.SECTOR === "subasta") {
                    return Math.abs(d.VAR);
                } else {
                    return 0;
                }
            };
        } else if (modelTag === 'alfabeticamente') {
            value = function (d) {
                if (sectorTag === "continuo" && d.SECTOR === "continuo") {
                    return 1;
                } else if (sectorTag === "fijo" && d.SECTOR === "fijo") {
                    return 1;
                } else if (sectorTag === "subasta" && d.SECTOR === "subasta") {
                    return 1;
                } else {
                    return 0;
                }
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
});
/**
 *  Metodo que esconde los diferentes tooltip de la pagina
 * @returns {undefined}
 */
function hideTooltip() {
    d3.select("#tooltipA").classed("hidden", true);
    d3.select("#tooltipB").classed("hidden", true);
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
    hideTooltip();
    modelTag = tag;
    customeAnimation(tag);
}

function sectorSelector(sector) {
    hideTooltip();
    sectorTag = sector;
    //sectorAnimation(sector);
    customeAnimation(sector);
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
    var color = getRandomColor();
    if (acciones.length < 6) {
        acciones.push({
            accion: accionTag,
            color: color
        });
        // cuando es vacio

        var dv = document.createElement("div");
        dv.setAttribute("class", "accionDiv");
        dv.setAttribute("id", "id" + accionTag);
        dv.setAttribute("style", "background:" + color + ";float:left;margin-right:8px;margin-top:8px;border-radius: 5px;");
        var p = document.createElement("p");
        var node = document.createTextNode(accionTag);
        p.setAttribute("class", "accionAdd");
        p.setAttribute("style", "color:white;vertical-align: middle;margin-top:8px");
        p.appendChild(node);
        dv.appendChild(p);
        document.getElementById("tablero_acciones").appendChild(dv);
        //$('#id' + accionTag).css('cursor', 'pointer');
    } else {
        // se debe mostrar  un mensaje que digan que no se puede agregar mas acciones
    }
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
 * Compara las acciones que esten en el tablero de acciones
 * @returns {undefined}
 */
function compararAcciones() {
    if (acciones.length > 0) {
        //add Boton Volver
        document.getElementById("btnBack").style.visibility = "visible";
        document.getElementById("compareAcciones").style.visibility = "hidden";
        document.getElementById("cleanAcciones").style.visibility = "hidden";
        hideTooltip();
        loadLineChart1();
        document.getElementById("viz").style.visibility = "hidden";
        document.getElementById("line").style.visibility = "visible";
    }
}

/**
 * Compara las acciones que esten en el tablero de acciones
 * @returns {undefined}
 */
function volver() {
    document.getElementById("btnBack").style.visibility = "hidden";
    document.getElementById("compareAcciones").style.visibility = "visible";
    document.getElementById("cleanAcciones").style.visibility = "visible";
    d3.selectAll("svg").remove();
    document.getElementById("viz").style.visibility = "visible";
    document.getElementById("line").style.visibility = "hidden";
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
            } else if (modelTag === "variacion") {
                return b.VAR - a.VAR
            }
        });
    arrayAcciones = [];
    srt.each(function (d) {
        if (modelTag === "cantidad") {
            if (d.CANTIDAD > 0) {
                arrayAcciones.push(d.CANTIDAD);
            }
        } else if (modelTag === "preciocierre") {
            arrayAcciones.push(d.PRECIOCIERRE);
        } else if (modelTag === "variacion") {
            arrayAcciones.push(d.VAR);
        }
    });
    // Saca los montos para los  colores
    colorLevel_5 = arrayAcciones[Math.round(arrayAcciones.length * 0.9)];
    colorLevel_4 = arrayAcciones[Math.round(arrayAcciones.length * 0.7)];
    colorLevel_3 = arrayAcciones[Math.round(arrayAcciones.length * 0.4)];
    colorLevel_2 = arrayAcciones[Math.round(arrayAcciones.length * 0.2)];
    colorLevel_1 = arrayAcciones[Math.round(arrayAcciones.length * 0.1)];
    d3.selectAll('.node-website')
        .style("background", function (d) { // Adicion id al nodo
            if (modelTag === "variacion") {
                if (d.VAR < 0) {
                    return "#B40404";
                } else {
                    return "#04B404";
                }
            }
            if (modelTag === "cantidad") {
                if (Number(d.CANTIDAD) > Number(colorLevel_1)) {
                    //console.log("entra 1 " + d.CANTIDAD + " " + colorLevel_1);
                    return "#052840";
                } else if (Number(d.CANTIDAD) > Number(colorLevel_2)) {
                    // console.log("entra 2 " + d.CANTIDAD + " " + colorLevel_2);
                    return "#375366";
                } else if (Number(d.CANTIDAD) > Number(colorLevel_3)) {
                    //console.log("entra 3 " + d.CANTIDAD + " " + colorLevel_3);
                    return "#697E8C";
                } else if (Number(d.CANTIDAD) > Number(colorLevel_4)) {
                    //console.log("entra 4 " + d.CANTIDAD + " " + colorLevel_4);
                    return "#9BA9B2";
                }
                return "#B4BEC5";
            } else if (modelTag === "preciocierre") {
                if (Number(d.PRECIOCIERRE) > Number(colorLevel_1) + 200000) {
                    //console.log("entra 1 " + d.PRECIOCIERRE + " " + colorLevel_1);
                    return "#052840";
                } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_2)) {
                    //console.log("entra 2 " + d.PRECIOCIERRE + " " + colorLevel_2);
                    return "#375366";
                } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_3)) {
                    //console.log("entra 3 " + d.PRECIOCIERRE + " " + colorLevel_3);
                    return "#697E8C";
                } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_4)) {
                    //console.log("entra 4 " + d.PRECIOCIERRE + " " + colorLevel_4);
                    return "#9BA9B2";
                }
                return "#B4BEC5";
            } else if (modelTag === "alfabeticamente") {
                return "#697E8C";
            }
        });
}

/**
 Funcion que carga cuando se selecciona cada acción del tooltip
 */
function loadBrush() {

    var margin = {
            top: 10,
            right: 10,
            bottom: 100,
            left: 80
        },
        margin2 = {
            top: 430,
            right: 10,
            bottom: 20,
            left: 80
        },
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
            if (modelTag === "cantidad") {
                return y(d.Cantidad);
            } else if (modelTag === "preciocierre") {
                return y(d.UltimoPrecio);
            } else if (modelTag === "variacion") {
                return y(d.Variacion);
            } else {
                return y(d.Cantidad);
            }
        });
    var area2 = d3.svg.area()
        .interpolate("monotone")
        .x(function (d) {
            return x2(d.fecha);
        }).y0(height2)
        .y1(function (d) {
            if (modelTag === "cantidad") {
                return y2(d.Cantidad);
            } else if (modelTag === "preciocierre") {
                return y2(d.UltimoPrecio);
            } else if (modelTag === "variacion") {
                return y2(d.Variacion);
            } else {
                return y2(d.Cantidad);
            }
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
        y.domain([0,
            d3.max(data.map(function (d) {
                if (modelTag === "cantidad") {
                    return d.Cantidad;
                } else if (modelTag === "preciocierre") {
                    return d.UltimoPrecio;
                } else if (modelTag === "variacion") {
                    return d.Variacion;
                } else {
                    return d.Cantidad;
                }
            }))
        ]);
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
            .attr("height", height2 + 7);
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
        if (modelTag === "cantidad") {
            d.Cantidad = +d.Cantidad;
        } else if (modelTag === "preciocierre") {
            d.UltimoPrecio = +d.UltimoPrecio;
        } else if (modelTag === "variacion") {
            //return d.Variacion;
            d.Variacion = +d.Variacion;
        } else {
            return d.Cantidad;
        }

        return d;
    }
}


//* - - - - - -  - - - - - - - - - - -  -
// Tarea comparar acciones.

function loadLineChart1() {
    // Set the dimensions of the canvas / graph
    var margin = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = 900 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    // Parse the date / time
    // var parseDate = d3.time.format("%d-%b-%y").parse,
    var parseDate = d3.time.format("%b %d %Y").parse,
        formatDate = d3.time.format("%d-%b"),
        bisectDate = d3.bisector(function (d) {
            return d.fecha;
        }).left;
    var parseDate = d3.time.format("%b %d %Y").parse;
    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(5);
    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(15);
    // Define the line
    var valueline = d3.svg.line()
        .x(function (d) {
            return x(d.fecha);
        })
        .y(function (d) {
            return y(d.Variacion);
        });
    // Adds the svg canvas
    var svg = d3.select("#line")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    var lineSvg = svg.append("g");
    var focus = svg.append("g")
        .style("display", "none");

    var first = false;
    for (i = 0; i < acciones.length; i++) {
        loadLine(acciones[i]);
    }
    loadLine({
        accion: "COLCAP",
        color: "red"
    });

    function loadLine(accion) {
        console.log("acc " + accion.accion);
        d3.csv("data/hist/" + accion.accion + "_HIST.CSV", function (error, data) {

            data.forEach(function (d) {
                d.fecha = parseDate(d.fecha);
                d.Variacion = +d.Variacion;
            });
            // Scale the range of the data
            x.domain(d3.extent(data, function (d) {
                return d.fecha;
            }));
            y.domain([-12, 12]);
            // Add the valueline path.
            if (accion.accion === "COLCAP") {
                lineSvg.append("path")
                    .attr("class", "line")
                    .style("stroke", "red")
                    .attr("d", valueline(data));
            } else {
                lineSvg.append("path")
                    .attr("class", "line")
                    .style("stroke", accion.color)
                    .attr("d", valueline(data));
            }

            // Add the X Axis
            if (!first) {
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
                first = true;
            }

            // Add the Y Axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);
            // append the x line
            focus.append("line")
                .attr("class", "x")
                .style("stroke", "blue")
                .style("stroke-dasharray", "3,3")
                .style("opacity", 0.5)
                .attr("y1", 0)
                .attr("y2", height);
            // append the y line
            focus.append("line")
                .attr("class", "y")
                .style("stroke", "blue")
                .style("stroke-dasharray", "3,3")
                .style("opacity", 0.5)
                .attr("x1", width)
                .attr("x2", width);
            // append the circle at the intersection
            focus.append("circle")
                .attr("class", "y")
                .style("fill", "none")
                .style("stroke", "blue")
                .attr("r", 4);
            // place the value at the intersection
            focus.append("text")
                .attr("class", "y1")
                .style("stroke", "white")
                .style("stroke-width", "3.5px")
                .style("opacity", 0.8)
                .attr("dx", 8)
                .attr("dy", "-.3em");
            focus.append("text")
                .attr("class", "y2")
                .attr("dx", 8)
                .attr("dy", "-.3em");
            // place the date at the intersection
            focus.append("text")
                .attr("class", "y3")
                .style("stroke", "white")
                .style("stroke-width", "3.5px")
                .style("opacity", 0.8)
                .attr("dx", 8)
                .attr("dy", "1em");
            focus.append("text")
                .attr("class", "y4")
                .attr("dx", 8)
                .attr("dy", "1em");
            // append the rectangle to capture mouse
            if (accion.accion === "COLCAP") {
                svg.append("rect")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "none")
                    .style("pointer-events", "all")
                    .on("mouseover", function () {
                        focus.style("display", null);
                        focus.style("font-size", "18pt");
                    })
                    .on("mouseout", function () {
                        focus.style("display", "none");
                    })
                    .on("mousemove", mousemove);

                function mousemove() {
                    var x0 = x.invert(d3.mouse(this)[0]),
                        i = bisectDate(data, x0, 1),
                        d0 = data[i - 1],
                        d1 = data[i],
                        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    focus.select("circle.y").attr("transform", "translate(" + x(d.fecha) + "," + y(d.Variacion) + ")");
                    focus.select("text.y1").attr("transform", "translate(" + x(d.fecha) + "," + y(d.Variacion) + ")")
                        .text(d.close);
                    focus.select("text.y2").attr("transform", "translate(" + x(d.fecha) + "," + y(d.Variacion) + ")")
                        .text(d.Variacion);
                    focus.select("text.y3").attr("transform", "translate(" + x(d.fecha) + "," + y(d.Variacion) + ")")
                        .text(formatDate(d.fecha));
                    focus.select("text.y4").attr("transform", "translate(" + x(d.fecha) + "," + y(d.Variacion) + ")")
                        .text(formatDate(d.fecha));
                    focus.select(".x").attr("transform", "translate(" + x(d.fecha) + "," + y(d.Variacion) + ")")
                        .attr("y2", height - y(d.Variacion));
                    focus.select(".y").attr("transform", "translate(" + width * -1 + "," + y(d.Variacion) + ")")
                        .attr("x2", width + width);
                }
            } else {

                svg.append("rect")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "none")
                    .style("pointer-events", "all")
                    .on("mouseover", function () {
                        focus.style("display", null);
                        focus.style("font-size", "18pt");
                    })
                    .on("mouseout", function () {
                        focus.style("display", "none");
                    });
            }
        });
    }
}

/**
 * Metodo que genera un color aleatorio
 * @returns {String}
 */
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/***
 * Metodo que recibe el llamado de la caja de texto
 * @returns {undefined}
 */
$(function () {

    $('.selectpicker').on('change', function () {
        var selected = $(this).find("option:selected").val();
        //alert(selected);
        sectorSelector(selected.toLowerCase());
    });

});
