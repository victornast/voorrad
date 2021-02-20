var myDataTemplate =
  'date	Income	Expense	Balance\n\
20111001	1500	1100	400\n\
20111002	1500	1300	600\n\
20111003	1500	1900	200\n\
20111004	1500	1400	300\n\
20111005	1500	1600	200\n\
20111006	1500	1800	-100\n\
20111007	1500	1500	-100\n\
20111008	1500	1300	100\n\
20111009	1500	1300	300\n\
20111010	1500	1200	600\n\
20111011	1500	1100	1000\n\
20111012	1500	1500	1000\n\
';
const colorsBalance = ['#2f74ad', '#fc6397', '#ffa600'];

const getLineChart = document.querySelector('[data-line-chart-summary]');

const widthLineChartContainer = getLineChart.offsetWidth;
const heightLineChartContainer = getLineChart.offsetHeight;

const monthlySummaries = [getLineChart.dataset.lineChartIncome.split(',')];
monthlySummaries.push(getLineChart.dataset.lineChartExpenses.split(','));
monthlySummaries.push(getLineChart.dataset.lineChartSummary.split(','));

var margin = {
    top: 20,
    right: 30,
    bottom: 30,
    left: 280
  },
  widthLineChart = widthLineChartContainer - margin.left - margin.right,
  heightLineChart = heightLineChartContainer - margin.top - margin.bottom;

var parseDate = d3.time.format('%Y%m%d').parse;

var x = d3.time.scale().range([0, widthLineChart]);

var y = d3.scale.linear().range([heightLineChart, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis().scale(x).orient('bottom');

var yAxis = d3.svg.axis().scale(y).orient('left');

var line = d3.svg
  .line()
  .x(function (d) {
    return x(d.date);
  })
  .y(function (d) {
    return y(d.temperature);
  });

var svgLineChart = d3
  .select(getLineChart)
  .append('svg')
  .attr('width', widthLineChart + margin.left + margin.right)
  .attr('height', heightLineChart + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var data = d3.tsv.parse(myDataTemplate);

color.domain(
  d3.keys(data[0]).filter(function (key) {
    return key !== 'date';
  })
);

data.forEach(function (d, i) {
  d.date = i + 1;
});

const cities = color.domain().map(function (name) {
  return {
    name: name,
    values: data.map(function (d) {
      return {
        date: d.date,
        temperature: +d[name]
      };
    })
  };
});

for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 12; j++) {
    cities[i].values[j].temperature = Number(monthlySummaries[i][j]);
  }
}

x.domain(
  d3.extent(data, function (d) {
    return d.date;
  })
);

y.domain([
  d3.min(cities, function (c) {
    return d3.min(c.values, function (v) {
      return v.temperature;
    });
  }),
  d3.max(cities, function (c) {
    return d3.max(c.values, function (v) {
      return v.temperature;
    });
  })
]);

svgLineChart
  .append('g')
  .attr('class', 'x axis')
  .attr('transform', 'translate(0,' + heightLineChart + ')')
  .call(xAxis)
  .style('fill', '#fffaf0');

svgLineChart
  .append('g')
  .attr('class', 'y axis')
  .call(yAxis)
  .style('fill', '#fffaf0')
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', 6)
  .attr('dy', '.71em')
  .style('text-anchor', 'end')
  .text('Amount');

var city = svgLineChart
  .selectAll('.city')
  .data(cities)
  .enter()
  .append('g')
  .attr('class', 'city');

city
  .append('path')
  .attr('class', 'line')
  .attr('d', function (d) {
    return line(d.values);
  })
  .style('stroke', function (d, i) {
    return colorsBalance[i];
  });
