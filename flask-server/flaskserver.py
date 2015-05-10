from flask import Flask
from flask import render_template
from flask.ext.pymongo import PyMongo


import urllib
import urllib2
import json

app = Flask(__name__)
# setup mongoDB
app.config['MONGO_DBNAME'] = 'SHTaxi'
mongo = PyMongo(app)



@app.route('/')
def showMap():
    return render_template('SH_maps.html');
    
    
    
@app.route('/trip/<int:tripID>')    
def getTripCoordsFromMongoDB( tripID ):
    """Get the sequence of GPS coordinates for given trip ID"""
    trip = mongo.db.trips.find_one_or_404( {'id': tripID} )
    records = trip['records']
    res = []
    for rec in records:
        res.append( [ rec['latitude'], rec['longitude']] )
    
    res_json = []
    while len(res) > 100:
        res_json += gps_to_BD09(res[0:100])     # from 0 to 99
        res = res[100:] # from 100 to the end
    res_json += gps_to_BD09(res)
    return json.dumps(res_json)
    
    

def gps_to_BD09( coords ):
    """Convert the WGS84 coordinates to BD09.
    The Baidu API supports at most 100 conversion in one function call.
    Therefore, the size of coords is guaranteed to be less than 100."""
    coorStr = ''
    for coord in coords:    # coords have format <latitude, longitude>
        if len(coorStr) == 0:
            coorStr += "%g,%g" % (coord[1], coord[0])
        else:
            coorStr += ";%g,%g" % (coord[1], coord[0])   # Baidu needs longitude, latitude;
    url = "http://api.map.baidu.com/geoconv/v1/"
    params = {
        'ak': "N26kk7vdPZVIDL3eyumXNRyB",
        'coords': coorStr,
        'from': 1,
        'to': 5,
        'output' : 'json'
    }
    data = urllib.urlencode(params) 
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    page = response.read()
    return json.loads(page)['result']
    
    
    
if __name__ == '__main__':
    app.debug = True
    app.run()