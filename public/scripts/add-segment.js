const dataSegment = document.querySelector('[data-segment]');
const dataSegmentClasses = dataSegment.classList;
const segmentGroup = document.querySelector('[data-segment-group]');
const splitTransaction = document.querySelector('[data-segment-button]');

splitTransaction.addEventListener('click', () => {
  let dynamicDiv = document.createElement('div');
  dynamicDiv.innerHTML = dataSegment.innerHTML;
  dynamicDiv.classList.add(...dataSegmentClasses);
  segmentGroup.insertBefore(dynamicDiv, splitTransaction);
});
