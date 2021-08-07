/**
 * Notre map, API Google
 * @constructor
 * @return {object} L' objet map
 */
function myMap () {
    this.map = ""; // api google n'est pas encore chargée
    this.PlaceService = "";
}




/**
 * Initialisation de la map en la centrant par défaut sur Marseille
 */
myMap.prototype.initMap = function () {
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 43.300000,
            lng: 5.400000
        },
        zoom: 13,
    });
    var pos = {
        lat: 43.300000,
        lng: 5.400000
    }
    var marker = new google.maps.Marker({
        position: pos,
        map: this.map,
        title:"Ici",
        animation: google.maps.Animation.DROP,
        icon: 'https://cdn3.iconfinder.com/data/icons/mapicons/icons/restaurant.png'
    })
    this.getJson("restaurants.json");
    this.PlaceService = new google.maps.places.PlacesService(this.map);
    this.geolocation();
    this.autocomplete();
    this.addMarkerClick();
}




/**
 * Fonction requête Ajax
 * @param  {string}   (url)      L' url de requête
 * @param  {Function} (callback) Fonction de callback
 */
myMap.prototype.ajaxGet = function (url, callback) {
    var req = new XMLHttpRequest();
    req.open("GET", url);
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            // Appelle la fonction callback en lui passant la réponse de la requête
            callback(req.responseText);
        } else {
           
        }
    });
    req.addEventListener("error", function () {
        
    });
    req.send(null);
}




/**
 * Requête vers le fichier Json
 * @param  {string} (url) L' url de notre requête
 */
myMap.prototype.getJson = function (url) {
    this.ajaxGet(url, function (results) {
        result = JSON.parse(results);
        for (var i = 0; i < result.length; i++) {
            var self = this;
            var num1 = result[i].ratings[0].stars;
            var num2 = result[i].ratings[1].stars;
            var somme = num1 + num2;
            /**
             * Moyenne de nos commentaires
             * @type {number}
             */
            var x = Math.round(somme / result[i].ratings.length);
            /**
             * Utilisation du constructor Item
             * @param {object} (map)          La map google
             * @param {object} (service)      Les services de l' API
             * @param {number} (id)           L' identifiant de l' item
             * @param {object} (location)     La latitude et longitude de l' item
             * @param {string} (name)         Le nom de l' item
             * @param {string} (vicinity)     L' adresse de l' item
             * @param {number} (rating)       La note moyenne de l' item
             * @param {object} (photos)       Photo retourné par l' API de l' item
             * @param {object} (commentsJson) Indique si l' item est à prendre dans la base JSON ou dans l'API
             */
            var item = new Item(self.map,
                        null,
                        null,
                        new google.maps.LatLng(result[i].lat, result[i].long), // retourne l'objet formater googlemap
                        result[i].restaurantName,
                        result[i].address,
                        x,
                        null,
                        result[i].ratings,
                        );
            item.createMarker();
            item.initHtml();
        };
    });
}




/**
 * Fonction qui gère la gélocalisation
 */
myMap.prototype.geolocation = function () {
    var self = this;
    /**
     * test la geolocation en HTML5.
     */
    if (navigator.geolocation) {
        var infoWindow = new google.maps.InfoWindow({
            content: name,
        });
        navigator.geolocation.getCurrentPosition(function(position) {
            App.listItem.innerHTML = "";
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            self.map.setCenter(pos)
            var marker = new google.maps.Marker({
                position: pos,
                map: self.map,
                title:"vous êtes ici",
                animation: google.maps.Animation.DROP,
                icon: 'https://cdn3.iconfinder.com/data/icons/mapicons/icons/restaurant.png'
            })
            /**
             * Utilisation de nearbySearch
             * @see  https://developers.google.com/places/web-service/search?hl=fr
             */
            var service = self.PlaceService;
            service.nearbySearch({
                location:pos,
                radius: 500,
                type: ['restaurant']
              }, self.callback);
      }, function() {
          handleLocationError(true, infoWindow, self.map.getCenter())
          })
      } else {
      /**
       * le navigateur ne supporte pas la géolocation
       */
      handleLocationError(false, infoWindow, self.map.getCenter())
    }
}




/**
 * Fonction qui gère l' autocomplète
 */
myMap.prototype.autocomplete = function () {
    var self = this;
    var input = document.querySelector('#autocompleteId')
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', function () {
        App.listItem.innerHTML = "";
        var position = autocomplete.getPlace().geometry.location;
        var marker = new google.maps.Marker({
            position: position,
            map: self.map,
            title:"vous êtes ici",
            animation: google.maps.Animation.DROP,
            icon: 'https://cdn3.iconfinder.com/data/icons/mapicons/icons/restaurant.png'
        })
        /**
         * Utilisation de nearbySearch
         * @see  https://developers.google.com/places/web-service/search?hl=fr
         */
        var service = self.PlaceService;
        service.nearbySearch({
            location :position,
            radius : 500,
            type : ['restaurant']
        }, self.callback)
        self.map.setCenter(position);
        self.map.setZoom(16);
    })
};




/**
 * Retourne les items autour de la localisation
 * @param  {object}   (results) L' objet Item
 * @param  {bolean}   (status)  Le statut de la requête
 */
myMap.prototype.callback = function(results, status) {
    var self = this;
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var PlaceService = new google.maps.places.PlacesService(document.body.appendChild(document.createElement('div')));
             /**
             * Utilisation du constructor Item
             */
            var item = new Item(self.map,
                                  PlaceService,
                                  results[i].place_id,
                                  results[i].geometry.location,
                                  results[i].name,
                                  results[i].vicinity,
                                  results[i].rating,
                                  results[i].photos,
                                  );
            item.createMarker();
            item.initHtml();
        }
    }
};




/**
 * Ajout d' item en cliquant sur la map
 */
myMap.prototype.addMarkerClick = function () {
    var self = this;
    /**
     * EventListener sur la map
     * @param   {object}    (map)       La map
     * @param   {event}     (click)     Click sur la map entraine une action
     * @param   {function}  (event)     Ouvre la modal
     */
    google.maps.event.addListener(myMap.map, 'click', function (event) {
        var $modal = $('#myModal1');
        var modal = document.body.querySelector('#myModal1');
        $modal.modal('toggle');
        var title = modal.querySelector('#nameItem').value;
        var adress = modal.querySelector('#adressItem').value;
        var rating = modal.querySelector('#ratingItem').value;
        /**
         * Reset de la modal
         */
        $(".modal-body input").val("");
        if (title != undefined || adress != undefined) {
            /**
             * Utilisation du constructor Item
             */
            var newRestau = new Item(self.map,
                                    self.PlaceService,
                                    null, //id
                                    event.latLng,
                                    title,
                                    adress,
                                    rating,
                                    null, //photo
                                    );
            newRestau.createMarker()
            newRestau.initHtml();

        }
    })
    document.body.querySelector('#buttonModalAddCloseId').addEventListener('click', function (){
        var $modal = $('#myModal1');
        var modal = document.body.querySelector('#myModal1');
        $modal.modal('toggle');
    })
}




/**
 * Retourne une erreure si le navigateur n'est pas compatible avec la géolocalisation
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.')
};
