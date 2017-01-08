# JS Card Slider #

[Screenshot](assets/img/ss.png)

### See working demo ###
* TODO: Add working demo url

### Use in your project ###
* Include js-cardslider.js in your view

```
#!html

<script src="source/js-cardslider.js"></script>
```

* Add an element to serve as an hook to the slider

```
#!html

<div id="slider"></div>
```

* Instantiate component

```
#!html

<script>
    jsCardslider("#slider").init({
        dataUrl: 'http://localhost:3000/cards',
        lazyLoad: true
    });
</script>
```

### Options ###
* **dataUrl** - The endpoint where cards data will be requested from
* **data** - Local data to feed cards
* **numCards** - Number of visible cards (default is 3)
* **dataIdField** - Id field name in feed data (default is 'id')
* **lazyLoad** - Lazy load cards instead of fetching all data at once. (default is false)
* **fromFilter** - Querystring filter field name to use as lower limit. (default is '_start')
* **toFilter** - Querystring filter field name to use as higher limit. (default is '_end')

### Tests ###

* TODO: Add tests demo url

```
#!console

npm install
```
