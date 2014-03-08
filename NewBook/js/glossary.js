var glossary =
{
	eng_abc: "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ",
	rus_abc: "аАбБвВгГдДеЕёЁжЖзЗиИйЙкКлЛмМнНоОпПрРсСтТуУфФхХцЦчЧшШщЩъЪыЫьЬэЭюЮяЯ",

	init: function(rus_db, eng_db)
	{
		var _t = this;
		var gl = ge("glossary");
		
		var eng_btn = document.createElement("button");
		eng_btn.innerHTML = "ENG";
		addClass(eng_btn, "red");
		var rus_div = _t.create(rus_db, _t.rus_abc, eng_btn);
		gl.appendChild(rus_div);
		
		var rus_btn = document.createElement("button");
		rus_btn.innerHTML = "РУС";
		addClass(rus_btn, "red");
		var eng_div = _t.create(eng_db, _t.eng_abc, rus_btn);
		gl.appendChild(eng_div);
		
		rus_div.style.display = "block";
		eng_div.style.display = "none";
		
		var f = function(e, r)
		{
			return function()
			{
				toggle(e);
				toggle(r);
			};
		}(eng_div, rus_div);
		
		eng_btn.onclick = f;
		rus_btn.onclick = f;
	},
	
	create: function(db, abc, btn)
	{
		var _t = this;
		var list_db = document.createElement("div");
		var list_abc = document.createElement("div");
		
		db.sort(_t.compareString(abc));
				
		var ol, si = 1;
		for(var i = 0; i < db.length; i++)
		{
			var f = false;
			if(i > 0)
			{
				var ai = Math.floor(abc.indexOf(db[i-1].title.charAt(0)) / 2);
				var bi = Math.floor(abc.indexOf(db[i].title.charAt(0)) / 2);
				f = ai != bi;
			}
			if(i == 0 || f)
			{
				var h = document.createElement("a");
				h.name = "letter_start" + i;
				h.id = "letter_start" + i;
				h.href = "#body";
				h.className = "start_letter";
				h.innerHTML = db[i].title.charAt(0);
				
				var b = document.createElement("span");
				b.innerHTML = "На верх&uarr;";
				h.appendChild(b);
				
				list_db.appendChild(h);
				ol = document.createElement("ol");
				ol.start = i+1;
				list_db.appendChild(ol);
				
				var fj = Math.floor(abc.indexOf(db[i].title.charAt(0)) / 2) * 2 + 1;
				for(var j = si; j < fj; j += 2)
				{
					var letter = document.createElement("span");
					letter.innerHTML = abc.charAt(j);
					list_abc.appendChild(letter);
				}
				var letter = document.createElement("a");
				addClass(letter, "button");
				letter.href = "#letter_start" + i;
				letter.innerHTML = abc.charAt(fj);
				list_abc.appendChild(letter);
				si = fj+2;
			}
			var a = document.createElement("a");
			a.innerHTML = db[i].title;
			a.href = db[i].href;
			var li = document.createElement("li");
			li.appendChild(a);
			ol.appendChild(li);
		}
		for(var j = si; j < abc.length; j += 2)
		{
			var letter = document.createElement("span");
			letter.innerHTML = abc.charAt(j);
			list_abc.appendChild(letter);
		}
		list_abc.appendChild(btn);
		
		var div = document.createElement("div");
		div.appendChild(list_abc);
		div.appendChild(list_db);
		return div;
	},
	compareString: function(abc)
	{
		return function(a, b)
		{
			for(var i = 0; i < Math.min(a.title.length, b.title.length); i++)
			{
				var ai = Math.floor(abc.indexOf(a.title.charAt(i)) / 2);
				var bi = Math.floor(abc.indexOf(b.title.charAt(i)) / 2);
				if(ai < bi)
					return -1;
				else if(ai > bi)
					return 1;
			}
			if(a.title.length < b.title.length)
				return -1;
			else if(a.title.length == b.title.length)
				return 0;
			else
				return 1;
		}
	}
};
