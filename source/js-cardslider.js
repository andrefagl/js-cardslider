var jscardslider_proto = {
    init: function(options) {
        // Set custom options
        this.options = this.extend({}, this.options);
        this.extend(this.options, options)
        var elem = this.elem;

        // Set visible cards
        var nCards = this.getOption('numCards');
        for (i = 0; i < nCards; i++) {
            this.visibleCards.push(i);
        }

        // Fetch data
        this.fetchData();

        // Set default values
        this.currentIndex = this.getOption('numCards');

        return this;
    },
    // These are the default options, they will be extended with the user custom options
    options: {
        numCards: 3,
        dataIdField: 'id',
        data: {},
        lazyLoad: false,
        fromFilter: '_start',
        toFilter: '_end',
    },
    updateData: function(data, self) {
        // Convert data string to JSON
        var cards = JSON.parse(data);

        // Update this._data
        self._data = cards;

        // Not using "this" because on a xmlhttp context, "this" would be "window" scope
        self.renderComponent(cards);
    },
    // Fetches data (local or remote)
    fetchData: function() {
        var url = this.getOption('dataUrl') || this.getOption('data');
        var isLazy = this.getOption('lazyLoad');
        var fromFilter = this.getOption('fromFilter');
        var toFilter = this.getOption('toFilter');

        // Check if data is local or remote
        if (url !== null && typeof url === 'object') { // Local data
            // Update data with local defined data
            this.updateData(this.getOption('data'));
        } else { // Remote data
            // When lazy loading data we will retrieve the minimum possible dataset from server
            if (isLazy) {
                url += '?' + fromFilter + '=0&' + toFilter + '=' + this.getOption('numCards');
            }

            this.getRemoteData(url, this.updateData);
        }
    },
    getRemoteData: function(url, callback, event) {

        var xmlhttp = new XMLHttpRequest();
        var errors = this._errors;
        var self = this;

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    callback(xmlhttp.responseText, self, event);
                }
                else if (xmlhttp.status == 400) {
                    errors.push('Failed to retrieve remote data. Error code: ' + xmlhttp.status);
                }
                else {
                    errors.push('Unexpected error while retrieaving remote data. Error code: ' + xmlhttp.status);
                }
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    },
    bindHandlers: function() {

        var previous = this.elem.querySelector('a.arrow-previous');
        var next = this.elem.querySelector('a.arrow-next');

        // Bind click on previous / next  arrows
        if (previous && next) {
            var callback;
            if (this.getOption('lazyLoad')) {
                callback = this.updateComponent;
            } else {
                callback = this.moveCards;
            }

            previous.addEventListener( "click", callback);
            next.addEventListener( "click", callback);

            // Set some util attributes we will need to deal when moving cards
            previous.direction = 'previous';
            next.direction = 'next';
            previous.baseElem = next.baseElem = this.elem;
            previous.instance = next.instance = this;
        }
    },
    updateComponent: function(event) {

        var cardsParent = event.target.baseElem.querySelector('.js-cardslider');

        var allCards = cardsParent.querySelectorAll('.card');
        var instance = event.target.instance;

        switch(event.target.direction) {
            case 'previous':
                instance.updateVisibleCards(allCards, 'previous');
                event.preventDefault();
                break;
            case 'next':
                var lastCard = allCards[allCards.length-1];
                if (lastCard.classList.contains('visible') && ! instance.preventRequests) { // If the last element is visible then we need to fetch some more data (when we still have data to fetch)
                    var fromValue = allCards.length;
                    var toValue = allCards.length + instance.getOption('numCards');
                    var fromFilter = instance.getOption('fromFilter');
                    var toFilter = instance.getOption('toFilter');
                    var url = instance.getOption('dataUrl') + '?' + fromFilter + '=' + fromValue + '&' + toFilter + '=' + toValue;

                    // New request. Pass results to appendNewCards callback
                    instance.getRemoteData(url, instance.appendNewCards, event);
                } else {
                    instance.moveCards(event);
                }

                event.preventDefault();
                break;
            default:
                event.preventDefault();
        }

        event.preventDefault();
    },
    appendNewCards: function(data, self, event) {
        // Convert data string to JSON
        var cards = JSON.parse(data);
        if (cards.length) {
            // Update this._data
            self._data.push.apply(self._data, cards);

            // Append cards
            var nCards = self.getOption('numCards');
            var cardsHtml = [];
            var rootElem = self.elem.querySelector('.js-cardslider');

            for (i = 0; i < cards.length; i++) {
                var card = cards[i],
                    currentCard;


                currentCard = [
                    '<div id="card-' + card.id + '" class="card hidden">',
                        '<div class="cover">',
                            '<div class="spinner"></div>',
                        '</div>',
                        '<div class="content">',
                            '<div class="header">',
                                '<div class="avatar"><img src="' + card.avatarUrl + '" /></div>',
                                '<div class="headings">',
                                    '<div class="title" title=\''+ card.title +'\'>' + self.truncate.apply(card.title, [14, true]) + '</div>',
                                    '<div class="disclaimer">'+ self.truncate.apply(card.disclaimer, [20, false]) +'</div>',
                                '</div>',
                            '</div>',
                            '<div class="description">' + self.truncate.apply(card.text, [130, true]) + '</div>',
                            '<div class="footer"><a href="#" target="_blank">Learn more</a></div>',
                        '</div>',
                    '</div>'
                ].join("\n");

                cardsHtml.push(currentCard);
            }

            // Append new cards html to root element
            rootElem.insertAdjacentHTML('beforeend', cardsHtml.join(''));

            // Load new cards images
            self.loadImages(cards);

            // Move cards right away
            self.moveCards(event);
        } else {
            // No new data - We should only move things around;
            self.moveCards(event);

            // Prevent further requests (since there is no more data to show)
            self.preventRequests = true;
        }
    },
    moveCards: function(event) {
        var cardsParent = event.target.baseElem.querySelector('.js-cardslider');

        var allCards = cardsParent.querySelectorAll('.card');
        var instance = event.target.instance;

        switch(event.target.direction) {
            case 'previous':
                instance.updateVisibleCards(allCards, 'previous');
                event.preventDefault();
                break;
            case 'next':
                instance.updateVisibleCards(allCards, 'next');
                event.preventDefault();
                break;
            default:
                event.preventDefault();
        }
    },
    updateVisibleCards: function(cards, direction) {

        var visibleCards = [];
        var edgeCards = this.elem.querySelector('.js-cardslider').querySelectorAll('.edge');

        for (i=0; i<cards.length; i++) {

            // Reset order to default value (0)
            cards[i].style.order = "initial";

            if (cards[i].classList.contains('visible')) {

                var cardsElement;

                if (direction == 'next') {
                    cardsElement = cards[i+1];
                    if (typeof cardsElement != 'undefined') {
                        visibleCards.push(i+1);
                    } else {
                        visibleCards.push(0);
                    }
                } else {
                    cardsElement = cards[i-1];
                    if (typeof cardsElement != 'undefined') {
                        visibleCards.push(i-1);
                    } else {
                        visibleCards.push(cards.length-1);
                    }
                }

                // Hide all elements
                cards[i].classList.remove('visible');
                cards[i].classList.add('hidden');
            }
        }

        // Sort the visible cards array so we can determine without doubt if we are in an edge case or not
        visibleCards.sort();

        // Show only the correct elements / re-order them when we are dealing with edge cases
        for (i=0; i<visibleCards.length; i++) {
            var indexDiff;

            if (typeof visibleCards[i+1] != 'undefined') {
                indexDiff = Math.abs(visibleCards[i]-visibleCards[i+1]);

                // On edge cases (eg. 9 - 1 - 2) we need to set the first numCards order to be something higher than the other edge cards
                if (indexDiff != 1) {
                    edgeCards.forEach(
                        function(elem, key, listObj, argument) {
                            elem.style.order = 1;
                        }
                    );
                }
            }

            // Show the cards that should be visible
            cards[visibleCards[i]].classList.remove('hidden');
            cards[visibleCards[i]].classList.add('visible');
        }

        return visibleCards;
    },
    renderComponent: function(cards) {

        var nCards = this.getOption('numCards');
        var cardsHtml = [];
        var handlersHtml = [];
        var showHandlers = nCards < cards.length || this.getOption('lazyLoad');
        var edgeCounter = (cards.length >= 2 * nCards) ? nCards : nCards-1;

        for (i = 0; i < cards.length; i++) {
            var card = cards[i],
                currentCard,
                isVisible,
                cardClass,
                edgeClass;

            isVisible = (this.isInArray(i, this.visibleCards)) ? true : false;
            cardClass = isVisible ? ' visible' : ' hidden',
            edgeClass = (i < edgeCounter) ? ' edge' : '';

            currentCard = [
                '<div id="card-' + card.id + '" class="card' + cardClass + edgeClass + '">',
                    '<div class="cover">',
                        '<div class="spinner"></div>',
                    '</div>',
                    '<div class="content">',
                        '<div class="header">',
                            '<div class="avatar"><img src="' + card.avatarUrl + '" /></div>',
                            '<div class="headings">',
                                '<div class="title" title=\''+ card.title +'\'>' + this.truncate.apply(card.title, [14, false]) + '</div>',
                                '<div class="disclaimer">'+ this.truncate.apply(card.disclaimer, [20, false]) +'</div>',
                            '</div>',
                        '</div>',
                        '<div class="description">' + this.truncate.apply(card.text, [130, true]) + '</div>',
                        '<div class="footer"><a href="#" target="_blank">Learn more</a></div>',
                    '</div>',
                '</div>'
            ].join("\n");

            cardsHtml.push(currentCard);
        }

        // Build arrow handlers
        handlersHtml = [
                '<div class="card-handlers">',
                    '<a href="" class="arrow arrow-previous"></a>',
                    '<a href="" class="arrow arrow-next"></a>',
                '</div>'
            ].join("\n");
        // Wrap component
        cardsHtml.unshift('<div class="js-cardslider">');
        cardsHtml.push('</div>');

        // Push handlers
        if (showHandlers) {
            cardsHtml.push(handlersHtml);
        }

        // Set the component html
        this.elem.innerHTML = cardsHtml.join('');

        // Bind arrow actions
        if (showHandlers) {
            this.bindHandlers();
        }

        this.loadImages(cards);
    },
    loadImages: function(cards, callback) {
        var self = this;
        for (i=0; i<cards.length; i++) {
            var card = cards[i];
            var img = new Image();
            img.src = card.imageUrl; // Image starts downloading here

            img.cardId = card.id;
            img.imageSrc = card.imageUrl;
            img.instance = self;
            img.onload = this.imagesLoaded;
        }
    },
    imagesLoaded: function(event) {
        var self = event.target.instance
        var cardElemId = 'card-' + event.target.cardId;
        var imgElement = event.target;

        // Get card element
        var cardElem = self.elem.querySelector('.js-cardslider').querySelector('#'+cardElemId);

        // Add image to card
        cardElem.querySelector('.cover').appendChild(imgElement);

        // Hide spinner
        cardElem.querySelector('.cover .spinner').style.display = 'none';

        // Change image opacity
        setTimeout(function(){cardElem.querySelector('.cover img').classList.add('visible');}, 200)
    },
    _data: [],
    _errors: [],
    currentIndex: 0,
    visibleCards: [],
    preventRequests: false,
    getOption: function(option) {
        // Returns option when available,
        // null when not available
        if( this.options.hasOwnProperty( option ) ) {
            return this.options[option];
        } else {
            return null;
        }
    },
    extend: function ( a, b ) {
        for( var key in b ) {
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    },
    isInArray: function(value, array) {
        return array.indexOf(value) > -1;
    },
    truncate: function(n, useWordBoundary) { // Source: http://stackoverflow.com/a/1199420
        var isTooLong = this.length > n,
            s_ = isTooLong ? this.substr(0,n-1) : this;
            s_ = (useWordBoundary && isTooLong) ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
        return  isTooLong ? s_ + '&hellip;' : s_;
    }
}, jsCardslider, _jsCardslider;

_jsCardslider = function(selector) { this.elem = document.querySelector(selector); };
_jsCardslider.prototype = jscardslider_proto;

jsCardslider = function(selector) {
    return new _jsCardslider(selector);
};
