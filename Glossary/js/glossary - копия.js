var glossary =
{
    init: function(rus_db, eng_db)
    {
        var _t = this;
        
        _t.rdb = rus_db.sort(_t.compareString(_t.rus_abc));
        _t.edb = eng_db.sort(_t.compareString(_t.eng_abc));
        
        _t.gl = ge("glossary");
        _t.currentList = null;
        _t.currentTerm = null;
        
        var eng_btn = document.createElement("button");
        eng_btn.innerHTML = "ENG";
        addClass(eng_btn, "red");
        var rus_div = _t.createAbc(_t.rus_abc, _t.rdb);
        rus_div.appendChild(eng_btn);
        _t.gl.appendChild(rus_div);
        
        var rus_btn = document.createElement("button");
        rus_btn.innerHTML = "РУС";
        addClass(rus_btn, "red");
        var eng_div = _t.createAbc(_t.eng_abc, _t.edb);
        eng_div.appendChild(rus_btn);
        _t.gl.appendChild(eng_div);
        
        rus_div.style.display = "block";
        eng_div.style.display = "none";
        
        eng_btn.onclick = function(r, e)
            {
                return function()
                    {
                        toggle(r);
                        toggle(e);
                        if(_t.active_button)
                            removeClass(_t.active_button, "red");
                        addClass(e.firstChild, "red");
                        _t.active_button = e.firstChild;
                        _t.showLetterFrom(0, _t.eng_abc, _t.edb);
                    };
            }(rus_div, eng_div);
        rus_btn.onclick = function(r, e)
            {
                return function()
                    {
                        toggle(r);
                        toggle(e);
                        if(_t.active_button)
                            removeClass(_t.active_button, "red");
                        addClass(r.firstChild, "red");
                        _t.active_button = r.firstChild;
                        _t.showLetterFrom(0, _t.rus_abc, _t.rdb);
                    };
            }(rus_div, eng_div);
            
        addClass(rus_div.firstChild, "red");
        _t.active_button = rus_div.firstChild;
        _t.showLetterFrom(0, _t.rus_abc, _t.rdb);
    },
    
    createAbc: function(abc, db)
    {
        var _t = this;
        
        var div = document.createElement("div");
        var cletter = -1;
        for(var i = 0; i < db.length; i++)
        {
            var letter = 1+2*Math.floor(abc.indexOf(db[i].title.charAt(0))/2);
            if(cletter != letter)
            {
                for(var j = cletter + 2; j < letter; j += 2)
                {
                    var span = document.createElement("span");
                    span.innerHTML = abc.charAt(j);
                    div.appendChild(span);
                }
                var btn = document.createElement("button");
                btn.innerHTML = abc.charAt(letter);
                btn.onclick = function(s)
                    {
                        return function(e)
                        {
                            if(_t.active_button)
                                removeClass(_t.active_button, "red");
                            addClass(this, "red");
                            _t.active_button = this;
                            _t.showLetterFrom(s, abc, db);
                        }
                    }(i);
                div.appendChild(btn);
                cletter = letter;
            }
        }
        for(var j = cletter + 1; j < abc.length; j += 2)
        {
            var span = document.createElement("span");
            span.innerHTML = abc.charAt(j);
            div.appendChild(span);
        }
        
        return div;
    },
    
    showLetterFrom: function(start, abc, db)
    {
        var _t = this;
                
        if(_t.currentList)
            _t.gl.removeChild(_t.currentList);
            
        _t.currentList = document.createElement("ol");
        _t.gl.appendChild(_t.currentList);
        
        var i = start;
        var letter = Math.floor(abc.indexOf(db[i].title.charAt(0)) / 2);
        do
        {
            var a = document.createElement("a");
            var li = document.createElement("li");
            a.innerHTML = db[i].title;
            if(db[i].href)
            {
                a.href = db[i].href;
                li.appendChild(a);
            }
            else
            {
                a.href = "#" + Math.ceil(Math.random()*100000);
                a.onclick = function(e)
                {
                    if(_t.currentTerm)
                        removeClass(_t.currentTerm, "opened");
                    if(_t.currentTerm == this.parentNode.parentNode)
                        _t.currentTerm = null;
                    else
                    {
                        addClass(this.parentNode.parentNode, "opened");
                        _t.currentTerm = this.parentNode.parentNode;
                    }
                    if(e.stopPropagation)
                        e.stopPropagation();
                    else
                        e.cancelBubble = true;
                };
                var di = document.createElement("div");
                di.onclick = function(e)
                {
                    if(_t.currentTerm == this.parentNode)
                    {
                        removeClass(_t.currentTerm, "opened");
                        _t.currentTerm = null;
                    }
                };
                var dedi = document.createElement("div");
                dedi.innerHTML = db[i].describe;
                di.appendChild(a);
                di.appendChild(dedi);
                li.appendChild(di);
            }
            _t.currentList.appendChild(li);
            
            i++;
        }
        while(i < db.length &&
                Math.floor(abc.indexOf(db[i].title.charAt(0)) / 2) == letter);
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
