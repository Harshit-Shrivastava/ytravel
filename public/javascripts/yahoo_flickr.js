var Yahoo_flickr = (function(){
      var photos_obj = null;
	var api_end_point = 'http://api.flickr.com/services/rest/?method=flickr.photos.search';
	var _selector = 'div#picrow';
	var _api_key = '';
	var options = {
		has_geo:true,
            extras : 'url_n',
		radius:30,
		page:1,
		format: 'json',
		per_page:30
	}
	var setAPIKey = function(key){
		_api_key = key;
	}
	var showPhotos = function(place)
	{
         getPhotosforLoc(place.jb, place.kb);
	}
      
      var f = function()
      {
          lastWidth = $("div#picstest").innerWidth();
          $("div.picrow").width(lastWidth);
          processPhotos(photos_obj.photos.photo);
          $("#picrow").scrollintoview({ duration: "slow", direction: "y"});
      };
	var getPhotosforLoc = function(lat, lon)
	{            
		var url = api_end_point ;
            options.api_key = _api_key;
            options.lat = lat;
            options.lon = lon;    
            spinner.spin($('#mapcontainer')[0]);        

            $.ajax({
              url:url,
              data:options,             
              async : false,
              success : function(data) { 
              
               // processPhotos(data.photos.photo);            
              },
              complete : function(data){
                var photos_data = data.responseText.replace("jsonFlickrApi",'').slice(1, - 1);
                photos_obj = JSON.parse(photos_data);  
                f();
                window.setTimeout(spinner.stop(),900);                        
              }
            });
      }                      
	
      //

	function processPhotos(photos)
	{
	    // divs to contain the images

	    $('#photocontainer').show();
	    
	    var d = $(_selector);
	    
	    // get row width - this is fixed.
	    var w = d.eq(0).innerWidth();
	    
	    // initial height - effectively the maximum height +/- 10%;
	    var h = 220;
	    // margin width
	    var border = 5;
	    
	    // store relative widths of all images (scaled to match estimate height above)
	    var ws = [];
	    $.each(photos, function(key, val) {
	        var wt = parseInt(val.width_n, 10);
	        var ht = parseInt(val.height_n, 10);
	        if( ht != h ) { wt = Math.floor(wt * (h / ht)); }
	        ws.push(wt);
	    });

	    // total number of images appearing in all previous rows
	    var baseLine = 0; 
	    var rowNum = 0;
	    
	    while(rowNum++ < d.length)
	    {
	        var d_row = d.eq(rowNum-1);
	        d_row.empty();
	        
	        // number of images appearing in this row
	        var c = 0; 
	        // total width of images in this row - including margins
	        var tw = 0;
	        
	        // calculate width of images and number of images to view in this row.
	        while( tw * 1.1 < w)
	        {
	            tw += ws[baseLine + c++] + border * 2;
	        }
	    
	        // Ratio of actual width of row to total width of images to be used.
	        var r = w / tw; 
	        
	        // image number being processed
	        var i = 0;
	        // reset total width to be total width of processed images
	        tw = 0;
	        // new height is not original height * ratio
	        var ht = Math.floor(h * r);
	        while( i < c )
	        {
	            var photo = photos[baseLine + i];
                  
	            // Calculate new width based on ratio
	            var wt = Math.floor(ws[baseLine + i] * r);
	            // add to total width with margins
	            tw += wt + border * 2;
	            // Create image, set src, width, height and margin
	            (function() {
                      if(typeof photo != "undefined"){
                        var img = $('<img/>', {'class': "photo", src: photo.url_n, width: wt, height: ht}).css("margin", border + "px");	                
                        var url = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
                        img.click(function() { location.href = url; });
                        d_row.append(img);
                      }
	            })();
	            i++;
	        }
	        
	        // if total width is slightly smaller than 
	        // actual div width then add 1 to each 
	        // photo width till they match
	        i = 0;
	        while( tw < w )
	        {
	            var img1 = d_row.find("img:nth-child(" + (i + 1) + ")");
	            img1.width(img1.width() + 1);
	            i = (i + 1) % c;
	            tw++;
	        }
	        // if total width is slightly bigger than 
	        // actual div width then subtract 1 from each 
	        // photo width till they match
	        i = 0;
	        while( tw > w )
	        {
	            var img2 = d_row.find("img:nth-child(" + (i + 1) + ")");
	            img2.width(img2.width() - 1);
	            i = (i + 1) % c;
	            tw--;
	        }
	        
	        // set row height to actual height + margins
	        d_row.height(ht + border * 2);
	    
	        baseLine += c;
	    }
	}

	return {
		setAPIKey: setAPIKey,
		showPhotos: showPhotos
	}
})();



