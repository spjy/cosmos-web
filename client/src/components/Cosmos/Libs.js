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
