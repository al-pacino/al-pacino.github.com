function ge(el)
{
  return (typeof el == 'string' || typeof el == 'number') ?
			document.getElementById(el) : el;
}
var book =
{
	pages_count: 228,
	page: 0,
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
		
		_t.flips = [];
		_t.buttons = [];
		_t.frontview = 0;
		_t.mouse = {x: 0, y: 0};
		_t.pages = new Array(_t.pages_count);
		_t.lp = -1;
		_t.rp = 0;
		
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
		
		for(var i = 0; i < _t.pages_count; i++)
		{
			var but = document.createElement("button");
			but.onclick = function(e){_t.clicked(e, this);};
			but.innerHTML = ""+(i+1);
			nav.appendChild(but);
			_t.buttons.push(but);
			
			_t.loadImage(i);
			_t.flips.push(
					{
						progress: 1.0,
						target: 1.0,
						running: false,
						dragging: false
					}
				);
		}
		if(!(_t.pages_count % 2))
			_t.flips.push(
					{
						progress: 1,
						target: 1,
						running: false,
						dragging: false
					}
				);

		setInterval(function(){_t.render();}, 30);
		document.addEventListener("mousemove", function(e){_t.mmove(e);}, false);
		book.addEventListener("mousedown", function(e){_t.mdown(e);}, false);
		document.addEventListener("mouseup", function(e){_t.mup(e);}, false);
	},
	loadImage: function(pagen)
	{
		var _t = this;
		
		if(_t.pages[pagen])
			return _t.pages[pagen];
		
		_t.pages[pagen] = document.createElement("img");
		_t.pages[pagen].onload = function(){ _t.render(); };
		_t.pages[pagen].src = _t.pages_path_prefix + (pagen+1)
									+ _t.pages_path_suffix;
	},
	isOnTheRun: function(pagen)
	{
		if(this.flips[pagen].dragging ||
				Math.abs(this.flips[pagen].progress) < 0.997)
			return true;
		else
			return false;
	},
	render: function()
	{
		var _t = this;
		var co = _t.context;
		co.clearRect(0, 0, _t.canvas_width, _t.canvas_height);
		
		/*if(_t.lp >= 0 && _t.lp < _t.pages_count)
			co.drawImage(_t.pages[_t.lp],
							_t.image_left + (_t.book_width-2*_t.page_width)/2,
							_t.image_top + (_t.book_height-_t.page_height)/2
								+ _t.canvas_padding);
		if(_t.rp >= 0 && _t.rp < _t.pages_count)
			co.drawImage(_t.pages[_t.rp],
						_t.image_left + (_t.book_width)/2,
						_t.image_top + (_t.book_height-_t.page_height)/2
							+ _t.canvas_padding);*/
							
		var lp = 0;
		while(lp <= _t.pages_count && !_t.flips[lp].running)
			lp += 2;
		if(lp > 0 && lp <= _t.pages_count)
		{
			co.drawImage(_t.pages[lp-1],
							_t.image_left + (_t.book_width-2*_t.page_width)/2,
							_t.image_top + (_t.book_height-_t.page_height)/2
								+ _t.canvas_padding);
		}
		else if(lp > _t.pages_count && _t.page > 0)
		{
			lp = _t.page;
			co.drawImage(_t.pages[_t.page-1],
							_t.image_left + (_t.book_width-2*_t.page_width)/2,
							_t.image_top + (_t.book_height-_t.page_height)/2
							+ _t.canvas_padding);
		}
		if(_t.page == 0)
			lp = 0;		
		if(lp >= 0 && lp < _t.pages_count)
			co.drawImage(_t.pages[lp],
							_t.image_left + (_t.book_width)/2,
							_t.image_top + (_t.book_height-_t.page_height)/2
							+ _t.canvas_padding);
		
		for(var i = 0; i < _t.pages_count; i++)
		{
			if(_t.flips[i].running)
				_t.buttons[i].style.backgroundColor = "#FF0000";
			else
				_t.buttons[i].style.backgroundColor = "#0000FF";
				
			if(i != _t.page)
				_t.buttons[i].className = "";
			else
				_t.buttons[i].className = "active";
				
			if(!_t.flips[i].running)
				continue;
			
			if(_t.flips[i].dragging)
			{
				_t.flips[i].target = Math.max(Math.min(_t.mouse.x/_t.page_width,
													1), -1);
			}
			_t.flips[i].progress += (_t.flips[i].target - _t.flips[i].progress)
										* 0.05;
			
			if(_t.isOnTheRun(i))
				_t.drawFlip(i+1, i+2, _t.flips[i].progress);
			else
			{
				_t.flips[i].running = false;
				//_t.frontview = i+2;
				_t.render();
				return;
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
			_t.flips[_t.page-2].running = true;
			_t.flips[_t.page-2].dragging = true;
		}
		else if(_t.mouse.x >= 0 && _t.page + 1 < _t.pages_count)
		{
			_t.clickedx = _t.mouse.x;
			_t.flips[_t.page].running = true;
			_t.flips[_t.page].dragging = true;
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
					if(_t.mouse.x * _t.clickedx < 0)
						_t.page = Math.min(_t.page + 2, _t.pages_count);
					_t.flips[i].target = -1;
				}
				else
				{
					if(_t.mouse.x * _t.clickedx < 0)
						_t.page = Math.max(_t.page - 2, 0);
					_t.flips[i].target = 1;
				}
			}
			_t.flips[i].dragging = false;
		}
	},
	clicked: function(e, b)
	{
		var _t = this;
		var np = parseInt(b.innerHTML)-1;
		
		if(np % 2)
			np++;
		if(_t.page == np)
			return;
			
		if(_t.page < np)
		{
			_t.flips[_t.page].target = -1;
			_t.flips[np-2].target = -1;
			_t.flips[_t.page].running = true;
			_t.flips[np-2].running = true;
			_t.page = np;
		}
		else
		{
			_t.flips[_t.page-2].target = 1;
			_t.flips[np].target = 1;
			_t.flips[_t.page-2].running = true;
			_t.flips[np].running = true;
			_t.page = np;
		}
	},
	drawFlip: function(p1, p2, progress)
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
		
		if(p2 >= 0 && p2 < _t.pages_count)
		{
		
			var image_right = _t.page_width - _t.image_width - _t.image_left;
			var w = Math.max(_t.page_width - foldX - image_right, 0);
			if(w > 0)
			{
				if(w < _t.image_width)
					co.drawImage(_t.pages[p2],
									Math.max(_t.image_width - w, 0), 0,
									w, _t.image_height,	foldX, _t.image_top,
									w, _t.image_height);
				else
					co.drawImage(_t.pages[p2], _t.image_left, _t.image_top);
			}
		}
		else
		{
			var image_right = _t.page_width - _t.image_width - _t.image_left;
			var w = Math.max(_t.page_width - foldX - image_right, 0);
			if(w > 0)
			{
				if(w < _t.image_width)
					_t.context.clearRect(foldX, _t.image_top,
											w, _t.image_height);
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
		if(p1 >= 0 && p1 < _t.pages_count)
			co.drawImage(_t.pages[p1], foldX - foldWidth + (1-kw)*foldWidth/2 ,
							_t.image_top, kw * foldWidth, _t.image_height);
		
		co.restore();
	}
}
