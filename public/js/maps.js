///////////////////////////////////////////
//API de geolocalisation
//
// see http://wrightshq.com/playground/placing-multiple-markers-on-a-google-map-using-api-3/

//jQuery(function($) {
//    // Asynchronously Load the map API 
//    var script = document.createElement('script');
//    script.src = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=initialize";
//    document.head.appendChild(script);
//});

var Map = Class.create({
	
	map: null,
	isCarteEnable: false,
	divMap: null,
	bounds: null,
	socketMap: null,
	localMember: null,
	markers: [],
	
	initialize: function(options) {
		this.divMap = options.divMap || null;
		this.bounds = new google.maps.LatLngBounds();
		this.isCarteEnable = options.isCarteEnable || false;
		this.showMap = options.showMap || null;
		this.localMember = options.localMember || null;
		this.createEventTask();
    },
    
    createEventTask: function() {
		this.socketMap = new ChatMessage({
			component: "geolocalisation_component"
		});
		this.socketMap.on('geolocation', (function(data) {
			console.log('Receiving geolocation of others people: ', data.coords);
			this.createPositionOnMap(data);
		}).bind(this)).on('bye', function(data) {
			// suppression du marker
			var marker;
			for (var idx=0; idx < this.markers.length -1; idx ++) {
				marker = this.markers[idx];
				if (data.member === marker.member) {
					marker.marker.setMap(null);
					break;
				}
			}
			if (marker) {
				this.markers.pop(marker);
			}
		});
	},
	
	sendMessageMap: function(messageType, data) {
		this.socketMap.sendMessage(messageType, data);
	},
	
	showGeolocationOnGoogleMap: function (geolocation) {

		if (geolocation) {
			geolocation.getCurrentPosition(function(pos) {
				createPositionOnMap(pos.coords);
			});
		}
	},

	createPositionOnMap: function(data) {
		var crd = data.coords;
		console.log('Your current position is:');
		console.log('Latitude : ' + crd.latitude);
		console.log('Longitude: ' + crd.longitude);
		console.log('More or less ' + crd.accuracy + ' meters.');
		
		if (!this.isCarteEnable) {
			//objet contenant des propriétés avec des identificateurs prédéfinis dans Google Maps permettant
			//de définir des options d'affichage de notre carte
			var options = {
				//center: position,
				zoom: 19,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			//constructeur de la carte qui prend en paramêtre le conteneur HTML
			//dans lequel la carte doit s'afficher et les options
			this.map = new google.maps.Map(this.divMap, options);
			
			if (this.showMap && jQuery.isFunction(this.showMap)) {
				this.showMap(this.divMap);
			}
			
			this.isCarteEnable = true;
		}
		
		var position = new google.maps.LatLng(crd.latitude, crd.longitude);
		this.bounds.extend(position);
		
		//création du marqueur
		var createMarker = true;
		for (var idx=0; idx < this.markers.length -1; idx ++) {
			marker = this.markers[idx];
			if (data.member === marker.member) {
				createMarker = false;
				break;
			}
		}
		if (createMarker) {
			var marker = new google.maps.Marker({
				position: position,
				map: this.map,
				title: data.member
			});
			this.markers.push({
				marker: marker,
				member: data.member
			});
		}
		
		// Allow each marker to have an info window    
//        google.maps.event.addListener(marker, 'click', (function(marker, i) {
//            return function() {
//                infoWindow.setContent(infoWindowContent[i][0]);
//                infoWindow.open(map, marker);
//            }
//        })(marker, i));
		
		// Automatically center the map fitting all markers on the screen
		this.map.fitBounds(this.bounds);
	},

	//on envoie la geolocalisation de l'appelant
	sendPosition: function() {
		navigator.geolocation.getCurrentPosition((function (pos) {
			console.log('Sending geolocation: ', pos.coords);
			var coords = {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
				altitude: pos.coords.altitude,
				accuracy: pos.coords.accuracy,
				altitudeAccuracy: pos.coords.altitudeAccuracy,
				heading: pos.coords.heading,
				speed: pos.coords.speed
			};
			this.sendMessageMap('geolocation', {
				coords: coords,
				member: (this.localMember && jQuery.isFunction(this.localMember)) ? this.localMember() : this.localMember,
			});
		}).bind(this), null /*Error function*/, {
			timeout:10000
		});
	}
	
});