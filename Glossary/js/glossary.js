var glossary =
{
    init: function(db)
    {
        var _t = this;
        
        _t.abc = db.abc;
        _t.dbTitle = _t.deepsort(db.data, _t.compareTitle);
        _t.dbYear = _t.flatten(db.data).sort(_t.compareYear);
        _t.gl = ge("glossary");
        _t.currentList = null;
        _t.activeLetterPair = null;
        _t.activeYearPair = null;

        var yearDiv, titleDiv;
        var action = function(f)
             {
                return function()
                    {
                        toggle(yearDiv);
                        toggle(titleDiv);
                        f();
                    };
            };

        var titleDiv = _t.createButton("По<br />&nbsp;Году&nbsp;",
            action(function()
                {
                    var by = _t.activeYearPair;
                    _t.showByYear(by.button, by.year);
                }));
        var yearDiv = _t.createButton("По<br />Фамилии",
            action(function()
                {
                    var bl = _t.activeLetterPair;
                    _t.showByLetter(bl.button, bl.letter);
                }));

        yearDiv.appendChild( _t.createYear() );
        titleDiv.appendChild( _t.createAbc() );

        _t.gl.appendChild(yearDiv);
        _t.gl.appendChild(titleDiv);
        
        yearDiv.style.display = "none";
        titleDiv.style.display = "block";

        _t.showByLetter(_t.activeLetterPair.button,_t.activeLetterPair.letter);
    },
    createButton: function(caption, action)
    {
        var btn = document.createElement("button");
        btn.innerHTML = caption;
        btn.onclick = action;
        addClass(btn, "red");
        addClass(btn, "glbtn");
        var div = document.createElement("div");
        div.appendChild(btn);
        
        return div;
    },
    deepsort: function(db, f)
    {
        var _t = this;

        for(var i in db)
        {
            if(typeof db[i].describe !== "string")
            {
                db[i].describe = _t.deepsort(db[i].describe, f);
            }
        }
        return db.sort(f);
    },
    flatten: function(db)
    {
        var _t = this;

        var newDB = new Array();
        for(var i in db)
        {
            if(db[i].year)
            {
                newDB.push(db[i]);
            }
            else
            {
                newDB = newDB.concat( _t.flatten(db[i].describe) );
            }
        }
        return newDB;
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
        if(a.title < b.title)
            return -1;
        else if(a.title > b.title)
            return 1;
        return 0;
    },
    createAbc: function()
    {
        var _t = this;
        
        var div = document.createElement("div");
        addClass(div, "vibor");
        
        var used = new Array();
        for(var i in _t.dbTitle)
            used.push(_t.dbTitle[i].title[0].toUpperCase());
        
        used = getDistinctArray(used);
       
        var arr = new Array();
        for(var i in _t.abc)
        {
            var obj = {"text": _t.abc[i]};
            if(used.indexOf(_t.abc[i]) != -1)
            {
                obj.action = function(c){
                                return function(e){_t.showByLetter(this, c);};
                              }(_t.abc[i]);
            }
            arr.push(obj);
        }
        
        var b = _t.appendButtons(div, arr);
        _t.activeLetterPair = {"button": b, "letter": arr[0].text};
        
        return div;
    },
    createYear: function()
    {
        var _t = this;
        
        var div = document.createElement("div");
        addClass(div, "vibor");
        
        var used = new Array();
        for(var i in _t.dbYear)
            used.push(_t.dbYear[i].year);
        
        used = getDistinctArray(used);
        
        var arr = new Array();
        for(var i in used)
        {
            arr.push({"text": used[i],
                      "action": function(y){
                                return function(e){_t.showByYear(this, y);};
                              }(used[i])});
        }
        
        var b = _t.appendButtons(div, arr);
        _t.activeYearPair = {"button": b, "year": used[0]};
        
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
        
        _t.show(_t.filter(_t.dbTitle,
                {"title": function(e){return e[0].toUpperCase() == c;}}));
    },
    showByYear: function(e, y)
    {
        var _t = this;
        if(_t.activeYearPair)
            removeClass(_t.activeYearPair.button, "red");
        addClass(e, "red");
        _t.activeYearPair = {"button": e, "year": y};
        
        _t.show(_t.filter(_t.dbYear, {"year": function(e){return e == y;}}));
    },
    show: function(db)
    {
        var _t = this;
                
        if(_t.currentList)
            _t.gl.removeChild(_t.currentList);
            
        var show = function(db)
        {
            var ol = document.createElement("ol");

            for(var i in db)
            {
                var li = document.createElement("li");
                var a = document.createElement("a");
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
                        var li = this.parentNode.parentNode;
                        var flag = hasClass(li, "opened");
                        var all = geByTag(li.parentNode, "li");
                        for(var i in all)
                        {
                                removeClass(all[i], "opened");
                        }
                        if(!flag)
                        {
                            addClass(li, "opened");
                        }
                    };
                    var di = document.createElement("div");
                    var dedi = document.createElement("div");
                    if(typeof db[i].describe === "string")
                    {
                        dedi.innerHTML = db[i].describe;
                    }
                    else
                    {
                        dedi.appendChild(show(db[i].describe));
                    }
                    di.appendChild(a);
                    di.appendChild(dedi);
                    li.appendChild(di);
                }
                ol.appendChild(li);
                
                i++;
            }
            return ol;
        }
        
        _t.currentList = show(db);
        _t.gl.appendChild(_t.currentList);
    }
};
