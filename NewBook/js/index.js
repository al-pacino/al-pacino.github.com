function toggleAdditional(btn, additional)
{
	if(hasClass(btn, "opened"))
	{
		geByTag1(btn, "span").innerHTML = "&darr;";
		removeClass(btn, "opened");
		removeClass(additional, "opened");
	}
	else
	{
		geByTag1(btn, "span").innerHTML = "&uarr;";
		addClass(btn, "opened");
		addClass(additional, "opened");
	}
}
