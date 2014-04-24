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

function getDistinctArray(arr) {
    var dups = {};
    return arr.filter(function(el) {
        var hash = el.valueOf();
        var isDup = dups[hash];
        dups[hash] = true;
        return !isDup;
    });
}