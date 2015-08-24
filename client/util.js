function ConvertToUTCTime(timePart) {
var d = new moment(timePart);
var resultDate = moment().startOf('day');
resultDate.add(d.hours(),'hours');
resultDate.add(d.minutes(),'minutes');
resultDate.add(d.seconds(),'seconds');
return new Date(resultDate).toUTCString();
};

function ConvertToLocalTime(timePart) {
var d = moment.utc(timePart);
var resultDate = moment().utc().startOf('day');
resultDate.add(d.hours(),'hours');
resultDate.add(d.minutes(),'minutes');
resultDate.add(d.seconds(),'seconds');
return moment(moment.utc(resultDate).toDate()).format('HH:mm');
}


function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y
    ].join(" ");

    return d;       
}

