/**
 * Elements permettant le fonctionnement de l'API
 * @constructor
 */
function App () {
    this.listItem = document.querySelector('#sidebarId');
    this.itemNode = document.querySelector('.item');
    this.refreshButton = document.getElementById('refreshId');
    this.filterButton = document.getElementById('filterId');
    this.refresh();
    this.filterListener();
}




/**
 * Bouton refresh de la page
 */
App.prototype.refresh = function () {
    var self = this;
    self.refreshButton.addEventListener('click', function () {
        window.location.reload();
    })
}




/**
 * Bouton filtrage  des notes
 */
App.prototype.filterListener = function () {
    var self = this;
    self.filterButton.addEventListener('change', function (event) {
        /**
         * Correspondant à la valeur de l' option choisie
         * @type {number}
         */
        var selectedStars = event.target.selectedOptions[0].attributes[0].nodeValue;
        //Appel le filtre avec cette valeur
        self.filter(selectedStars);
    })
}




/**
 * Filtre la liste des items
 * @param  {number} (maxStars) permet le nombre d' étoile max autorisé à notre filtre
 */
App.prototype.filter = function(maxStars){
    // c.l ('nombre d'étoiles : ', maxStars);
  var self = this;
    for(var i = 0; i < self.listItem.children.length; i++ ) {
        var itemStars = self.listItem.children[i].querySelector('.itemRatingClass');
        itemStars = itemStars.innerHTML;
        x = Math.round(itemStars);
        if (itemStars >= maxStars && itemStars <= maxStars + 1 || maxStars === 'noFilter') {
            // show item
            self.listItem.children[i].style.display = 'block';
        } else {
            // hidde item
            self.listItem.children[i].style.display = 'none';
        }
    }
}




/**
 * Affichage d'un message alert à la fermeture ou refresh de la page
 * @param  {function} (e) Evenement fermer ou rafraichir
 * @return {string}    Message d' alerte
 */
window.addEventListener("beforeunload", function (e) {
    var message = "";
    e.returnValue = message;
    return message;
});
