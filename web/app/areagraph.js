d3 = require('d3');
moment = require('moment');

function AreaGraph(selector, modeColor, modeOrder) {
    this.rootElement = d3.select(selector);
    this.graphElement = this.rootElement.append('g');
    this.verticalLine = this.rootElement.append('line')
        .style('display', 'none');

    // Create axis
    this.xAxisElement = this.rootElement.append('g')
        .attr('class', 'x axis');

    // Create scales
    this.x = d3.scaleTime();
    this.y = d3.scaleLinear();
    this.z = d3.scaleOrdinal()
        .domain(modeOrder)
        .range(modeOrder.map(function(d) { return modeColor[d]; }));

    // 
    this.stack = d3.stack()
        .keys(modeOrder.reverse());
}

AreaGraph.prototype.data = function (arg) {
    if (!arg) return this._data;
    if (!arg.length) {
        this._data = [];
        return this;
    }

    // Parse data
    this._data = data = arg.map(function(d) {
        var obj = {
            datetime: moment(d.datetime).toDate()
        };
        // Add production
        d3.entries(d.production).forEach(function(o) { obj[o.key] = o.value; });
        return obj;
    });

    // Set domains
    this.x.domain(d3.extent(data, function(d) { return d.datetime; }));
    /*this.y.domain([
        d3.min(arg, function(d) { return d.totalExport; }),
        d3.max(arg, function(d) { return d.totalImport + d.totalProduction; })
    ]);*/
    this.y.domain([
        0,
        d3.max(arg, function(d) { return d.totalProduction; })
    ]);

    return this;
}

AreaGraph.prototype.render = function () {
    // Convenience
    var that = this,
        x = this.x,
        y = this.y,
        z = this.z,
        stack = this.stack,
        data = this._data;

    // Set scale range, based on effective pixel size
    var width  = this.rootElement.node().getBoundingClientRect().width,
        height = this.rootElement.node().getBoundingClientRect().height;
    var X_AXIS_HEIGHT = 20;
    var X_AXIS_PADDING = 4;
    x.range([0, width]);
    y.range([height, X_AXIS_HEIGHT + X_AXIS_PADDING]);

    var area = d3.area()
        .x(function(d, i) { return x(d.data.datetime); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); });

    var selection = this.graphElement
        .selectAll('.layer')
        .data(stack(data))
    var layer = selection.enter().append('g')
        .attr('class', 'layer');

    layer.append('path')
        .attr('class', 'area')
    layer.merge(selection).select('path.area')
        .on('mouseover', function (d) {
            if (that.mouseOverHandler)
                that.mouseOverHandler.call(this, d);
        })
        .on('mouseout', function (d) {
            if (that.mouseOutHandler)
                that.mouseOutHandler.call(this, d);
        })
        .on('mousemove', function (d) {
            if (that.mouseMoveHandler)
                that.mouseMoveHandler.call(this, d);
        })
        .transition()
        .style('fill', function(d) { return z(d.key); })
        .attr('d', area);

    // x axis
    var xAxis = d3.axisTop(x)
        .ticks(6)
        .tickFormat(function(d) { return moment(d).format('LT'); });
    this.xAxisElement
        .transition()
        .style('transform', 'translate(0, ' + X_AXIS_HEIGHT + 'px)')
        .call(xAxis);

    return this;
}

AreaGraph.prototype.onMouseOver = function(arg) {
    if (!arg) return this.mouseOverHandler;
    else this.mouseOverHandler = arg;
    return this;
}
AreaGraph.prototype.onMouseOut = function(arg) {
    if (!arg) return this.mouseOutHandler;
    else this.mouseOutHandler = arg;
    return this;
}
AreaGraph.prototype.onMouseMove = function(arg) {
    if (!arg) return this.mouseMoveHandler;
    else this.mouseMoveHandler = arg;
    return this;
}

module.exports = AreaGraph;
