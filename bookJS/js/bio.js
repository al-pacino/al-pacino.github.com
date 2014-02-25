var bio =
{
	init: function(writer)
	{
		var _t = this;
		_t.writers_number = writer;
		_t.writer = writers[writer];

		ge("wrapper").style.display = "block";
		
		_t.initPersonal();
		_t.initBiography();
		_t.initPortrait();
		_t.initWorks();
	},
	initPersonal: function()
	{
		var p = this.writer.personal;
		ge("writers_name").innerHTML = p.firstName + " "
										+ p.patronym	+ " " + p.lastName;
		ge("writers_dateOfBirth").innerHTML = p.dateOfBirth;
		ge("writers_dateOfDeath").innerHTML = p.dateOfDeath;
		
	},
	initBiography: function()
	{
		ge("biography").innerHTML = this.writer.biography;
		toggle("biography");
	},
	initPortrait: function()
	{
		var w = this.writer;
		var a = document.createElement("a");
		a.alt = "full size portrait";
		a.title = "full size portrait";
		a.href = basic_path + w.path + w.portrait.full_image;
		var i = document.createElement("img");
		i.width = "200";
		i.src = basic_path + w.path + w.portrait.image;
		a.appendChild(i);
		ge("portrait").appendChild(a);
	},
	initWorks: function()
	{
		var _t = this;
		var w = _t.writer.works;
		var ol = document.createElement("ol");
		for(var i = 0; i < w.length; i++)
		{
			var li = document.createElement("li");
			var a = document.createElement("a");
			a.targer = "_blank";
			a.href = "book.html?writer=" + _t.writers_number
						+ "&work=" + i;
			a.innerHTML = w[i].title;
			li.appendChild(a);
			ol.appendChild(li);
		}
		ge("works").appendChild(ol);
	}
};