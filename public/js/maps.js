///////////////////////////////////////////
// Geolocalization API using GoogleMap API
//
// see http://wrightshq.com/playground/placing-multiple-markers-on-a-google-map-using-api-3/

//jQuery(function($) {
//    // Asynchronously Load the map API 
//    var script = document.createElement('script');
//    script.src = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=initialize";
//    document.head.appendChild(script);
//});

/**
 * Manage the localization of all people in the chat room with the GoogleMaps API.
 * This class uses the socket event with NodeJS socket.
 * 
 * Options to use to initialize the class: {
 * 		divMap --> The HTML element which is used by the map of Google. The element is found for example by this code: document.querySelector('#divMap')
 *		showMap --> This property is filled with a function (callback) which is called by the class to show the map when the map is initialize.
 *		localMember --> The local member which opened the browser. This property can be an attribut or a function
 * }
 * 
 * On the NodeJS Server, the developper must be implemented 2 events on the 'lane' 'geolocalisation_component'.
 * This event is:
 * - 'geolocation' using when a chat member send their location properties
 * - 'bye' using when a chat member close his browser
 * Example of code to use on the NodeJS server:
 * socket.on('geolocalisation_component', function(message) {
 *	if (message.type === 'geolocation') {
 *		log('Got ' + message.type + ': ', message);
 *		socket.broadcast.emit('geolocalisation_component', message);
 *	} else if (message.type === 'bye') {
 *		log('Got ' + message.type + ': ', message);
 *		socket.broadcast.emit('geolocalisation_component', message);
 *	} else {
 *		logger.err('Unknown socket message type <' + message.type + '> for the geolocalisation_component'); 
 *	}
 * });
 */
var Map = Class.create({
	
	map: null,
	isCarteEnable: false,
	divMap: null,
	bounds: null,
	socketMap: null,
	localMember: null,
	markers: [],
	
	/**
	 * Initialization of the class
	 */
	initialize: function(options) {
		this.divMap = options.divMap || null;
		this.bounds = new google.maps.LatLngBounds();
		//this.isCarteEnable = options.isCarteEnable || false;
		this.showMap = options.showMap || null;
		this.localMember = options.localMember || null;
		this.createEventTask();
    },
    
    /**
     * Create the different event tasks to interact with the NodeJS server by socket.io
     */
    createEventTask: function() {
    	
    	// create the custom socket object
		this.socketMap = new ChatMessage({
			component: "geolocalisation_component"
		});
		
		// bind different events
		this.socketMap
			// fire event when other people send their location
			.on('geolocation', (function(data) { 
				console.log('Receiving geolocation of others people: ', data.coords);
				this.createPositionOnMap(data);
			}).bind(this))
			// fire event when a person send disconnected notification
			.on('bye', (function(data) {
				var marker;
				// search the person marker
				for (var idx=0; idx < this.markers.length -1; idx ++) {
					marker = this.markers[idx];
					if (data.member === marker.member) {
						marker.marker.setMap(null);
						break;
					}
				}
				// delete the marker in the map
				if (marker) {
					this.markers.pop(marker);
				}
			}).bind(this));
	},
	
	/**
	 * send a message to the server with the component message of this class
	 */
	sendMessageMap: function(messageType, data) {
		this.socketMap.sendMessage(messageType, data);
	},
	
	/**
	 * Show the location of the local member
	 */
	showGeolocationOnGoogleMap: function (geolocation) {

		if (geolocation) {
			geolocation.getCurrentPosition(function(pos) {
				GEOCHAT_MAP.map.createPositionOnMap(pos.coords);
			});
		}
	},

	/**
	 * create the location on the map with the data of the remote person
	 */
	createPositionOnMap: function(data) {
		//dans le cas de l'appel lancé depuis GEOCHAT_MAP.locate : data == coords voir ci-dessus, donc si pas de pro coords, on suppose que data l'est
		var crd = data.coords ? data.coords : data;
		console.log('Your current position is:');
		console.log('Latitude : ' + crd.latitude);
		console.log('Longitude: ' + crd.longitude);
		console.log('More or less ' + crd.accuracy + ' meters.');
		
		// create the map if it does not exist
		if (!this.isCarteEnable) {
			// define default options for the map
			var position = new google.maps.LatLng(crd.latitude, crd.longitude);
			var options = {
				center: position,
				zoom: 19,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			// build the map by the GoogleMaps API
			this.map = new google.maps.Map(this.divMap, options);
			
			// call the callback to show the map
			if (this.showMap && jQuery.isFunction(this.showMap)) {
				this.showMap(this.divMap);
			}
			
			this.isCarteEnable = true;
		}
		
		// search if the marker exists in the map
		var createMarker = true;
		for (var idx=0; idx < this.markers.length -1; idx ++) {
			marker = this.markers[idx];
			if (data.member === marker.member) {
				createMarker = false;
				break;
			}
		}
		
		// if the marker does not exist then create the marker
		if (createMarker) {
			// create the position object which is added on the map
			var position = new google.maps.LatLng(crd.latitude, crd.longitude);
			this.bounds.extend(position);
			
			// create the marker
			var marker = new google.maps.Marker({
				position: position,
				map: this.map,
				title: data.member
			});
			this.markers.push({
				marker: marker,
				member: data.member
			});
			
			// Allow each marker to have an info window    
//	        google.maps.event.addListener(marker, 'click', (function(marker, i) {
//	            return function() {
//	                infoWindow.setContent(infoWindowContent[i][0]);
//	                infoWindow.open(map, marker);
//	            }
//	        })(marker, i));
			
			// Automatically center the map fitting all markers on the screen
			this.map.fitBounds(this.bounds);
		}
	},

	/**
	 * Send the position by socket message
	 */
	sendPosition: function() {
		
		// search the position of the local member
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
			
			// send the coords to all member of the room
			this.sendMessageMap('geolocation', {
				coords: coords,
				member: (this.localMember && jQuery.isFunction(this.localMember)) ? this.localMember() : this.localMember,
			});
		}).bind(this), null /*Error function*/, {
			timeout:10000
		});
	},
	
	/**
	 * Delete marker of local member on the remote map
	 */
	closeLocation: function() {
		this.sendMessageMap('bye', {
			member: jQuery.isFunction(this.localMember) ? this.localMember() : this.localMember
		});
	}
	
});

window.GEOCHAT_MAP = {
	map : null,
	initialize : function(){
		//
		// le lien pour tester l'affichage local
		//
		$("#map-locate").click(GEOCHAT_MAP.locate);
		
		GEOCHAT_MAP.map = new Map({
			divMap: $("#carte")[0],
			localMember: function() {
				return AUTH.getMember();
			},
			showMap: function(mapElement) {
				var el = jQuery(mapElement);

				el.css({
					height: "100%"
				});

				this.map.setOptions({
					disableDefaultUI: true,
					zoomControl: true
				});

				// TODO
				// 		panControl: boolean,
				// 		mapTypeControl: boolean,
				// 		scaleControl: boolean,
				// 		streetViewControl: boolean,
				// 		overviewMapControl: boolean

				// el.find('#carte img[src*="google_white"]')
				// 	.parent()
				// 	.parent()
				// 	.parent()
				// 	.css('background-color', 'red');

				// el.find('#carte .gmnoprint div:contains(Données)').remove();
				// el.find('#carte .gmnoprint span:contains(Données)').remove();
				// el.find('#carte .gmnoprint a:contains(Données)').remove();
				// el.find('#carte .gmnoprint a:contains(Conditions)').remove();

				// a = el.find('#carte').children('.gmstyle').children('div:first-child').clone();
				// a = el.find('#carte').children('.gmstyle').children('div:last-child').clone();

				// el.find('#carte .gmstyle div').remove();
				// el.find('#carte .gmstyle').append(a);
				// el.find('#carte .gmstyle').append(b);
			}
		});
	},
	connect : function(){
		$("#carte").show();
		$("#map-locate").show();
	},
	disconnect : function(){
		$("#carte").hide();
		$("#map-locate").hide();
		if( GEOCHAT_MAP.map != null) {
			GEOCHAT_MAP.map.closeLocation();
		}
	},
	locate : function(e){
		e.preventDefault();
		GEOCHAT_MAP.map.showGeolocationOnGoogleMap(navigator.geolocation);
	}
};
