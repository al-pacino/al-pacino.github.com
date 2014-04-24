var glossary =
{
    init: function(db)
    {
        var _t = this;
        
        _t.db = db;
        _t.db.data = _t.db.data.sort(_t.compareYear);
        _t.gl = ge("glossary");
        _t.currentList = null;
        _t.currentTerm = null;        
        
        var year_btn = document.createElement("button");
        year_btn.innerHTML = "По<br />&nbsp;Году&nbsp;";
        addClass(year_btn, "red");
        addClass(year_btn, "glbtn");
        var year_div = document.createElement("div");
        year_div.appendChild(year_btn);
        
        _t.gl.appendChild(year_div);
        
        var title_btn = document.createElement("button");
        title_btn.innerHTML = "По<br />Фамилии";
        addClass(title_btn, "red");
        addClass(title_btn, "glbtn");
        var title_div = document.createElement("div");
        title_div.appendChild(title_btn);
        _t.gl.appendChild(title_div);
        
        title_div.appendChild(_t.createYears(_t.db));
        year_div.appendChild(_t.createAbc(_t.db));
        
        year_div.style.display = "block";
        title_div.style.display = "none";
        
        year_btn.onclick = function(r, e)
            {
                return function()
                    {
                        toggle(r);
                        toggle(e);
                        if(_t.active_button)
                            removeClass(_t.active_button, "red");
                        addClass(e.firstChild, "red");
                        _t.active_button = e.firstChild;
                        _t.showByYear(_t.activeYearPair.button,
                                      _t.activeYearPair.year);
                                        
                    };
            }(year_div, title_div);
        title_btn.onclick = function(r, e)
            {
                return function()
                    {
                        toggle(r);
                        toggle(e);
                        if(_t.active_button)
                            removeClass(_t.active_button, "red");
                        addClass(r.firstChild, "red");
                        _t.active_button = r.firstChild;
                        _t.showByLetter(_t.activeLetterPair.button,
                                        _t.activeLetterPair.letter);
                    };
            }(year_div, title_div);
    },
    filter: function(arr, obj)
    {
        var result = new Array();
        for(var i in arr)
        {
            var eq = true;
            for(var j in obj)
            {
                if(typeof(obj[j]) === "function")
                {
                    if(!obj[j](arr[i][j]))
                    {
                        eq = false;
                        break;
                    }
                }
                else if(arr[i][j] !== obj[j])
                {
                    eq = false;
                    break;
                }
            }
            if(eq)
                result.push(arr[i]);
        }
        return result;
    },
    compareTitle: function(a, b)
    {
        if(a.title < b.title)
            return -1;
        else if(a.title > b.title)
            return 1;
        return 0;
    },    
    compareYear: function(a, b)
    {
        if(a.year < b.year)
            return -1;
        else if(a.year > b.year)
            return 1;
        return 0;
    },
    createAbc: function()
    {
        var _t = this;
        
        var div = document.createElement("div");
        addClass(div, "vibor");
        
        var used = new Array();
        for(var i in _t.db.data)
            used.push(_t.db.data[i].title[0].toUpperCase());
        
        used = getDistinctArray(used);
       
        var arr = new Array();
        for(var i in _t.db.abc)
        {
            var obj = {"text": _t.db.abc[i]};
            if(used.indexOf(_t.db.abc[i]) != -1)
            {
                obj.action = function(c){
                                return function(e){_t.showByLetter(this, c);};
                              }(_t.db.abc[i]);
            }
            arr.push(obj);
        }
        
        _t.activeLetterPair = null;
        var r =_t.appendButtons(div, arr);
        if(r)
            r.click();
        
        return div;
    },
    createYears: function()
    {
        var _t = this;
        
        var div = document.createElement("div");
        addClass(div, "vibor");
        
        var used = new Array();
        for(var i in _t.db.data)
            used.push(_t.db.data[i].year);
        
        used = getDistinctArray(used);
        
        var arr = new Array();
        for(var i in used)
        {
            arr.push({"text": used[i],
                      "action": function(y){
                                return function(e){_t.showByYear(this, y);};
                              }(used[i])});
        }
        
        _t.activeYearPair = null;
        var r = _t.appendButtons(div, arr);
        if(r)
            r.click();
        
        return div;
    },
    appendButtons: function(co, arr)
    {
        var _t = this;
        var first_button = null;
        for(var i in arr)
        {
            var elem;
            if(arr[i].action)
            {
                elem = document.createElement("button");
                elem.onclick = arr[i].action;
                if(!first_button)
                    first_button = elem;
            }
            else
            {
                elem = document.createElement("span");
            }
            elem.innerHTML = arr[i].text;
            co.appendChild(elem);
        }
        return first_button;
    },
    showByLetter: function(e, c)
    {
        var _t = this;
        if(_t.activeLetterPair)
            removeClass(_t.activeLetterPair.button, "red");
        addClass(e, "red");
        _t.activeLetterPair = {"button": e, "letter": c};
        
        _t.show(_t.filter(_t.db.data,
                    {"title": function(e){return e[0].toUpperCase() == c;}}));
    },
    showByYear: function(e, y)
    {
        var _t = this;
        if(_t.activeYearPair)
            removeClass(_t.activeYearPair.button, "red");
        addClass(e, "red");
        _t.activeYearPair = {"button": e, "year": y};
        
        var _t = this;
        _t.show(_t.filter(_t.db.data,
                {"year": function(e){return e == y;}}).sort(_t.compareTitle));
    },
    show: function(db)
    {
        var _t = this;
                
        if(_t.currentList)
            _t.gl.removeChild(_t.currentList);
            
        _t.currentList = document.createElement("ol");
        _t.gl.appendChild(_t.currentList);
        
        for(var i in db)
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
    }
};
