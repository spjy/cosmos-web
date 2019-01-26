export function isleap( year)
{
    if (!(year % 4))
    {
        if (!(year%100))
        {
            if (!(year%400))
            {
                return (1);
            }
            else
            {
                return 0;
            }
        }
        else
        {
            return 1;
        }
    }
    else
    {
        return 0;
    }
}

export function mjd2ymd( mjd,  year, month, day, doy)
{
    var lmjd = 0.;
    var lyear = 1858;
    var lmonth = 11;
    var lday = 17.;
    var ldoy = 321.;

    if (mjd !== lmjd)
    {
        var a, b, c, d, e, z, alpha;
        var f;

        lmjd = mjd;
        mjd += 2400001.;
        z = Math.floor(mjd);
        f = mjd - z;

        if (z<2299161)
            a = z;
        else
        {
            alpha = Math.floor((z - 1867216.25)/36524.25);
            a = z +1 + alpha - Math.floor(alpha/4);
        }

        b = a + 1524;
        c = Math.floor((b - 122.1)/365.25);
        d = Math.floor(365.25*c);
        e = Math.floor((b - d)/30.6001);

        lday = b - d - Math.floor(30.6001 * e) + f;
        if (e < 14)
            lmonth = e - 1;
        else
            lmonth = e - 13;
        if (lmonth > 2)
            lyear = c - 4716;
        else
            lyear = c - 4715;
        ldoy = Math.floor((275 * lmonth)/9) - (2-isleap(lyear))*Math.floor((lmonth+9)/12) + lday - 30;
    }

    // year = lyear;
    // month = lmonth;
    // day = lday;
    // doy  = ldoy;
    // return 0;
    return {year: lyear, month:lmonth, day: lday, doy: ldoy}
}

export function mjd2cal(mjd){
  var lmjd = 0.;
  var date={};

  if (lmjd !== mjd)
  {
      // var dom;
      // var doy;
      var temp;
      lmjd = mjd;

      temp = mjd2ymd(mjd);
      // mjd2ymd(mjd, date.year, date.month, dom, doy);
      date.year = temp.year;
      date.month = temp.month
      // date.doy = (int32_t)doy;
      date.doy = Math.floor(temp.doy)
      date.dom = Math.floor(temp.day)
      // date.dom = (int32_t)dom;
      // doy = (doy - date.doy) * 24.;
      temp.doy = (temp.doy - date.doy) * 24.;
      // date.hour = (int32_t)doy;
      date.hour = Math.floor(temp.doy);
      // doy = (doy - date.hour) * 60.;
      temp.doy = (temp.doy - date.hour) * 60.;
      // date.minute = (int32_t)doy;
      date.minute = Math.floor(temp.doy)
      // doy = (doy - date.minute) * 60.;
      temp.doy = (temp.doy - date.minute) * 60.;
      // date.second = (int32_t)doy;
      date.second = Math.floor(temp.doy)
      // doy = (doy - date.second) * 1e9;
      temp.doy = (temp.doy - date.second) * 1e6;
      date.nsecond = Math.floor(temp.doy + .5);
  }
   // console.log(date)
  return new Date(Date.UTC(date.year, date.month-1, date.dom, date.hour, date.minute, date.second));
}
export function plot_form_datalist(structure){
  // console.log("plot_form_datalist", structure)
  var tree_data = [];
  for(var i =0; i < structure.length; i++){
    var entry = structure[i];
    var parent=tree_data;
    var title = '';
    for(var j=0; j < entry.length; j++){
      var index;
      var child_index;

      if(j === 0){ // first level, find in tree_data
        title=entry[0];
        index = tree_data.findIndex(x => x.title === title);
        if(index >= 0){ // found at first level
          // set parent as tree_data[index]
          parent = tree_data[index];
        }
        else { // add to tree_data
          if(j===entry.length-1){ // add to tree_data without chidlren []
            tree_data.push({
              title:title,
              value:title,
              key:title
            });
            parent = null;
          }
          else {// add to tree_data with children , set added entry as parent
            child_index =tree_data.push({
              title:title,
              value:title,
              key:title,
              children:[]
            });
            parent = tree_data[child_index-1]
          }
        }
      }
      else { // find in parent.children
        title +='_'+entry[j];
        index = parent.children.findIndex(x => x.title === title);

        if(index >= 0){ // found, set parent as parent.children[index]
          parent = parent.children[index];
        }
        else { // not found, add entry
          // console.log('looking for',title, "in", parent.children,"given", index)
          if(j===entry.length-1){ // add to parent.children without chidlren []
            parent.children.push({
              title:title,
              value:title,
              key:title
            });
            parent = null;
          }
          else {// add to parent.children with children , set added entry as parent
            child_index =parent.children.push({
              title:title,
              value:title,
              key:title,

              children:[]
            })
            parent = parent.children[child_index-1]
          }
        }
      }
    }
  }
  // console.log('tree',tree_data)
  return tree_data;
}
