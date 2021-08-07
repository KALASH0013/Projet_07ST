/**
 * Item correspond à nos restaurants
 * @param {object} (map)          map de google
 * @param {object} (service)       services de l' API
 * @param {number} (id)           ID de l' item
 * @param {object} (location)     lat et long de l' item
 * @param {string} (name)         nom de l' item
 * @param {string} (vicinity)     adresse de l' item
 * @param {number} (rating)        note moyenne de l' item
 * @param {object} (photos)       Photo renvoyée par l' API de l' item
 * @param {object} (commentsJson) Indication prise soit dans la base JSON soit dans l'API
 */
function Item (map, service, id, location, name, vicinity, rating, photos, commentsJson) {
    this.map = map;
    this.service = service;
    this.id = id;
    this.location = location;
    this.name = name;
    this.vicinity = vicinity;
    this.rating = rating;
    if(photos != undefined) {
        this.photos = photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200});
    } else {
        this.photos = "https://media.istockphoto.com/vectors/male-face-silhouette-or-icon-man-avatar-profile-unknown-or-anonymous-vector-id1087531642?k=6&m=1087531642&s=170667a&w=0&h=Gh62OWB5xcC3TRjhULs-uu4YP3GCoDow6FVYa56I5pc=";
    }
    if (commentsJson != undefined) {
        this.commentsJson = commentsJson;
    }
}




/**
 * Créé et intègre les marqueurs à la map.
 * @return {object} Objet Google correspondant
 */
Item.prototype.createMarker = function () {
    var self = this;
    var placeLoc = self.location;
    var titleInfo =  `
        ${self.name}
        ${self.vicinity}
      `;
    var marker = new google.maps.Marker({
        map: myMap.map,
        position: placeLoc,
        title: titleInfo,
        animation: google.maps.Animation.DROP,
        icon: 'https://cdn3.iconfinder.com/data/icons/mapicons/icons/restaurant.png',
    })
}




/**
 * Initialisation de  la sidebar avec l' ensemble de nos items correpondant à une recherche.
 * @return {object} L' ensemble de nos items
 */
Item.prototype.initHtml = function () {

    this.itemNode = document.querySelector('.item').cloneNode(true);
    var self = this;
    var a = 0;
    self.itemNode.classList.remove('.item');
    self.itemNode.removeAttribute('block');
    /**
     * Ajout du nom de l' item à l' élément sélectionné
     * @type {string}
     */
    self.itemNode.querySelector('.itemNameClass').textContent = `${self.name}`;
    /**
     * Ajout de  l' adresse de l' item
     * @type {string}
     */
    self.itemNode.querySelector('.itemVicinityClass').textContent = `${self.vicinity}`;
    /**
     * Charge la note moyenne de l' item et la masque
     * @type {number}
     */
    x = Math.round(self.rating);
    self.itemNode.querySelector('.itemRatingClass').textContent = `${x}`;
    self.itemNode.querySelector('.itemRatingClass').style.display = "none";
    var starElm = self.itemNode.querySelector('.itemRatingImg');
    /**
     * Affichage du png correspondant à la note moyenne de l'item avant l' adresse 
     * @param  {number} (x) Note moyenne
     */
    if (x === 1) {starElm.src = "../img/1_star.png";}
    else if (x === 2) {starElm.src = "../img/2_stars.png";}
    else if (x === 3) {starElm.src = "../img/3_stars.png";}
    else if (x === 4) {starElm.src = "../img/4_stars.png";}
    else if (x === 5) {starElm.src = "../img/5_stars.png";}
    else {starElm.src = "../img/0_star.png";};
    var starElm = self.itemNode.insertBefore(starElm, self.itemNode.querySelector('.itemVicinityClass'));
    /**
     * Chargement d'une photo de l' item et la masque avant la note moyenne 
     * @type {img}
     */
    var imageElm = document.createElement('IMG');
    imageElm.src = self.photos;
    imageElm.style.display = "none";
    var imageElm = self.itemNode.insertBefore(imageElm, self.itemNode.querySelector('.itemRatingClass'));
    /**
     * Chargement avant l' adresse de l' item d'un bouton permettant de fermer les commentaires et de
     * les masque
     * @type {img}
     */
    var closeElm = document.createElement('IMG');
    closeElm.className = "close";
    closeElm.src = "../img/close.png";
    closeElm.style.display = "none";
    var closeElm = self.itemNode.insertBefore(closeElm, self.itemNode.querySelector('.itemVicinityClass'));
    /**
     * Chargement  des commentaires provenant de l' API et les masques
     */
    self.itemNode.style.height = "90px";
    self.itemNode.style.overflow = "hidden";
    /**
     * Chargement d'un bouton afin  d'ajouter des commentaires et les masquer
     */
    self.itemNode.querySelector('#buttonModalAddCommentId').style.display = "none";

    /**
     * Eventlistener sur le nom de l' item permet d'afficher des éléments masqués.
     * @param  {function} (evt) Click sur le nom de l' item
     */
    self.itemNode.querySelector('.itemNameClass').addEventListener('click', function(evt){
        evt.target.style.color = "#FC6354";
        self.itemNode.style.backgroundColor = "#EFEEE4";
        self.itemNode.style.height = "500px";
        self.itemNode.style.overflow = "auto";
        /**
         * Affichage de la photo de l' item
         */
        imageElm.style.display = "block";
        /**
         * Affichage du bouton close
         */
        closeElm.style.display = "block";
        /**
         * Affichage des  commentaires de l' API
         */
        if(a == 0) {
            self.getDetails();
            a = 1;
        } if (a== 1 ) {
            console.log('pas de nouvel request');
        };
        /**
         * Affichage des commentaires ajoutés par l' utilisateur.
         */
        var commentNode = document.body.querySelector('.commentClass');
        commentNode.style.display= "block";
        /**
         * Affichage du bouton permettant l' ajout de commentaire par l' utilisateur via l' ouverture
         * d'une modal.
         */
        var modalElm = self.itemNode.querySelector('#buttonModalAddCommentId');
        modalElm.style.display = "block";
        document.body.querySelector('#buttonModalValidCommentId').addEventListener('click', validation)
        var modalElm = self.itemNode.insertBefore(modalElm, self.itemNode.querySelector('.itemCommentClassNode'));
        /**
         * Fonction validation enregistrement et insertion de valeurs en fonction des informations renseignees dans la
         * modal dans les commentaires
         * @param  {function} (evt) Click sur le bouton validation de la modal
         */
        function validation (evt) {
            var $modal = $('#myModal');
            var modal = document.body.querySelector('#myModal');
            var pseudo = modal.querySelector('#pseudoId').value;
            var commentaire = modal.querySelector('#commentaireId').value;
            var note = modal.querySelector('#ratingId').value;
            /**
             * Création d' un nouveau commentaire
             * @param {string} (pseudo) Le pseudo de l' utilisateur.
             * @param {number} (note)   La note de l' utilisateur
             * @type {Comment}
             */
            var comment = new Comment(pseudo, note, commentaire, self.itemNode);
            comment.initHtml();
            if (comment == true) {
                self.itemNode.querySelector('#buttonModalAddCommentId').style.display = "none";
            }
            self.itemNode.querySelector('#buttonModalAddCommentId').style.display = "none";
            $modal.modal('toggle');
            /**
             * Réinitialisation de la modal et on stop l' eventListener sur le bouton validation
             */
            $(".modal-body input").val("");
            document.body.querySelector('#buttonModalValidCommentId').removeEventListener('click', validation);
        }
        /**
         * Fonction qui masque les éléments qui étaient par défaut non visible.
         * @param  {fuction} (evt) Click sur le bouton close.
         */
        closeElm.addEventListener('click', function(evt){
            setTimeout(function() {
                self.itemNode.querySelector('.itemNameClass').style.color = "#2D5BE3";
                self.itemNode.style.backgroundColor = '#FFFFFF';
                self.itemNode.querySelector('#buttonModalAddCommentId').style.display = "none";
            },2000);
            self.itemNode.style.height = "90px";
            self.itemNode.style.overflow = "hidden";
            closeElm.style.display = "none";
            var commentNode = document.body.querySelector('.commentClass');
            commentNode.style.display = "none";
        })
    })
    App.listItem.appendChild(self.itemNode);
}




/**
 * Chargement  des commentaires de l' API
 * @return {object} Les commentaires renseignés correspondent aux items
 */
Item.prototype.getDetails = function() {
    var self = this;
    /**
     * Les commentaires viennent du fichier JSON
     * @param {string} (name)    nom de l' auteur du commentaire
     * @param {number} (rating)    note du commentaire
     * @param {string} (comment)   contenu du commentaire
     * @param {object} (itemNode)  noeud html
     */
    if (self.commentsJson) {
        self.commentsJson.forEach(function(comment) {
            var commentObject = new Comment("Anonyme", comment.stars, comment.comment, self.itemNode);
            commentObject.initHtml();
        });
    } else {
        /**
         * Requête sur le lieu
         */
        self.service.getDetails({"placeId": self.id}, detailsCallback);
        /**
         * Les commentaires viennent de l' API
         * @param  {object} (place)  Appel aux services de l' API
         * @param  {object} (status) La statut de la requête
         */
        function detailsCallback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for(var i = 0; i < place.reviews.length; i++ ) {

                    self.commentNode = document.querySelector('.itemCommentClassNode').cloneNode(true);
                    self.commentNode.style.display = "block";
                    /**
                     * Renseigne les élements suivants : auteur, commentaires, date
                     */
                    self.commentNode.querySelector('.itemCommentInfoClass').textContent =`Commentaire écrit par : `
                    self.commentNode.querySelector('.itemCommentAuthorClass').textContent = ` ${place.reviews[i].author_name} `;
                    self.commentNode.querySelector('.itemCommentClass').textContent =  `" ${place.reviews[i].text} " `;
                    self.commentNode.querySelector('.itemCommentClass').style.textAlign = "justify-all";
                    self.commentNode.querySelector('.itemCommentTimeClass').textContent = `${place.reviews[i].relative_time_description}.`;
                    /**
                     * Renseigne et masque la note
                     * @type {number}
                     */
                    x = Math.round(place.reviews[i].rating);
                    self.commentNode.querySelector('.itemCommentRatingClass').textContent = `${x}`;
                    self.commentNode.querySelector('.itemCommentRatingClass').style.display = "none";
                    var starElm = self.commentNode.querySelector('.itemCommentImg');
                    /**
                     * Affichage d'un png correspondant à la note du commentaire et l' insertion avant l' adresse
                     * @param  {number} (x) La note du commentaire
                     */
                    if (x === 1) {starElm.src = "../img/1_star.png";}
                    else if (x === 2) {starElm.src = "../img/2_stars.png";}
                    else if (x === 3) {starElm.src = "../img/3_stars.png";}
                    else if (x === 4) {starElm.src = "../img/4_stars.png";}
                    else if (x === 5) {starElm.src = "../img/5_stars.png";}
                    else {starElm.src = "../img/0_star.png";};
                    var starElm = self.commentNode.insertBefore(starElm, self.commentNode.querySelector('.itemCommentClass'));
                    self.itemNode.appendChild(self.commentNode);
                }
            } else {
              
            }
        }
    }

}

