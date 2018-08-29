const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
// https://github.com/expressjs/express-paginate
const paginate = require('express-paginate')
const request = require('request');

const port = process.env.PORT || 3000

// Uses template engine Pug for ease of use with express-paginate
app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.static('public'))
app.use(paginate.middleware(10, 50))

// Renders the homepage without any gifs
app.get('/', (req, res) => {
    res.render('index', { 
    	title: 'Exercise: Full Stack - JavaScript', 
    })
})

// GET request to be used by AJAX calls from the homepage to dynamically load content as a single-page web app
// Response returns 10 gifs paginated using URL query params generated using express-paginate
app.get('/gallery', (req, res, next) => {
    const imagesAll = getGifs();
    const itemCount = imagesAll.length;
    const pageCount = Math.ceil(itemCount / req.query.limit);

    // Math using the current page number (req.query.page) and number of gifs per page (req.query.limit) to filter gifs to be displayed
    let imagesPaged = imagesAll.splice((req.query.page-1)*req.query.limit, req.query.limit);

    let limitsArray = [5, 10, 20];

    res.render('gallery', { 
        title: 'All GIFs',
    	images: imagesPaged,
    	pageCount,
        itemCount,
        currentPage: req.query.page,
        currentLimit: req.query.limit,
        limitsArray,
        pages: paginate.getArrayPages(req)(pageCount, pageCount, req.query.page)
    })
})

// GET request to be used by AJAX calls from the homepage to dynamically load content as a single-page web app
// Response returns random gif rendered in the gallery view
app.get('/random', (req, res, next) => {
	let randomGif = getRandomGif();
	res.render('gallery', {
        title: 'Random GIF', 
		image: randomGif,
        single: true
	})
})

app.get('/tenor', (req, res, next) => {

    const srcArray = [];

    request({
        url: 'https://api.tenor.com/v1/trending',
        qs: { key: '6XRQHQ85IF13' }
    }, function(error, response, body){
        
        let obj = JSON.parse(body);
        
        obj.results.forEach(function(result){
            srcArray.push(result.media[0].gif.url);
        });

        const itemCount = srcArray.length;
        const pageCount = Math.ceil(itemCount / req.query.limit);

        // Math using the current page number (req.query.page) and number of gifs per page (req.query.limit) to filter gifs to be displayed
        let imagesPaged = srcArray.splice((req.query.page-1)*req.query.limit, req.query.limit);

        let limitsArray = [5, 10, 20];

        res.render('gallery', { 
            title: 'Trending GIFs',
            images: imagesPaged,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            currentLimit: req.query.limit,
            limitsArray,
            pages: paginate.getArrayPages(req)(pageCount, pageCount, req.query.page)
        })
    })

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});

// Returns an array of all gif file names from the backend
function getGifs() {
	let dirPath = path.join(__dirname, 'public/gifs');
 
    let allGifs = [];

    // Retrieve all file names located at the first level of our backend directory
    let files = fs.readdirSync(dirPath);
 
    for (file of files) {
        let fileLocation = path.join(dirPath, file);
        let stat = fs.statSync(fileLocation);
        // Check if the filepath is a file, has a file status, and has a file extension of ".gif"
		if (stat && stat.isFile() && ['.gif'].indexOf(path.extname(fileLocation)) != -1) {
            allGifs.push('gifs/'+file);
        }
    }

    return allGifs;
}
// Returns a random gif file name from the backend
function getRandomGif() {
	// Retrieve all possible gifs in an array
	let allGifs = getGifs();
	// Use Math.random() to get a random index number and get the random gif file name
	let randomGif = allGifs[Math.floor(Math.random() * allGifs.length)];
	return randomGif;
}

app.listen(port, function () {
  console.log(`Full Stack - JavaScript listening on port ${port}!`)
})