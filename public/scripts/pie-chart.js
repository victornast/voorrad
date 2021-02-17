const getPieChartData = document.querySelector('[data-pie-chart-expenses]');
const expenses = getPieChartData.dataset.pieChartExpenses.split(',');
const categories = getPieChartData.dataset.pieChartCategoryName.split(',');
const colors = [
  '#ffa600',
  '#ff8545',
  '#ff6c71',
  '#fc6397',
  '#d567b4',
  '#a170c2',
  '#6875bf',
  '#2f74ad'
];

const width = document.querySelector('[data-pie-chart-expenses]').offsetWidth;
const height = document.querySelector('[data-pie-chart-expenses]').offsetHeight;
const minDimension = Math.min(width, height) / 2;
const initialAnimationDelay = 300;
const arcAnimationDelay = 150;
const arcAnimationDuration = 3000;
const secDuration = 1000;
const secIndividualDelay = 150;

let radius;

// Calculate chart Radius
if (minDimension > 200) {
  radius = 200;
} else {
  radius = minDimension;
}

// Append SVG
let svg = d3
  .select('.vr-yearly-expense-summary-chart')
  .append('svg')
  .attr({ width: width, height: height, class: 'pieChart' })
  .append('g');

svg.attr({ transform: `translate(${width / 2}, ${height / 2})` });

// Draw Slices
let arc = d3.svg
  .arc()
  .innerRadius(radius * 0.6)
  .outerRadius(radius * 0.45);

// Draw Labels and Polylines
let outerArc = d3.svg
  .arc()
  .innerRadius(radius * 0.85)
  .outerRadius(radius * 0.85);

let pie = d3.layout.pie().value((d) => d);

let draw = function () {
  svg.append('g').attr('class', 'lines');
  svg.append('g').attr('class', 'slices');
  svg.append('g').attr('class', 'labels');

  // Define Slice
  let slice = svg.select('.slices').datum(expenses).selectAll('path').data(pie);
  slice
    .enter()
    .append('path')
    .attr({
      fill: (d, i) => colors[i],
      d: arc,
      'stroke-width': '25px',
      transform: (d, i) => 'rotate(-180,0,0)'
    })
    .style('opacity', 0)
    .transition()
    .delay((d, i) => i * arcAnimationDelay + initialAnimationDelay)
    .duration(arcAnimationDuration)
    .ease('elastic')
    .style('opacity', 1)
    .attr('transform', 'rotate(0,0,0)');

  slice
    .transition()
    .delay((d, i) => arcAnimationDuration + i * secIndividualDelay)
    .duration(secDuration)
    .attr('stroke-width', '5px');

  let midAngle = (d) => d.startAngle + (d.endAngle - d.startAngle) / 2;

  let text = svg.select('.labels').selectAll('text').data(pie(expenses));

  text
    .enter()
    .append('text')
    .attr('dy', '0.35em')
    .style('opacity', 0)
    .style('fill', (d, i) => colors[i])
    .text((d, i) => categories[i])
    .attr('transform', (d) => {
      //outer Arc center
      let pos = outerArc.centroid(d);
      //define text alignment
      pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
      return `translate(${pos})`;
    })
    .style('text-anchor', (d) => (midAngle(d) < Math.PI ? 'start' : 'end'))
    .transition()
    .delay((d, i) => arcAnimationDuration + i * secIndividualDelay)
    .duration(secDuration)
    .style('opacity', 1);

  let polyline = svg.select('.lines').selectAll('polyline').data(pie(expenses));

  polyline
    .enter()
    .append('polyline')
    .style('opacity', 1)
    .attr('points', (d) => {
      let pos = outerArc.centroid(d);
      pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
      return [arc.centroid(d), arc.centroid(d), arc.centroid(d)];
    })
    .transition()
    .duration(secDuration)
    .delay((d, i) => arcAnimationDuration + i * secIndividualDelay)
    .attr('points', (d) => {
      let pos = outerArc.centroid(d);
      pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
      return [arc.centroid(d), outerArc.centroid(d), pos];
    });
};

draw();
