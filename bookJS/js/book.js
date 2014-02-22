var book =
{
	pages_count: 14,
	page: 1, /* from 1 to pages_count */
	pages_path_prefix: "bo/",
	pages_path_suffix: ".jpg",
	
	preloder_image_path: "design_images/preloader.png",
	preloader_frame_width: 100,
	preloader_frame_height: 100,
	preloader_frame_count: 12,

	image_width: 360,
	image_height: 480,
	image_left: 20,
	image_top: 50,
	
	book_width: 830,
	book_height: 600,
	
	page_width: 400,
	page_height: 580,
	canvas_padding: 50,
		
	progress: 1,

	init: function()
	{
		var _t = this;
		
		_t.initGui();
		
		_t.preloader = document.createElement("img");
		_t.preloader.src = _t.preloder_image_path;
		_t.preloader_current_frame = 0;
		
		_t.mouse = {x: 0, y: 0};
		_t.page--;
		_t.page = Math.max(0, Math.min(_t.pages_count-1, _t.page));
		if(_t.page % 2)
			_t.page++;
		_t.bg_page = _t.page-1;
		_t.pages = new Array(_t.pages_count);
		_t.flips = new Array(_t.pages_count);
		for(var i = 0; i < _t.pages_count; i++)
		{
			_t.loadImage(i);
			_t.flips[i] =
			{
				progress: 0,
				target: 0,
				running: false,
				dragging: false,
				loaded: false
			};
			
		}
		
		setInterval(function(){_t.render();}, 30);
		document.addEventListener("mousemove",
									function(e){_t.mmove(e);}, false);
		ge("book").addEventListener("mousedown",
									function(e){_t.mdown(e);}, false);
		document.addEventListener("mouseup", function(e){_t.mup(e);}, false);
		document.addEventListener("mouseup", function(e){_t.mup(e);}, false);
		document.addEventListener("mouseup", function(e){_t.mup(e);}, false);
		document.addEventListener("keydown", function(e){
			if(e.keyCode == 39)
				_t.change(2);
			else if(e.keyCode == 37)
				_t.change(-2);
		}, false);
	},
	initGui: function()
	{
		var _t = this;
		
		var book = ge("book");		
		book.style.width = _t.book_width+"px";
		book.style.height = _t.book_height+"px";
		book.style.marginLeft = Math.floor(-_t.book_width / 2)+"px";
		book.style.marginTop = Math.floor(-_t.book_height / 2)+"px";
		
		var canvas = document.createElement("canvas");				
		_t.context = canvas.getContext("2d");
		_t.canvas_width = 2 * _t.page_width;
		_t.canvas_height = _t.page_height + 2 * _t.canvas_padding;		
		canvas.width = _t.canvas_width;
		canvas.height = _t.canvas_height;
		canvas.style.left = "0px";
		canvas.style.top = (-_t.canvas_padding)+"px";
		book.appendChild(canvas);
		
		/* navigation */
		var nav = document.createElement("div");		
		nav.style.width = _t.book_width+"px";
		nav.className = "navigation";
		book.appendChild(nav);
		
		_t.buttons = {};
		_t.buttons.begin = _t.createButton(" begin ", function(e){
			_t.goToPage(0); });
		_t.buttons.end = _t.createButton(" end ", function(e){
			_t.goToPage(_t.pages_count-1); });
		
		_t.buttons.m2 = _t.createButton(" &lt; ", function(e){
			_t.change(-2); });
		_t.buttons.p2 = _t.createButton(" &gt; ", function(e){
			_t.change(2); });
		
		if(_t.pages_count >= 40)
		{
			_t.buttons.m20 = _t.createButton(" &lt;&lt; ", function(e){
				_t.change(-20); });
			_t.buttons.p20 = _t.createButton(" &gt;&gt; ", function(e){
				_t.change(20); });
		}
		if(_t.pages_count >= 200)
		{
			_t.buttons.m100 = _t.createButton(" &lt;&lt;&lt; ", function(e){
				_t.change(-100); });
			_t.buttons.p100 = _t.createButton(" &gt;&gt;&gt; ", function(e){
				_t.change(100); });
		}
		
		_t.input_text = document.createElement("input");
		_t.input_text.className = "page_number";
		_t.input_text.onkeydown = function(e){
			if(e.keyCode == 13){ _t.pageNumberGo(); }
		};
		_t.show_page_number = true;
		_t.input_text.onfocus = function(e){
			_t.show_page_number = false;
			_t.input_text.select();
		};
		_t.input_text.onblur = function(e){
			_t.show_page_number = true;
		};
		
		var span = document.createElement("span");
		span.innerHTML = "/ " + _t.pages_count;
		
		nav.appendChild(_t.buttons.begin);
		if(_t.buttons.m100) nav.appendChild(_t.buttons.m100);
		if(_t.buttons.m20) nav.appendChild(_t.buttons.m20);
		nav.appendChild(_t.buttons.m2);
		nav.appendChild(_t.input_text);
		nav.appendChild(span);
		nav.appendChild(_t.buttons.p2);
		if(_t.buttons.p20) nav.appendChild(_t.buttons.p20);
		if(_t.buttons.p100) nav.appendChild(_t.buttons.p100);
		nav.appendChild(_t.buttons.end);
		nav.appendChild(document.createElement("br"));
		
		_t.buttons.pages = [];
		for(var i = 0; i < 13; i++)
		{
			var b = _t.createButton("",	function(e){
				_t.onNavButtonClick(e);
			});
			_t.buttons.pages.push(b);
			nav.appendChild(b);
		}
	},
	createButton: function(caption, action)
	{
		var button = document.createElement("button");
		button.innerHTML = caption;
		if(arguments.length > 2)
			button.className = arguments[2];
		button.onclick = function(){action(this);};
		return button;
	},
	change: function(p)
	{
		var _t = this;
		_t.goToPage(_t.page+p);
	},
	onNavButtonClick: function(e)
	{
		var _t = this;
		np = parseInt(e.innerHTML);
		if(np > 0 && np <= _t.pages_count)
			_t.goToPage(np-1);
	},
	activateButton: function(e, f)
	{
		if(!e)
			return;
		if(f)
		{
			e.setAttribute("disabled", "disabled");
			e.className = "active";
		}
		else
		{
			e.removeAttribute("disabled");
			e.className = "";
		}
	},
	updateNavButtons: function()
	{
		var _t = this;
		
		_t.activateButton(_t.buttons.begin, (_t.page == 0));
		_t.activateButton(_t.buttons.end, (_t.page >= _t.pages_count-1));
		_t.activateButton(_t.buttons.m100, ((_t.page-100) < 0));
		_t.activateButton(_t.buttons.m20, ((_t.page-20) < 0));
		_t.activateButton(_t.buttons.m2, ((_t.page-2) < 0));
		_t.activateButton(_t.buttons.p2, ((_t.page+2) > _t.pages_count));
		_t.activateButton(_t.buttons.p20, ((_t.page+20) > _t.pages_count));
		_t.activateButton(_t.buttons.p100, ((_t.page+100) > _t.pages_count));
		
		/* pages */
		var al = Math.floor(_t.page / 2);
		var ar = Math.floor((_t.pages_count-_t.page) / 2);
		
		if(al < 6)
			ar = Math.min(ar, 12-al);
		else if(ar < 6)
			al = Math.min(al, 12-ar);
		else
		{
			al = 6;
			ar = 6;
		}
		
		for(var bi = 0, sp = _t.page-2*al, fp = _t.page+2*ar;
												bi < 13; bi++, sp += 2)
		{
			if(sp > fp)
			{
				_t.buttons.pages[bi].style.display = "none";
			}
			else
			{
				_t.buttons.pages[bi].style.display = "inline";
				_t.buttons.pages[bi].innerHTML = Math.max(sp, 1);
				_t.activateButton(_t.buttons.pages[bi], sp == _t.page);
			}
		}
	},
	pageNumberGo: function()
	{
		var _t = this;
		var np = parseInt(_t.input_text.value.replace(/[^0-9]/g, "").
							replace(/^0+/, "").substr(0,4));
		if(np > 0 && np <= _t.pages_count)
		{
			_t.goToPage(np-1);
		}
		showPageNumber = true;
		_t.input_text.blur();
	},
	goToPage: function(np)
	{
		var _t = this;
		if(np < 0)
			return;
		if(np % 2)
			np++;
		if(np > _t.pages_count)
			return;
		if(np == _t.page)
			return;
		
		var lp, rp;
		for(lp = 0; lp < _t.pages_count; lp++)
			if(_t.flips[lp].running)
				break;
		for(rp = _t.pages_count-1; rp >= 0; rp--)
			if(_t.flips[rp].running)
				break;
		
		if(lp > rp)
		{
			if(np > _t.page)
			{
				//ge("te").innerHTML = "a";
				_t.flips[np-1].progress = 1;
				_t.flips[np-1].target = -1;
				_t.flips[np-1].running = true;
				_t.page = np;
			}
			else
			{
				//ge("te").innerHTML = "b";
				_t.flips[_t.page-1].progress = -1;
				_t.flips[_t.page-1].target = 1;
				_t.flips[_t.page-1].running = true;
				_t.bg_page = np-1;
				_t.page = np;
			}
		}
		/* ---- */
		else
		{
			if(np < lp)
			{
				if(np < _t.bg_page)
				{
					//ge("te").innerHTML = "c";
					for(var i = _t.bg_page; i < _t.pages_count; i++)
					{
						_t.flips[i].target = 1;
					}
					_t.flips[_t.bg_page].progress = -1;
					_t.flips[_t.bg_page].running = true;
					_t.bg_page = np-1;
					_t.page = np;
				}
				else if(np == _t.bg_page+1)
				{
					//ge("te").innerHTML = "d";
					for(var i = _t.bg_page+2; i < _t.pages_count; i++)
					{
						_t.flips[i].target = 1;
					}
					_t.page = np;
				}
				else /* _t.bg_page+1 < np < lp */
				{
					//ge("te").innerHTML = "e";
					for(var i = np; i < _t.pages_count; i++)
					{
						_t.flips[i].target = 1;
					}
					_t.flips[np-1].progress = _t.flips[lp].progress;
					_t.flips[np-1].target = -1;
					_t.flips[np-1].running = true;
					_t.page = np;
				}
			}
			else if(np == rp+1)
			{
				//ge("te").innerHTML = "f";
				for(var i = 0; i < _t.pages_count; i++)
				{
					_t.flips[i].target = -1;
				}
				_t.page = np;
			}
			else if(np > rp+1)
			{
				//ge("te").innerHTML = "g";
				for(var i = 0; i < _t.pages_count; i++)
				{
					_t.flips[i].target = -1;
				}
				_t.flips[np-1].progress = 1;
				_t.flips[np-1].running = true;
				_t.page = np;
			}
			else /* lp < np < rp */
			{
				//ge("te").innerHTML = "h";
				for(var i = lp; i <= np-1; i++)
				{
					_t.flips[i].target = -1;
				}
				var p;
				for(var i = rp; i > np-1; i--)
				{
					if(_t.flips[i].running)
					{
						_t.flips[i].target = 1;
						p = _t.flips[i].progress;
					}
				}
				if(!_t.flips[np-1].running)
				{
					_t.flips[np-1].target = -1;
					_t.flips[np-1].progress = p;
					_t.flips[np-1].running = true;
				}
				_t.page = np;
			}
		}
		/*if(_t.page != np)
			alert('fail: ' + lp + ' ' + rp + ' ' + np);*/
	},
	loadImage: function(pagen)
	{
		var _t = this;
		
		if(_t.pages[pagen])
			return _t.pages[pagen];
		
		_t.pages[pagen] = document.createElement("img");
		_t.pages[pagen].onload = new Function("\
				book.flips["+pagen+"].loaded = true;");
		_t.pages[pagen].src = _t.pages_path_prefix + (pagen+1)
									+ _t.pages_path_suffix;
	},
	drawPreloader: function(x, y)
	{
		var _t = this;
		var w = _t.preloader_frame_width;
		var sx = 0;
		if(arguments.length == 3)
		{
			w = arguments[2];
		}
		else if(arguments.length == 4)
		{
			sx = arguments[2];
			w = arguments[3];
		}
		_t.context.drawImage(_t.preloader,
					_t.preloader_current_frame * _t.preloader_frame_width + sx,
					0, w, _t.preloader_frame_height, x, y,
						w, _t.preloader_frame_height);
	},
	render: function()
	{
		var _t = this;
		_t.preloader_current_frame = (_t.preloader_current_frame+1)%
										_t.preloader_frame_count;
		
		_t.updateNavButtons();
		if(_t.show_page_number)
			_t.input_text.value = Math.max(_t.page, 1);
		
		//ge("te").innerHTML = _t.bg_page + " " + _t.page + " " + user_page;
		
		var co = _t.context;
		co.clearRect(0, 0, _t.canvas_width, _t.canvas_height);
		if(_t.bg_page >= 0)
		{
			if(_t.flips[_t.bg_page].loaded)
				co.drawImage(_t.pages[_t.bg_page],
							_t.image_left + (_t.book_width-2*_t.page_width)/2,
							_t.image_top + (_t.book_height-_t.page_height)/2
								+ _t.canvas_padding);
			else
				_t.drawPreloader(_t.image_left +
									(_t.book_width-2*_t.page_width)/2,
								(_t.page_height-_t.preloader_frame_height)/2 + 
									(_t.book_height-_t.page_height)/2
										+ _t.canvas_padding);
		}								
		if(_t.bg_page+1 < _t.pages_count)
		{
			if(_t.flips[_t.bg_page+1].loaded)
				co.drawImage(_t.pages[_t.bg_page+1],
						_t.image_left + (_t.book_width)/2,
						_t.image_top + (_t.book_height-_t.page_height)/2
							+ _t.canvas_padding);
			else
				_t.drawPreloader(_t.image_width + _t.image_left
									+ (_t.book_width)/2 -
									_t.preloader_frame_width,
								(_t.page_height-_t.preloader_frame_height)/2 + 
									(_t.book_height-_t.page_height)/2
										+ _t.canvas_padding);
		}
		
		for(var i = 0; i < _t.pages_count; i++)
		{
			if(_t.flips[i].dragging)
			{
				_t.flips[i].target = Math.max(
						Math.min(_t.mouse.x/_t.page_width, 1), -1);
				_t.flips[i].progress += (1.3*_t.flips[i].target - 
											_t.flips[i].progress)*0.1;
				_t.drawFlip(i, _t.flips[i].progress);
				continue;
			}
			if(_t.flips[i].running)
			{
				_t.flips[i].progress += (1.3*_t.flips[i].target - 
											_t.flips[i].progress)*0.1;
				_t.drawFlip(i, _t.flips[i].progress);
				if(Math.abs(_t.flips[i].progress) >= 1)
				{
					_t.flips[i].running = false;
					if(_t.flips[i].target < 0)
					{
						_t.bg_page = i;
					}
				}
			}
		}
	},
	mmove: function(e)
	{
		var _t = this;
		var book = ge("book");
		_t.mouse.x = e.clientX - book.offsetLeft - (_t.book_width / 2);
		_t.mouse.y = e.clientY - book.offsetTop;
	},
	mdown: function(e)
	{
		var _t = this;
		if(Math.abs(_t.mouse.x) > _t.page_width ||
			_t.mouse.y < 0 || _t.mouse.y > _t.book_height)
			return;

		if (_t.mouse.x < 0 && _t.page > 1)
		{
			_t.clickedx = _t.mouse.x;
			_t.flips[_t.page-1].dragging = true;
			_t.goToPage(_t.page - 2);
		}
		else if(_t.mouse.x >= 0 && _t.page + 1 < _t.pages_count)
		{
			_t.clickedx = _t.mouse.x;
			_t.flips[_t.page+1].dragging = true;
			_t.goToPage(_t.page + 2);
		}
	},
	mup: function(e)
	{
		var _t = this;
		for(var i = 0; i < _t.pages_count; i++)
		{
			if(_t.flips[i].dragging)
			{
				if(_t.mouse.x < 0)
				{
					if(_t.mouse.x * _t.clickedx > 0)
						_t.goToPage(_t.page + 2);
					else
						_t.flips[i].target = -1;
				}
				else
				{
					if(_t.mouse.x * _t.clickedx > 0)
						_t.goToPage(_t.page - 2);
					else
						_t.flips[i].target = 1;
				}
			}
			_t.flips[i].dragging = false;
		}
	},
	drawFlip: function(p, progress)
	{
		progress = Math.max(-1, Math.min(1, progress));
		var _t = this;
		var co = _t.context;
		
		co.save();
		co.translate((_t.book_width/2),
						_t.canvas_padding + (_t.book_height-_t.page_height)/2);	
		
		var strength = 1 - Math.abs(progress);
		strength = Math.round(strength*1000) / 1000;
		var foldWidth = (_t.page_width * 0.5) * (1 - progress);
		var foldX = _t.page_width * progress + foldWidth;		
		var verticalOutdent = 20 * strength;
		
		var image_right = _t.image_width + _t.image_left;
		var w = Math.max(image_right - foldX, 0);
		if(w > 0)
		{
			if(w < _t.image_width)
				_t.context.clearRect(foldX, 0,
										w, _t.page_height);
			else
				_t.context.clearRect(_t.image_left, _t.image_top,
										_t.image_width, _t.image_height);
		}
		if((p+1) >= 0 && (p+1) < _t.pages_count)
		{
			if(_t.flips[p+1].loaded)
			{
				if(w > 0)
				{
					if(w < _t.image_width)
						co.drawImage(_t.pages[p+1],
										Math.max(_t.image_width - w, 0), 0,
										w, _t.image_height,	foldX, _t.image_top,
										w, _t.image_height);
					else
						co.drawImage(_t.pages[p+1], _t.image_left,
											_t.image_top);
				}
			}
			else
			{
				if(w > 0)
				{
					if(w < _t.preloader_frame_width)
						_t.drawPreloader(foldX,
								(_t.page_height-_t.preloader_frame_height)/2,
								Math.max(_t.preloader_frame_width - w, 0), w);
					else
						_t.drawPreloader(
								image_right - _t.preloader_frame_width,
								(_t.page_height-_t.preloader_frame_height)/2);
				}
			}
		}
		
		var paperShadowWidth = (_t.page_width * 0.5) *	Math.max(
									Math.min(1 - progress, 0.5), 0);
		var rightShadowWidth = (_t.page_width * 0.5) *
									Math.max(Math.min(strength, 0.5), 0);
		var leftShadowWidth = (_t.page_width * 0.5) *
									Math.max(Math.min(strength, 0.5), 0);
		
		co.strokeStyle = 'rgba(0,0,0,'+(0.05 * strength)+')';
		co.lineWidth = 30 * strength;
		co.beginPath();
		co.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
		co.lineTo(foldX - foldWidth, _t.page_height + (verticalOutdent * 0.5));
		co.stroke();

		var rightShadowGradient = co.createLinearGradient(foldX, 0,
									foldX + rightShadowWidth, 0);
		rightShadowGradient.addColorStop(0, 'rgba(0,0,0,'+(strength*0.2)+')');
		rightShadowGradient.addColorStop(0.8, 'rgba(0,0,0,0.0)');
		
		co.fillStyle = rightShadowGradient;
		co.beginPath();
		co.moveTo(foldX, 0);
		co.lineTo(foldX + rightShadowWidth, 0);
		co.lineTo(foldX + rightShadowWidth, _t.page_height);
		co.lineTo(foldX, _t.page_height);
		co.fill();
		
		var leftShadowGradient = co.createLinearGradient(
									foldX - foldWidth - leftShadowWidth,
									0, foldX - foldWidth, 0);
		leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
		leftShadowGradient.addColorStop(1, 'rgba(0,0,0,'+(strength*0.15)+')');
		
		co.fillStyle = leftShadowGradient;
		co.beginPath();
		co.moveTo(foldX - foldWidth - leftShadowWidth, 0);
		co.lineTo(foldX - foldWidth, 0);
		co.lineTo(foldX - foldWidth, _t.page_height);
		co.lineTo(foldX - foldWidth - leftShadowWidth, _t.page_height);
		co.fill();
		
		var foldGradient = co.createLinearGradient(
								foldX - paperShadowWidth, 0, foldX, 0);
		foldGradient.addColorStop(0.35, '#fafafa');
		foldGradient.addColorStop(0.73, '#eeeeee');
		foldGradient.addColorStop(0.9, '#fafafa');
		foldGradient.addColorStop(1.0, '#e2e2e2');
		
		co.fillStyle = foldGradient;
		co.strokeStyle = 'rgba(0,0,0,0.06)';
		co.lineWidth = 0.5;
		
		co.beginPath();
		co.moveTo(foldX, 0);
		co.lineTo(foldX, _t.page_height);
		co.quadraticCurveTo(foldX, _t.page_height + (verticalOutdent * 2),
							foldX - foldWidth, _t.page_height + verticalOutdent);
		co.lineTo(foldX - foldWidth, -verticalOutdent);
		co.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);
						
		co.fill();
		co.stroke();
		
		if(p >= 0 && p < _t.pages_count)
		{
			if(_t.flips[p].loaded)
			{
				if(foldWidth > _t.image_left)
				{
					var w = Math.min(foldWidth-_t.image_left, _t.image_width);
					co.drawImage(_t.pages[p], 0, 0,
									w, _t.image_height,
									foldX-foldWidth+_t.image_left, _t.image_top,
									w, _t.image_height);
				}
			}
			else
			{
				if(foldWidth > _t.image_left)
				{
					var w = Math.min(foldWidth-_t.image_left,
											_t.preloader_frame_width);
					_t.drawPreloader(foldX-foldWidth+_t.image_left,
							(_t.page_height-_t.preloader_frame_height)/2, w);
				}
			}
		}
		
		co.restore();
	}
}

function ge(el)
{
  return (typeof el == 'string' || typeof el == 'number') ?
			document.getElementById(el) : el;
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
