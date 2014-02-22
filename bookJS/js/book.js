function ge(el)
{
  return (typeof el == 'string' || typeof el == 'number') ?
			document.getElementById(el) : el;
}
var book =
{
	pages_count: 228,
	page: 1, /* from 1 to pages_count */
	pages_path_prefix: "pages/",
	pages_path_suffix: ".png",

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
		
		var book = ge("book");
		var canvas = ge("pageflip");
		var nav = ge("nav");
				
		_t.context = canvas.getContext("2d");
		_t.canvas_width = 2 * _t.page_width;
		_t.canvas_height = _t.page_height + 2 * _t.canvas_padding;
		
		book.style.width = _t.book_width+"px";
		book.style.height = _t.book_height+"px";
		book.style.marginLeft = (-_t.book_width / 2)+"px";
		book.style.marginTop = (-_t.book_height / 2)+"px";
		
		nav.style.width = _t.book_width+"px";
		
		canvas.width = _t.canvas_width;
		canvas.height = _t.canvas_height;
		canvas.style.left = "0px";
		canvas.style.top = (-_t.canvas_padding)+"px";
		
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
			var t = i < _t.page ? -1 : 1;
			_t.flips[i] =
			{
				progress: t,
				target: t,
				running: false,
				dragging: false,
			};
			var but = document.createElement("button");
			but.onclick = function(e){_t.onNavButtonClick(this);};
			but.innerHTML = ""+(i+1);
			//nav.appendChild(but);
		}
		/*setTimeout(function()
		{
			setInterval(function()
			{
				_t.goToPage(Math.floor(Math.random()*_t.pages_count));
			}, 250);
		}, 1000);*/
		
		setInterval(function(){_t.render();}, 30);
		document.addEventListener("mousemove",
									function(e){_t.mmove(e);}, false);
		book.addEventListener("mousedown", function(e){_t.mdown(e);}, false);
		document.addEventListener("mouseup", function(e){_t.mup(e);}, false);
		/*var g = function(p)
		{
			if(p >= 1)
			{
				_t.context.clearRect(0, 0, _t.canvas_width, _t.canvas_height);
				_t.drawFlip(0, p);
				setTimeout(f, 1500, 1);
				return;
			}
			_t.context.clearRect(0, 0, _t.canvas_width, _t.canvas_height);
			_t.drawFlip(0, p);
			setTimeout(g, 100, p+(1-0.6*p)*0.1);
		};
		var f = function(p)
		{
			if(p <= -1)
			{
				_t.context.clearRect(0, 0, _t.canvas_width, _t.canvas_height);
			_t.drawFlip(0, p);
				setTimeout(g, 1500, -1);
				return;
			}
			_t.context.clearRect(0, 0, _t.canvas_width, _t.canvas_height);
			_t.drawFlip(0, p);
			setTimeout(f, 100, p+(-1-0.6*p)*0.1);
		};
		setTimeout(g, 500, 1);*/
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
		np--;
		_t.goToPage(np);
	},
	showNavButtons: function()
	{
		var _t = this;
	},
	filterPageNumber: function()
	{
		var page_number = ge("page_number");
		page_number.value = page_number.value.
					replace(/[^0-9]/g, "").
					replace(/^0+/, "").
					substr(0,4);
	},
	pageNumberGo: function()
	{
		var _t = this;
		_t.filterPageNumber();
		var np = ge("page_number").value;
		if(np > 0 && np <= _t.pages_count)
		{
			_t.goToPage(np-1);
		}
		else
		{
			ge("page_number").value = _t.pages_count + "";
		}
	},
	goToPage: function(np)
	{
		var _t = this;
		if(np < 0 || np >= _t.pages_count)
			return;
		if(np % 2)
			np++;
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
		//_t.pages[pagen].onload = function(){ _t.render(); };
		_t.pages[pagen].src = _t.pages_path_prefix + (pagen+1)
									+ _t.pages_path_suffix;
	},
	render: function()
	{
		var _t = this;
		
		_t.filterPageNumber();
		var user_page = _t.page;
		if(_t.page > 0 && _t.flips[_t.page-1].dragging)
		{
			user_page -= _t.flips[_t.page-1].progress > 0 ? 2 : 0; 
		}
		
		ge("te").innerHTML = _t.bg_page + " " + _t.page + " " + user_page;
		
		var co = _t.context;
		co.clearRect(0, 0, _t.canvas_width, _t.canvas_height);
		if(_t.bg_page >= 0)
			co.drawImage(_t.pages[_t.bg_page],
							_t.image_left + (_t.book_width-2*_t.page_width)/2,
							_t.image_top + (_t.book_height-_t.page_height)/2
								+ _t.canvas_padding);
		if(_t.bg_page+1 < _t.pages_count)
			co.drawImage(_t.pages[_t.bg_page+1],
						_t.image_left + (_t.book_width)/2,
						_t.image_top + (_t.book_height-_t.page_height)/2
							+ _t.canvas_padding);
							
		for(var i = 0; i < _t.pages_count; i++)
		{
			if(_t.flips[i].dragging)
			{
				_t.flips[i].target = Math.max(
						Math.min(_t.mouse.x/_t.page_width, 1), -1);
				_t.flips[i].progress += (_t.flips[i].target - 
											0.6*_t.flips[i].progress)*0.01;
				_t.drawFlip(i, _t.flips[i].progress);
				continue;
			}
			if(_t.flips[i].running)
			{
				_t.flips[i].progress += (_t.flips[i].target - 
											0.6*_t.flips[i].progress)*0.01;
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
		
		if((p+1) >= 0 && (p+1) < _t.pages_count)
		{
		
			var image_right = _t.page_width - _t.image_width - _t.image_left;
			var w = Math.max(_t.page_width - foldX - image_right, 0);
			if(w > 0)
			{
				if(w < _t.image_width)
					co.drawImage(_t.pages[p+1],
									Math.max(_t.image_width - w, 0), 0,
									w, _t.image_height,	foldX, _t.image_top,
									w, _t.image_height);
				else
					co.drawImage(_t.pages[p+1], _t.image_left, _t.image_top);
			}
		}
		else
		{
			var image_right = _t.page_width - _t.image_width - _t.image_left;
			var w = Math.max(_t.page_width - foldX - image_right, 0);
			if(w > 0)
			{
				if(w < _t.image_width)
					_t.context.clearRect(foldX, 0,
											w, _t.page_height);
				else
					_t.context.clearRect(_t.image_left, _t.image_top,
											_t.image_width, _t.image_height);
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
		
		var kw = _t.image_width / _t.page_width;
		if(p >= 0 && p < _t.pages_count)
			co.drawImage(_t.pages[p], foldX - foldWidth + (1-kw)*foldWidth/2 ,
							_t.image_top, kw * foldWidth, _t.image_height);
		
		co.restore();
	}
}
