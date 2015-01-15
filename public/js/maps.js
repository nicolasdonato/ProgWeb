///////////////////////////////////////////
//API de geolocalisation
//
//

var Map = Class.create({
	isCarteEnable: false,
	divMap: null,
	sendGeolocFunction: null,
	
	initialize: function(options) {
		this.divMap = options.divMap || null;
		this.isCarteEnable = options.isCarteEnable || false;
		this.sendGeolocFunction = options.sendGeolocFunction || null;
		this.showMap = options.showMap || null;
    },
	
	showGeolocationOnGoogleMap: function (geolocation) {

		if (geolocation) {
			geolocation.getCurrentPosition(function(pos) {
				createPositionOnMap(pos.coords);
			});
		}
	},

	createPositionOnMap: function(crd) {
		console.log('Your current position is:');
		console.log('Latitude : ' + crd.latitude);
		console.log('Longitude: ' + crd.longitude);
		console.log('More or less ' + crd.accuracy + ' meters.');
		
		if (!this.isCarteEnable) {
			var latlng = new google.maps.LatLng(crd.latitude, crd.longitude);
			//objet contenant des propriétés avec des identificateurs prédéfinis dans Google Maps permettant
			//de définir des options d'affichage de notre carte
			var options = {
				center: latlng,
				zoom: 19,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			//constructeur de la carte qui prend en paramêtre le conteneur HTML
			//dans lequel la carte doit s'afficher et les options
			var carte = new google.maps.Map(this.divMap, options);
			this.divMap.map=carte;
			
			if (this.showMap && jQuery.isFunction(this.showMap)) {
				this.showMap(this.divMap);
			}
		}
		
		//création du marqueur
		var marqueur = new google.maps.Marker({
			position: latlng,
			map: this.divMap.map
		});
	},

	//on envoie la geolocalisation de l'appelant
	sendPosition: function() {
		var functionSendPosition = this.sendGeolocFunction;
		navigator.geolocation.getCurrentPosition(function (pos) {
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
			if (functionSendPosition && jQuery.isFunction(functionSendPosition)) {
				functionSendPosition(coords);
			}
		});
	}
});