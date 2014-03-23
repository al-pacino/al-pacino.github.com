function ge(el)
{
	return (typeof el == 'string' || typeof el == 'number') ?
		document.getElementById(el) : el;
}

function geByTag(node, searchTag)
{
	node = ge(node) || document;
	return node.getElementsByTagName(searchTag);
}

function geByTag1(node, searchTag)
{
	var r = geByTag(node, searchTag);
	if(r.length > 0)
		return r[0];
}

function hasClass(obj, name)
{
	obj = ge(obj);
	return obj && (new RegExp('(\\s|^)' + name + '(\\s|$)')).test(obj.className);
}
function addClass(obj, name)
{
	if ((obj = ge(obj)) && !hasClass(obj, name))
	{
		obj.className = (obj.className ? obj.className + ' ' : '') + name;
	}
}
function removeClass(obj, name)
{
	if (obj = ge(obj))
	{
		obj.className = trim((obj.className || '').replace((new RegExp('(\\s|^)'
			+ name + '(\\s|$)')), ' '));
	}
}

function trim(text)
{
	return (text || '').replace(/^\s+|\s+$/g, '');
}

function toggle(id)
{
	var e = ge(id);
	if(!e)
		return;
	e.style.display = e.style.display == "none" ? "block" : "none";
}

function preventSelection(element){
  var preventSelection = false;

  function addHandler(element, event, handler){
    if (element.attachEvent)
      element.attachEvent('on' + event, handler);
    else
      if (element.addEventListener)
        element.addEventListener(event, handler, false);
  }
  function removeSelection(){
    if (window.getSelection) { window.getSelection().removeAllRanges(); }
    else if (document.selection && document.selection.clear)
      document.selection.clear();
  }
  function killCtrlA(event){
    var event = event || window.event;
    var sender = event.target || event.srcElement;

    if (sender.tagName.match(/INPUT|TEXTAREA/i))
      return;

    var key = event.keyCode || event.which;
    if (event.ctrlKey && key == 'A'.charCodeAt(0))
    {
      removeSelection();

      if (event.preventDefault)
        event.preventDefault();
      else
        event.returnValue = false;
    }
  }
  addHandler(element, 'mousemove', function(){
    if(preventSelection)
      removeSelection();
  });
  addHandler(element, 'mousedown', function(event){
    var event = event || window.event;
    var sender = event.target || event.srcElement;
    preventSelection = !sender.tagName.match(/INPUT|TEXTAREA/i);
  });
  addHandler(element, 'mouseup', function(){
    if (preventSelection)
      removeSelection();
    preventSelection = false;
  });
  addHandler(element, 'keydown', killCtrlA);
  addHandler(element, 'keyup', killCtrlA);
}
