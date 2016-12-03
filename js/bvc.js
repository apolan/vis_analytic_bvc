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

var margin = {top: 10, right: 0, bottom: 0, left: 10},
width = windowWidth - margin.left - margin.right,
        height = windowHeight - margin.top - margin.bottom;

//var color = d3.scale.category20b();
//var color = d3.scale.ordinal().range([ "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"]);   //colorbrewer purples

var modelTag = "cantidad";
var segmentTag = "variable";
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
    d3.select(this).style("box-shadow", "inset 0 0 10px white");
   /* d3.select(this).transition()
            .duration(750)
            .attr("transform", "translate(480,480)scale(23)rotate(180)").transition()
      .delay(1500)
      .attr("transform", "translate(240,240)scale(0)")
     );/*/

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
    /*
     initialize(treeData);
     accumulate(treeData);
     layout(treeData);*/
    display(treeData);

    function initialize(root) {
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    function accumulate(d) {
        //console.log(d.children);
        return d.values
                ? d.value = d.values.reduce(function (p, v) {
                    return p + accumulate(v);
                }, 0)
                : +d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
        if (d.values) {
            treemap.nodes({values: d.values});
            d.values.forEach(function (c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                layout(c);
            });
        }
    }

    function display(d) {
        grandparent.datum(d.parent)
                .on("click", transition);
        //.select("text")
        //.text(name(d));

        var g = d3.selectAll(".node-website");
        // .data(d.values);

        g.filter(function (d) {
            return d.values;
        }).classed("children", true).on("click", transition);

        /*g.selectAll(".child")
         .data(function (d) {
         return d.values || [d];
         })
         .enter().append("rect")
         .attr("class", "child")
         .call(rect);
         /*/
        /*     g.append("rect")
         .attr("class", "parent")
         .call(rect)
         .append("title")
         .text(function (d) {
         return formatNumber(+d.value);
         });
         
         g.append("text")
         .attr("dy", ".75em")
         .text(function (d) {
         return name(d);
         })
         .call(text);
         */
        function transition(d) {
            if (transitioning || !d)
                return;
            transitioning = true;

            var g2 = display(d),
                    t1 = g1.transition().duration(750),
                    t2 = g2.transition().duration(750);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            div.style("shape-rendering", null);

            /*// Draw child nodes on top of parent nodes.
             div.selectAll(".depth").sort(function (a, b) {
             return a.depth - b.depth;
             });*/

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);

            // Transition to the new view.
            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function () {
                div.style("shape-rendering", "crispEdges");
                transitioning = false;
            });
        }

        return g;
    }

    function text(text) {
        text.attr("x", function (d) {
            return x(d.x) + 6;
        })
                .attr("y", function (d) {
                    return y(d.y) + 6;
                });
    }

    function rect(rect) {
        rect.attr("x", function (d) {
            return x(d.x);
        })
                .attr("y", function (d) {
                    return y(d.y);
                })
                .attr("width", function (d) {
                    return x(d.x + d.dx) - x(d.x);
                })
                .attr("height", function (d) {
                    return y(d.y + d.dy) - y(d.y);
                });
    }



    customeAnimation();

    // Zoom

});

///////////////////////////////

function hideTooltip() {
    d3.select("#tooltip").classed("hidden", true);
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
                }
            });
}
