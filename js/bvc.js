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

var arrayAcciones = [];

// A menor nivel mayor contraste de color
var colorLevel_1;
var colorLevel_2;
var colorLevel_3;
var colorLevel_4;
var colorLevel_5;

var margin = {top: 10, right: 0, bottom: 0, left: 10},
width = windowWidth - margin.left - margin.right,
        height = windowHeight - margin.top - margin.bottom;

//var color = d3.scale.category20b();
//var color = d3.scale.ordinal().range([ "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"]);   //colorbrewer purples

var modelTag = "cantidad";

//var highlightColor = "#de77ae";
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
        });

var div = d3.select("#viz")
        .style("position", "relative")
        //.attr("class", "bdy_acciones")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) + "px")
//.style("left", margin.left + "px")
//.style("top", margin.top + "px");


var clickCount = 0;

var mouseClick = function (d) {

    var xPosition = d3.event.pageX;
    var yPosition = d3.event.pageY;

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
    d3.select(this)
            .style("box-shadow", "inset 0 0 10px white");

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

};

// 	Se carga csv
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
            .style("border", "solid 1px black")
            .on("click", mouseClick);

    /*color.domain(node.map(function (d) {
        return d.key;
    }));*/

    // Se da color no se tdavia como
    //node.style("background", function (d) {
    //return d.children ? color(d.key) : color(d.parent.key);
    //return d.children ? color(d.key) : color(d.parent.key);
    node.style("background", "green");

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
            })
            .style("z-index", function (d) {
                if (d.y - cellpadding === d.parent.y && d.x - cellpadding === d.parent.x) {
                    return 99;
                }
            });

    customeAnimation = function (option) {

        hideTooltip();
        var value = function () {
            return 1;
        }
        animate(value);

        if (option === 'preciocierre') {

            value = function (d) {
                return d.PRECIOCIERRE;
            };
            animate(value);
        } else if (option === 'cantidad') {

            value = function (d) {
                return d.CANTIDAD;
            };
            animate(value);


        } else if (option === 'monto') {

            value = function (d) {
                return d.MONTO;
            };
            animate(value);

        } else {

            value = function (d) {
                return d.CANTIDAD;
            };
            animate(value);
        }
        updateColor();
    };

    customeAnimation();

    function animate(value) {
        node
                .data(treemap.value(value).nodes)
                .transition()
                .duration(3500)
                .call(position);
    }

///////////////////////////////

    d3.selectAll(".formCheckbox").on("change", updateNodeColors);

    function updateNodeColors() {
        hideTooltip();
        console.log("updateColors");
        var count = 0;
        node
                .transition()
                .style("background", function (d) {

                    var matchesATopic = false,
                            topics = [
                                "PRECIOCIERRE"
                            ],
                            topicsForm = document.forms.formTopic;

                    if (d.children) {
                        console.log("has children " + d.key);

                    } else {

                        for (i = 0; i < topics.length; i++) {
                            //console.log(topics[i]);
                            if (topicsForm[topics[i]].checked == true) {
                                //console.log(d[topics[i]]);
                                if (d[topics[i]] == "X") {

                                    matchesATopic = true;
                                    console.log(d.key + " " + matchesATopic);
                                    count++;

                                    break;

                                }
                                ;
                            }
                            ;
                        }
                    }
                    ;

                    if (matchesATopic) {
                        return highlightColor
                    } else
                        //return d.children ? color(d.key) : color(d.parent.key);
                        console.log("verde");
                    return "green";
                });

        d3.select("#numberofsites").text(count);
    }
    ;
});

///////////////////////////////

function hideTooltip() {
    d3.select("#tooltip").classed("hidden", true);
}

function position() {
    this.style("left", function (d) {
        return d.x + "px";
    })
            .style("top", function (d) {
                return d.y + "px";
            })
            .style("width", function (d) {
                return Math.max(0, d.dx - 1) + "px";
            })
            .style("height", function (d) {
                return Math.max(0, d.dy - 1) + "px";
            });
}

// ----------- Funciones propias afp

function setModel(tag) {
    modelTag = tag;
    customeAnimation(tag);

}

/**
 * Funcion que maneja los colores en el treemap dependiendo la variable global modeltag
 * @returns {undefined}
 */
function updateColor() {

    console.log("Entra update - - - - ");
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
        console.log((modelTag))
        if (modelTag === "cantidad") {
            if (d.CANTIDAD > 0) {
                arrayAcciones.push(d.CANTIDAD);
            }
        }else if (modelTag === "preciocierre") {
            //if (d.PRECIOCIERRE > 0) {
                arrayAcciones.push(d.PRECIOCIERRE);
            //}
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
                        console.log("entra 1 " + d.CANTIDAD + " " + colorLevel_1);
                        return  "#052840";
                    } else if (Number(d.CANTIDAD) > Number(colorLevel_2)) {
                        console.log("entra 2 " + d.CANTIDAD + " " + colorLevel_2);
                        return  "#375366";
                    } else if (Number(d.CANTIDAD) > Number(colorLevel_3)) {
                        console.log("entra 3 " + d.CANTIDAD + " " + colorLevel_3);
                        return  "#697E8C";
                    } else if (Number(d.CANTIDAD) > Number(colorLevel_4)) {
                        console.log("entra 4 " + d.CANTIDAD + " " + colorLevel_4);
                        return  "#9BA9B2";
                    }
                    return "#B4BEC5";
                } else if (modelTag === "preciocierre") {
                    if (Number(d.PRECIOCIERRE) > Number(colorLevel_1)+200000) {
                        console.log("entra 1 " + d.PRECIOCIERRE + " " + colorLevel_1);
                        return  "#052840";
                    } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_2)) {
                        console.log("entra 2 " + d.PRECIOCIERRE + " " + colorLevel_2);
                        return  "#375366";
                    } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_3)) {
                        console.log("entra 3 " + d.PRECIOCIERRE + " " + colorLevel_3);
                        return  "#697E8C";
                    } else if (Number(d.PRECIOCIERRE) > Number(colorLevel_4)) {
                        console.log("entra 4 " + d.PRECIOCIERRE + " " + colorLevel_4);
                        return  "#9BA9B2";
                    }
                    return "#B4BEC5";
                }
            });
}
