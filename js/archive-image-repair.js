document.addEventListener('error', function (event) {
  var image = event.target;

  if (!(image instanceof HTMLImageElement) || !image.closest('.article-entry')) {
    return;
  }

  var parent = image.parentElement;
  if (!parent || parent.classList.contains('image-unavailable')) {
    return;
  }

  parent.classList.add('image-unavailable');
  parent.setAttribute('data-image-unavailable', 'true');
  parent.appendChild(document.createTextNode('Archived image unavailable.'));
}, true);
