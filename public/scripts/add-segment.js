const dataSegment = document.querySelector('[data-segment]');
const segmentGroup = document.getElementById('segment-group');
const splitTransaction = document.getElementById('split-button');

splitTransaction.addEventListener('click', () => {
  let dynamicDiv = document.createElement('div');
  dynamicDiv.innerHTML = dataSegment.innerHTML;
  segmentGroup.append(dynamicDiv);
});
